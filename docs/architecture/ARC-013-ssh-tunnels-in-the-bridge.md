---
id: ARC-013
title: The bridge opens its SSH tunnels with an OpenSSH client and a key of its own — the system's client on macOS and Linux, Win32-OpenSSH inside the Windows bridge —; the dashboard writes the tunnel commands, the service files and the jump host's web-server configuration, and reaches a session through a forward or over HTTPS through the jump host
forced_by:
  - THE BRIDGE OPENS ITS TUNNELS ITSELF
  - THE BRIDGE CREATES ITS OWN SSH KEY
  - A BRIDGE BEHIND NAT IS REACHED THROUGH A REVERSE TUNNEL
  - A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK
  - EACH REMOTE SESSION HAS ITS OWN PORT FROM THE CONFIGURED RANGE
  - THE DASHBOARD WRITES THE TUNNEL COMMANDS
  - REMOTE ACCESS TO THE BRIDGE GOES THROUGH A TUNNEL
  - A BRIDGE CAN BE REACHED OVER HTTPS THROUGH THE JUMP HOST
  - THE JUMP HOST FORWARDS TO A BRIDGE ONLY AFTER ITS OWN LOGIN
  - THE JUMP HOST ALLOWS CROSS-ORIGIN REQUESTS ONLY FROM THE INSTANCE
  - THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS
  - THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT
  - A CREDENTIAL IS NEVER PLACED IN A URL
  - BROWSER REACHABILITY IS MEASURED, NOT ASSUMED
  - EVERY STEP EXPLAINS ITSELF
  - THE BRIDGE IS ONE FILE PER PLATFORM
  - A REUSE DECISION RECORDS ITS DUE DILIGENCE
  - DUE DILIGENCE IS FETCHED, NOT RECALLED
  - A REUSED LICENCE IS SHOWN AGAINST THE PRODUCT'S
  - UC-011
  - UC-042
  - UC-044
keeps:
  - A BRIDGE CAN BE REACHED OVER HTTPS THROUGH THE JUMP HOST
  - THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT
---
# ARC-013 SSH tunnels in the bridge, and the jump host's HTTPS route

## Context

A bridge on a machine that accepts no incoming connection is reached through a reverse tunnel that machine opens to a jump host, and through a forward from the person's own machine to that jump host (`A BRIDGE BEHIND NAT IS REACHED THROUGH A REVERSE TUNNEL`); a bridge opens and keeps these tunnels itself, with an SSH key of its own (`THE BRIDGE OPENS ITS TUNNELS ITSELF`, `THE BRIDGE CREATES ITS OWN SSH KEY`); for a machine without a bridge the dashboard writes both commands (`THE DASHBOARD WRITES THE TUNNEL COMMANDS`). Instead of the forward, the dashboard may reach the tunnel's end through an HTTPS address of the jump host, with a certificate the browsers trust, whose web server forwards only after its own login and allows cross-origin requests from the instance's Pages origin only (`A BRIDGE CAN BE REACHED OVER HTTPS THROUGH THE JUMP HOST`, `THE JUMP HOST FORWARDS TO A BRIDGE ONLY AFTER ITS OWN LOGIN`, `THE JUMP HOST ALLOWS CROSS-ORIGIN REQUESTS ONLY FROM THE INSTANCE`) — the one route Safari allows, which blocks a page's call to loopback (ARC-012). The jump host and the remote sessions are this browser's settings (`THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS`, ARC-005: `MOD-settings-store.storeJumpHost`, `MOD-settings-store.storeRemoteSession`); the product's `docs/assets/bridge-tunnel.mjs` holds the checks and the commands' options this decision takes over.

What OpenSSH does with a forward's bind address decides `A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK`. ssh(1): "By default, TCP listening sockets on the server will be bound to the loopback interface only. This may be overridden by specifying a bind_address" (`https://man.openbsd.org/ssh.1`). sshd_config(5) on `GatewayPorts`: "no to force remote port forwardings to be available to the local host only, yes to force remote port forwardings to bind to the wildcard address … The default is no" (`https://man.openbsd.org/sshd_config.5`). The server's code accepts an explicit `127.0.0.1` where `GatewayPorts` is not `yes` — "If a specific IPv4/IPv6 localhost address has been requested then accept it even if gateway_ports is in effect" — and binds the wildcard address where it is `yes` (`channel_fwd_bind_addr`, `https://github.com/openssh/openssh-portable/blob/master/channels.c`).

Windows 10 and 11 have no OpenSSH client by default, and adding the feature needs an administrator (`https://learn.microsoft.com/en-us/troubleshoot/windows-server/system-management-components/cant-install-openssh-features`: "this situation isn't true for older versions of Windows Server or for Windows 11"; `https://learn.microsoft.com/en-us/windows-server/administration/openssh/openssh_install_firstuse`: "An account that is a member of the built-in Administrators group."; `docs/measurements/2026-09-30_architecture-open-points.md`, point 4).

## Decision

1. **One module writes every tunnel** (`MOD-bridge-tunnel`, an adapter of SSH, ARC-003): the checks, the commands, the service files and the web-server configuration, for the dashboard's settings page and for the bridge app. It starts no process: the bridge's shell runs the argument lists it writes as child processes, never through a shell, so that a setting cannot add a word to a command.
2. **The jump host and its sessions** (`MOD-bridge-tunnel.checkJumpHost`, `MOD-bridge-tunnel.newSession`). Every value of the jump host's settings is checked before it enters a command — its name, its SSH user, its port range, the key files it names, names only, never a key —, and, for the HTTPS route, an `https` address without query, fragment or login, with the web server's login. **+ Remote session** gives a session the lowest free port of the range, or the one chosen where it lies in the range and no other session has it; its bridge's port; its route — through a forward on this computer, or over HTTPS through the jump host —; and its bridge token: that of the bridge paired in this browser where the session is this computer's own bridge (UC-044 4c), else one the settings page draws (`MOD-bridge-server.newToken`), so that an export carries it to a bridge without a window (decision 7). The store keeps the rule of one port per session inside the range (ARC-005).
3. **The commands for a machine without a bridge** (`MOD-bridge-tunnel.tunnelCommands`, `MOD-bridge-tunnel.tunnelBindProblems`, `MOD-bridge-tunnel.serviceFiles`). The settings page shows, filled in from the settings, the reverse tunnel for the machine behind NAT and the forward for the person's machine:
   `ssh -N -o ServerAliveInterval=30 -o ServerAliveCountMax=3 -o ExitOnForwardFailure=yes -o IdentitiesOnly=yes -o IdentityFile=<key file> -R 127.0.0.1:<port>:127.0.0.1:<bridge port> <user>@<jump host>` and the same with `-L 127.0.0.1:<port>:127.0.0.1:<port>`. `-N`: "Do not execute a remote command. This is useful for just forwarding ports" (ssh(1)); `ServerAliveCountMax`: "If this threshold is reached while server alive messages are being sent, ssh will disconnect from the server"; `ExitOnForwardFailure`: "terminate the connection if it cannot set up all requested … port forwardings"; `IdentitiesOnly`: "only use the configured authentication identity"; "Arguments to IdentityFile may use the tilde syntax" (`https://man.openbsd.org/ssh_config.5`). Each forward binds `127.0.0.1` explicitly and forwards to `127.0.0.1`; a command with `-g`, `GatewayPorts`, another bind address or another destination is refused before it is shown. To keep the reverse tunnel running, the page shows a systemd user unit — `Restart=always`, which restarts "regardless of whether it exited cleanly or not", `RestartSec=5` (`https://man7.org/linux/man-pages/man5/systemd.service.5.html`); in `~/.config/systemd/user/` (`https://man7.org/linux/man-pages/man5/systemd.unit.5.html`); started with `systemctl --user enable --now`, and `loginctl enable-linger`, with which "a user manager is spawned for the user at boot and kept around after logouts" (`https://man7.org/linux/man-pages/man1/loginctl.1.html`) — and a launchd agent with `RunAtLoad`, `KeepAlive` and a `ThrottleInterval` of 30 seconds (`https://www.launchd.info/`). Both add `BatchMode=yes` — "user interaction such as password prompts and host key confirmation requests will be disabled" — and `StrictHostKeyChecking=yes`; the page says, above them: *Run the command once in a terminal first: it asks you to confirm the jump host's key and records it. The service then runs it without asking.* On Windows, the bridge keeps its tunnels itself (decision 6).
4. **The route over HTTPS through the jump host** (`MOD-bridge-tunnel.sessionRoute`, `MOD-bridge-tunnel.webServerConfig`). The dashboard reaches a session through its forward at `http://localhost:<port>`, or at `<HTTPS address>/<port>` with the web server's login in `Authorization` and the bridge's token in a header of its own (ARC-012 decisions 3 and 9) — the login sent only to that address, never in it (`A CREDENTIAL IS NEVER PLACED IN A URL`). The settings page shows the jump host's web-server configuration, for Apache 2.4.26 or later and for nginx, filled in from the settings:
   - every session's location forwards to `http://127.0.0.1:<port>/` — the tunnel's end on the jump host's loopback — only with the web server's own login: Apache's `ProxyPass` with `AuthType Basic` and `Require valid-user` in its `<Location>`; nginx's `auth_basic` and `proxy_pass`, which, "specified with a URI", replaces "the part of a normalized request URI matching the location" (`https://nginx.org/en/docs/http/ngx_http_proxy_module.html`), so the bridge receives its own paths;
   - a preflight, which carries no login, is answered by the web server itself, `204`, naming the instance's Pages origin alone, and never forwarded. Apache: `SetEnvIf Request_Method "^OPTIONS$" no-proxy=1` — "the "no-proxy" environment variable can be set to disable mod_proxy processing the current request" (`https://httpd.apache.org/docs/2.4/mod/mod_proxy.html`) —, a `RewriteRule … [R=204,L]` at the virtual host's level — a status "outside the redirect range" ends the rewriting "as if the L were used" (`https://httpd.apache.org/docs/2.4/rewrite/flags.html`), and rewrite rules in a `<Location>` are "unsupported" (`https://httpd.apache.org/docs/2.4/mod/mod_rewrite.html`) —, and `Header always set … "expr=%{REQUEST_METHOD} == 'OPTIONS'"` (`https://httpd.apache.org/docs/2.4/mod/mod_headers.html`). nginx: `if ($request_method = OPTIONS) { … return 204; }`, which the rewrite phase runs before the access phase where `auth_basic` checks the login (`https://nginx.org/en/docs/dev/development_guide.html`), with `add_header … always`, added "regardless of the response code" (`https://nginx.org/en/docs/http/ngx_http_headers_module.html`);
   - forwarded answers get no `Access-Control-Allow-Origin` of the web server's; the bridge names the paired origin (ARC-012 decision 4);
   - the login's password file is made on the jump host by the command the page shows — `htpasswd -B -c` for Apache, bcrypt being "currently considered to be very secure", `htpasswd -m -c` for nginx, whose `auth_basic_user_file` reads "the Apache variant of the MD5-based password algorithm (apr1)" (`https://httpd.apache.org/docs/2.4/programs/htpasswd.html`, `https://nginx.org/en/docs/http/ngx_http_auth_basic_module.html`); no password and no hash is ever part of what the page shows;
   - a block that would forward beyond `127.0.0.1`, allow every origin or forward without the login is refused before it is shown. Above the blocks, the page says what the host needs: *An HTTPS address with a certificate the browsers trust, issued for the jump host's name — for example from Let's Encrypt, free and renewed automatically, or the institution's own; a self-signed certificate does not work —, the web server's modules the block names, and the password file the command below makes. The web server answers the browser's preflight itself and forwards every other request only with this login.*
