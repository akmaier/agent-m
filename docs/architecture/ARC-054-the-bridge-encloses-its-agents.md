---
id: ARC-054
title: The Bridge encloses the agents it starts
refines: ARC-040
forced_by:
  - NO MODEL READS A CREDENTIAL
  - A LOCAL AGENT USES THE PERSON'S OWN LOGIN
  - A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
  - CONFIGURATION LIVES IN THE BROWSER
  - A CREDENTIAL IS NEVER PLACED IN A URL
  - THE BRIDGE IS ONE FILE PER PLATFORM
  - THE BRIDGE FINDS THE INSTALLED AGENTS
  - THE BRIDGE GUIDES THE INSTALLATION OF A MISSING AGENT
  - THE BRIDGE IS PAIRED ONCE
  - THE BRIDGE CREATES ITS OWN SSH KEY
  - THE BRIDGE HOLDS THE MAILBOX PASSWORD ONLY FOR ONE REQUEST
  - A REUSE DECISION RECORDS ITS DUE DILIGENCE
  - DUE DILIGENCE IS FETCHED, NOT RECALLED
  - A REUSED LICENCE IS SHOWN AGAINST THE PRODUCT'S
  - CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI
  - AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST
  - A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS
  - A JOB STOPS AT EVERY GATE
  - UC-011
  - UC-024
  - UC-034
  - UC-044
designs:
  - MOD-agent-enclosure
  - MOD-bridge-jobs
  - MOD-agent-processes
  - MOD-desktop-shell
---
# ARC-054 The Bridge encloses the agents it starts

## Context

The Bridge starts coding-agent CLIs on the person's computer (UC-011, UC-044), as the person's own user. Each of them
works with its own tools — reading files, running commands, reaching the web — and every result of a tool reaches the
agent's model. The Bridge holds credentials: its pairing token, the tokens of the remote sessions and whatever else its
settings keep, and its own SSH key, in its data folder (MOD-bridge-http, MOD-desktop-shell, MOD-tunnels); an endpoint's
key and a mailbox password in its memory, for one request (MOD-bridge-jobs, MOD-mail-protocols); and it reaches the
repositories with the repository tokens the browser it is paired with hands it, which it keeps in its data folder
(`A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT`, `CONFIGURATION LIVES IN THE BROWSER`), and, for a repository it holds
none for, with the computer's own git login — SSH keys, an SSH agent, a credential helper and its store, the system's
keychain (MOD-bridge-jobs). `NO MODEL READS A CREDENTIAL` says that none of these reaches a model, neither in what is sent
to it nor through a tool it calls.

As the person's user, an agent's tools reach all of it. Measured on macOS (`docs/measurements/2026-10-27_what-an-agent-on-a-bridge-reaches.md`):
a child of the person's user reads files of mode 0600 of that user, and the keychain answers its searches, which is where
git's `osxkeychain` helper keeps the computer's git login; it reads the environment of other processes of the user; it
cannot open their memory. Until now the agent also pushed its branch and opened its pull request itself, with the
computer's git login and its own tools (MOD-bridge-jobs). On the server's runners the same rule is met by running the
model as another OS user beside a key holder (ARC-046); on a Bridge it was not met.

The Bridge ships for macOS, Windows and Linux (`THE BRIDGE IS ONE FILE PER PLATFORM`) to a person who may never have used
a terminal, often without administrator rights on a computer they do not administer.

An implementation job's agent delivers through the server: its tests-only first commit must be red in the product's CI
(`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`), its code reaches the default branch through a pull request with
green CI, merged only once the Definition of Done holds (`CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH
GREEN CI`, `A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS`), and by the agent itself where the author
leaves the merge to it (UC-024, UC-034). While it works, it fetches and pulls what the origin gained meanwhile — a
default branch that moved, which it brings its branch up to. For a private product, on GitHub or on a GitLab server,
each of these is a call to the server with a credential, and the merge is one for every product.

## Decision

**Every process of a coding agent that the Bridge starts runs in an enclosure the operating system enforces; the Bridge
itself does not.** Inside the enclosure the agent reads everything except the places that hold a credential of the
Bridge or of the computer's git login, writes only its own home, the job's checkout with the folders the Bridge makes for
the job beside it, and temporary files, and reaches the network. The enclosure is the new module MOD-agent-enclosure of the Bridge (ARC-040); MOD-agent-processes starts a CLI
through the enclosure it is given, and MOD-bridge-jobs gives every agent process one — a job, an ask, the check whether
the agent is logged in and the harmless probe.

