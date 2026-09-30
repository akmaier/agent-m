---
id: MOD-bridge-tunnel
title: Writes, checks and — in the bridge — opens and keeps the SSH tunnels to the jump host, and writes the jump host's web-server configuration for the HTTPS route
realises:
  - A BRIDGE BEHIND NAT IS REACHED THROUGH A REVERSE TUNNEL
  - A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK
  - EACH REMOTE SESSION HAS ITS OWN PORT FROM THE CONFIGURED RANGE
  - THE DASHBOARD WRITES THE TUNNEL COMMANDS
  - THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS
  - THE BRIDGE OPENS ITS TUNNELS ITSELF
  - THE BRIDGE CREATES ITS OWN SSH KEY
  - REMOTE ACCESS TO THE BRIDGE GOES THROUGH A TUNNEL
  - A BRIDGE CAN BE REACHED OVER HTTPS THROUGH THE JUMP HOST
  - THE JUMP HOST FORWARDS TO A BRIDGE ONLY AFTER ITS OWN LOGIN
  - THE JUMP HOST ALLOWS CROSS-ORIGIN REQUESTS ONLY FROM THE INSTANCE
  - UC-011
  - UC-042
  - UC-044
follows:
  - ARC-003
  - ARC-012
  - ARC-013
uses: []
provides:
  - jumpHostProblem
  - allocatePort
  - tunnelCommands
  - tunnelBindProblems
  - webServerConfig
  - sshClient
  - ensureKey
  - superviseTunnel
---
# MOD-bridge-tunnel Writes, checks and — in the bridge — opens and keeps the SSH tunnels to the jump host, and writes the jump host's web-server configuration for the HTTPS route

## Responsibility

Tunnels of ARC-013: the commands and their checks, used by the dashboard's settings page for
machines without a bridge, and the same commands executed and supervised by the bridge with its own
key and its own OpenSSH client; and the web-server block that puts a session's tunnel end behind the
jump host's HTTPS address (ARC-012 point 9, ARC-013 decision 6 — proposed). The jump host's name, SSH
user, port range, HTTPS address and web-server login, and each session's name, port and bridge token,
are read from the browser settings (MOD-settings-store); this module keeps none of them.

**Current state.** In `review-core.mjs` today: `jumpHostProblem`, `nextFreePort`, `addRemoteSession`,
`tunnelBindProblems`, `tunnelCommands`, `KEEPALIVE_SECONDS`; they move here. `webServerConfig`,
`sshClient`, `ensureKey` and `superviseTunnel` do not exist yet.

## Interfaces

- `jumpHostProblem(jump) -> null | reason` — host, SSH user, port range, key file names (never key contents); for the HTTPS route also an `https://` address on the jump host's name and a login name.
- `allocatePort(jump, sessions, wanted?) -> port` — the lowest free port of the range, or the wanted one if free and in range; no free port is refused with the reason.
- `tunnelCommands(jump, session, keyFile?) -> { reverse: [argv], forward: [argv], url }` — both ends as argument lists (the dashboard shows them joined), binding `127.0.0.1` explicitly, forwarding to `127.0.0.1`, keep-alive and `ExitOnForwardFailure`; `url` is `http://localhost:<port>` on the loopback route and `https://<jump host>/<base path>/<port>/` on the HTTPS route.
- `tunnelBindProblems(command) -> [problem]` — any `-R`/`-L` not bound to loopback, `-g`, or `GatewayPorts` is refused.
- `webServerConfig(jump, sessions, pagesOrigin) -> { apache, nginx, htpasswd }` — the blocks for every session of one jump host: a reverse proxy from `<base path>/<port>/` to `http://127.0.0.1:<port>/`, Basic authentication before any proxying, the `OPTIONS` preflight answered by the web server for `pagesOrigin` only and never forwarded, no `Access-Control-Allow-Origin` of its own on forwarded answers, no request bodies logged; `htpasswd` is the command to create the login with `htpasswd -B` on the jump host — no password and no hash is ever part of the output. A block that would proxy without login, answer `*` or proxy to a non-loopback address is refused, as `tunnelBindProblems` refuses a bad tunnel.
- `sshClient(platform, appDir) -> { ssh, sshKeygen, notices? }` — the bridge side: on macOS and Linux the system's `ssh` and `ssh-keygen`; on Windows the Win32-OpenSSH `ssh.exe` and `ssh-keygen.exe` shipped in the bridge's install folder, with the paths of its `LICENSE.txt` and `NOTICE.txt` for the *About* window; a missing file is reported, never replaced by whatever is on the path.
- `ensureKey(dir) -> { publicKey, fingerprint }` — the bridge side: creates `id_ed25519` with the `ssh-keygen` of `sshClient` on first use, owner-only permissions (on Windows an ACL for the user only); the private key is never returned.
- `superviseTunnel(argv, dir) -> { state(), stop() }` — the bridge side: runs the `ssh` of `sshClient` as a child with an argument array (no shell), its own `known_hosts`, restarts with backoff, reports *open* or the last error.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; revised on 2026-09-30 by Claude (claude-opus-5-5) against commit 1110607b6dc4d9c888549a23a680fbe4b38dd3f1 — SPEC and use cases as accepted that day, and `docs/measurements/2026-09-30_architecture-open-points.md`; open until accepted.*