5. **A session's test** (`MOD-settings-page.testSetting` with the setting `session`, ARC-026): the greeting of the session's bridge through its route with its token (`MOD-bridge-server.callBridge`), or the refusal named with what works instead — on the HTTPS route, where no answer arrives, the jump host's certificate first, named as a possible cause, and the web-server configuration the page shows. **This computer's own bridge over HTTPS** (UC-044 4c): where the bridge's test finds no answer on loopback, it names the reason and offers this route (ARC-026); the person sets the jump host, adds a session on the HTTPS route with the bridge paired here, its token and its port, and sets the same jump host and session in the bridge's window — or imports this browser's export there, which leaves its pairing as it is (`MOD-bridge-app.pairWith`) —; the bridge makes its key on first use, opens the session's reverse end (decision 6), and the session's test then reaches it at the jump host's HTTPS address.
6. **The bridge opens its tunnels itself** (`MOD-bridge-tunnel.sshClient`, `MOD-bridge-tunnel.keyCommand`, `MOD-bridge-tunnel.publicKeyOf`, `MOD-bridge-tunnel.bridgeCommand`, `MOD-bridge-tunnel.restartDelay`, `MOD-bridge-tunnel.tunnelState`, `MOD-bridge-tunnel.tunnelsReport`).
   - **Its client:** on macOS and Linux the system's `ssh` and `ssh-keygen`; on Windows `ssh.exe` and `ssh-keygen.exe` of Win32-OpenSSH, shipped in the folder `openssh` of the installed bridge beside the `libcrypto.dll` they load and its `LICENSE.txt` and `NOTICE.txt`, which the bridge's *About* window shows; never an `ssh.exe` found on the path, so that every Windows bridge runs the version it was tested with.
   - **Its own key:** on first use, `ssh-keygen -q -t ed25519 -N "" -C agent-m-bridge -f <bridge directory>/id_ed25519` (`https://man.openbsd.org/ssh-keygen.1`), in the bridge's directory of ARC-011, readable by its user only; the private key never leaves it — no export, no log, no answer of the bridge holds it. The window shows the public key with *Copy* and: *Add this key to ~/.ssh/authorized_keys of <user> on <jump host>, or hand it to whoever administers the jump host.*
   - **Its commands,** from its own tunnel settings (decision 7) — the reverse end of the session it serves, from that session's port to the bridge's own port; a forward for each session port it reaches —: the forwarding and keep-alive of decision 3 with the bridge's own key file, `BatchMode=yes`, `StrictHostKeyChecking=accept-new` — "ssh will automatically add new host keys to the user's known_hosts file, but will not permit connections to hosts with changed host keys" —, its own `UserKnownHostsFile` in its directory, and `ConnectTimeout=10`, which "is applied both to establishing the connection and to performing the initial SSH protocol handshake and key exchange" (`https://man.openbsd.org/ssh_config.5`).
   - **Its supervision:** when `ssh` ends — after sleep or a network change, the keep-alive ends a dead connection —, the bridge starts it again 5 seconds after a run of a minute or more, and after shorter runs in a row twice as long each time, at most 5 minutes. A tunnel is *open* once its `ssh` has run 15 seconds — a refused key, a connection that failed or a forward that could not be set up end it before —, *connecting* before, and *closed* with the last line `ssh` wrote to its error output and when it starts again; the window and `GET /tunnels` show it, with the jump host and the public key.
7. **The bridge's tunnel settings, in its window or from an export** (`MOD-bridge-tunnel.tunnelSettingsOf`, `MOD-bridge-tunnel.keepTunnelSettings`, `MOD-bridge-tunnel.settingsFromExport`, `MOD-bridge-app.pairWith`). The bridge keeps in its store the jump host's name and SSH user, the session it serves behind NAT — its port on the jump host and the bridge's own port — or none, and the session ports it reaches through forwards. They are set in its window, or read from the dashboard's export (`MOD-settings-store.importSettings`, with its passphrase where it is locked, and `MOD-settings-store.readSettings`) with the session the bridge serves — chosen in the window, or named at a headless start —, whose bridge token becomes the bridge's pairing token (`MOD-bridge-app.pairWith`) and whose bridge port the bridge listens on (ARC-011 decision 6); a bridge that reaches sessions takes the ports of all of them.

```mermaid
sequenceDiagram
    participant D as Dashboard (https://owner.github.io)
    participant W as Jump host web server (HTTPS, trusted certificate)
    participant T as Reverse tunnel end 127.0.0.1:session port
    participant B as Bridge on the far machine
    D->>W: OPTIONS (preflight, no login)
    W-->>D: 204, allowed for the Pages origin only, nothing forwarded
    D->>W: GET /agent-m/<port>/hello, Authorization: Basic, Agent-M-Bridge-Token
    alt login missing or wrong
        W-->>D: 401, nothing forwarded
    else login valid
        W->>T: forward to http://127.0.0.1:<port>/hello
        T->>B: through the SSH tunnel
        B->>B: host, origin, token checked
        B-->>D: answer (CORS for the paired origin)
    end
```

### Due diligence (read 2026-09-30)

Sources: GitHub API `https://api.github.com/repos/PowerShell/Win32-OpenSSH` (repository, `/releases`,
`/releases/latest` with asset download counts), issue search
`https://api.github.com/search/issues?q=repo:PowerShell/Win32-OpenSSH+is:issue+is:open` (and `is:closed`,
`closed:>=2025-09-30`, `created:>=2025-09-30`); the licence file
`https://api.github.com/repos/PowerShell/openssh-portable/contents/LICENCE` and the `LICENSE.txt` and
`NOTICE.txt` inside `OpenSSH-Win64.zip` of release 10.0.0.0p2-Preview; the README
`https://github.com/PowerShell/Win32-OpenSSH`; for PuTTY, `https://www.chiark.greenend.org.uk/~sgtatham/putty/licence.html`,
`…/putty/latest.html`, `…/putty/changes.html` and the 0.85 manual
`https://the.earth.li/~sgtatham/putty/0.85/htmldoc/Chapter7.html` and `…/Chapter8.html`. All read
2026-09-30. Agent M's licence is MIT.

| Candidate | Licence | Against MIT | Releases | Issues | Adoption / availability |
|---|---|---|---|---|---|
| **Win32-OpenSSH** (PowerShell/Win32-OpenSSH; source in PowerShell/openssh-portable) — chosen for Windows | OpenSSH's `LICENCE`: "all components are under a BSD licence, or a licence more free than that. OpenSSH contains no GPL code."; the release's `NOTICE.txt` adds LibreSSL ("New additions are ISC licensed"; OpenSSL code "under the terms of the original OpenSSL licenses", i.e. the OpenSSL and SSLeay licences), zlib, libfido2 (BSD-2-Clause) and libcbor (MIT). GitHub reports no licence for the release repository and NOASSERTION for openssh-portable | **compatible for redistribution**: every licence named permits redistribution in binary form on conditions — reproduce the copyright notices and licence texts in the documentation or other materials (BSD clause 2, OpenSSL/SSLeay), and, under the OpenSSL and SSLeay licences, the acknowledgement "This product includes software developed by the OpenSSL Project…" in advertising materials that mention its features; zlib: an altered version must be marked. Shipping `ssh.exe` unaltered inside the `.msi` with `LICENSE.txt` and `NOTICE.txt` beside it meets these; none imposes a condition on Agent M's own licence. | 17 releases listed in the README from 7.7.2.0 (2018-07-26) to 10.0.0.0 (2025-10-27); latest `10.0.0.0p2-Preview` on 2025-10-27, whose notes say "**This is a preview-release (non-production ready)**"; the one before, v9.8.3.0p2-Preview, on 2025-04-18; the last *Beta* v9.5.0.0p1 on 2023-12-18; builds as `.zip` for x64, x86, ARM64 and ARM, and as `.msi` for x64, x86 and ARM64 | 407 open, 1 846 closed; 32 closed and 58 opened since 2025-09-30 | 8 293 stars, 820 forks; downloads of the latest release: `OpenSSH-Win64.zip` 402 777, `OpenSSH-Win64-v10.0.0.0.msi` 278 029, `OpenSSH-ARM64.zip` 31 787 |
| OpenSSH client of the system (openssh/openssh-portable) — chosen for macOS and Linux (invoked, not redistributed) | `LICENCE` as above | compatible; not redistributed | 10.5 on 2026-08-11, 10.4 on 2026-07-06, 10.3 on 2026-04-02, 10.2 on 2025-10-10, 10.1 on 2025-10-06 (`https://www.openssh.com/releasenotes.html`) | the portable repository takes no issues on GitHub (0 open, 0 closed via search); bugs go to the project's bugzilla (not read) | part of macOS and of common Linux distributions (not measured per distribution) |
| PuTTY `plink` — rejected | MIT: "The PuTTY executables and source code are distributed under the MIT licence" | compatible | latest 0.85 on 2026-08-16; the one before on 2026-05-22; then 2025-02-08 (changes page) | no public issue tracker; a wishlist page | Windows installers also offered in the Microsoft Store (latest page) |
| ssh2 (mscdex/ssh2), pure-JS SSH, through Deno's npm compatibility | MIT (`LICENSE`; npm field empty) | compatible | 1.17.0 on 2025-08-20; no version in 12 months | 61 open, 1 281 closed, 12 closed in 12 months | 48 068 287 downloads last month; 5 825 stars; one maintainer |
| node-ssh (steelbrain/node-ssh), wrapper over ssh2 | MIT | compatible | 13.2.1 on 2025-03-20; none in 12 months | 54 open, 116 closed, 2 closed in 12 months (read 2026-10-04, issue search as above for `repo:steelbrain/node-ssh`) | 1 559 769 downloads last month; 1 007 stars (read 2026-10-04) |

## Alternatives

- **Guide the person to add Windows's OpenSSH feature** — rejected: the feature is absent by default on Windows 10 and 11 and adding it needs an administrator, which is exactly the step a non-expert cannot take.
- **PuTTY's `plink`** — rejected: its manual documents `-R [listen-IP:]listen-port:host:port`, `-N` and `-batch`, so it could hold the tunnel, but "SSH-2 private keys have no standard format. OpenSSH and ssh.com have different formats, and PuTTY's is different again" (Chapter 8) — the bridge's key would be a `.ppk` on Windows and an OpenSSH key elsewhere, and the commands the dashboard shows would no longer be the commands Windows runs.
- **ssh2 inside the bridge** — not chosen: no release in twelve months, one maintainer, and it depends on Node's `crypto` and `net` as Deno's compatibility layer implements them, unmeasured; the shown commands would again not be the executed ones.
- **Deno's own TCP and a hand-written SSH client** — rejected: a security protocol is not written anew.
- **A VPN or an overlay network (WireGuard, Tailscale)** — rejected: another service and account; SSH to a host the person already controls is what the SPEC names.
- **The fingerprint of a new jump host confirmed in the bridge's window** (`StrictHostKeyChecking=ask`) — rejected: a headless bridge has no window, and `BatchMode` disables the confirmation; `accept-new` records the first key and refuses a changed one.
- **autossh** — not needed: the bridge starts `ssh` again itself, and a machine without a bridge has its service manager do it.
- **For the web-server configuration:** a documented template the person fills in by hand — rejected: the same mistakes the written blocks avoid, a forward without login, a forwarded preflight, `*` as origin; nothing from Agent M, the jump host's administrator configuring it from the SPEC's rules — remains possible, since the blocks are only shown, never applied; the bridge terminating HTTPS itself — rejected: the bridge binds to loopback only, and the certificate belongs to the jump host's name.
- **The web server forwarding the preflight to the bridge** — rejected: the preflight carries no login, so the web server would forward a request without it, against `THE JUMP HOST FORWARDS TO A BRIDGE ONLY AFTER ITS OWN LOGIN`.

## Consequences

- The HTTPS route needs a jump host with a web server the person controls, a trusted certificate and a login; a session's test names the failing part.
- The jump host keeps `GatewayPorts` at its default, `no`: with `yes` its server binds a forward to the wildcard address whatever the command asks, which no command and no test of the dashboard can see; the settings page says so beside the commands: *The jump host's SSH server must keep GatewayPorts at no, its default.*
- Windows needs no administrator step for tunnels beyond what installing the bridge's `.msi` itself requires (ARC-011, open measurement 3). Win32-OpenSSH's files reach the folder `openssh` of the installed bridge through the release build: the Windows target of `MOD-bridge-release.releaseWorkflow` (ARC-017) is to copy `ssh.exe`, `ssh-keygen.exe`, `libcrypto.dll`, `LICENSE.txt` and `NOTICE.txt` in before `deno desktop` builds the installer — a step its workflow does not have yet —; how `deno desktop` takes extra files into its `.msi` is open measurement 1.
- The Windows bridge carries a third-party security component: every Win32-OpenSSH release is a bridge update, taken by a pull request that replaces the files, their `LICENSE.txt` and `NOTICE.txt`, and the version named in the release notes. Its publisher labels its latest release "preview-release (non-production ready)"; the bridge's release notes name it so.
- The licence notices of Win32-OpenSSH and its components are reproduced in the bridge's *About* window and in its release notes, as the BSD and OpenSSL licences ask for binary redistribution.
- **Open measurement 1 — Win32-OpenSSH from the bridge's folder.** Install the bridge `.msi` with `ssh.exe`, `ssh-keygen.exe` and `libcrypto.dll` on a fresh Windows 11 without the OpenSSH feature; record whether `ssh-keygen` creates the key readable by the user only, whether `ssh -N -R …` with `StrictHostKeyChecking=accept-new` holds the tunnel, and whether a Windows-feature `ssh.exe` on the path interferes.
- **Open measurement 2 — reachability per browser, HTTPS route.** Through a test web server with a trusted certificate, Basic login and a reverse tunnel: the preflight, a request without login (`401`, nothing forwarded), a request with login and token (answered by the bridge), and a preflight from another origin (no `Access-Control-Allow-Origin` of its own) — in Chrome, Edge, Firefox and Safari (`BROWSER REACHABILITY IS MEASURED, NOT ASSUMED`).
- **Open measurement 3 — the written web-server blocks.** Apply the Apache and the nginx block to a test server each with a Let's Encrypt certificate and a reverse tunnel, and run open measurement 2 against them; above all, that Apache answers the preflight with `204` before its login is asked.
- Not realised here: UC-011 1c.3 — pairing through a session works as in UC-011 1 with its token; its jobs are UC-011 2–5's, which stand once the runtime of the drafting jobs is designed, since a session's job may be a drafting job, whose CLI session commits through ARC-007's correction loop (ARC-030's consequences); UC-011 1c.5 — a self-hosted runner instead of a tunnel is UC-010's; the jump host's own test — it is tested through its sessions, and its line on the settings page answers `no-test` (ARC-026).
- The earlier module file of `MOD-bridge-tunnel` leaves the working tree, with its approval records: this decision is where the module is designed (ARC-020 decisions 3 and 12).

