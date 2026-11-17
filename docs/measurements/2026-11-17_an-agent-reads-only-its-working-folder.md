# An agent on a Bridge that reads only its working folder of the person's home, with the person's SSH agent

**MEASUREMENT** — 2026-11-17, macOS 15.8.1 (build 24H32), as the computer's ordinary user, `main` at commit `02b0fa124`.
Method: each probe runs under `/usr/bin/sandbox-exec -f <profile>` with the environment `env -i PATH=/usr/local/bin:/usr/bin:/bin
HOME=<working folder>/home SSH_AUTH_SOCK=<the person's> TMPDIR=/private/tmp LANG=en_US.UTF-8`, in the working folder
`/Users/maier/Documents/code/scratch/codex` of the Bridge's agent codex; the CLIs are installed below `/usr/local`. Each
negative is shown beside a known positive of the same probe. No key was read: ssh's probe used the SSH agent and a copy of
the host keys of `github.com` (`ssh-keygen -F github.com`) in a temporary file. The profile was a temporary file:

```
(version 1)
(allow default)
(deny file-read* file-write* (subpath "/Users/maier"))
(allow file-read* file-write* (subpath "<working folder>"))
(deny file-write*)
(allow file-write* (subpath "<working folder>") (subpath "/private/tmp") (subpath "/private/var/folders") (subpath "/dev"))
(deny mach-lookup (global-name "com.apple.SecurityServer") (global-name "com.apple.securityd.xpc") (global-name "com.apple.secd"))
```

## Results

| Probe | Under the profile | Known positive |
|---|---|---|
| `codex login status` | `Logged in using ChatGPT`, exit 0 (its login in the working folder's `home/.codex/`) | — |
| `claude --version`, `opencode --version` | `2.1.292 (Claude Code)`, `opencode v2.1.4` | — |
| `ls ~/.ssh`, `cat ~/.zshrc` | `Operation not permitted` | `ls /usr/local/bin/codex` lists it |
| `touch ~/Documents/<probe>` | `Operation not permitted` | `touch <working folder>/home/tmp/<probe>` succeeds |
| `curl https://api.github.com/zen` | 200 | — |
| `ssh -T git@github.com` | `Host key verification failed`: `hostkeys_foreach failed for ~/.ssh/known_hosts: Operation not permitted` — ssh reads its files from the user's own `~/.ssh`, not from `HOME` | — |
| `ssh -v -o UserKnownHostsFile=<copy> -T git@github.com` | host key found; `get_agent_identities: agent returned 1 keys` | with the socket refused as before, `(deny network-outbound (remote unix-socket (path-regex #"^/private/tmp/com\.apple\.launchd\.[^/]+/Listeners$")))`: `ssh_get_authentication_socket: Operation not permitted` |

GitHub refused the one key the SSH agent held at first (`Permission denied (publickey)`): that key is not one of the
account's on GitHub (`https://github.com/akmaier.keys`), and the account's key, `~/.ssh/id_rsa`, was not in the agent.
Outside the profile ssh reads `~/.ssh/id_rsa` itself, which the profile hides. Once a plain `ssh -T git@github.com` had
added `~/.ssh/id_rsa` to the agent (`AddKeysToAgent yes` in `~/.ssh/config`), `ssh -o UserKnownHostsFile=<copy> -T
git@github.com` under the profile was answered `Hi akmaier! You've successfully authenticated`, while `ls ~/.ssh` under
the same profile stayed `Operation not permitted`.
