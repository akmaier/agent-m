---
id: ARC-052
title: SSH in the Bridge
refines: ARC-037
forced_by:
  - THE BRIDGE OPENS ITS TUNNELS ITSELF
  - THE BRIDGE CREATES ITS OWN SSH KEY
  - A BRIDGE BEHIND NAT IS REACHED THROUGH A REVERSE TUNNEL
  - A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK
  - REMOTE ACCESS TO THE BRIDGE GOES THROUGH A TUNNEL
  - THE BRIDGE IS ONE FILE PER PLATFORM
  - THE BRIDGE RUNS AS AN APP
  - A REUSE DECISION RECORDS ITS DUE DILIGENCE
  - DUE DILIGENCE IS FETCHED, NOT RECALLED
  - A REUSED LICENCE IS SHOWN AGAINST THE PRODUCT'S
  - UC-011
  - UC-044
---
# ARC-052 SSH in the Bridge

## Context

A Bridge on a computer behind NAT opens a reverse tunnel to a jump host, bound to the jump host's loopback (`A BRIDGE
BEHIND NAT IS REACHED THROUGH A REVERSE TUNNEL`, `A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK`); the Bridge
on the person's own computer opens the matching forward. Both keep their connection open and reopen it after sleep or a
change of network, and nobody types an SSH command (`THE BRIDGE OPENS ITS TUNNELS ITSELF`). The Bridge makes its own key
pair on first use, keeps the private key on its computer only, readable by its owner, and shows the public key to be
added on the jump host (`THE BRIDGE CREATES ITS OWN SSH KEY`). The Bridge is one file per platform that needs no other
runtime installed (`THE BRIDGE IS ONE FILE PER PLATFORM`), installed by a person who may never have used a terminal
(UC-044).

## Decision

MOD-tunnels speaks SSH with the **ssh2** package, inside the Bridge's own process (its README):

- `forwardIn` asks the jump host to listen on an address and port the Bridge names — the jump host's loopback address —
  for the reverse tunnel;
- `forwardOut` opens the forward on the person's computer;
- `keepaliveInterval` sends SSH-level keepalives "in a similar way as OpenSSH's ServerAliveInterval";
- `generateKeyPairSync('ed25519')` makes the Bridge's own key pair, which MOD-tunnels writes to the Bridge's folder,
  readable by its owner only.

A tunnel's state is the connection's own events, which the Bridge's window and API show. Reopening a tunnel after sleep
or a change of network is the Bridge's own loop.

## Alternatives

- **The system's OpenSSH client** — `ssh` for the tunnels and `ssh-keygen` for the key —, started as child processes.
  OpenSSH is BSD-licensed, released steadily, and included in Linux systems and in Microsoft Windows (below). But on
  Windows its client is an optional feature: Microsoft's guide, for Windows 10 from build 1809 on, has the person check
  whether it is installed and otherwise add it under Optional Features or with `Add-WindowsCapability`, as a member of
  the Administrators group. That is a step the Bridge cannot take itself and that a person who never used a terminal
  should not have to take. A child process would also report a tunnel's state only through its output and its exit.
  Rejected.

## Due diligence

Agent M's own licence is MIT (its `LICENSE` file). Adoption of ssh2 is its downloads from the npm registry between
2026-09-05 and 2026-10-04; OpenSSH is no package, and its adoption is what its own project states.

| Candidate | Licence | Compatible with MIT | First release | Latest release | Releases | Open / closed issues | Adoption | Read from | Read on |
|---|---|---|---|---|---|---|---|---|---|
| ssh2 — chosen | none in the registry entry; MIT in the package's licence file, and MIT for its repository | yes, by its licence file | 2012-08-03 | 1.17.0, 2025-08-20 | 106 (106) | 61 / 1,281 | 51,599,247 | [1] | 2026-10-05 |
| OpenSSH, the system's client | its `LICENCE`: "all components are under a BSD licence, or a licence more free than that" | yes; not shipped by Agent M | 1.2.2p1, 2000-03-05 — the first in its release notes | 10.5/10.5p1, 2026-08-11 | 107 in its release notes | not on GitHub — "we do not use Github for bug reporting"; bugs are filed in its Bugzilla at bugzilla.mindrot.org | its list of users names, among others, "All Linux systems, such as Red Hat" and "Microsoft Windows" | [2] | 2026-10-05 |

No candidate is marked: both licences are known to be compatible with MIT.

Where each fact was read:

- [1] https://registry.npmjs.org/ssh2 (licence field, first release `time.created`, latest release `dist-tags.latest` and
  its time, `versions`, dependencies `asn1` and `bcrypt-pbkdf`, optional dependencies `nan` and `cpu-features`) ·
  https://unpkg.com/ssh2@1.17.0/LICENSE (the MIT licence text) · https://api.github.com/repos/mscdex/ssh2 (licence MIT,
  last push 2026-08-20) · https://api.npmjs.org/downloads/point/last-month/ssh2 ·
  https://api.github.com/search/issues?q=repo:mscdex/ssh2+is:issue+is:open and `+is:closed` (`total_count`) · its README:
  https://raw.githubusercontent.com/mscdex/ssh2/master/README.md
- [2] https://raw.githubusercontent.com/openssh/openssh-portable/master/LICENCE ·
  https://www.openssh.com/releasenotes.html (107 dated releases, from 1.2.2p1 of 2000-03-05 to 10.5/10.5p1 of 2026-08-11) ·
  https://raw.githubusercontent.com/openssh/openssh-portable/master/README and README.md (where bugs are reported) ·
  https://www.openssh.com/report.html · https://api.github.com/repos/openssh/openssh-portable (issues switched off on
  GitHub) · https://www.openssh.com/users.html · Microsoft's guide:
  https://learn.microsoft.com/en-us/windows-server/administration/openssh/openssh_install_firstuse

## Consequences

- The SSH implementation ships inside the Bridge; a security fix in it reaches people with the next Bridge release.
- ssh2's latest release is 1.17.0 of 2025-08-20, while its repository was last pushed to on 2026-08-20; the Bridge
  depends on its maintenance, and its due diligence is read again before every Bridge release.
- ssh2 names two optional native dependencies; whether a Bridge build includes them is for MOD-bridge-build to decide
  and measure.
- The jump host needs only its SSH server and, for the HTTPS route, its web server; it needs nothing of Agent M's.
