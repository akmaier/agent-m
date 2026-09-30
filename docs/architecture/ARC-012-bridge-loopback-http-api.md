---
id: ARC-012
title: The bridge's loopback HTTP API — bearer token, CORS for the one paired Pages origin, host check, and Chrome's Local Network Access permission
forced_by:
  - THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY
  - THE LOCAL BRIDGE REQUIRES A TOKEN
  - THE BRIDGE IS PAIRED ONCE
  - BROWSER REACHABILITY IS MEASURED, NOT ASSUMED
  - A CREDENTIAL IS NEVER PLACED IN A URL
  - THE MAILBOX PASSWORD LEAVES THE BROWSER ONLY TO THE BRIDGE
  - REMOTE ACCESS TO THE BRIDGE GOES THROUGH A TUNNEL
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

Browser behaviour for requests from a public HTTPS page to loopback changed in 2025. Read 2026-09-30
at `https://developer.chrome.com/blog/local-network-access`: Chrome's earlier Private Network Access
preflights were "put on hold" and replaced by *Local Network Access*, a **permission prompt** for
"any request from the public network to a local network or loopback destination"; opt-in from
Chrome 138, "launching in Chrome 142" (update of 2025-09-29). WebSockets are listed there among the
known limitations.

## Decision

1. **Bind.** The bridge listens on `127.0.0.1` (and `::1`) only; any other configured address is
   refused at start (`THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY`). The port is the bridge's own setting
   (ARC-011).
2. **Plain HTTP with `fetch`, JSON bodies, no WebSockets.** Long-running output (a job's log) is
   read by polling a cursor (`GET /jobs/<id>/log?after=<n>`), avoiding the WebSocket limitation named
   by the Local Network Access announcement and keeping one request type to measure.
3. **Authentication.** Every request except the CORS preflight carries
   `Authorization: Bearer <pairing token>`; the bridge compares it in constant time and answers
   `401` without a body otherwise. The token is 256 random bits, kept in a file readable by its user
   only, replaced by *Pair anew*. It never appears in a URL, a log line or an export's clear text.
4. **Origin.** At pairing, the bridge records the origin of the dashboard that paired it. CORS
   answers name exactly that origin (never `*`), allow the methods `GET, POST, DELETE` and the headers
   `authorization, content-type`, and send no credentials mode. A request whose `Origin` is another
   web origin is refused before the token is checked.
5. **Host check.** The bridge refuses a request whose `Host` header is not `127.0.0.1:<port>`,
   `localhost:<port>` or `[::1]:<port>` — protection against DNS rebinding, which the token alone
   also stops but which costs nothing to check.
6. **Private Network Access, where still sent.** If a preflight carries
   `Access-Control-Request-Private-Network: true`, the bridge answers
   `Access-Control-Allow-Private-Network: true`; browsers that use the permission prompt instead need
   nothing from the server.
7. **The mailbox password** reaches the bridge only in the body of a mail request over this API
   (`THE MAILBOX PASSWORD LEAVES THE BROWSER ONLY TO THE BRIDGE`), is kept in memory for that request
   and dropped (MOD-bridge-mail).
8. **Endpoints** (MOD-bridge-server): `GET /hello` (version, paired origin, agents; the pairing test),
   `GET /agents`, `POST /jobs`, `GET /jobs`, `GET /jobs/<id>`, `GET /jobs/<id>/log`,
   `DELETE /jobs/<id>` (cancel), `POST /mail/read`, `POST /mail/find`, `POST /mail/draft`,
   `POST /mail/send`, `GET /tunnels`. The endpoint names are part of the protocol version the bridge
   reports in `/hello`; the dashboard refuses a bridge with an unknown major version.

## Alternatives

- **WebSocket API** — rejected: named as a known limitation of Local Network Access in the source
  above, and not needed (point 2).
- **Pairing by a one-time code in the URL** (`http://127.0.0.1:port/pair#code`) — rejected by
  `A CREDENTIAL IS NEVER PLACED IN A URL`; the token is copied from the bridge's window instead
  (`THE BRIDGE SHOWS ITS PAIRING TOKEN IN ITS WINDOW`).
- **HTTPS on loopback with a self-signed certificate** — rejected: the person would have to trust a
  certificate by hand; loopback HTTP is what the permission prompt and the mixed-content exemptions are
  designed around.
- **Native messaging through a browser extension** — rejected: an extension per browser is a second
  thing to install and review for a non-expert.

## Consequences

- **Open measurement 1 — reachability per browser.** From `https://akmaier.github.io` to a test
  server on `http://127.0.0.1:<port>`: does a `fetch` with an `Authorization` header and a JSON body
  succeed, which prompt appears, and is the permission remembered — on current Chrome (≥ 142),
  Edge, Firefox and Safari on macOS, and Chrome and Edge on Windows. To be recorded in
  `docs/measurements/` before the bridge is released (`BROWSER REACHABILITY IS MEASURED, NOT
  ASSUMED`). Until measured, the claim that loopback HTTP is not blocked as mixed content (PLAN §7) is
  unverified.
- **Open measurement 2 — `localhost` versus `127.0.0.1`.** The current dashboard probes
  `http://localhost:<port>` for remote sessions (`probeLocalPort`); whether both names behave the same
  under Local Network Access is part of measurement 1.
- The permission prompt is a one-time step for the person; the settings page explains it before the
  first pairing (`EVERY STEP EXPLAINS ITSELF`).
- The API is the only way into the bridge; a tunnel (ARC-013) forwards to it and adds nothing.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; open until accepted.*
