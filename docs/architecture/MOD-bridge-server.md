---
id: MOD-bridge-server
title: Serves the bridge's loopback HTTP API and is the dashboard's client for it
realises:
  - THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY
  - THE LOCAL BRIDGE REQUIRES A TOKEN
  - THE BRIDGE IS PAIRED ONCE
  - REMOTE ACCESS TO THE BRIDGE GOES THROUGH A TUNNEL
  - THE MAILBOX PASSWORD LEAVES THE BROWSER ONLY TO THE BRIDGE
  - UC-011
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
# MOD-bridge-server Serves the bridge's loopback HTTP API and is the dashboard's client for it

## Responsibility

The protocol of ARC-012 on both ends: the server inside the bridge and the client in the dashboard.
It knows nothing about agents, mail or tunnels; the bridge app composes those into its route table.

**Current state.** No bridge exists. `probeLocalPort` in `review-core.mjs` (the settings page's
reachability test for a remote session) moves here as part of `bridgeClient`.

## Interfaces

- `serve({ port, token, pairedOrigin, routes }) -> server` — binds `127.0.0.1` and `::1` only (any other bind address refused), answers CORS for the paired origin only, checks `Host`, compares the bearer token in constant time, dispatches to the route table the app passes in; logs route and outcome, never bodies.
- `bridgeClient({ address, token }) -> { hello(), agents(), jobs…, mail…, tunnels() }` — the dashboard's calls to a bridge; the token only in the `Authorization` header to that address; a refused or unreachable bridge is named with its reason.
- `pairing(dir) -> { token(), pairAnew() }` — the token kept in a file readable by its owner only; *Pair anew* replaces it and the old one is refused.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; open until accepted.*
