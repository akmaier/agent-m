---
id: MOD-bridge-server
title: Serves the bridge's loopback HTTP API and is the dashboard's client for it, on loopback or over HTTPS through the jump host
realises:
  - THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY
  - THE LOCAL BRIDGE REQUIRES A TOKEN
  - THE BRIDGE IS PAIRED ONCE
  - REMOTE ACCESS TO THE BRIDGE GOES THROUGH A TUNNEL
  - THE MAILBOX PASSWORD LEAVES THE BROWSER ONLY TO THE BRIDGE
  - A BRIDGE CAN BE REACHED OVER HTTPS THROUGH THE JUMP HOST
  - THE JUMP HOST FORWARDS TO A BRIDGE ONLY AFTER ITS OWN LOGIN
  - THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS
  - UC-011
  - UC-042
  - UC-044
follows:
  - ARC-011
  - ARC-012
uses: []
provides:
  - serve
  - bridgeClient
  - pairing
---
# MOD-bridge-server Serves the bridge's loopback HTTP API and is the dashboard's client for it, on loopback or over HTTPS through the jump host

## Responsibility

The protocol of ARC-012 on both ends: the server inside the bridge and the client in the dashboard.
It knows nothing about agents, local model servers, mail or tunnels; the bridge app composes those into
its route table. The client takes the route from the remote session's browser settings (`THE JUMP HOST
AND THE REMOTE SESSIONS ARE SETTINGS`): loopback, or the jump host's HTTPS address with its web-server
login.

**Current state.** No bridge exists. `probeLocalPort` in `review-core.mjs` (the settings page's
reachability test for a remote session) moves here as part of `bridgeClient`.

## Interfaces

- `serve({ port, sessionPort, token, pairedOrigin, routes }) -> server` — binds `127.0.0.1` and `::1` only (any other bind address refused), answers CORS for the paired origin only with the headers `agent-m-bridge-token, authorization, content-type`, accepts a `Host` of `127.0.0.1`, `localhost` or `[::1]` with its own port or its session port, compares the `Agent-M-Bridge-Token` header in constant time and ignores `Authorization`, dispatches to the route table the app passes in; logs route and outcome, never bodies.
- `bridgeClient({ route, token }) -> { hello(), agents(), jobs…, endpoint…, mail…, tunnels() }` — the dashboard's calls to a bridge. `route` is `{ kind: "loopback", address }` or `{ kind: "https", url, login }` from the session's settings. The bridge token goes only in `Agent-M-Bridge-Token` to that route's address; on the HTTPS route the web-server login goes only as `Authorization: Basic` to that same address, never elsewhere and never in a URL. A refused or unreachable bridge is named with its reason: a browser that blocks loopback (Safari), a `401` from the web server (its login), a `401` from the bridge (its token), a failed TLS connection (the certificate, ARC-012 point 9).
- `pairing(dir) -> { token(), pairAnew() }` — the token kept in a file readable by its owner only; *Pair anew* replaces it and the old one is refused.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; revised on 2026-09-30 by Claude (claude-opus-5-5) against commit 1110607b6dc4d9c888549a23a680fbe4b38dd3f1 — SPEC and use cases as accepted that day, and `docs/measurements/2026-09-30_architecture-open-points.md`; open until accepted.*