## Modules

### MOD-bridge-tunnel

```json module
{
  "id": "MOD-bridge-tunnel",
  "folder": "src/bridge-tunnel/",
  "layer": "adapter",
  "responsibility": "The SSH tunnels between a machine behind NAT, a jump host and the person's machine: in the dashboard, the jump host's settings checked, a remote session given its port, both tunnel commands written and checked, the service files that keep a tunnel running, the route the dashboard's client takes to a session, and the jump host's web-server configuration; in the bridge, the OpenSSH client it runs, the command that makes its own key, the commands it runs, when a tunnel starts again, its state, its tunnel settings kept or read from an export, and its answer to GET /tunnels. It starts no process: the bridge's shell runs the argument lists it writes, never through a shell.",
  "realises": ["REMOTE ACCESS TO THE BRIDGE GOES THROUGH A TUNNEL", "A BRIDGE BEHIND NAT IS REACHED THROUGH A REVERSE TUNNEL", "A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK", "EACH REMOTE SESSION HAS ITS OWN PORT FROM THE CONFIGURED RANGE", "THE DASHBOARD WRITES THE TUNNEL COMMANDS", "THE JUMP HOST FORWARDS TO A BRIDGE ONLY AFTER ITS OWN LOGIN", "THE JUMP HOST ALLOWS CROSS-ORIGIN REQUESTS ONLY FROM THE INSTANCE", "THE BRIDGE OPENS ITS TUNNELS ITSELF", "THE BRIDGE CREATES ITS OWN SSH KEY"],
  "owns": ["MaybeJumpHost", "JumpHostChecked", "NewSession", "TunnelCommands", "ServiceFile", "ServiceFiles", "PasswordFileCommands", "WebServerConfig", "SshClient", "PublicKey", "TunnelRun", "TunnelState", "ServedSession", "TunnelSettings", "ExportChoice", "FromExport", "TunnelStateOf", "TunnelReport", "TunnelsReport"],
  "uses": ["MOD-contracts"]
}
```

```json interface
{
  "id": "MOD-bridge-tunnel.checkJumpHost",
  "summary": "The jump host's settings, checked before any of them enters a command: its name, its SSH user, its port range, the key files it names — names only, never a key —, and for the HTTPS route an https address without query, fragment or login, with the web server's login.",
  "params": [{ "name": "jump", "type": "MaybeJumpHost" }],
  "result": "JumpHostChecked",
  "async": false,
  "refusals": [
    { "code": "no-jump-host", "when": "no jump host is set" },
    { "code": "not-a-host", "when": "the jump host is no host name or IPv4 address" },
    { "code": "not-a-user", "when": "the SSH user is no login name" },
    { "code": "bad-range", "when": "the port range lies outside 1024–65535 or runs backwards" },
    { "code": "not-a-key-file", "when": "a key file is no file name" },
    { "code": "not-https", "when": "the HTTPS address is no https address, or carries a query, a fragment or a login" },
    { "code": "no-login", "when": "the HTTPS address has no web-server login" }
  ],
  "examples": [
    {
      "name": "a jump host with its HTTPS address",
      "input": {
        "jump": {
          "host": "jump.example.org",
          "user": "alice",
          "portFrom": 20001,
          "portTo": 20010,
          "reverseKey": "~/.ssh/id_ed25519",
          "forwardKey": "~/.ssh/id_ed25519",
          "https": "https://jump.example.org/agent-m",
          "login": { "user": "alice", "password": "web-example" },
          "tested": null
        }
      },
      "result": { "host": "jump.example.org", "user": "alice", "https": "https://jump.example.org/agent-m" }
    },
    {
      "name": "SSH only",
      "input": {
        "jump": {
          "host": "jump.example.org",
          "user": "alice",
          "portFrom": 20001,
          "portTo": 20010,
          "reverseKey": "~/.ssh/id_ed25519",
          "forwardKey": "~/.ssh/id_ed25519",
          "https": "",
          "login": { "user": "", "password": "" },
          "tested": null
        }
      },
      "result": { "host": "jump.example.org", "user": "alice", "https": "" }
    },
    {
      "name": "an option given as a key file",
      "input": {
        "jump": {
          "host": "jump.example.org",
          "user": "alice",
          "portFrom": 20001,
          "portTo": 20010,
          "reverseKey": "-oProxyCommand=sh",
          "forwardKey": "~/.ssh/id_ed25519",
          "https": "https://jump.example.org/agent-m",
          "login": { "user": "alice", "password": "web-example" },
          "tested": null
        }
      },
      "refused": "not-a-key-file"
    },
    {
      "name": "a plain HTTP address",
      "input": {
        "jump": {
          "host": "jump.example.org",
          "user": "alice",
          "portFrom": 20001,
          "portTo": 20010,
          "reverseKey": "~/.ssh/id_ed25519",
          "forwardKey": "~/.ssh/id_ed25519",
          "https": "http://jump.example.org/agent-m",
          "login": { "user": "alice", "password": "web-example" },
          "tested": null
        }
      },
      "refused": "not-https"
    },
    {
      "name": "the HTTPS address without its login",
      "input": {
        "jump": {
          "host": "jump.example.org",
          "user": "alice",
          "portFrom": 20001,
          "portTo": 20010,
          "reverseKey": "~/.ssh/id_ed25519",
          "forwardKey": "~/.ssh/id_ed25519",
          "https": "https://jump.example.org/agent-m",
          "login": { "user": "alice", "password": "" },
          "tested": null
        }
      },
      "refused": "no-login"
    },
    { "name": "no jump host", "input": { "jump": null }, "refused": "no-jump-host" }
  ]
}
```

```json interface
{
  "id": "MOD-bridge-tunnel.newSession",
  "summary": "+ Remote session: a session of the jump host with its port — the lowest free one of the range, or the one chosen where it lies in the range and no other session has it —, its bridge's port, its route, and its bridge token — that of the bridge paired in this browser where the session is this computer's own bridge, else one the shell drew (MOD-bridge-server.newToken), so that an export carries it to a bridge without a window —; untested.",
  "params": [
    { "name": "jump", "type": "MaybeJumpHost" },
    { "name": "sessions", "type": "RemoteSession[]" },
    { "name": "input", "type": "NewSession" }
  ],
  "result": "RemoteSession",
  "async": false,
  "refusals": [
    { "code": "no-jump-host", "when": "no jump host is set" },
    { "code": "not-a-host", "when": "the jump host is no host name or IPv4 address" },
    { "code": "not-a-user", "when": "the SSH user is no login name" },
    { "code": "bad-range", "when": "the port range lies outside 1024–65535 or runs backwards" },
    { "code": "not-a-key-file", "when": "a key file is no file name" },
    { "code": "not-https", "when": "the HTTPS address is no https address, or carries a query, a fragment or a login" },
    { "code": "no-login", "when": "the HTTPS address has no web-server login" },
    { "code": "not-a-name", "when": "the name is not letters, digits, '.', '_' or '-'" },
    { "code": "name-taken", "when": "another session has the name" },
    { "code": "not-a-port", "when": "the bridge port is no port" },
    { "code": "unknown-route", "when": "the route is neither forward nor https" },
    { "code": "no-https", "when": "the route is HTTPS and the jump host has no HTTPS address" },
    { "code": "not-a-token", "when": "the bridge token is not 64 hexadecimal characters" },
    { "code": "no-free-port", "when": "every port of the range has a session" },
    { "code": "port-outside-range", "when": "the chosen port lies outside the range" },
    { "code": "port-taken", "when": "another session has the chosen port" }
  ],
  "examples": [
    {
      "name": "the lowest free port",
      "input": {
        "jump": {
          "host": "jump.example.org",
          "user": "alice",
          "portFrom": 20001,
          "portTo": 20010,
          "reverseKey": "~/.ssh/id_ed25519",
          "forwardKey": "~/.ssh/id_ed25519",
          "https": "https://jump.example.org/agent-m",
          "login": { "user": "alice", "password": "web-example" },
          "tested": null
        },
        "sessions": [
          { "name": "gpu-box", "port": 20001, "bridgePort": 47321, "route": "forward", "token": "51ae3adc7d0ac063f3992b6ecf478a009e175ce84078ba2e94d76b4ca8f8821e", "tested": null }
        ],
        "input": { "name": "lab-pc", "port": 0, "bridgePort": 47321, "route": "https", "token": "3cae3adc7d0ac063f3992b6ecf478a009e175ce84078ba2e94d76b4ca8f8821e" }
      },
      "result": { "name": "lab-pc", "port": 20002, "bridgePort": 47321, "route": "https", "token": "3cae3adc7d0ac063f3992b6ecf478a009e175ce84078ba2e94d76b4ca8f8821e", "tested": null }
    },
    {
      "name": "a port chosen",
      "input": {
        "jump": {
          "host": "jump.example.org",
          "user": "alice",
          "portFrom": 20001,
          "portTo": 20010,
          "reverseKey": "~/.ssh/id_ed25519",
          "forwardKey": "~/.ssh/id_ed25519",
          "https": "https://jump.example.org/agent-m",
          "login": { "user": "alice", "password": "web-example" },
          "tested": null
        },
        "sessions": [
          { "name": "gpu-box", "port": 20001, "bridgePort": 47321, "route": "forward", "token": "51ae3adc7d0ac063f3992b6ecf478a009e175ce84078ba2e94d76b4ca8f8821e", "tested": null }
        ],
        "input": { "name": "cluster", "port": 20005, "bridgePort": 47321, "route": "forward", "token": "3cae3adc7d0ac063f3992b6ecf478a009e175ce84078ba2e94d76b4ca8f8821e" }
      },
      "result": { "name": "cluster", "port": 20005, "bridgePort": 47321, "route": "forward", "token": "3cae3adc7d0ac063f3992b6ecf478a009e175ce84078ba2e94d76b4ca8f8821e", "tested": null }
    },
    {
      "name": "a port another session has",
      "input": {
        "jump": {
          "host": "jump.example.org",
          "user": "alice",
          "portFrom": 20001,
          "portTo": 20010,
          "reverseKey": "~/.ssh/id_ed25519",
          "forwardKey": "~/.ssh/id_ed25519",
          "https": "https://jump.example.org/agent-m",
          "login": { "user": "alice", "password": "web-example" },
          "tested": null
        },
        "sessions": [
          { "name": "gpu-box", "port": 20001, "bridgePort": 47321, "route": "forward", "token": "51ae3adc7d0ac063f3992b6ecf478a009e175ce84078ba2e94d76b4ca8f8821e", "tested": null }
        ],
        "input": { "name": "cluster", "port": 20001, "bridgePort": 47321, "route": "forward", "token": "3cae3adc7d0ac063f3992b6ecf478a009e175ce84078ba2e94d76b4ca8f8821e" }
      },
      "refused": "port-taken"
    },
    {
      "name": "a full range",
      "input": {
        "jump": {
          "host": "jump.example.org",
          "user": "alice",
          "portFrom": 20001,
          "portTo": 20001,
          "reverseKey": "~/.ssh/id_ed25519",
          "forwardKey": "~/.ssh/id_ed25519",
          "https": "https://jump.example.org/agent-m",
          "login": { "user": "alice", "password": "web-example" },
          "tested": null
        },
        "sessions": [
          { "name": "gpu-box", "port": 20001, "bridgePort": 47321, "route": "forward", "token": "51ae3adc7d0ac063f3992b6ecf478a009e175ce84078ba2e94d76b4ca8f8821e", "tested": null }
        ],
        "input": { "name": "cluster", "port": 0, "bridgePort": 47321, "route": "forward", "token": "3cae3adc7d0ac063f3992b6ecf478a009e175ce84078ba2e94d76b4ca8f8821e" }
      },
      "refused": "no-free-port"
    },
    {
      "name": "the HTTPS route without the jump host's address",
      "input": {
        "jump": {
          "host": "jump.example.org",
          "user": "alice",
          "portFrom": 20001,
          "portTo": 20010,
          "reverseKey": "~/.ssh/id_ed25519",
          "forwardKey": "~/.ssh/id_ed25519",
          "https": "",
          "login": { "user": "", "password": "" },
          "tested": null
        },
        "sessions": [],
        "input": { "name": "lab-pc", "port": 0, "bridgePort": 47321, "route": "https", "token": "3cae3adc7d0ac063f3992b6ecf478a009e175ce84078ba2e94d76b4ca8f8821e" }
      },
      "refused": "no-https"
    },
    {
      "name": "a name taken",
      "input": {
        "jump": {
          "host": "jump.example.org",
          "user": "alice",
          "portFrom": 20001,
          "portTo": 20010,
          "reverseKey": "~/.ssh/id_ed25519",
          "forwardKey": "~/.ssh/id_ed25519",
          "https": "https://jump.example.org/agent-m",
          "login": { "user": "alice", "password": "web-example" },
          "tested": null
        },
        "sessions": [
          { "name": "gpu-box", "port": 20001, "bridgePort": 47321, "route": "forward", "token": "51ae3adc7d0ac063f3992b6ecf478a009e175ce84078ba2e94d76b4ca8f8821e", "tested": null }
        ],
        "input": { "name": "gpu-box", "port": 0, "bridgePort": 47321, "route": "forward", "token": "3cae3adc7d0ac063f3992b6ecf478a009e175ce84078ba2e94d76b4ca8f8821e" }
      },
      "refused": "name-taken"
    }
  ]
}
```