- **The separation is by what the system lets a process reach, not by what a tool may say** — ARC-046's principle for the
  server's runners. A rule an agent's tool has to keep would be kept by the model it serves.
- **Per platform, the simplest enclosure that holds** (`KEEP IT SIMPLE`). The three are the ones Anthropic's
  sandbox-runtime uses for coding agents: "`sandbox-exec` on macOS, `bubblewrap` on Linux", and on Windows "a dedicated
  `srt-sandbox` local user account" (its README, [3] below).
  - **macOS — a Seatbelt profile**, applied by `/usr/bin/sandbox-exec`, which every macOS has: no installation and no
    administrator. The profile allows by default, then denies every write, allows writing the agent's home, the job's
    checkout, `/private/tmp` and `/dev`, denies reading and writing the places that hold credentials, denies the
    keychain's services and denies connecting to the SSH agent's socket. Measured: each of these rules holds for the
    child and what it starts, and HTTPS still works.
  - **Linux — bubblewrap** (`bwrap`), a program of the system: the whole file system bound read-only, the agent's home and
    the job's checkout bound writable, a private `/tmp`, an empty folder over each place that holds credentials and over
    the user's runtime folder — the session bus with its secret service, the SSH and GPG agents —, `/dev/null` over each
    such file, a PID namespace of its own, so that no process of the person is seen, a new session, and an end with the
    Bridge. bubblewrap needs no privilege where the kernel lets a user make namespaces.
  - **Windows — a local account of the Bridge's own**, without administrator rights. Windows offers no enclosure that a
    user without administrator rights can put around a child of their own and that hides the Credential Manager — where
    Git Credential Manager keeps the git login — and the Bridge's process memory: both are open to every process of the
    user. The account has its own profile, its own Credential Manager, and no access to the person's profile or processes.
    The Bridge starts the agent as that account with the account's password, which only the Bridge keeps, in its data
    folder; the job's checkout and the clones of the instance and of the job's product are granted to the account, the
    checkout for writing.
- **The enclosed agent has a home of its own** — `home/` in the agent's working folder, on Windows the account's profile —,
  with its own configuration and its own login (`A LOCAL AGENT USES THE PERSON'S OWN LOGIN`, read as: the agent's own
  login on this computer, made by the person with the agent's own login step; Agent M asks for no key). The person's own
  configuration of the agent is neither read nor written by the enclosed one: a hook written into it would run outside the
  enclosure the next time the person uses the agent. On macOS this follows anyway: the keychain, where Claude Code keeps
  its login, is closed, and Claude Code inside the profile reports no login (measured).
- **A login the agent would keep in the closed keychain is kept in its home.** Claude Code keeps its login in the
  keychain on macOS, and `claude auth login` in the enclosure fails to save it. Its login step there is therefore
  `claude setup-token`, the long-lived token Claude Code offers for a computer whose store it cannot use: the terminal
  of the login step records what it prints, the enclosure takes the token from that record into the agent's home, and
  gives it to Claude Code as `CLAUDE_CODE_OAUTH_TOKEN`, the variable Claude Code reads it from. The token stays on the
  Bridge's computer, in the agent's home, as Codex's login stays in its `auth.json` there; it is written to no
  repository and sent to no dashboard. Codex keeps its login in a file of its home by default (its
  `cli_auth_credentials_store` is `file`), and opencode in its database below its home's data folder: neither uses the
  keychain, and their own login steps stay as they are. On Linux and Windows Claude Code's login step stays
  `claude auth login`.
- **The environment is chosen, not inherited** — the same rule as on the server's runners (MOD-workflow-entries, *The
  model's user*): the agent receives the variables a program needs to run — the path, the language, the terminal, its
  home and the folders below it —, the git identity the computer's configuration names for its commits, and the login
  its home keeps for it, and nothing else: no key variable, no SSH agent, no session bus.
- **Git stays with the Bridge** (`NO MODEL READS A CREDENTIAL`; nothing twice — the push address of CI's agent machine,
  MOD-workflow-entries). Before the agent starts, the Bridge brings its own clone of the product up to the origin with
  its credentials, makes the job's checkout from that clone, which stays the checkout's fetch address, and sets its
  push address to an outbox, a bare repository beside it, in which the agent's pushes land. **The agent fetches from
  the Bridge's clone**: its `git fetch` and `git pull` read the origin's branches as the Bridge last fetched them, over
  a local path, without a credential, for every product alike — public or private, GitHub or GitLab. **Each push is
  forwarded at once**: while the agent works, the Bridge looks at the outbox every few seconds, fetches its branches
  into its own clone of the product — which the agent cannot write — and pushes every branch the agent made or moved to
  the origin, never forced, so that the product's CI runs on each commit the agent pushes, the tests-only first one
  among them. The Bridge never runs git with its credentials in a repository the agent can write: a
  hook or a command in that repository's configuration would run with the person's rights, the alternative ARC-046
  rejects for CI.
- **The Bridge relays the agent's calls to the server** (`NO MODEL READS A CREDENTIAL`; nothing twice — the outbox's
  pattern: the agent writes where it may, the Bridge, outside the enclosure, carries it to the server). The agent brings
  the Bridge's clone up to the origin, opens its pull request, reads it with its CI and a run's log, and merges it by
  asking: it writes a request into a folder of the job it may write, the Bridge makes the call — the fetch with its own
  git and the token it holds for the product, as every fetch of that clone, the others through MOD-repository-hosts'
  adapter of the server's API with that token, a pull request on GitHub, a merge request on GitLab —, and writes the
  answer into a folder the agent may only read; after a fetch the agent runs its own `git fetch` against the clone. The Bridge reads a request without following a link and answers with nothing of the
  request's file and no token. It opens through the job's writer, so that the pull request has the description Agent M
  gives every job's; it merges only on the head on which the product's CI found the Definition of Done to hold, where
  the job leaves the merge to the agent and every gate before the merge is passed, and the server's branch protection
  stays in force — the relay cannot merge what the SPEC forbids. Since every read — git's fetch among them — goes
  through the Bridge, a private product is served as a public one. The forwards and the relay are MOD-bridge-jobs'.
