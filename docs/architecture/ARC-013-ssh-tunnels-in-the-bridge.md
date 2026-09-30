---
id: ARC-013
title: The bridge opens its SSH tunnels with the system OpenSSH client and a key of its own, running the commands the core already writes
forced_by:
  - THE BRIDGE OPENS ITS TUNNELS ITSELF
  - THE BRIDGE CREATES ITS OWN SSH KEY
  - A BRIDGE BEHIND NAT IS REACHED THROUGH A REVERSE TUNNEL
  - A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK
  - EACH REMOTE SESSION HAS ITS OWN PORT FROM THE CONFIGURED RANGE
  - THE DASHBOARD WRITES THE TUNNEL COMMANDS
  - REMOTE ACCESS TO THE BRIDGE GOES THROUGH A TUNNEL
  - A REUSE DECISION RECORDS ITS DUE DILIGENCE
  - UC-011
  - UC-044
---
# ARC-013 SSH tunnels in the bridge: system OpenSSH, own key, the core's commands

## Context

A bridge behind NAT is reached through a reverse tunnel it opens to a jump host, and the person's
own machine opens a forward to that jump host (`A BRIDGE BEHIND NAT IS REACHED THROUGH A REVERSE
TUNNEL`). With the bridge app, the bridges open and keep these tunnels themselves, with an SSH key
each bridge creates on first use and never lets leave its machine. The core already writes both
commands and checks them (`tunnelCommands`, `tunnelBindProblems`, `nextFreePort` in
`review-core.mjs`): `ssh -N -o ServerAliveInterval=30 -o ServerAliveCountMax=3 -o
ExitOnForwardFailure=yes -R 127.0.0.1:<port>:127.0.0.1:<bridge port> <user>@<jump host>` and the
matching `-L`. The process repository's support cockpit runs the same pattern, restarted by
launchd; measured 2026-08-24: restart after 5 s, tunnel end on the jump host's loopback only
(`SOFTWARE_MAINTENANCE.md` §6.1a).

## Decision

1. **The bridge runs the system `ssh` client**, as a child process, with exactly the argument list
   `MOD-bridge-tunnel.tunnelCommands` produces and `tunnelBindProblems` accepts — one definition for
   the dashboard's displayed command and the bridge's executed one. Arguments are passed as an array,
   never through a shell.
2. **Own key.** On first use the bridge runs `ssh-keygen -t ed25519 -N "" -f <bridge dir>/id_ed25519`
   and sets the private key's mode to owner-only; it shows the public key with *Copy* and one sentence
   of what to do with it. The private key is never read into the dashboard, an export, or a log. The
   command also sets `-i <that file>` and `-o IdentitiesOnly=yes`, so the person's other keys are
   not offered to the jump host.
3. **Host key.** The first connection shows the jump host's key fingerprint in the bridge window and
   stores it in the bridge's own `known_hosts` (`-o UserKnownHostsFile=<bridge dir>/known_hosts
   -o StrictHostKeyChecking=yes` after the first acceptance); the person accepts once.
4. **Supervision.** The bridge restarts `ssh` with backoff when it exits, after sleep or a network
   change, and shows *tunnel open* or the last error from `ssh`'s stderr in its window and in `GET
   /tunnels`.
5. **Where OpenSSH is missing** (Windows without the optional feature), the bridge says so and shows
   the vendor's installation step, as it does for a missing agent CLI; tunnels stay off until then.

### Due diligence (read 2026-09-30)

| Candidate | Licence | Against MIT | Releases | Issues | Adoption / availability |
|---|---|---|---|---|---|
| **OpenSSH client** (openssh/openssh-portable; invoked, not redistributed) — chosen | `LICENCE`: "all components are under a BSD licence, or a licence more free than that. OpenSSH contains no GPL code." | compatible; not redistributed anyway | 10.5 on 2026-08-11, 10.4 on 2026-07-06, 10.3 on 2026-04-02, 10.2 on 2025-10-10, 10.1 on 2025-10-06 (`https://www.openssh.com/releasenotes.html`) | the portable repository takes no issues on GitHub (0 open, 0 closed via search); bugs go to the project's bugzilla (not read) | Windows: "Beginning with Windows 10 build 1809 … OpenSSH is available as a feature on demand"; the page's table lists Windows 10 1809+ as "Not installed, install and enable using optional features" (`https://learn.microsoft.com/en-us/windows-server/administration/openssh/openssh-overview`); PowerShell/Win32-OpenSSH: 407 open, 1 846 closed issues, latest release 10.0.0.0p2-Preview on 2025-10-27 |
| ssh2 (mscdex/ssh2), pure-JS SSH in Node, through Deno's npm compatibility | MIT (`LICENSE`; npm field empty) | compatible | 1.17.0 on 2025-08-20; no version in 12 months | 61 open, 1 281 closed, 12 closed in 12 months | 48 068 287 downloads last month; 5 825 stars; one maintainer |
| node-ssh (steelbrain/node-ssh), wrapper over ssh2 | MIT | compatible | 13.2.1 on 2025-03-20; none in 12 months | — | 1 559 769 downloads last month |

## Alternatives

- **ssh2 inside the bridge** — not chosen now: it would make the bridge independent of an installed
  client (the Windows case), but it has had no release in twelve months, one maintainer, and it
  depends on Node's `crypto` and `net` as implemented by Deno's compatibility layer — unmeasured. The
  commands the dashboard shows would then no longer be the commands that run.
- **Deno's own TCP plus a hand-written SSH client** — rejected: implementing a security protocol is
  exactly what not to do.
- **A VPN or an overlay network (WireGuard, Tailscale)** — rejected: another service and account;
  SSH to a host the person already controls is what the SPEC names.

## Consequences

- On macOS and common Linux distributions an OpenSSH client is part of the system (not measured here
  per distribution); on Windows the table above says the feature may be absent, and adding it needs an
  administrator — the non-expert case the bridge was built for. **Open measurement:** on a fresh
  Windows 11 consumer installation, is `ssh.exe` present by default (the Microsoft table does not list
  Windows 11)? If it is not, the PO decides between guiding the installation and switching to ssh2
  after a measurement of ssh2 under `deno compile`.
- The jump host keeps `GatewayPorts no` (its default); the bridge never passes `-g` or a non-loopback
  bind address, which `tunnelBindProblems` already refuses.
- The core's tunnel functions move from `review-core.mjs` to MOD-bridge-tunnel; the settings page
  keeps showing the commands for machines without a bridge (`THE DASHBOARD WRITES THE TUNNEL
  COMMANDS`).

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; open until accepted.*