```json interface
{
  "id": "MOD-bridge-tunnel.tunnelCommands",
  "summary": "The two ends of a session's tunnel, as argument lists and as the text the dashboard shows: the reverse tunnel the machine behind NAT runs — the session's port on the jump host's loopback to the bridge's port on its own —, the forward the person's machine runs — the same port on its own loopback to the session's port on the jump host's —, each with the key file the settings name, offered alone; keep-alive, an end where a forward cannot be set up; and the address the dashboard reaches the session at through the forward. Every command is checked before it is given.",
  "params": [{ "name": "jump", "type": "MaybeJumpHost" }, { "name": "session", "type": "RemoteSession" }],
  "result": "TunnelCommands",
  "async": false,
  "refusals": [
    { "code": "no-jump-host", "when": "no jump host is set" },
    { "code": "not-a-host", "when": "the jump host is no host name or IPv4 address" },
    { "code": "not-a-user", "when": "the SSH user is no login name" },
    { "code": "bad-range", "when": "the port range lies outside 1024–65535 or runs backwards" },
    { "code": "not-a-key-file", "when": "a key file is no file name" },
    { "code": "not-https", "when": "the HTTPS address is no https address, or carries a query, a fragment or a login" },
    { "code": "no-login", "when": "the HTTPS address has no web-server login" },
    { "code": "not-a-session", "when": "the session names no name, port or bridge port" },
    { "code": "bad-bind", "when": "a written command would listen beyond loopback" }
  ],
  "examples": [
    {
      "name": "the GPU box",
      "input": {
        "jump": {
          "host": "jump.example.org",
          "user": "alice",
          "portFrom": 20001,
          "portTo": 20010,
          "reverseKey": "~/.ssh/id_ed25519",
          "forwardKey": "~/.ssh/id_ed25519",
          "https": "https://jump.example.org/agent-m",
          "login": { "user": "alice", "password": "web-example" },
          "tested": null
        },
        "session": { "name": "gpu-box", "port": 20001, "bridgePort": 47321, "route": "forward", "token": "51ae3adc7d0ac063f3992b6ecf478a009e175ce84078ba2e94d76b4ca8f8821e", "tested": null }
      },
      "result": {
        "reverse": ["ssh", "-N", "-o", "ServerAliveInterval=30", "-o", "ServerAliveCountMax=3", "-o", "ExitOnForwardFailure=yes", "-o", "IdentitiesOnly=yes", "-o", "IdentityFile=~/.ssh/id_ed25519", "-R", "127.0.0.1:20001:127.0.0.1:47321", "alice@jump.example.org"],
        "forward": ["ssh", "-N", "-o", "ServerAliveInterval=30", "-o", "ServerAliveCountMax=3", "-o", "ExitOnForwardFailure=yes", "-o", "IdentitiesOnly=yes", "-o", "IdentityFile=~/.ssh/id_ed25519", "-L", "127.0.0.1:20001:127.0.0.1:20001", "alice@jump.example.org"],
        "reverseText": "ssh -N -o ServerAliveInterval=30 -o ServerAliveCountMax=3 -o ExitOnForwardFailure=yes -o IdentitiesOnly=yes -o IdentityFile=~/.ssh/id_ed25519 -R 127.0.0.1:20001:127.0.0.1:47321 alice@jump.example.org",
        "forwardText": "ssh -N -o ServerAliveInterval=30 -o ServerAliveCountMax=3 -o ExitOnForwardFailure=yes -o IdentitiesOnly=yes -o IdentityFile=~/.ssh/id_ed25519 -L 127.0.0.1:20001:127.0.0.1:20001 alice@jump.example.org",
        "url": "http://localhost:20001"
      }
    },
    {
      "name": "without key files",
      "input": {
        "jump": {
          "host": "jump.example.org",
          "user": "alice",
          "portFrom": 20001,
          "portTo": 20010,
          "reverseKey": "",
          "forwardKey": "",
          "https": "https://jump.example.org/agent-m",
          "login": { "user": "alice", "password": "web-example" },
          "tested": null
        },
        "session": { "name": "gpu-box", "port": 20001, "bridgePort": 47321, "route": "forward", "token": "51ae3adc7d0ac063f3992b6ecf478a009e175ce84078ba2e94d76b4ca8f8821e", "tested": null }
      },
      "result": {
        "reverse": ["ssh", "-N", "-o", "ServerAliveInterval=30", "-o", "ServerAliveCountMax=3", "-o", "ExitOnForwardFailure=yes", "-R", "127.0.0.1:20001:127.0.0.1:47321", "alice@jump.example.org"],
        "forward": ["ssh", "-N", "-o", "ServerAliveInterval=30", "-o", "ServerAliveCountMax=3", "-o", "ExitOnForwardFailure=yes", "-L", "127.0.0.1:20001:127.0.0.1:20001", "alice@jump.example.org"],
        "reverseText": "ssh -N -o ServerAliveInterval=30 -o ServerAliveCountMax=3 -o ExitOnForwardFailure=yes -R 127.0.0.1:20001:127.0.0.1:47321 alice@jump.example.org",
        "forwardText": "ssh -N -o ServerAliveInterval=30 -o ServerAliveCountMax=3 -o ExitOnForwardFailure=yes -L 127.0.0.1:20001:127.0.0.1:20001 alice@jump.example.org",
        "url": "http://localhost:20001"
      }
    },
    {
      "name": "a host name that would carry an option",
      "input": {
        "jump": {
          "host": "-oProxyCommand=sh",
          "user": "alice",
          "portFrom": 20001,
          "portTo": 20010,
          "reverseKey": "~/.ssh/id_ed25519",
          "forwardKey": "~/.ssh/id_ed25519",
          "https": "https://jump.example.org/agent-m",
          "login": { "user": "alice", "password": "web-example" },
          "tested": null
        },
        "session": { "name": "gpu-box", "port": 20001, "bridgePort": 47321, "route": "forward", "token": "51ae3adc7d0ac063f3992b6ecf478a009e175ce84078ba2e94d76b4ca8f8821e", "tested": null }
      },
      "refused": "not-a-host"
    }
  ]
}
```

```json interface
{
  "id": "MOD-bridge-tunnel.tunnelBindProblems",
  "summary": "What would let a tunnel listen beyond a loopback address, in a command's argument list: -g, the option GatewayPorts, a forward without an explicit loopback bind address, or one to another host than 127.0.0.1 — or no forward at all; none for a command Agent M writes.",
  "params": [{ "name": "argv", "type": "string[]" }],
  "result": "string[]",
  "async": false,
  "refusals": [],
  "examples": [
    {
      "name": "the written reverse tunnel",
      "input": { "argv": ["ssh", "-N", "-R", "127.0.0.1:20001:127.0.0.1:47321", "alice@jump.example.org"] },
      "result": []
    },
    {
      "name": "no bind address",
      "input": { "argv": ["ssh", "-N", "-R", "20001:127.0.0.1:47321", "alice@jump.example.org"] },
      "result": ["-R 20001:127.0.0.1:47321: no bind address — it names 127.0.0.1"]
    },
    {
      "name": "every interface",
      "input": { "argv": ["ssh", "-N", "-R", "0.0.0.0:20001:127.0.0.1:47321", "alice@jump.example.org"] },
      "result": ["-R 0.0.0.0:20001:127.0.0.1:47321: binds 0.0.0.0, not a loopback address"]
    },
    {
      "name": "-g and GatewayPorts",
      "input": {
        "argv": ["ssh", "-g", "-o", "GatewayPorts=yes", "-N", "-L", "127.0.0.1:20001:127.0.0.1:20001", "alice@jump.example.org"]
      },
      "result": ["-g lets other hosts connect to the forwarded port", "GatewayPorts is not set by a command of Agent M"]
    },
    {
      "name": "a forward to another host",
      "input": { "argv": ["ssh", "-N", "-L", "127.0.0.1:20001:10.0.0.7:22", "alice@jump.example.org"] },
      "result": ["-L 127.0.0.1:20001:10.0.0.7:22: forwards to 10.0.0.7, not to 127.0.0.1"]
    }
  ]
}
```

```json interface
{
  "id": "MOD-bridge-tunnel.serviceFiles",
  "summary": "The files that keep a session's reverse tunnel running on a machine behind NAT that has no bridge: a systemd user unit, restarted always 5 seconds after it ends and run without a login once linger is on; and a launchd agent, kept alive and started at most once in 30 seconds. Both run the reverse command with BatchMode and StrictHostKeyChecking=yes, so that no prompt waits unseen; the person runs the command once by hand first, which records the jump host's key.",
  "params": [{ "name": "jump", "type": "MaybeJumpHost" }, { "name": "session", "type": "RemoteSession" }],
  "result": "ServiceFiles",
  "async": false,
  "refusals": [
    { "code": "no-jump-host", "when": "no jump host is set" },
    { "code": "not-a-host", "when": "the jump host is no host name or IPv4 address" },
    { "code": "not-a-user", "when": "the SSH user is no login name" },
    { "code": "bad-range", "when": "the port range lies outside 1024–65535 or runs backwards" },
    { "code": "not-a-key-file", "when": "a key file is no file name" },
    { "code": "not-https", "when": "the HTTPS address is no https address, or carries a query, a fragment or a login" },
    { "code": "no-login", "when": "the HTTPS address has no web-server login" },
    { "code": "not-a-session", "when": "the session names no name, port or bridge port" },
    { "code": "bad-bind", "when": "a written command would listen beyond loopback" }
  ],
  "examples": [
    {
      "name": "the GPU box",
      "input": {
        "jump": {
          "host": "jump.example.org",
          "user": "alice",
          "portFrom": 20001,
          "portTo": 20010,
          "reverseKey": "~/.ssh/id_ed25519",
          "forwardKey": "~/.ssh/id_ed25519",
          "https": "https://jump.example.org/agent-m",
          "login": { "user": "alice", "password": "web-example" },
          "tested": null
        },
        "session": { "name": "gpu-box", "port": 20001, "bridgePort": 47321, "route": "forward", "token": "51ae3adc7d0ac063f3992b6ecf478a009e175ce84078ba2e94d76b4ca8f8821e", "tested": null }
      },
      "result": {
        "systemd": {
          "path": "~/.config/systemd/user/agent-m-tunnel-gpu-box.service",
          "text": "[Unit]\nDescription=Agent M reverse tunnel of the session gpu-box to jump.example.org\nAfter=network-online.target\nWants=network-online.target\n\n[Service]\nExecStart=ssh -N -o ServerAliveInterval=30 -o ServerAliveCountMax=3 -o ExitOnForwardFailure=yes -o IdentitiesOnly=yes -o IdentityFile=~/.ssh/id_ed25519 -R 127.0.0.1:20001:127.0.0.1:47321 -o BatchMode=yes -o StrictHostKeyChecking=yes alice@jump.example.org\nRestart=always\nRestartSec=5\n\n[Install]\nWantedBy=default.target\n",
          "commands": ["systemctl --user enable --now agent-m-tunnel-gpu-box.service", "loginctl enable-linger"]
        },
        "launchd": {
          "path": "~/Library/LaunchAgents/org.agent-m.tunnel.gpu-box.plist",
          "text": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<plist version=\"1.0\">\n<dict>\n    <key>Label</key>\n    <string>org.agent-m.tunnel.gpu-box</string>\n    <key>ProgramArguments</key>\n    <array>\n        <string>/usr/bin/ssh</string>\n        <string>-N</string>\n        <string>-o</string>\n        <string>ServerAliveInterval=30</string>\n        <string>-o</string>\n        <string>ServerAliveCountMax=3</string>\n        <string>-o</string>\n        <string>ExitOnForwardFailure=yes</string>\n        <string>-o</string>\n        <string>IdentitiesOnly=yes</string>\n        <string>-o</string>\n        <string>IdentityFile=~/.ssh/id_ed25519</string>\n        <string>-R</string>\n        <string>127.0.0.1:20001:127.0.0.1:47321</string>\n        <string>-o</string>\n        <string>BatchMode=yes</string>\n        <string>-o</string>\n        <string>StrictHostKeyChecking=yes</string>\n        <string>alice@jump.example.org</string>\n    </array>\n    <key>RunAtLoad</key>\n    <true/>\n    <key>KeepAlive</key>\n    <true/>\n    <key>ThrottleInterval</key>\n    <integer>30</integer>\n</dict>\n</plist>\n",
          "commands": ["launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/org.agent-m.tunnel.gpu-box.plist"]
        }
      }
    }
  ]
}
```