- **The repository tokens stay in the Bridge's data folder, and reach only the Bridge's own git** (`NO MODEL READS A
  CREDENTIAL`, `A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT`). The browser hands the Bridge its repository tokens,
  each with its repository, over the paired channel (UC-044, step 4); the Bridge keeps them in one file of its data
  folder, which every enclosure hides, written in git's own configuration format: for each repository the header that
  authorises git's requests to that repository's address, which git applies by its own matching of addresses. The
  Bridge's process names that file to every git it starts — its environment includes the file by its path —, so that a
  token is never on a command line, in a remote address, in a clone's configuration or in an environment; the API
  requests read the token back from the same file, with git's same matching (*Nothing twice*: one store, one rule of
  which token goes where). An agent's environment is chosen and names no such file. Where the file holds no token for a
  repository, git uses the computer's own login, where it has one, at no cost of its own: the Bridge adds nothing for
  it.
- **No enclosure, no agent** — no silent weakening. Before it starts an agent, the Bridge asks the enclosure whether it
  works on this computer. Where it does not — bubblewrap missing or refused its namespaces, the account not made — the
  Bridge starts no agent: the agent is shown as not ready, a job ends failed and an ask fails, each naming the reason and
  the one-time step that makes it work.
- **The one-time steps** are named by the enclosure and shown in the Bridge's window:
  - on every platform, once per agent: the agent's own login step, run in the enclosure, with its home — for Claude Code
    on macOS `claude setup-token`, whose token the enclosure keeps;
  - on Linux, where bubblewrap is missing: an administrator installs the package `bubblewrap`; where it is installed but
    may not make namespaces, an administrator allows it;
  - on Windows: an administrator confirms, once, that the Bridge makes its account — Windows' own elevation prompt —;
    then the person installs the agent for that account and logs it in, in a console the Bridge opens as that account.
- **Endpoint keys stay where they are.** The Bridge gives no CLI a model endpoint and no key variable (`A LOCAL AGENT USES
  THE PERSON'S OWN LOGIN`); the key of an endpoint it calls for the page lives in its own memory for that request, which
  the enclosure keeps out of reach: macOS refuses another process's memory to a process of the same user, the Bridge is
  built with the hardened runtime (MOD-bridge-build), Linux's agent sees no process of the person, and on Windows it is
  another account. MOD-endpoint-calls' key holder, which serves where a model works in a checkout with a key the machine
  holds, has no such model on a Bridge.

