---
id: MOD-bridge-server
title: The bridge's HTTP protocol on both ends — the loopback server inside the bridge and the dashboard's generic client for it, on loopback or over HTTPS through the jump host
realises:
  - THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY
  - THE LOCAL BRIDGE REQUIRES A TOKEN
  - A BRIDGE CAN BE REACHED OVER HTTPS THROUGH THE JUMP HOST
  - UC-011
follows:
  - ARC-003
  - ARC-012
  - ARC-013
uses: []
provides:
  - serve
  - bridgeClient
  - pairing
---
# MOD-bridge-server The bridge's HTTP protocol on both ends

## Responsibility

Adapter. The protocol of ARC-012 on both ends: the server inside the bridge and the client in the
dashboard. It knows nothing about agents, local model servers, mail or tunnels — the bridge app composes
their handlers into the route table, and the participant and mailbox adapters call the client with their
own paths. The route a client takes — loopback, or the jump host's HTTPS address with its web-server login
(ARC-013) — and the bridge token are passed in by the caller; the pairing token is kept in the bridge's
store, which the bridge app passes in. This module reads no store of its own.

## Interfaces

- `serve({ port, sessionPort, token, pairedOrigin, routes }) -> server` — binds `127.0.0.1` and `::1` only (any other bind address refused), answers CORS for the paired origin only with the headers `agent-m-bridge-token, authorization, content-type`, accepts a `Host` of `127.0.0.1`, `localhost` or `[::1]` with its own port or its session port, compares the `Agent-M-Bridge-Token` header in constant time and ignores `Authorization`, dispatches to the route table passed in; logs route and outcome, never bodies.
- `bridgeClient({ route, token }) -> { call(method, path, body) }` — the generic client every browser-side caller uses. `route` is `{ kind: "loopback", address }` or `{ kind: "https", url, login }`. The bridge token goes only in `Agent-M-Bridge-Token` to that route's address; on the HTTPS route the web-server login goes only as `Authorization: Basic` to that same address, never elsewhere and never in a URL. A refused or unreachable bridge is named with its reason: a browser that blocks loopback, a `401` from the web server (its login), a `401` from the bridge (its token), a failed TLS connection (the certificate).
- `pairing(store) -> { token(), pairAnew() }` — the pairing token kept in the bridge's store, readable by its owner only; *Pair anew* replaces it and the old one is refused.

## Testing

Component tests against a server on an ephemeral loopback port (`tests/test_bridge_loopback.py`, `tests/test_bridge_token.py`): a bind
address other than loopback is refused; a request without the token, with a wrong token, from another
origin or with another `Host` is refused, and one with the right token answered; after *Pair anew* the old
token is refused. For the client, a fake `fetch` records every request: the bridge token and the login go
only to the route's address, never in a URL, and each refusal is named with its reason. The seams are
`fetch` and the listening socket. Whether a browser reaches loopback from the Pages origin is measured per
browser (ARC-012), not assumed. No model is involved.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; revised on 2026-09-30 by Claude (claude-opus-5-5) against commit 1110607b6dc4d9c888549a23a680fbe4b38dd3f1 — SPEC and use cases as accepted that day, and `docs/measurements/2026-09-30_architecture-open-points.md`; revised on 2026-10-01 by Claude (claude-opus-5-5) against commit d0e5631081876203e719a2508d673d904e7768db — the leaner architecture of the architecture review, as the PO approved it (UC-023): a generic client without domain methods, the pairing token in the bridge's store passed in, the current state removed; open until accepted.*