```json interface
{
  "id": "MOD-bridge-tunnel.sessionRoute",
  "summary": "The route the dashboard's client takes to a session (MOD-bridge-server.bridgeRequest): through the forward on this computer's loopback, or at the session's port under the jump host's HTTPS address, with the web server's login.",
  "params": [{ "name": "jump", "type": "MaybeJumpHost" }, { "name": "session", "type": "RemoteSession" }],
  "result": "BridgeRoute",
  "async": false,
  "refusals": [
    { "code": "no-jump-host", "when": "no jump host is set" },
    { "code": "not-a-host", "when": "the jump host is no host name or IPv4 address" },
    { "code": "not-a-user", "when": "the SSH user is no login name" },
    { "code": "bad-range", "when": "the port range lies outside 1024–65535 or runs backwards" },
    { "code": "not-a-key-file", "when": "a key file is no file name" },
    { "code": "not-https", "when": "the HTTPS address is no https address, or carries a query, a fragment or a login" },
    { "code": "no-login", "when": "the HTTPS address has no web-server login" },
    { "code": "not-a-session", "when": "the session names no name, port or bridge port" },
    { "code": "no-https", "when": "the session's route is HTTPS and the jump host has no HTTPS address" }
  ],
  "examples": [
    {
      "name": "through the forward",
      "input": {
        "jump": {
          "host": "jump.example.org",
          "user": "alice",
          "portFrom": 20001,
          "portTo": 20010,
          "reverseKey": "~/.ssh/id_ed25519",
          "forwardKey": "~/.ssh/id_ed25519",
          "https": "https://jump.example.org/agent-m",
          "login": { "user": "alice", "password": "web-example" },
          "tested": null
        },
        "session": { "name": "gpu-box", "port": 20001, "bridgePort": 47321, "route": "forward", "token": "51ae3adc7d0ac063f3992b6ecf478a009e175ce84078ba2e94d76b4ca8f8821e", "tested": null }
      },
      "result": { "kind": "loopback", "address": "http://localhost:20001" }
    },
    {
      "name": "over HTTPS",
      "input": {
        "jump": {
          "host": "jump.example.org",
          "user": "alice",
          "portFrom": 20001,
          "portTo": 20010,
          "reverseKey": "~/.ssh/id_ed25519",
          "forwardKey": "~/.ssh/id_ed25519",
          "https": "https://jump.example.org/agent-m",
          "login": { "user": "alice", "password": "web-example" },
          "tested": null
        },
        "session": { "name": "lab-pc", "port": 20002, "bridgePort": 47321, "route": "https", "token": "94f07d1ec04c02a635dc6eb0118acc42e1599e2b82bafd70d719ae8feb3ac561", "tested": null }
      },
      "result": {
        "kind": "https",
        "url": "https://jump.example.org/agent-m/20002",
        "login": { "user": "alice", "password": "web-example" }
      }
    },
    {
      "name": "HTTPS without the jump host's address",
      "input": {
        "jump": {
          "host": "jump.example.org",
          "user": "alice",
          "portFrom": 20001,
          "portTo": 20010,
          "reverseKey": "~/.ssh/id_ed25519",
          "forwardKey": "~/.ssh/id_ed25519",
          "https": "",
          "login": { "user": "", "password": "" },
          "tested": null
        },
        "session": { "name": "lab-pc", "port": 20002, "bridgePort": 47321, "route": "https", "token": "94f07d1ec04c02a635dc6eb0118acc42e1599e2b82bafd70d719ae8feb3ac561", "tested": null }
      },
      "refused": "no-https"
    }
  ]
}
```

```json interface
{
  "id": "MOD-bridge-tunnel.webServerConfig",
  "summary": "The jump host's web-server configuration for its sessions, for Apache 2.4.26 or later and for nginx, with the command that makes the login's password file: every session's location authenticates with the web server's login and forwards to the tunnel's end on 127.0.0.1 only; a preflight is answered by the web server itself, 204, without login and never forwarded, naming the instance's Pages origin alone; no password and no hash is part of it.",
  "params": [
    { "name": "jump", "type": "MaybeJumpHost" },
    { "name": "sessions", "type": "RemoteSession[]" },
    { "name": "pagesOrigin", "type": "string" }
  ],
  "result": "WebServerConfig",
  "async": false,
  "refusals": [
    { "code": "no-jump-host", "when": "no jump host is set" },
    { "code": "not-a-host", "when": "the jump host is no host name or IPv4 address" },
    { "code": "not-a-user", "when": "the SSH user is no login name" },
    { "code": "bad-range", "when": "the port range lies outside 1024–65535 or runs backwards" },
    { "code": "not-a-key-file", "when": "a key file is no file name" },
    { "code": "not-https", "when": "the HTTPS address is no https address, or carries a query, a fragment or a login" },
    { "code": "no-login", "when": "the HTTPS address has no web-server login" },
    { "code": "no-https", "when": "the jump host has no HTTPS address" },
    { "code": "not-an-origin", "when": "the Pages origin is no HTTPS origin" },
    { "code": "no-session", "when": "the jump host has no session" },
    { "code": "unsafe-config", "when": "a written block would forward beyond 127.0.0.1, allow every origin or forward without the login" }
  ],
  "examples": [
    {
      "name": "the lab PC over HTTPS",
      "input": {
        "jump": {
          "host": "jump.example.org",
          "user": "alice",
          "portFrom": 20001,
          "portTo": 20010,
          "reverseKey": "~/.ssh/id_ed25519",
          "forwardKey": "~/.ssh/id_ed25519",
          "https": "https://jump.example.org/agent-m",
          "login": { "user": "alice", "password": "web-example" },
          "tested": null
        },
        "sessions": [
          { "name": "lab-pc", "port": 20002, "bridgePort": 47321, "route": "https", "token": "94f07d1ec04c02a635dc6eb0118acc42e1599e2b82bafd70d719ae8feb3ac561", "tested": null }
        ],
        "pagesOrigin": "https://alice.github.io"
      },
      "result": {
        "apache": "# Agent M: the HTTPS route to the remote sessions of jump.example.org, inside its <VirtualHost *:443>.\n# Needs mod_proxy, mod_proxy_http, mod_auth_basic, mod_authn_file, mod_headers, mod_rewrite and mod_setenvif.\n# A preflight is answered here, 204, without login and never forwarded:\nSetEnvIf Request_Method \"^OPTIONS$\" no-proxy=1\nRewriteEngine On\nRewriteCond \"%{REQUEST_METHOD}\" \"=OPTIONS\"\nRewriteRule \"^/agent-m/[0-9]+/\" \"-\" [R=204,L]\nHeader always set Access-Control-Allow-Origin \"https://alice.github.io\" \"expr=%{REQUEST_METHOD} == 'OPTIONS'\"\nHeader always set Access-Control-Allow-Methods \"GET, POST, DELETE\" \"expr=%{REQUEST_METHOD} == 'OPTIONS'\"\nHeader always set Access-Control-Allow-Headers \"agent-m-bridge-token, authorization, content-type\" \"expr=%{REQUEST_METHOD} == 'OPTIONS'\"\n\n# The session lab-pc: forwarded to the tunnel's end only with the login.\n<Location \"/agent-m/20002/\">\n    ProxyPass \"http://127.0.0.1:20002/\"\n    ProxyPassReverse \"http://127.0.0.1:20002/\"\n    AuthType Basic\n    AuthName \"Agent M\"\n    AuthUserFile \"/etc/apache2/agent-m.htpasswd\"\n    Require valid-user\n</Location>\n",
        "nginx": "# Agent M: the HTTPS route to the remote sessions of jump.example.org, inside its server block on port 443.\n\n# The session lab-pc: a preflight answered here, 204, without login and never forwarded; every other request only with the login.\nlocation /agent-m/20002/ {\n    if ($request_method = OPTIONS) {\n        add_header Access-Control-Allow-Origin \"https://alice.github.io\" always;\n        add_header Access-Control-Allow-Methods \"GET, POST, DELETE\" always;\n        add_header Access-Control-Allow-Headers \"agent-m-bridge-token, authorization, content-type\" always;\n        return 204;\n    }\n    auth_basic \"Agent M\";\n    auth_basic_user_file /etc/nginx/agent-m.htpasswd;\n    proxy_pass http://127.0.0.1:20002/;\n}\n",
        "passwordFile": { "apache": "htpasswd -B -c /etc/apache2/agent-m.htpasswd alice", "nginx": "htpasswd -m -c /etc/nginx/agent-m.htpasswd alice" }
      }
    },
    {
      "name": "a jump host without an HTTPS address",
      "input": {
        "jump": {
          "host": "jump.example.org",
          "user": "alice",
          "portFrom": 20001,
          "portTo": 20010,
          "reverseKey": "~/.ssh/id_ed25519",
          "forwardKey": "~/.ssh/id_ed25519",
          "https": "",
          "login": { "user": "", "password": "" },
          "tested": null
        },
        "sessions": [
          { "name": "lab-pc", "port": 20002, "bridgePort": 47321, "route": "https", "token": "94f07d1ec04c02a635dc6eb0118acc42e1599e2b82bafd70d719ae8feb3ac561", "tested": null }
        ],
        "pagesOrigin": "https://alice.github.io"
      },
      "refused": "no-https"
    },
    {
      "name": "every origin",
      "input": {
        "jump": {
          "host": "jump.example.org",
          "user": "alice",
          "portFrom": 20001,
          "portTo": 20010,
          "reverseKey": "~/.ssh/id_ed25519",
          "forwardKey": "~/.ssh/id_ed25519",
          "https": "https://jump.example.org/agent-m",
          "login": { "user": "alice", "password": "web-example" },
          "tested": null
        },
        "sessions": [
          { "name": "lab-pc", "port": 20002, "bridgePort": 47321, "route": "https", "token": "94f07d1ec04c02a635dc6eb0118acc42e1599e2b82bafd70d719ae8feb3ac561", "tested": null }
        ],
        "pagesOrigin": "*"
      },
      "refused": "not-an-origin"
    },
    {
      "name": "no session",
      "input": {
        "jump": {
          "host": "jump.example.org",
          "user": "alice",
          "portFrom": 20001,
          "portTo": 20010,
          "reverseKey": "~/.ssh/id_ed25519",
          "forwardKey": "~/.ssh/id_ed25519",
          "https": "https://jump.example.org/agent-m",
          "login": { "user": "alice", "password": "web-example" },
          "tested": null
        },
        "sessions": [],
        "pagesOrigin": "https://alice.github.io"
      },
      "refused": "no-session"
    }
  ]
}
```

```json interface
{
  "id": "MOD-bridge-tunnel.sshClient",
  "summary": "The OpenSSH client the bridge runs: on macOS and Linux the system's ssh and ssh-keygen; on Windows those of Win32-OpenSSH in the folder openssh of the installed bridge, with the licence files the About window shows — never an ssh.exe found on the path.",
  "params": [{ "name": "system", "type": "string" }, { "name": "appDir", "type": "string" }],
  "result": "SshClient",
  "async": false,
  "refusals": [
    { "code": "unknown-system", "when": "the system is none of macos, windows and linux" },
    { "code": "no-app-folder", "when": "on Windows, the installed bridge's folder is not known" }
  ],
  "examples": [
    {
      "name": "macOS",
      "input": { "system": "macos", "appDir": "/Applications/Agent M Bridge.app" },
      "result": { "ssh": "ssh", "sshKeygen": "ssh-keygen", "notices": [] }
    },
    {
      "name": "Windows",
      "input": { "system": "windows", "appDir": "C:\\Program Files\\Agent M Bridge" },
      "result": {
        "ssh": "C:\\Program Files\\Agent M Bridge\\openssh\\ssh.exe",
        "sshKeygen": "C:\\Program Files\\Agent M Bridge\\openssh\\ssh-keygen.exe",
        "notices": ["C:\\Program Files\\Agent M Bridge\\openssh\\LICENSE.txt", "C:\\Program Files\\Agent M Bridge\\openssh\\NOTICE.txt"]
      }
    },
    {
      "name": "a system the bridge is not built for",
      "input": { "system": "freebsd", "appDir": "" },
      "refused": "unknown-system"
    }
  ]
}
```

```json interface
{
  "id": "MOD-bridge-tunnel.keyCommand",
  "summary": "The command that makes the bridge's own key on first use: an Ed25519 key pair without a passphrase, quietly, in the bridge's directory, whose private half never leaves it.",
  "params": [{ "name": "client", "type": "SshClient" }, { "name": "dir", "type": "string" }],
  "result": "string[]",
  "async": false,
  "refusals": [{ "code": "no-directory", "when": "the bridge's directory is not known" }],
  "examples": [
    {
      "name": "on a Linux lab machine",
      "input": {
        "client": { "ssh": "ssh", "sshKeygen": "ssh-keygen", "notices": [] },
        "dir": "/home/alice/.agent-m-bridge"
      },
      "result": ["ssh-keygen", "-q", "-t", "ed25519", "-N", "", "-C", "agent-m-bridge", "-f", "/home/alice/.agent-m-bridge/id_ed25519"]
    },
    {
      "name": "no directory",
      "input": { "client": { "ssh": "ssh", "sshKeygen": "ssh-keygen", "notices": [] }, "dir": "" },
      "refused": "no-directory"
    }
  ]
}
```