### Responsibility within the system

MOD-agent-enclosure states, for the platform it runs on, what an agent process may read, write and reach, builds the
command that starts a CLI inside it and the environment it receives, says whether the enclosure works on this computer,
and names the one-time step where it does not. It belongs to the Bridge (ARC-040); nothing else starts a coding agent on
a person's computer.

### The interface it offers

| Module | Functions other subsystems use |
|---|---|
| MOD-agent-enclosure | `AgentEnclosure`, `agentEnclosure` |

MOD-agent-processes, of Participants and jobs (ARC-046), defines the type `Enclosure` — what it needs to start a CLI
inside an enclosure — and takes one as an option of its driver, of its list of installed agents and of its probe.
MOD-agent-enclosure implements that type, as the drivers implement MOD-job-runner's `Driver`: the Bridge's module points
to the lower layer, never the other way.

## Alternatives

- **A separate OS user on every platform, as on the server's runners.** It holds everywhere. Rejected for macOS and
  Linux: it needs an administrator on every computer — the user, and a rule that lets the person's user start processes
  as it —, a home the Bridge copies the checkouts into and reads back from, and a login of the agent made as that user,
  while the system's own sandbox holds there without an administrator (`KEEP IT SIMPLE`). Chosen for Windows, where no
  same-user enclosure holds.
- **macOS App Sandbox.** It is given to an app by entitlements in the app's own signature; the agents' executables are
  their vendors', signed by them. Rejected.
- **Linux Landlock.** It restricts a process from inside, through system calls Node does not offer: a native module in
  every Bridge, and only rules that allow, without the PID namespace bubblewrap gives. Rejected (`KEEP IT SIMPLE`).
- **Linux firejail.** A program installed set-user-ID root, whose adoption is a hundredth of bubblewrap's (below).
  Rejected.
- **Windows AppContainer, or a restricted token.** Both are put on a child without an administrator, and both deny the
  child the person's profile — and with it the agent's own installation, its configuration and every tool it runs from
  the profile —, until the Bridge grants each folder; an AppContainer also cannot reach the computer's loopback without
  an exemption an administrator sets. Rejected for the grants they need everywhere, which the Bridge could not know.
- **Adopting sandbox-runtime.** It encloses with the same three mechanisms, and adds what Agent M does not need: proxies
  that filter the network by domain, a configuration language of its own, and on Windows a machine-wide network filter
  installed by an administrator; its versions are `0.0.x`. The enclosure the Bridge needs is a profile, a list of
  arguments and an account. Rejected (`KEEP IT SIMPLE`, `YOU AREN'T GONNA NEED IT`); its choices are the evidence for
  this decision's.
- **Protecting only the places that hold credentials, and letting the agent write everywhere else.** Rejected: an agent
  that may write the person's `~/.gitconfig`, a git or ssh binary below a folder the person can write (Homebrew's), or
  the Bridge's own clones makes the Bridge's next git command run its code with the person's rights, outside the
  enclosure.
- **Hiding only the Bridge's data folder.** Rejected: the git login the Bridge pushes with is a credential the Bridge uses
  as much as the ones it keeps.
- **The agent keeping the computer's git login to push and to open its pull request.** Rejected: through that login its
  model reaches the credential — `git credential fill`, the SSH agent.
- **A token given to git on its command line (`-c http.extraHeader=…`).** Rejected: a process of the person's user reads
  the command lines of the others (`ps`), an enclosed agent's among them on macOS, and MOD-bridge-jobs keeps no credential
  in a process command.
- **A token given to git in an environment variable, or by a `GIT_ASKPASS` program.** Rejected: on macOS an enclosed
  agent reads the environment of the person's other processes (measured), and an askpass program is one program per
  platform that reads the token from a file anyway.
- **A token written into a clone's remote address or a credential store beside the clone.** Rejected: the clones are
  readable by the agent (`A CREDENTIAL IS NEVER PLACED IN A URL`).
