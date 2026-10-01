---
id: ARC-012
title: The bridge's loopback HTTP API — a bridge token in a header of its own, CORS for the one paired Pages origin, host check, Local Network Access, and a generic route table
forced_by:
  - THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY
  - THE LOCAL BRIDGE REQUIRES A TOKEN
  - THE BRIDGE IS PAIRED ONCE
  - BROWSER REACHABILITY IS MEASURED, NOT ASSUMED
  - A CREDENTIAL IS NEVER PLACED IN A URL
  - THE MAILBOX PASSWORD LEAVES THE BROWSER ONLY TO THE BRIDGE
  - REMOTE ACCESS TO THE BRIDGE GOES THROUGH A TUNNEL
  - EVERY STEP EXPLAINS ITSELF
  - UC-011
  - UC-044
---
# ARC-012 The bridge's loopback HTTP API

## Context

The dashboard (served from `https://<owner>.github.io`) calls the bridge on the same computer, or on
another computer through a tunnel that ends on that bridge's loopback address. Loopback is not a
permission boundary between programs on one machine (`THE LOCAL BRIDGE REQUIRES A TOKEN`): any web
page the person opens can send requests to `127.0.0.1`. The book's OpenClaw box (ch. 10) is the
cautionary case: a local gateway that "any website a developer visited could silently connect to".

How browsers treat a request from a public HTTPS page to loopback was read from their documentation on
2026-09-30 and is recorded, with every source and quotation, in
`docs/measurements/2026-09-30_architecture-open-points.md`, point 3 (*measurement §3*). In short:
Chrome from 142, Edge from 143 and Firefox from 153 allow such a request after one Local Network Access
prompt, which replaced Chrome's Private Network Access preflights; Safari blocks it as mixed content. For
Safari, and for a bridge on another machine without a forward on the person's own, the dashboard reaches
the bridge over an HTTPS address of the jump host instead (ARC-013); the bridge receives those requests
through its reverse tunnel, on loopback, like any other.

## Decision

1. **Bind.** The bridge listens on `127.0.0.1` (and `::1`) only; any other configured address is
   refused at start (`THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY`). The port is the bridge's own setting
   (ARC-011).
