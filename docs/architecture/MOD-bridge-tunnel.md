---
id: MOD-bridge-tunnel
title: Writes, checks and — in the bridge — opens and keeps the SSH tunnels to the jump host
realises:
  - A BRIDGE BEHIND NAT IS REACHED THROUGH A REVERSE TUNNEL
  - A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK
  - EACH REMOTE SESSION HAS ITS OWN PORT FROM THE CONFIGURED RANGE
  - THE DASHBOARD WRITES THE TUNNEL COMMANDS
  - THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS
  - THE BRIDGE OPENS ITS TUNNELS ITSELF
  - THE BRIDGE CREATES ITS OWN SSH KEY
  - REMOTE ACCESS TO THE BRIDGE GOES THROUGH A TUNNEL
  - UC-011
  - UC-044
follows:
  - ARC-003
  - ARC-013
uses: []
provides:
  - jumpHostProblem
  - allocatePort
  - tunnelCommands
  - tunnelBindProblems
  - ensureKey
  - superviseTunnel
---
# MOD-bridge-tunnel Writes, checks and — in the bridge — opens and keeps the SSH tunnels to the jump host

## Responsibility

Tunnels of ARC-013: the commands and their checks, used by the dashboard's settings page for
machines without a bridge, and the same commands executed and supervised by the bridge with its own
key.

**Current state.** In `review-core.mjs` today: `jumpHostProblem`, `nextFreePort`, `addRemoteSession`,
`tunnelBindProblems`, `tunnelCommands`, `KEEPALIVE_SECONDS`; they move here. `ensureKey` and
`superviseTunnel` do not exist yet.

## Interfaces

- `jumpHostProblem(jump) -> null | reason` — host, SSH user, port range, key file names (never key contents).
- `allocatePort(jump, sessions, wanted?) -> port` — the lowest free port of the range, or the wanted one if free and in range; no free port is refused with the reason.
- `tunnelCommands(jump, session, keyFile?) -> { reverse: [argv], forward: [argv], url }` — both ends as argument lists (the dashboard shows them joined), binding `127.0.0.1` explicitly, forwarding to `127.0.0.1`, keep-alive and `ExitOnForwardFailure`.
- `tunnelBindProblems(command) -> [problem]` — any `-R`/`-L` not bound to loopback, `-g`, or `GatewayPorts` is refused.
- `ensureKey(dir) -> { publicKey, fingerprint }` — the bridge side: creates `id_ed25519` with `ssh-keygen` on first use, owner-only permissions; the private key is never returned.
- `superviseTunnel(argv, dir) -> { state(), stop() }` — the bridge side: runs the system `ssh` as a child with an argument array (no shell), its own `known_hosts`, restarts with backoff, reports *open* or the last error.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; open until accepted.*