- **The Bridge pushing the agent's branches only after the agent's answer, and opening the pull request then.**
  Rejected: nothing reaches the origin while the agent works, so the agent cannot see its tests-only commit red in the
  product's CI, follow its CI or merge (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`, `A PULL REQUEST IS MERGED ONLY
  WHEN THE DEFINITION OF DONE HOLDS`).
- **The agent reading the server itself, without a token, and asking the Bridge only to open and merge.** Rejected: a
  private product's pull requests and runs are not read without a token; one way serves every product (`KEEP IT
  SIMPLE`).
- **The job's checkout fetching from the origin, and from the Bridge's clone only for a private product.** Rejected: two
  fetch addresses, chosen by a visibility the Bridge would have to know (*No special first case*); a public product's
  origin answers the agent's git as the Bridge's clone does.
- **The Bridge fetching into the job's checkout or its outbox when the agent asks.** Rejected: the Bridge would run git
  with its credentials in a repository the agent can write, whose hooks and configuration would run with the person's
  rights — the reason the Bridge runs git there only before the agent starts.
- **The Bridge fetching its clone at every look at the outbox, without a call.** Rejected: a request to the server every
  two seconds for each running job, mostly for nothing, while the agent knows when it needs the origin as it stands
  (`YOU AREN'T GONNA NEED IT`).
- **A git credential helper or a proxy of the Bridge that the agent's git reaches the origin through.** Rejected: a
  helper answers `git credential fill` with the token, and a proxy is a route of the Bridge a process inside the
  enclosure reaches (`NO MODEL READS A CREDENTIAL`), beside a fetch the Bridge's clone already makes.
- **A route of the Bridge's API for the agent, with a token of the job.** Rejected: that token is a credential the
  Bridge holds that reaches the model (`NO MODEL READS A CREDENTIAL`), and the Bridge's API would answer a process inside
  the enclosure.
- **The requests as refs the agent pushes into the outbox, the answers as refs it fetches.** Rejected: an answer cannot
  come back through the outbox, in which the Bridge runs no git once the agent has started, and a ref that carries a
  call or a state is not what a model expects of git (`LEAST ASTONISHMENT`).
- **A command the Bridge puts on the agent's path that makes the calls (`agent-m pr open`).** Rejected: one program per
  platform that would only write the same requests and read the same answers (`KEEP IT SIMPLE`).
- **The servers' command-line clients logged in as the person (`gh`, `glab`).** Rejected: a second login on the Bridge's
  computer for each server, which the person sets up; `glab` is a further program, and the API adapters MOD-repository-hosts
  already has open pull and merge requests with the token.
- **A token entered in the Bridge's window, or taken from the dashboard's export.** Rejected: the person decided that no
  token is entered there; and the browser's token, handed over the paired channel, is the one the person renews in the
  dashboard (*Nothing twice*).
- **Claude Code's `claude auth login` in the enclosure with the keychain opened to it.** Rejected: the keychain that would
  hold its login holds git's.
- **The person pasting the token of `claude setup-token` into the Bridge.** Rejected: the Bridge would ask for a key
  (`A LOCAL AGENT USES THE PERSON'S OWN LOGIN`); the record of the login step's terminal already holds it.
- **The person's own configuration and login of the agent shared with the enclosed agent.** Rejected: on macOS the
  keychain that holds the login is the keychain that holds git's; and a hook the enclosed agent writes into the shared
  configuration runs unenclosed.
- **Routing endpoint keys through the key holder on the Bridge.** Not needed: the Bridge starts no CLI with an endpoint,
  and its own endpoint calls run in its own process (`YOU AREN'T GONNA NEED IT`).
- **Running agents unenclosed where the enclosure does not work, with a warning.** Rejected: a weakening the person did
  not choose; the agent is not started and the one-time step is named.

## Due diligence

The enclosure adopts one program that does not come with the operating system: bubblewrap on Linux. `sandbox-exec` is
part of macOS, a local account part of Windows. Agent M's own licence is MIT (its `LICENSE` file). Adoption is the number
of Debian installations that report the package to Debian's popularity contest on 2026-10-26, or, for an npm package, its
downloads in the last month the registry reports.

