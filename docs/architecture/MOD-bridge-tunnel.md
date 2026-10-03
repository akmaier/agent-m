---
id: MOD-bridge-tunnel
title: Writes, checks and — in the bridge — opens and keeps the SSH tunnels to the jump host, and writes the jump host's web-server configuration for the HTTPS route
realises:
  - REMOTE ACCESS TO THE BRIDGE GOES THROUGH A TUNNEL
  - A BRIDGE BEHIND NAT IS REACHED THROUGH A REVERSE TUNNEL
  - A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK
  - EACH REMOTE SESSION HAS ITS OWN PORT FROM THE CONFIGURED RANGE
  - THE DASHBOARD WRITES THE TUNNEL COMMANDS
  - THE JUMP HOST FORWARDS TO A BRIDGE ONLY AFTER ITS OWN LOGIN
  - THE JUMP HOST ALLOWS CROSS-ORIGIN REQUESTS ONLY FROM THE INSTANCE
  - THE BRIDGE OPENS ITS TUNNELS ITSELF
  - THE BRIDGE CREATES ITS OWN SSH KEY
  - UC-011
follows:
  - ARC-003
  - ARC-013
uses: []
provides:
  - jumpHostProblem
  - nextFreePort
  - tunnelCommands
  - tunnelBindProblems
  - webServerConfig
  - sshClient
  - ensureKey
  - superviseTunnel
  - addRemoteSession
  - probeLocalPort
---
# MOD-bridge-tunnel SSH tunnels to the jump host, and the jump host's web-server configuration

## Responsibility

Adapter. The tunnels of ARC-013: the commands and their checks, used by the dashboard's settings page for
machines without a bridge, and the same commands executed and supervised by the bridge with its own key
and its own OpenSSH client; and the web-server block that puts a session's tunnel end behind the jump
host's HTTPS address (ARC-013 decisions 5 and 6). The jump host's name, SSH user, port range, HTTPS
address and web-server login, and each session's name and port, are passed in by the caller; the bridge's
key and `known_hosts` live in the bridge's directory, which the bridge app passes in. This module keeps
none of them.

## Interfaces

- `jumpHostProblem(jump) -> null | reason` — host, SSH user, port range, key file names (never key contents); for the HTTPS route also an `https://` address on the jump host's name and a login name.
- `nextFreePort(jump, sessions) -> port` — the lowest port of the range that no session uses; no free port is refused with the reason.
- `addRemoteSession(jump, sessions, { name, port?, bridgePort, token? }) -> sessions` — the list with the new session: its port the lowest free one, or the chosen one if it lies in the range and no other session has it; refused with the reason when the jump host is not set or not valid, the name, bridge port or token is not well-formed, or the name is taken.
- `tunnelCommands(jump, session, keyFile?) -> { reverse: [argv], forward: [argv], url }` — both ends as argument lists (the dashboard shows them joined), binding `127.0.0.1` explicitly, forwarding to `127.0.0.1`, keep-alive and `ExitOnForwardFailure`; `url` is `http://localhost:<port>` on the loopback route and `https://<jump host>/<base path>/<port>/` on the HTTPS route.
- `tunnelBindProblems(command) -> [problem]` — any `-R`/`-L` not bound to loopback, `-g`, or `GatewayPorts` is refused.
- `webServerConfig(jump, sessions, pagesOrigin) -> { apache, nginx, htpasswd }` — the blocks for every session of one jump host: a reverse proxy from `<base path>/<port>/` to `http://127.0.0.1:<port>/`, Basic authentication before any proxying, the `OPTIONS` preflight answered by the web server for `pagesOrigin` only and never forwarded, no `Access-Control-Allow-Origin` of its own on forwarded answers, no request bodies logged; `htpasswd` is the command to create the login with `htpasswd -B` on the jump host — no password and no hash is ever part of the output. A block that would proxy without login, answer `*` or proxy to a non-loopback address is refused, as `tunnelBindProblems` refuses a bad tunnel.
- `sshClient(platform, appDir) -> { ssh, sshKeygen, notices? }` — the bridge side: on macOS and Linux the system's `ssh` and `ssh-keygen`; on Windows the Win32-OpenSSH `ssh.exe` and `ssh-keygen.exe` shipped in the bridge's install folder, with the paths of its `LICENSE.txt` and `NOTICE.txt` for the *About* window; a missing file is reported, never replaced by whatever is on the path.
- `ensureKey(dir) -> { publicKey, fingerprint }` — the bridge side: creates `id_ed25519` with the `ssh-keygen` of `sshClient` on first use, owner-only permissions (on Windows an ACL for the user only); the private key is never returned.
- `superviseTunnel(argv, dir) -> { state(), stop() }` — the bridge side: runs the `ssh` of `sshClient` as a child with an argument array (no shell), its own `known_hosts`, restarts with backoff, reports *open* or the last error.
- `probeLocalPort(port) -> Promise<boolean>` — whether anything answers at `http://localhost:<port>/`: one request without token or header, whose answer is not read (`no-cors`); the module's only request.

## Testing

Unit tests for the writers and checks (`tests/review-core.test.mjs`, `tests/test_bridge_tunnel.py`): a command bound to `0.0.0.0`,
with `-g` or `GatewayPorts` is refused, the generated one passes; the port allocator never hands out a used
port or one outside the range; a web-server block without login, with `*` or to a non-loopback address is
refused, and no output contains a password or a hash. Component tests for the bridge side with a fake
`ssh` executable on the path: the argument array is exactly `tunnelCommands`' reverse end, the child is
restarted after it exits, and the private key never appears in a result. The seams are the process spawner
and the file system. A system test against a real OpenSSH server on loopback runs before a release
(ARC-016). No model is involved.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; revised on 2026-09-30 by Claude (claude-opus-5-5) against commit 1110607b6dc4d9c888549a23a680fbe4b38dd3f1 — SPEC and use cases as accepted that day, and `docs/measurements/2026-09-30_architecture-open-points.md`; revised on 2026-10-01 by Claude (claude-opus-5-5) against commit d0e5631081876203e719a2508d673d904e7768db — the leaner architecture of the architecture review, as the PO approved it (UC-023): the HTTPS route's reasons stay in ARC-013, settings passed in, the current state removed, rules it does not check left to their owners; revised on 2026-10-03 by Claude (claude-opus-5-5) against commit 230662f4a7d0fe40cae0b00b8973d1d752eb609f — ITM-138, akmaier's option A: the names other modules use are provided and used as the code has them; open until accepted.*