```json interface
{
  "id": "MOD-bridge-tunnel.publicKeyOf",
  "summary": "The public key the window shows with Copy: the one line of id_ed25519.pub.",
  "params": [{ "name": "text", "type": "string" }],
  "result": "PublicKey",
  "async": false,
  "refusals": [{ "code": "not-a-key", "when": "the text holds no Ed25519 public key" }],
  "examples": [
    {
      "name": "the bridge's public key",
      "input": { "text": "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJ7m0Qm8l0T6Pq3dQzq9eA3fK2xQm5bR8cS1tV4wX6yZ agent-m-bridge\n" },
      "result": { "publicKey": "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJ7m0Qm8l0T6Pq3dQzq9eA3fK2xQm5bR8cS1tV4wX6yZ agent-m-bridge" }
    },
    {
      "name": "a private key's text",
      "input": { "text": "-----BEGIN OPENSSH PRIVATE KEY-----" },
      "refused": "not-a-key"
    }
  ]
}
```

```json interface
{
  "id": "MOD-bridge-tunnel.bridgeCommand",
  "summary": "The command the bridge runs for one of its tunnels, from its own tunnel settings: the reverse end of the session it serves behind NAT — that session's port on the jump host's loopback to the bridge's own port —, or a forward to a session port it reaches — the same port on its own loopback —; the forwarding and keep-alive of the dashboard's commands, with the bridge's own key and known_hosts in its directory, no prompt (BatchMode), a new jump host's key recorded on first contact and a changed one refused (StrictHostKeyChecking=accept-new), and a connection that gives up after 10 seconds.",
  "params": [
    { "name": "settings", "type": "TunnelSettings" },
    { "name": "role", "type": "string" },
    { "name": "port", "type": "integer" },
    { "name": "client", "type": "SshClient" },
    { "name": "dir", "type": "string" }
  ],
  "result": "string[]",
  "async": false,
  "refusals": [
    { "code": "no-jump-host", "when": "the tunnel settings name no jump host and SSH user" },
    { "code": "no-directory", "when": "the bridge's directory is not known" },
    { "code": "not-served", "when": "the role is reverse and the bridge serves no session at that port" },
    { "code": "not-reached", "when": "the role is forward and the bridge reaches no session at that port" },
    { "code": "unknown-role", "when": "the role is neither reverse nor forward" },
    { "code": "bad-bind", "when": "the command would listen beyond loopback" }
  ],
  "examples": [
    {
      "name": "the reverse end on the GPU box",
      "input": {
        "settings": {
          "host": "jump.example.org",
          "user": "alice",
          "serve": { "port": 20001, "bridgePort": 47321 },
          "reach": []
        },
        "role": "reverse",
        "port": 20001,
        "client": { "ssh": "ssh", "sshKeygen": "ssh-keygen", "notices": [] },
        "dir": "/home/alice/.agent-m-bridge"
      },
      "result": ["ssh", "-N", "-o", "ServerAliveInterval=30", "-o", "ServerAliveCountMax=3", "-o", "ExitOnForwardFailure=yes", "-o", "IdentitiesOnly=yes", "-o", "IdentityFile=/home/alice/.agent-m-bridge/id_ed25519", "-R", "127.0.0.1:20001:127.0.0.1:47321", "-o", "BatchMode=yes", "-o", "StrictHostKeyChecking=accept-new", "-o", "UserKnownHostsFile=/home/alice/.agent-m-bridge/known_hosts", "-o", "ConnectTimeout=10", "alice@jump.example.org"]
    },
    {
      "name": "a forward on the person's Mac",
      "input": {
        "settings": { "host": "jump.example.org", "user": "alice", "serve": null, "reach": [20001, 20002] },
        "role": "forward",
        "port": 20002,
        "client": { "ssh": "ssh", "sshKeygen": "ssh-keygen", "notices": [] },
        "dir": "/Users/alice/.agent-m-bridge"
      },
      "result": ["ssh", "-N", "-o", "ServerAliveInterval=30", "-o", "ServerAliveCountMax=3", "-o", "ExitOnForwardFailure=yes", "-o", "IdentitiesOnly=yes", "-o", "IdentityFile=/Users/alice/.agent-m-bridge/id_ed25519", "-L", "127.0.0.1:20002:127.0.0.1:20002", "-o", "BatchMode=yes", "-o", "StrictHostKeyChecking=accept-new", "-o", "UserKnownHostsFile=/Users/alice/.agent-m-bridge/known_hosts", "-o", "ConnectTimeout=10", "alice@jump.example.org"]
    },
    {
      "name": "a session the bridge does not serve",
      "input": {
        "settings": { "host": "jump.example.org", "user": "alice", "serve": null, "reach": [20001, 20002] },
        "role": "reverse",
        "port": 20001,
        "client": { "ssh": "ssh", "sshKeygen": "ssh-keygen", "notices": [] },
        "dir": "/Users/alice/.agent-m-bridge"
      },
      "refused": "not-served"
    },
    {
      "name": "a port the bridge does not reach",
      "input": {
        "settings": {
          "host": "jump.example.org",
          "user": "alice",
          "serve": { "port": 20001, "bridgePort": 47321 },
          "reach": []
        },
        "role": "forward",
        "port": 20002,
        "client": { "ssh": "ssh", "sshKeygen": "ssh-keygen", "notices": [] },
        "dir": "/home/alice/.agent-m-bridge"
      },
      "refused": "not-reached"
    },
    {
      "name": "no jump host set",
      "input": {
        "settings": { "host": "", "user": "", "serve": null, "reach": [] },
        "role": "forward",
        "port": 20002,
        "client": { "ssh": "ssh", "sshKeygen": "ssh-keygen", "notices": [] },
        "dir": "/home/alice/.agent-m-bridge"
      },
      "refused": "no-jump-host"
    }
  ]
}
```

```json interface
{
  "id": "MOD-bridge-tunnel.restartDelay",
  "summary": "When the bridge starts a tunnel again after its ssh ended, in seconds: 5 after a run of a minute or more; after shorter runs in a row, twice as long each time, at most 300 — the length of each run so far given in seconds, the newest last.",
  "params": [{ "name": "runs", "type": "integer[]" }],
  "result": "integer",
  "async": false,
  "refusals": [],
  "examples": [
    { "name": "after a long run", "input": { "runs": [3600] }, "result": 5 },
    { "name": "the third short run in a row", "input": { "runs": [3600, 4, 3, 5] }, "result": 20 },
    { "name": "a jump host down for long", "input": { "runs": [2, 2, 2, 2, 2, 2, 2, 2, 2] }, "result": 300 }
  ]
}
```

```json interface
{
  "id": "MOD-bridge-tunnel.tunnelState",
  "summary": "A tunnel's state as the window and GET /tunnels show it: open once its ssh has run 15 seconds — a refused key, a connection that failed or a forward that could not be set up end it before —, connecting before, closed after it ended, with the last line ssh wrote to its error output and when it starts again.",
  "params": [{ "name": "run", "type": "TunnelRun" }],
  "result": "TunnelState",
  "async": false,
  "refusals": [],
  "examples": [
    {
      "name": "open",
      "input": { "run": { "running": true, "ranSeconds": 600, "lastError": "", "retryIn": 0 } },
      "result": { "state": "open", "reason": "" }
    },
    {
      "name": "connecting",
      "input": { "run": { "running": true, "ranSeconds": 3, "lastError": "", "retryIn": 0 } },
      "result": { "state": "connecting", "reason": "" }
    },
    {
      "name": "the jump host does not know the key",
      "input": {
        "run": { "running": false, "ranSeconds": 1, "lastError": "alice@jump.example.org: Permission denied (publickey).", "retryIn": 20 }
      },
      "result": { "state": "closed", "reason": "alice@jump.example.org: Permission denied (publickey).; starting again in 20 seconds" }
    }
  ]
}
```

```json interface
{
  "id": "MOD-bridge-tunnel.tunnelSettingsOf",
  "summary": "The bridge's tunnel settings as its store keeps them: the jump host's name and SSH user, the session it serves behind NAT — its port on the jump host and the bridge's own port — or none, and the session ports it reaches through forwards; none set where nothing is kept.",
  "params": [{ "name": "store", "type": "StoragePort" }],
  "result": "TunnelSettings",
  "async": true,
  "refusals": [
    { "code": "not-settings", "when": "the kept value does not read as tunnel settings" },
    { "code": "not-kept", "when": "the store keeps nothing" }
  ],
  "examples": [
    {
      "name": "a lab machine that serves the GPU box",
      "input": {
        "store": { "tunnel-settings": "{\"host\":\"jump.example.org\",\"user\":\"alice\",\"serve\":{\"port\":20001,\"bridgePort\":47321},\"reach\":[]}" }
      },
      "result": {
        "host": "jump.example.org",
        "user": "alice",
        "serve": { "port": 20001, "bridgePort": 47321 },
        "reach": []
      }
    },
    {
      "name": "nothing kept",
      "input": { "store": {} },
      "result": { "host": "", "user": "", "serve": null, "reach": [] }
    },
    {
      "name": "a kept value that does not read",
      "input": { "store": { "tunnel-settings": "{\"host\":" } },
      "refused": "not-settings"
    },
    { "name": "a store that keeps nothing", "input": { "store": null }, "refused": "not-kept" }
  ]
}
```

```json interface
{
  "id": "MOD-bridge-tunnel.keepTunnelSettings",
  "summary": "The bridge's tunnel settings kept in its store, as set in its window or read from an export: a jump host's name and SSH user, the session served or none, and the ports reached.",
  "params": [{ "name": "store", "type": "StoragePort" }, { "name": "settings", "type": "TunnelSettings" }],
  "result": "TunnelSettings",
  "async": true,
  "refusals": [
    { "code": "not-settings", "when": "the settings name no jump host or SSH user, or a port that is none" },
    { "code": "not-kept", "when": "the store keeps nothing" }
  ],
  "examples": [
    {
      "name": "the person's Mac, reaching both sessions",
      "input": {
        "store": {},
        "settings": { "host": "jump.example.org", "user": "alice", "serve": null, "reach": [20001, 20002] }
      },
      "result": { "host": "jump.example.org", "user": "alice", "serve": null, "reach": [20001, 20002] }
    },
    {
      "name": "no jump host named",
      "input": { "store": {}, "settings": { "host": "", "user": "", "serve": null, "reach": [] } },
      "refused": "not-settings"
    }
  ]
}
```

```json interface
{
  "id": "MOD-bridge-tunnel.settingsFromExport",
  "summary": "The tunnel settings an imported export gives the bridge (MOD-settings-store.importSettings, readSettings): the jump host's name and SSH user, and the session it serves — named by the person in the window or at a headless start — whose bridge token becomes its pairing token (MOD-bridge-app.pairWith), or else the ports of every session it reaches.",
  "params": [{ "name": "settings", "type": "Settings" }, { "name": "choice", "type": "ExportChoice" }],
  "result": "FromExport",
  "async": false,
  "refusals": [
    { "code": "no-jump-host", "when": "the export names no jump host" },
    { "code": "no-session", "when": "the export has no session of that name" }
  ],
  "examples": [
    {
      "name": "the GPU box, headless",
      "input": {
        "settings": {
          "github": null,
          "gitlab": [],
          "products": [],
          "endpoints": [],
          "bridge": null,
          "mailbox": null,
          "notAnIssue": [],
          "jumpHost": {
            "host": "jump.example.org",
            "user": "alice",
            "portFrom": 20001,
            "portTo": 20010,
            "reverseKey": "~/.ssh/id_ed25519",
            "forwardKey": "~/.ssh/id_ed25519",
            "https": "https://jump.example.org/agent-m",
            "login": { "user": "alice", "password": "web-example" },
            "tested": null
          },
          "sessions": [
            { "name": "gpu-box", "port": 20001, "bridgePort": 47321, "route": "forward", "token": "51ae3adc7d0ac063f3992b6ecf478a009e175ce84078ba2e94d76b4ca8f8821e", "tested": null },
            { "name": "lab-pc", "port": 20002, "bridgePort": 47321, "route": "https", "token": "94f07d1ec04c02a635dc6eb0118acc42e1599e2b82bafd70d719ae8feb3ac561", "tested": null }
          ],
          "resourceKeys": []
        },
        "choice": { "serve": "gpu-box" }
      },
      "result": {
        "settings": {
          "host": "jump.example.org",
          "user": "alice",
          "serve": { "port": 20001, "bridgePort": 47321 },
          "reach": []
        },
        "token": "51ae3adc7d0ac063f3992b6ecf478a009e175ce84078ba2e94d76b4ca8f8821e"
      }
    },
    {
      "name": "the person's Mac",
      "input": {
        "settings": {
          "github": null,
          "gitlab": [],
          "products": [],
          "endpoints": [],
          "bridge": null,
          "mailbox": null,
          "notAnIssue": [],
          "jumpHost": {
            "host": "jump.example.org",
            "user": "alice",
            "portFrom": 20001,
            "portTo": 20010,
            "reverseKey": "~/.ssh/id_ed25519",
            "forwardKey": "~/.ssh/id_ed25519",
            "https": "https://jump.example.org/agent-m",
            "login": { "user": "alice", "password": "web-example" },
            "tested": null
          },
          "sessions": [
            { "name": "gpu-box", "port": 20001, "bridgePort": 47321, "route": "forward", "token": "51ae3adc7d0ac063f3992b6ecf478a009e175ce84078ba2e94d76b4ca8f8821e", "tested": null },
            { "name": "lab-pc", "port": 20002, "bridgePort": 47321, "route": "https", "token": "94f07d1ec04c02a635dc6eb0118acc42e1599e2b82bafd70d719ae8feb3ac561", "tested": null }
          ],
          "resourceKeys": []
        },
        "choice": { "serve": "" }
      },
      "result": {
        "settings": { "host": "jump.example.org", "user": "alice", "serve": null, "reach": [20001, 20002] },
        "token": ""
      }
    },
    {
      "name": "a session the export does not have",
      "input": {
        "settings": {
          "github": null,
          "gitlab": [],
          "products": [],
          "endpoints": [],
          "bridge": null,
          "mailbox": null,
          "notAnIssue": [],
          "jumpHost": {
            "host": "jump.example.org",
            "user": "alice",
            "portFrom": 20001,
            "portTo": 20010,
            "reverseKey": "~/.ssh/id_ed25519",
            "forwardKey": "~/.ssh/id_ed25519",
            "https": "https://jump.example.org/agent-m",
            "login": { "user": "alice", "password": "web-example" },
            "tested": null
          },
          "sessions": [
            { "name": "gpu-box", "port": 20001, "bridgePort": 47321, "route": "forward", "token": "51ae3adc7d0ac063f3992b6ecf478a009e175ce84078ba2e94d76b4ca8f8821e", "tested": null },
            { "name": "lab-pc", "port": 20002, "bridgePort": 47321, "route": "https", "token": "94f07d1ec04c02a635dc6eb0118acc42e1599e2b82bafd70d719ae8feb3ac561", "tested": null }
          ],
          "resourceKeys": []
        },
        "choice": { "serve": "cluster" }
      },
      "refused": "no-session"
    },
    {
      "name": "an export without a jump host",
      "input": {
        "settings": {
          "github": null,
          "gitlab": [],
          "products": [],
          "endpoints": [],
          "bridge": null,
          "mailbox": null,
          "notAnIssue": [],
          "jumpHost": null,
          "sessions": [],
          "resourceKeys": []
        },
        "choice": { "serve": "gpu-box" }
      },
      "refused": "no-jump-host"
    }
  ]
}
```