| Candidate | Licence | Compatible with MIT | First release | Latest release | Releases | Open / closed issues | Adoption | Read from | Read on |
|---|---|---|---|---|---|---|---|---|---|
| bubblewrap — chosen | LGPL-2.1 (its `COPYING`) | yes for this use: the Bridge runs the system's program and neither links nor ships it | v0.1.3, 2016-10-14 (the repository since 2016-02-16) | v0.13.1, 2026-10-14 | 28 (28) on GitHub; 32 tags | 156 / 246 | 135,387 installations | [1] | 2026-10-27 |
| firejail | GPL-2.0 | yes for this use, as above | 0.9.62.2, 2020-08-11, the oldest GitHub lists | 0.9.80, 2026-03-14 | 16 (13) on GitHub | 504 / 3,037 | 1,257 installations | [2] | 2026-10-27 |
| @anthropic-ai/sandbox-runtime | Apache-2.0 | yes | 0.0.1, 2025-10-20 | 0.0.81, 2026-10-20 | 77 (77) | 136 / 40 | 733,216 (2026-06-02 to 2026-07-01, the newest month the registry reported) | [3] | 2026-10-27 |

No candidate is marked: every licence is known to be compatible with MIT for the use made of it.

- [1] https://api.github.com/repos/containers/bubblewrap · https://api.github.com/repos/containers/bubblewrap/releases ·
  https://api.github.com/repos/containers/bubblewrap/tags ·
  https://api.github.com/search/issues?q=repo:containers/bubblewrap+is:issue+is:open and `+is:closed` ·
  https://raw.githubusercontent.com/containers/bubblewrap/main/COPYING ·
  https://qa.debian.org/cgi-bin/popcon-data?packages=bubblewrap · https://sources.debian.org/api/src/bubblewrap/
- [2] https://api.github.com/repos/netblue30/firejail · https://api.github.com/repos/netblue30/firejail/releases ·
  https://api.github.com/search/issues?q=repo:netblue30/firejail+is:issue+is:open and `+is:closed` ·
  https://qa.debian.org/cgi-bin/popcon-data?packages=firejail
- [3] https://registry.npmjs.org/@anthropic-ai%2Fsandbox-runtime ·
  https://api.npmjs.org/downloads/point/last-month/@anthropic-ai/sandbox-runtime ·
  https://api.github.com/search/issues?q=repo:anthropics/sandbox-runtime+is:issue+is:open and `+is:closed` · its README:
  https://raw.githubusercontent.com/anthropic-experimental/sandbox-runtime/main/README.md

## Consequences

- A model working through an agent on a Bridge cannot read the Bridge's data folder, the computer's git login, its SSH
  keys and agent, or the keychain (macOS), the session bus and the user's runtime folder (Linux), or the person's profile
  and Credential Manager (Windows), and cannot write where the Bridge or the person would run what it wrote.
- Every agent a Bridge offers needs one login of its own, in its enclosure; a Windows computer needs an administrator
  once, a Linux computer without bubblewrap too. Until then the Bridge offers the agent as not ready and says why.
- The agent reaches the server only through the Bridge: it fetches from the Bridge's clone, which the relay's `fetch`
  brings up to the origin, each of its pushes is forwarded at once, and its pull-request calls are made with the token
  this browser handed the Bridge for the product — a pull request on GitHub, a merge request on GitLab. For a product it
  holds no token for, git fetches and pushes with the computer's own login where it has one, the relay answers every
  other call to the server as not supported, and the job ends with its branch pushed and no pull request, and says so.
- The agent learns of its pushes, its pull request and its CI only from the relay's answers, a few seconds after the
  fact; it polls them while it waits for CI. What it fetches is the origin as the Bridge last fetched it, until it asks
  `fetch`.
- The forwards and the relay are tested with a fixture outbox, a fixture server and the requests a fixture agent writes:
  a push reaches the server before the agent has answered, a commit the server gained reaches the agent's `git fetch`
  after a `fetch` call, a merge is refused for each condition that does not hold, and no answer holds a token;
  counter-proof: with every condition holding, the merge is made.
- A Bridge reached at the jump host's HTTPS address receives the repository tokens through the jump host's web server, as
  it receives its pairing token.
- What remains within an enclosed agent's reach, stated rather than closed: on macOS the environment the Bridge was
  started with (measured), so the Bridge puts no credential into an environment; on Linux a session bus that listens
  on an abstract socket instead of in the runtime folder; on every platform the person's other files that are not among
  the Bridge's or git's credential holders — a package registry's token in `~/.npmrc`, a cloud's in its own folder —, and
  the agent's own login in its own home.
- The macOS profile and the Linux arguments are tested by construction on every platform and run on macOS; the Linux
  enclosure and the Windows account are tested by construction only until they run on such a computer.