2. **Plain HTTP with `fetch`, JSON bodies, no WebSockets.** Long-running output (a job's log) is
   read by polling a cursor (`GET /jobs/<id>/log?after=<n>`). WebSockets are not left out of Local
   Network Access any more — they are gated from Chrome 147 and Firefox 154 (measurement §3) —, so the
   reason is simplicity: one request type to measure, to proxy and to authenticate on every route.
3. **Authentication — the bridge token in a header of its own.** Every request except the CORS
   preflight carries `Agent-M-Bridge-Token: <pairing token>`, whichever way it came. The bridge compares
   it in constant time and answers `401` without a body otherwise. `Authorization` is left to the jump
   host's web server (ARC-013); the bridge ignores it. The token is 256 random bits, kept in the bridge's
   store, readable by its user only, replaced by *Pair anew* (ARC-003, the bridge store). It never appears
   in a URL, a log line or an export's clear text.
4. **Origin.** At pairing, the bridge records the origin of the dashboard that paired it. CORS
   answers name exactly that origin (never `*`), allow the methods `GET, POST, DELETE` and the headers
   `agent-m-bridge-token, authorization, content-type`, and send no credentials mode. A request whose
   `Origin` is another web origin is refused before the token is checked.
5. **Host check.** The bridge refuses a request whose `Host` header is not `127.0.0.1:<port>`,
   `localhost:<port>` or `[::1]:<port>` — its own port, or the session port its reverse tunnel serves
   on the jump host, which is the `Host` a forwarding web server names (ARC-013). This guards against DNS
   rebinding, which the token alone also stops but which costs nothing to check.
6. **Local Network Access.** The dashboard's requests to loopback set `targetAddressSpace: 'loopback'`
   where the browser supports it (Chrome's adoption guide, measurement §3), and the settings page
   explains the one-time prompt before the first pairing (`EVERY STEP EXPLAINS ITSELF`). If a preflight
   still carries the older `Access-Control-Request-Private-Network: true`, the bridge answers
   `Access-Control-Allow-Private-Network: true`; it costs nothing, and PNA is "put on hold".
7. **The mailbox password** reaches the bridge only in the body of a mail request over this API
   (`THE MAILBOX PASSWORD LEAVES THE BROWSER ONLY TO THE BRIDGE`), is kept in memory for that request
   and dropped (MOD-mailbox).
8. **A generic protocol, a composed route table.** The server and the dashboard's client know the
   protocol — bind, token, origin, host, CORS, errors — and no domain: the bridge app composes the route
   table from the modules that own the routes (agents and local model servers, mail, tunnels). The
   endpoints are `GET /hello` (version, paired origin, agents, shell mode; the pairing test),
   `GET /agents`, `POST /jobs`, `GET /jobs`, `GET /jobs/<id>`, `GET /jobs/<id>/log`, `DELETE /jobs/<id>`
   (cancel), `GET /endpoint/models`, `POST /endpoint/chat` (local model servers, ARC-009),
   `POST /mail/read`, `POST /mail/find`, `POST /mail/draft`, `POST /mail/send`, `GET /tunnels`. Their
   names are part of the protocol version the bridge reports in `/hello`; the dashboard refuses a bridge
   with an unknown major version.

## Alternatives

- **The bridge token in `Authorization: Bearer` on the loopback route and elsewhere on the HTTPS
  route** — rejected: two ways to authenticate one protocol; the header of its own works on both routes.
- **WebSocket API** — rejected (point 2).
- **Pairing by a one-time code in the URL** (`http://127.0.0.1:port/pair#code`) — rejected by
  `A CREDENTIAL IS NEVER PLACED IN A URL`; the token is copied from the bridge's window instead
  (`THE BRIDGE SHOWS ITS PAIRING TOKEN IN ITS WINDOW`).
- **HTTPS on loopback with a self-signed certificate** — rejected: the person would have to trust a
  certificate by hand on every computer. Its original reason, "the mixed-content exemptions", does not
  hold for Safari (measurement §3); Safari is served by the HTTPS route of ARC-013 instead, with a
  certificate the browsers already trust.
- **Domain methods on the client** (`client.mail…`, `client.agents…`) — rejected: the protocol module
  would know mail, agents and endpoints, and change with each of them; the module that owns a route calls
  it through the generic client.
- **Native messaging through a browser extension** — rejected: an extension per browser is a second
  thing to install and review for a non-expert.

## Consequences

- In Chrome, Edge and Firefox the loopback route works after one prompt per site, according to their
  documentation; in Safari only the HTTPS route of ARC-013 works. The dashboard recognises a blocked call
  and offers that route (UC-011 2a, UC-044 4c).
- **Open measurement 1 — reachability per browser, loopback.** From `https://akmaier.github.io` to a
  test server on `http://127.0.0.1:<port>`: whether a `fetch` with the bridge-token header and a JSON
  body succeeds, which prompt appears, and whether it is remembered — Chrome, Edge and Firefox on macOS
  and Windows, and Safari 26 on macOS with its console message (the compatibility data names no Safari
  version). Recorded in `docs/measurements/` before the bridge is released (`BROWSER REACHABILITY IS
  MEASURED, NOT ASSUMED`). `localhost` and `127.0.0.1` behave alike in every source read, so both are
  kept in the measurement only as a check.
- The API is the only way into the bridge; a tunnel or the web server forwards to it and adds nothing
  but the web server's own login.
- A new route is a handler of the module that owns it and a line of the bridge app's table; the protocol
  module does not change.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; revised on 2026-09-30 by Claude (claude-opus-5-5) against commit 1110607b6dc4d9c888549a23a680fbe4b38dd3f1 — SPEC and use cases as accepted that day, and `docs/measurements/2026-09-30_architecture-open-points.md`; revised on 2026-10-01 by Claude (claude-opus-5-5) against commit d0e5631081876203e719a2508d673d904e7768db — the leaner architecture of the architecture review, as the PO approved it (UC-023): the bridge side only; the HTTPS route through the jump host (decision 9) moved to ARC-013, the browser facts to the measurement it cites; open until accepted.*