```json interface
{
  "id": "MOD-bridge-tunnel.tunnelsReport",
  "summary": "The bridge's answer to GET /tunnels: the jump host, the public key to add there, and each of its tunnels — the reverse end it serves, the forwards it reaches — with its state.",
  "params": [
    { "name": "settings", "type": "TunnelSettings" },
    { "name": "states", "type": "TunnelStateOf[]" },
    { "name": "publicKey", "type": "string" }
  ],
  "result": "TunnelsReport",
  "async": false,
  "refusals": [],
  "examples": [
    {
      "name": "the GPU box, its tunnel open",
      "input": {
        "settings": {
          "host": "jump.example.org",
          "user": "alice",
          "serve": { "port": 20001, "bridgePort": 47321 },
          "reach": []
        },
        "states": [{ "role": "reverse", "port": 20001, "state": { "state": "open", "reason": "" } }],
        "publicKey": "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJ7m0Qm8l0T6Pq3dQzq9eA3fK2xQm5bR8cS1tV4wX6yZ agent-m-bridge"
      },
      "result": {
        "jumpHost": "alice@jump.example.org",
        "publicKey": "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJ7m0Qm8l0T6Pq3dQzq9eA3fK2xQm5bR8cS1tV4wX6yZ agent-m-bridge",
        "tunnels": [{ "role": "reverse", "port": 20001, "state": "open", "reason": "" }]
      }
    }
  ]
}
```

## Types

```json type
{
  "$id": "MaybeJumpHost",
  "description": "The jump host as this browser keeps it, or none.",
  "anyOf": [{ "$ref": "JumpHost" }, { "type": "null" }],
  "examples": [
    {
      "host": "jump.example.org",
      "user": "alice",
      "portFrom": 20001,
      "portTo": 20010,
      "reverseKey": "~/.ssh/id_ed25519",
      "forwardKey": "~/.ssh/id_ed25519",
      "https": "https://jump.example.org/agent-m",
      "login": { "user": "alice", "password": "web-example" },
      "tested": null
    },
    null
  ]
}
```

```json type
{
  "$id": "JumpHostChecked",
  "description": "A jump host whose settings may enter a command: its name, its SSH user, and its HTTPS address without a trailing slash — empty without one.",
  "type": "object",
  "required": ["host", "user", "https"],
  "additionalProperties": false,
  "properties": {
    "host": { "type": "string", "minLength": 1 },
    "user": { "type": "string", "minLength": 1 },
    "https": { "type": "string" }
  },
  "examples": [
    { "host": "jump.example.org", "user": "alice", "https": "https://jump.example.org/agent-m" },
    { "host": "jump.example.org", "user": "alice", "https": "" }
  ]
}
```

```json type
{
  "$id": "NewSession",
  "description": "What + Remote session asks for: the session's name, its port — 0 for the lowest free one —, its bridge's port, its route, and the bridge token the shell drew.",
  "type": "object",
  "required": ["name", "port", "bridgePort", "route", "token"],
  "additionalProperties": false,
  "properties": {
    "name": { "type": "string" },
    "port": { "type": "integer", "minimum": 0, "maximum": 65535 },
    "bridgePort": { "type": "integer", "minimum": 0, "maximum": 65535 },
    "route": { "type": "string" },
    "token": { "type": "string" }
  },
  "examples": [
    { "name": "lab-pc", "port": 0, "bridgePort": 47321, "route": "https", "token": "3cae3adc7d0ac063f3992b6ecf478a009e175ce84078ba2e94d76b4ca8f8821e" }
  ]
}
```

```json type
{
  "$id": "TunnelCommands",
  "description": "A session's two tunnel commands as argument lists and as the text shown, and the address the dashboard reaches the session at through the forward.",
  "type": "object",
  "required": ["reverse", "forward", "reverseText", "forwardText", "url"],
  "additionalProperties": false,
  "properties": {
    "reverse": { "type": "array", "items": { "type": "string" } },
    "forward": { "type": "array", "items": { "type": "string" } },
    "reverseText": { "type": "string" },
    "forwardText": { "type": "string" },
    "url": { "type": "string", "pattern": "^http://localhost:[0-9]+$" }
  },
  "examples": [
    {
      "reverse": ["ssh", "-N", "-o", "ServerAliveInterval=30", "-o", "ServerAliveCountMax=3", "-o", "ExitOnForwardFailure=yes", "-o", "IdentitiesOnly=yes", "-o", "IdentityFile=~/.ssh/id_ed25519", "-R", "127.0.0.1:20001:127.0.0.1:47321", "alice@jump.example.org"],
      "forward": ["ssh", "-N", "-o", "ServerAliveInterval=30", "-o", "ServerAliveCountMax=3", "-o", "ExitOnForwardFailure=yes", "-o", "IdentitiesOnly=yes", "-o", "IdentityFile=~/.ssh/id_ed25519", "-L", "127.0.0.1:20001:127.0.0.1:20001", "alice@jump.example.org"],
      "reverseText": "ssh -N -o ServerAliveInterval=30 -o ServerAliveCountMax=3 -o ExitOnForwardFailure=yes -o IdentitiesOnly=yes -o IdentityFile=~/.ssh/id_ed25519 -R 127.0.0.1:20001:127.0.0.1:47321 alice@jump.example.org",
      "forwardText": "ssh -N -o ServerAliveInterval=30 -o ServerAliveCountMax=3 -o ExitOnForwardFailure=yes -o IdentitiesOnly=yes -o IdentityFile=~/.ssh/id_ed25519 -L 127.0.0.1:20001:127.0.0.1:20001 alice@jump.example.org",
      "url": "http://localhost:20001"
    }
  ]
}
```

```json type
{
  "$id": "ServiceFile",
  "description": "A file that keeps a tunnel running: where it goes, its text, and the commands that start it.",
  "type": "object",
  "required": ["path", "text", "commands"],
  "additionalProperties": false,
  "properties": {
    "path": { "type": "string" },
    "text": { "type": "string" },
    "commands": { "type": "array", "items": { "type": "string" } }
  },
  "examples": [
    {
      "path": "~/.config/systemd/user/agent-m-tunnel-gpu-box.service",
      "text": "[Unit]\nDescription=Agent M reverse tunnel of the session gpu-box to jump.example.org\nAfter=network-online.target\nWants=network-online.target\n\n[Service]\nExecStart=ssh -N -o ServerAliveInterval=30 -o ServerAliveCountMax=3 -o ExitOnForwardFailure=yes -o IdentitiesOnly=yes -o IdentityFile=~/.ssh/id_ed25519 -R 127.0.0.1:20001:127.0.0.1:47321 -o BatchMode=yes -o StrictHostKeyChecking=yes alice@jump.example.org\nRestart=always\nRestartSec=5\n\n[Install]\nWantedBy=default.target\n",
      "commands": ["systemctl --user enable --now agent-m-tunnel-gpu-box.service", "loginctl enable-linger"]
    }
  ]
}
```

```json type
{
  "$id": "ServiceFiles",
  "description": "The service files of a reverse tunnel, for systemd and for launchd.",
  "type": "object",
  "required": ["systemd", "launchd"],
  "additionalProperties": false,
  "properties": { "systemd": { "$ref": "ServiceFile" }, "launchd": { "$ref": "ServiceFile" } },
  "examples": [
    {
      "systemd": {
        "path": "~/.config/systemd/user/agent-m-tunnel-gpu-box.service",
        "text": "[Unit]\nDescription=Agent M reverse tunnel of the session gpu-box to jump.example.org\nAfter=network-online.target\nWants=network-online.target\n\n[Service]\nExecStart=ssh -N -o ServerAliveInterval=30 -o ServerAliveCountMax=3 -o ExitOnForwardFailure=yes -o IdentitiesOnly=yes -o IdentityFile=~/.ssh/id_ed25519 -R 127.0.0.1:20001:127.0.0.1:47321 -o BatchMode=yes -o StrictHostKeyChecking=yes alice@jump.example.org\nRestart=always\nRestartSec=5\n\n[Install]\nWantedBy=default.target\n",
        "commands": ["systemctl --user enable --now agent-m-tunnel-gpu-box.service", "loginctl enable-linger"]
      },
      "launchd": {
        "path": "~/Library/LaunchAgents/org.agent-m.tunnel.gpu-box.plist",
        "text": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<plist version=\"1.0\">\n<dict>\n    <key>Label</key>\n    <string>org.agent-m.tunnel.gpu-box</string>\n    <key>ProgramArguments</key>\n    <array>\n        <string>/usr/bin/ssh</string>\n        <string>-N</string>\n        <string>-o</string>\n        <string>ServerAliveInterval=30</string>\n        <string>-o</string>\n        <string>ServerAliveCountMax=3</string>\n        <string>-o</string>\n        <string>ExitOnForwardFailure=yes</string>\n        <string>-o</string>\n        <string>IdentitiesOnly=yes</string>\n        <string>-o</string>\n        <string>IdentityFile=~/.ssh/id_ed25519</string>\n        <string>-R</string>\n        <string>127.0.0.1:20001:127.0.0.1:47321</string>\n        <string>-o</string>\n        <string>BatchMode=yes</string>\n        <string>-o</string>\n        <string>StrictHostKeyChecking=yes</string>\n        <string>alice@jump.example.org</string>\n    </array>\n    <key>RunAtLoad</key>\n    <true/>\n    <key>KeepAlive</key>\n    <true/>\n    <key>ThrottleInterval</key>\n    <integer>30</integer>\n</dict>\n</plist>\n",
        "commands": ["launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/org.agent-m.tunnel.gpu-box.plist"]
      }
    }
  ]
}
```

```json type
{
  "$id": "PasswordFileCommands",
  "description": "The command that makes the web server's password file for its login, for Apache and for nginx.",
  "type": "object",
  "required": ["apache", "nginx"],
  "additionalProperties": false,
  "properties": { "apache": { "type": "string" }, "nginx": { "type": "string" } },
  "examples": [
    { "apache": "htpasswd -B -c /etc/apache2/agent-m.htpasswd alice", "nginx": "htpasswd -m -c /etc/nginx/agent-m.htpasswd alice" }
  ]
}
```

```json type
{
  "$id": "WebServerConfig",
  "description": "The jump host's web-server configuration for its sessions, for Apache and for nginx, and the commands that make the login's password file.",
  "type": "object",
  "required": ["apache", "nginx", "passwordFile"],
  "additionalProperties": false,
  "properties": {
    "apache": { "type": "string" },
    "nginx": { "type": "string" },
    "passwordFile": { "$ref": "PasswordFileCommands" }
  },
  "examples": [
    {
      "apache": "# Agent M: the HTTPS route to the remote sessions of jump.example.org, inside its <VirtualHost *:443>.\n# Needs mod_proxy, mod_proxy_http, mod_auth_basic, mod_authn_file, mod_headers, mod_rewrite and mod_setenvif.\n# A preflight is answered here, 204, without login and never forwarded:\nSetEnvIf Request_Method \"^OPTIONS$\" no-proxy=1\nRewriteEngine On\nRewriteCond \"%{REQUEST_METHOD}\" \"=OPTIONS\"\nRewriteRule \"^/agent-m/[0-9]+/\" \"-\" [R=204,L]\nHeader always set Access-Control-Allow-Origin \"https://alice.github.io\" \"expr=%{REQUEST_METHOD} == 'OPTIONS'\"\nHeader always set Access-Control-Allow-Methods \"GET, POST, DELETE\" \"expr=%{REQUEST_METHOD} == 'OPTIONS'\"\nHeader always set Access-Control-Allow-Headers \"agent-m-bridge-token, authorization, content-type\" \"expr=%{REQUEST_METHOD} == 'OPTIONS'\"\n\n# The session lab-pc: forwarded to the tunnel's end only with the login.\n<Location \"/agent-m/20002/\">\n    ProxyPass \"http://127.0.0.1:20002/\"\n    ProxyPassReverse \"http://127.0.0.1:20002/\"\n    AuthType Basic\n    AuthName \"Agent M\"\n    AuthUserFile \"/etc/apache2/agent-m.htpasswd\"\n    Require valid-user\n</Location>\n",
      "nginx": "# Agent M: the HTTPS route to the remote sessions of jump.example.org, inside its server block on port 443.\n\n# The session lab-pc: a preflight answered here, 204, without login and never forwarded; every other request only with the login.\nlocation /agent-m/20002/ {\n    if ($request_method = OPTIONS) {\n        add_header Access-Control-Allow-Origin \"https://alice.github.io\" always;\n        add_header Access-Control-Allow-Methods \"GET, POST, DELETE\" always;\n        add_header Access-Control-Allow-Headers \"agent-m-bridge-token, authorization, content-type\" always;\n        return 204;\n    }\n    auth_basic \"Agent M\";\n    auth_basic_user_file /etc/nginx/agent-m.htpasswd;\n    proxy_pass http://127.0.0.1:20002/;\n}\n",
      "passwordFile": { "apache": "htpasswd -B -c /etc/apache2/agent-m.htpasswd alice", "nginx": "htpasswd -m -c /etc/nginx/agent-m.htpasswd alice" }
    }
  ]
}
```

```json type
{
  "$id": "SshClient",
  "description": "The OpenSSH client the bridge runs: its ssh, its ssh-keygen, and the licence files the About window shows — none where the system's own is run.",
  "type": "object",
  "required": ["ssh", "sshKeygen", "notices"],
  "additionalProperties": false,
  "properties": {
    "ssh": { "type": "string", "minLength": 1 },
    "sshKeygen": { "type": "string", "minLength": 1 },
    "notices": { "type": "array", "items": { "type": "string" } }
  },
  "examples": [
    { "ssh": "ssh", "sshKeygen": "ssh-keygen", "notices": [] },
    {
      "ssh": "C:\\Program Files\\Agent M Bridge\\openssh\\ssh.exe",
      "sshKeygen": "C:\\Program Files\\Agent M Bridge\\openssh\\ssh-keygen.exe",
      "notices": ["C:\\Program Files\\Agent M Bridge\\openssh\\LICENSE.txt", "C:\\Program Files\\Agent M Bridge\\openssh\\NOTICE.txt"]
    }
  ]
}
```

```json type
{
  "$id": "PublicKey",
  "description": "The bridge's public key, the one line to add on the jump host.",
  "type": "object",
  "required": ["publicKey"],
  "additionalProperties": false,
  "properties": { "publicKey": { "type": "string", "pattern": "^ssh-ed25519 " } },
  "examples": [
    { "publicKey": "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJ7m0Qm8l0T6Pq3dQzq9eA3fK2xQm5bR8cS1tV4wX6yZ agent-m-bridge" }
  ]
}
```

```json type
{
  "$id": "TunnelRun",
  "description": "What the bridge's shell knows of a tunnel's ssh: whether it runs, for how many seconds, the last line it wrote to its error output, and in how many seconds it starts again.",
  "type": "object",
  "required": ["running", "ranSeconds", "lastError", "retryIn"],
  "additionalProperties": false,
  "properties": {
    "running": { "type": "boolean" },
    "ranSeconds": { "type": "integer", "minimum": 0 },
    "lastError": { "type": "string" },
    "retryIn": { "type": "integer", "minimum": 0 }
  },
  "examples": [
    { "running": false, "ranSeconds": 1, "lastError": "alice@jump.example.org: Permission denied (publickey).", "retryIn": 20 }
  ]
}
```

```json type
{
  "$id": "TunnelState",
  "description": "A tunnel's state — open, connecting or closed — and why it is closed.",
  "type": "object",
  "required": ["state", "reason"],
  "additionalProperties": false,
  "properties": {
    "state": { "type": "string", "enum": ["open", "connecting", "closed"] },
    "reason": { "type": "string" }
  },
  "examples": [
    { "state": "open", "reason": "" },
    { "state": "closed", "reason": "alice@jump.example.org: Permission denied (publickey).; starting again in 20 seconds" }
  ]
}
```

```json type
{
  "$id": "ServedSession",
  "description": "The session a bridge serves behind NAT: its port on the jump host and the bridge's own port.",
  "type": "object",
  "required": ["port", "bridgePort"],
  "additionalProperties": false,
  "properties": {
    "port": { "type": "integer", "minimum": 1, "maximum": 65535 },
    "bridgePort": { "type": "integer", "minimum": 1, "maximum": 65535 }
  },
  "examples": [{ "port": 20001, "bridgePort": 47321 }]
}
```

```json type
{
  "$id": "TunnelSettings",
  "description": "A bridge's tunnel settings: the jump host's name and SSH user — empty where none is set —, the session it serves or none, and the session ports it reaches.",
  "type": "object",
  "required": ["host", "user", "serve", "reach"],
  "additionalProperties": false,
  "properties": {
    "host": { "type": "string" },
    "user": { "type": "string" },
    "serve": { "anyOf": [{ "$ref": "ServedSession" }, { "type": "null" }] },
    "reach": { "type": "array", "items": { "type": "integer", "minimum": 1, "maximum": 65535 } }
  },
  "examples": [
    { "host": "jump.example.org", "user": "alice", "serve": { "port": 20001, "bridgePort": 47321 }, "reach": [] },
    { "host": "jump.example.org", "user": "alice", "serve": null, "reach": [20001, 20002] }
  ]
}
```

```json type
{
  "$id": "ExportChoice",
  "description": "Which session of an export the bridge serves — empty where it reaches every session.",
  "type": "object",
  "required": ["serve"],
  "additionalProperties": false,
  "properties": { "serve": { "type": "string" } },
  "examples": [{ "serve": "gpu-box" }]
}
```

```json type
{
  "$id": "FromExport",
  "description": "What an export gives the bridge: its tunnel settings, and the pairing token of the session it serves — empty where it serves none.",
  "type": "object",
  "required": ["settings", "token"],
  "additionalProperties": false,
  "properties": { "settings": { "$ref": "TunnelSettings" }, "token": { "type": "string" } },
  "examples": [
    {
      "settings": {
        "host": "jump.example.org",
        "user": "alice",
        "serve": { "port": 20001, "bridgePort": 47321 },
        "reach": []
      },
      "token": "51ae3adc7d0ac063f3992b6ecf478a009e175ce84078ba2e94d76b4ca8f8821e"
    }
  ]
}
```

```json type
{
  "$id": "TunnelStateOf",
  "description": "The state of one of a bridge's tunnels: its role, its session port, and its state.",
  "type": "object",
  "required": ["role", "port", "state"],
  "additionalProperties": false,
  "properties": {
    "role": { "type": "string", "enum": ["reverse", "forward"] },
    "port": { "type": "integer", "minimum": 1, "maximum": 65535 },
    "state": { "$ref": "TunnelState" }
  },
  "examples": [{ "role": "reverse", "port": 20001, "state": { "state": "open", "reason": "" } }]
}
```

```json type
{
  "$id": "TunnelReport",
  "description": "One tunnel as GET /tunnels names it: its role, its session port, its state and why it is closed.",
  "type": "object",
  "required": ["role", "port", "state", "reason"],
  "additionalProperties": false,
  "properties": {
    "role": { "type": "string", "enum": ["reverse", "forward"] },
    "port": { "type": "integer", "minimum": 1, "maximum": 65535 },
    "state": { "type": "string", "enum": ["open", "connecting", "closed"] },
    "reason": { "type": "string" }
  },
  "examples": [{ "role": "reverse", "port": 20001, "state": "open", "reason": "" }]
}
```

```json type
{
  "$id": "TunnelsReport",
  "description": "The bridge's answer to GET /tunnels: its jump host as user@host — empty where none is set —, the public key to add there, and its tunnels.",
  "type": "object",
  "required": ["jumpHost", "publicKey", "tunnels"],
  "additionalProperties": false,
  "properties": {
    "jumpHost": { "type": "string" },
    "publicKey": { "type": "string" },
    "tunnels": { "type": "array", "items": { "$ref": "TunnelReport" } }
  },
  "examples": [
    {
      "jumpHost": "alice@jump.example.org",
      "publicKey": "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJ7m0Qm8l0T6Pq3dQzq9eA3fK2xQm5bR8cS1tV4wX6yZ agent-m-bridge",
      "tunnels": [{ "role": "reverse", "port": 20001, "state": "open", "reason": "" }]
    }
  ]
}
```

## Realisation

| Step | Interfaces |
|---|---|
| UC-011 1c.1 | MOD-settings-views.settingsPage, MOD-bridge-tunnel.checkJumpHost, MOD-settings-store.storeJumpHost, MOD-bridge-server.newToken, MOD-bridge-tunnel.newSession, MOD-settings-store.storeRemoteSession, MOD-settings-store.saveEntries |
| UC-011 1c.2 | MOD-bridge-tunnel.tunnelCommands, MOD-bridge-tunnel.tunnelBindProblems, MOD-bridge-tunnel.serviceFiles |
| UC-011 1c.4 | MOD-bridge-tunnel.webServerConfig, MOD-bridge-tunnel.sessionRoute, MOD-settings-page.testSetting, MOD-bridge-server.callBridge, MOD-bridge-server.admit, MOD-bridge-app.hello, MOD-bridge-server.speaks, MOD-settings-store.recordTest, MOD-settings-store.saveEntries |
| UC-044 4c | MOD-settings-page.testSetting, MOD-bridge-server.callBridge, MOD-bridge-tunnel.checkJumpHost, MOD-settings-store.storeJumpHost, MOD-bridge-tunnel.newSession, MOD-settings-store.storeRemoteSession, MOD-settings-store.saveEntries, MOD-bridge-tunnel.keepTunnelSettings, MOD-bridge-tunnel.sshClient, MOD-bridge-tunnel.keyCommand, MOD-bridge-tunnel.publicKeyOf, MOD-bridge-tunnel.tunnelSettingsOf, MOD-bridge-tunnel.bridgeCommand, MOD-bridge-tunnel.tunnelState, MOD-bridge-tunnel.webServerConfig, MOD-bridge-tunnel.sessionRoute, MOD-settings-page.testSetting, MOD-bridge-server.callBridge |
| UC-044 6a.1 | MOD-bridge-tunnel.tunnelSettingsOf, MOD-settings-store.importSettings, MOD-settings-store.readSettings, MOD-bridge-tunnel.settingsFromExport, MOD-bridge-app.pairWith, MOD-bridge-tunnel.keepTunnelSettings |
| UC-044 6a.2 | MOD-bridge-tunnel.sshClient, MOD-bridge-tunnel.keyCommand, MOD-bridge-tunnel.publicKeyOf |
| UC-044 6a.3 | MOD-bridge-tunnel.tunnelSettingsOf, MOD-bridge-tunnel.sshClient, MOD-bridge-tunnel.bridgeCommand, MOD-bridge-tunnel.restartDelay, MOD-bridge-tunnel.tunnelState, MOD-bridge-tunnel.tunnelsReport |
| UC-044 6a.4 | MOD-settings-store.importSettings, MOD-settings-store.readSettings, MOD-bridge-tunnel.settingsFromExport, MOD-bridge-tunnel.keepTunnelSettings, MOD-bridge-tunnel.tunnelSettingsOf, MOD-bridge-tunnel.sshClient, MOD-bridge-tunnel.keyCommand, MOD-bridge-tunnel.publicKeyOf, MOD-bridge-tunnel.bridgeCommand, MOD-bridge-tunnel.restartDelay, MOD-bridge-tunnel.tunnelState, MOD-bridge-tunnel.tunnelsReport, MOD-bridge-tunnel.tunnelCommands |
| UC-044 6a.5 | MOD-bridge-tunnel.checkJumpHost, MOD-settings-store.storeJumpHost, MOD-settings-store.saveEntries, MOD-bridge-tunnel.sessionRoute, MOD-settings-page.testSetting, MOD-bridge-server.callBridge, MOD-bridge-tunnel.webServerConfig, MOD-settings-store.recordTest |
