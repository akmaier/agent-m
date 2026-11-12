---
id: MOD-desktop-shell
title: The Bridge's app — its icon, its window, its settings and its updates
folder: src/desktop-shell/
realises:
follows:
  - ARC-040
  - ARC-050
uses:
  - MOD-bridge-http.bridgeApi
  - MOD-bridge-http.BridgeHandlers
  - MOD-bridge-http.serveBridge
  - MOD-bridge-http.pairAnew
  - MOD-bridge-jobs.jobHandlers
  - MOD-bridge-jobs.startWatching
  - MOD-bridge-jobs.stopWatching
  - MOD-bridge-jobs.checkOut
  - MOD-bridge-jobs.keepRepositoryTokens
  - MOD-bridge-jobs.useRepositoryTokens
  - MOD-bridge-jobs.listJobs
  - MOD-bridge-jobs.jobLog
  - MOD-bridge-jobs.keepJobLogs
  - MOD-mail-protocols.mailHandlers
  - MOD-tunnels.ensureKey
  - MOD-tunnels.openTunnels
  - MOD-tunnels.closeTunnels
  - MOD-tunnels.tunnelState
  - MOD-tunnels.tunnelHandlers
  - MOD-bridge-client.TunnelPlan
  - MOD-bridge-client.JumpHost
  - MOD-bridge-client.BridgeEntry
  - MOD-bridge-client.tunnelCommands
  - MOD-browser-store.readExport
  - MOD-agent-processes.Agent
  - MOD-agent-processes.installedAgents
  - MOD-agent-enclosure.AgentEnclosure
  - MOD-agent-enclosure.agentEnclosure
  - MOD-job-runner.registerStrategies
  - MOD-approvals.approvalStrategies
  - MOD-spec-changes.specStrategies
  - MOD-artifact-edits.editStrategies
  - MOD-source-register.sourceStrategies
  - MOD-reuse-facts.reuseStrategies
  - MOD-resource-list.resourceStrategies
  - MOD-work-plans.workStrategies
  - MOD-run-planner.runStrategies
  - MOD-test-schedule.scheduleStrategies
  - MOD-result-records.resultStrategies
  - MOD-issue-handling.issueStrategies
  - MOD-runtimes.routeStrategies
  - MOD-site-frame.PageSetup
  - MOD-site-frame.View
  - MOD-site-frame.Route
  - MOD-site-frame.startPage
  - MOD-site-frame.explain
  - MOD-site-frame.confirmDecision
  - MOD-site-frame.notice
  - MOD-markdown-render.renderArtifact
provides:
  - appDescription
---
# MOD-desktop-shell The Bridge's app — its icon, its window, its settings and its updates

## Responsibility

It belongs to the Bridge (ARC-040). It is the app of ARC-050: it composes the Bridge's other modules and the shared ones
into one program, and it is everything a person sees of the Bridge. It starts by a double click and runs with its icon in
the menu bar or the tray, or with its window open where there is no tray (`THE BRIDGE RUNS AS AN APP`). Its window, drawn
with the site's frame and renderer, shows the agents of this computer and how to install a missing one, which of them
the Bridge offers, the one folder that holds their working folders and what each holds checked out, the pairing token, the jump host with the Bridge's public key, the tunnels, the jobs the Bridge took with the console of each, the settings and a newer release. It keeps the Bridge's
settings, set in the window or taken from the dashboard's export; it pauses and quits; and it installs a newer release
only after the person's click and only with the publisher's signature. Its main process runs in Node, inside Electron;
its window runs in Electron's browser part. The window serves UC-044 and UC-011.

## Parts

- `index.mjs` — the interface: `appDescription`.
- `app.json` — `appDescription` as data.
- `main.mjs` — the app's entry, Electron's main process: one running Bridge per user, the icon, the window, pause and
  quit.
- `compose.mjs` — the strategies registered with the job runner, the server with its handlers, the watching of the
  served products, the tunnels.
- `settings.mjs` — the settings file, and taking over a settings export.
- `updates.mjs` — the offer of a newer release, its download on the click, its signatures, its installation on the
  click.
- `window.html`, `window.mjs` — the window's page and its routes; the page links no style sheet, since `startPage` gives
  it the site's look, and the routes draw their buttons, fields, tables, lists and a job's console in that look's classes,
  with no style of their own; `preload.cjs` — the fixed set of calls the window may
  make to the main process. The window has no other access to Node.
- `icons/` — the app's icon for each platform, and the icon of the menu bar and the tray.

## Data

**The Bridge's settings**, the part of the dashboard's export the Bridge takes over (ARC-040): `settings.json` in the
Bridge's per-user data folder, written only by this module.

```json
{ "agent-m-bridge-settings": 1, "name": "lab-pc", "port": 4711, "folder": "/home/alice/agent-m-work",
  "agents": [{ "name": "claude", "place": "this machine",
    "capabilities": ["draft text", "read the repository", "write to the repository", "run code and tests", "use tools",
    "reach the web"], "models": [{ "model": "claude-opus-5-5", "context": 200000 }], "chrome": false }],
  "products": ["https://github.com/alice/example-product"], "every": 300, "paused": false,
  "jumpHost": { "hostname": "jump.example.org", "user": "alice", "sshPort": 22 },
  "tunnels": [{ "direction": "reverse", "jumpHost": "jump.example.org", "user": "alice", "sshPort": 22,
    "remotePort": 40101, "bind": "127.0.0.1", "bridgePort": 4711, "keyFile": "ssh/id_ed25519" }] }
```

- `agent-m-bridge-settings` — the version of the format, `1`.
- `name` — the Bridge's name, which the route of its connections in a browser's settings and of its jobs' records
  carries (`bridge <name> agent <agent>`, MOD-participant-list, MOD-job-ledger); by default the computer's own name.
- `port` — the port on loopback the API listens on; by default the one `bridgeApi` names.
- `folder` — the one folder the person chooses in the window, which holds the working folder of each agent the Bridge
  offers, `<folder>/<agent>`, made by the Bridge, in which MOD-bridge-jobs keeps that agent's clones (`THE BRIDGE IS
  CONFIGURED IN ITS WINDOW OR FROM AN EXPORT`); `null` until it is chosen, and then no agent has a working folder. An
  agent's working folder is no setting of its own: it follows from `folder` and the agent's name.
- `agents` — the agents the Bridge offers, each a supported agent installed on this computer and chosen by the person in
  the window (`THE BRIDGE FINDS THE INSTALLED AGENTS`), with its declaration as a
  connection (UC-044 step 5): `place`, where it processes data, *this machine* preset; `capabilities`, every one preset;
  and `models`, each model it can run with its context in tokens — set in the window or from the settings page through
  the API (MOD-bridge-http, `PUT /v1/agents/{agent}`); and `chrome`, whether the Bridge starts every session of that
  agent with its Chrome integration (UC-044 step 3), `false` until the person ticks it in the window, which
  `PUT /v1/agents/{agent}` leaves as it is; an agent no longer installed stays listed and is shown as missing.
- `products` — the addresses of the product repositories whose queued jobs and runs this Bridge serves.
- `every` — the seconds between two readings of the served products; by default 300.
- `paused` — whether the Bridge was paused when it last ran; it starts paused again.
- `jumpHost` — the jump host's `hostname`, `user` and `sshPort`, the fields of MOD-bridge-client's `JumpHost` a Bridge
  needs; the web server's login and the port range stay in the dashboard.
- `tunnels` — the tunnel plans in MOD-bridge-client's format, `TunnelPlan`, which MOD-tunnels opens; their `keyFile` is
  always the Bridge's own key.

**Taking over an export** (`THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT`). Of the settings Access's
`readExport` returns, the Bridge takes `products`, `jump-host` and the `bridge:<name>` entries reached through the jump
host. The person says in the window whether this computer is their own — then each of those Bridges becomes a forward —
or which of them it is — then that entry's name becomes the Bridge's name, its port that of the reverse tunnel, and its
token the pairing token, so that the dashboard reaches this Bridge with the token it already holds. The plans are made by MOD-bridge-client's
`tunnelCommands`, the function that writes the dashboard's commands, so both ends agree. Nothing else of the export is
kept: no token of a repository server, no endpoint key, no mailbox connection or password (`THE MAILBOX PASSWORD LEAVES
THE BROWSER ONLY TO THE BRIDGE`), no sign-in token. An export of another instance is refused, since the Bridge answers
only its own instance's origin.

**The Bridge's per-user data folder**: a folder named after the app's identifier, in the platform's place for an app's
per-user data — `~/Library/Application Support/` on macOS, `%APPDATA%` on Windows, `~/.config/` on Linux —, readable and
writable by its user only, so that the Bridges of two instances on one computer never share one. It holds
`settings.json`, MOD-bridge-http's `pairing-token`, MOD-tunnels' `ssh/` and MOD-bridge-jobs' `repository-tokens.gitconfig`
and `job-logs/`.
Nothing in it enters a repository or an export. The clones lie in the working folders of the agents the Bridge offers,
in the folder the person chooses.

**What the build places among the app's resources**, read at start:

- `build.json` — `{ "instance": "alice/agent-m", "appId": "io.github.alice.agent-m.bridge", "origin":
  "https://alice.github.io", "version": "2026.10.0", "commit": "<commit>" }`: the instance whose release this is, the
  app's identifier, the instance's Pages origin — the one origin the API answers across origins —, the version and its
  commit.
- `update-key.pem` — the publisher's public update key, Ed25519, in PEM.
- `app-update.yml` — electron-updater's configuration, written by electron-builder, naming the instance repository's
  releases as the update feed.

A start without them — from the source folder, as in the Bridge's component tests — takes the instance and its origin
from its command line and offers no update.

## Interfaces

- `appDescription` — `{ productName: "Agent M Bridge", main: "src/desktop-shell/main.mjs", window:
  "src/desktop-shell/window.html", preload: "src/desktop-shell/preload.cjs", icons: { macos: string, windows: string,
  linux: string }, resources: { build: "build.json", updateKey: "update-key.pem" } }` — what MOD-bridge-build packages:
  the app's name; its main entry and its window, from which the module folders the app carries are reached through
  their `index.mjs`; its preload; its icons; and the names under which the build places the files above among the app's
  resources.

The rest of its surface faces the person, not another module:

- **Start.** One Bridge runs per user; a second start opens the first one's window. The shell makes the data folder, and
  through MOD-tunnels the key pair (`THE BRIDGE CREATES ITS OWN SSH KEY`); has every git of its process read the
  repository tokens it holds (MOD-bridge-jobs' `useRepositoryTokens`); has the jobs' logs kept in the data folder
  (MOD-bridge-jobs' `keepJobLogs`); registers with the job runner the strategies of
  every kind a Bridge may run; starts the server on `127.0.0.1` at the settings' port, for the instance's origin, with
  the name of the settings in force and the version of `build.json`, `null` for a start without it, and with the
  handlers of MOD-bridge-jobs, MOD-mail-protocols and MOD-tunnels, and its own for `PUT /v1/agents/{agent}`, which keeps
  an agent's declaration in the settings, and for `PUT /v1/repository-tokens`, which keeps the tokens the paired browser
  hands it through MOD-bridge-jobs' `keepRepositoryTokens` and then checks out again (`THE LOCAL BRIDGE BINDS TO LOOPBACK
  ONLY`); checks out every working folder (*The checkout*, below); opens
  the tunnels (`THE BRIDGE OPENS ITS TUNNELS ITSELF`); and, unless paused, starts watching the served products, so that
  their runs go on while no tab is open (`A RUN CONTINUES WITHOUT A CLICK BETWEEN ITS JOBS`). A port in use is shown with
  a field for another; a data folder that cannot be written is shown with its path.
- **Icon and window.** On macOS and Windows the icon in the menu bar or the tray opens the window, pauses or resumes, and
  quits; closing the window leaves the Bridge running. On Linux, where not every desktop shows a tray icon, the window
  stays open while the Bridge runs. The window loads only the app's own files, under a protocol of the app's own, never
  a remote page; a link — an agent's installation page, the dashboard — opens in the person's browser.
- **The window's views**, drawn with the site's frame as the page `bridge`, each with its explanation:
  - *Agents* — laid out top down as the one folder, then a panel for each installed agent, then the agents not
    installed, then *Save agents* and *Check again*, and the last checkout's result as a table of agent, repository, and
    commit or reason. Every supported agent with its version, ready and logged in, installed but not logged in with its own
    login step (`Agent.login`) and, beside it, *Check result*, which reads the agents anew as *Check again* does, so
    that the login's result is checked where it was started, or missing with its vendor's installation page for this platform, and *Check again* (`THE BRIDGE FINDS THE INSTALLED AGENTS`, `THE BRIDGE GUIDES THE
    INSTALLATION OF A MISSING AGENT`); a tick for each installed agent the Bridge is to offer, with its declaration —
    place, capabilities, models with their context —; the one folder, chosen with the system's folder dialog, with the
    working folder `<folder>/<agent>` each ticked agent gets in it; *Save agents*; and the last checkout's result: for each
    agent and repository the commit its clone holds, or the repository not reached with git's reason. No token is entered
    here (UC-044, step 3). For each offered agent,
    its enclosure (ARC-054): whether it works on this computer, else its reason and its one-time step, with *Set up*
    where the Bridge can take that step itself — on Windows, through Windows' elevation prompt —; and whether the agent is
    logged in there, else *Log in*, which opens a terminal in the enclosure running the agent's own login step, with
    what of its output the enclosure keeps (`Agent.keeps`). An installed agent's panel heads its tick with the agent's
    name, its version and its state — *ready*, *not logged in* or *not enclosed* — beside its *Log in* or *Set up*, and
    lays its declaration out as a small form: the place, the capabilities as a group of ticks, the models one per line;
    for an agent whose `Agent.chrome` holds, a tick *Chrome* beside them, saved with *Save agents* (UC-044 step 3).
  - *Jobs* — the jobs the Bridge took in the last six weeks, MOD-bridge-jobs' `listJobs`, as a table — identifier,
    kind, agent, product, state, when taken —, and the console of the one chosen, by default the one running, else the
    one taken last (`THE BRIDGE'S WINDOW SHOWS EACH JOB'S CONSOLE LIVE`, UC-044 step 6): the last 1000 lines of its log and
    the line being written, in a pane of the look's class `console`. While the view is shown it asks the main process
    every half second for the jobs and, through MOD-bridge-jobs' `jobLog` — the reading `GET /v1/jobs/{id}/log` answers
    from —, first for the last 1000 lines of the log and then for the lines after the last it has; it holds the last 1000
    of them, and stays scrolled to the newest line unless the person has scrolled up from it.
  - *Pairing* — the Bridge's address and its pairing token with *Copy* (`THE BRIDGE SHOWS ITS PAIRING TOKEN IN ITS
    WINDOW`); *paired with* the origin MOD-bridge-http's `pairedWith()` gives, or *not yet paired since this start*; and
    *Pair anew*, a decision that names that every paired browser must pair again (`THE BRIDGE IS PAIRED
    ONCE`).
  - *Tunnels* — the jump host; the Bridge's public key with *Copy* and where to add it on the jump host; each tunnel's
    state with its reason.
  - *Settings* — the name, the port, the served products and the interval; *Import a settings export*, with its
    passphrase when the export is locked; what was taken over.
  - *Updates* — the running version, and a newer release when there is one.
- **The checkout** (UC-044, step 3). At start, and at once whenever the agents, the folder or the served products are saved
  in the window, an export is taken over, or the paired browser hands it its repository tokens, the shell has
  MOD-bridge-jobs' `checkOut` bring every offered agent's working folder to the instance and the served products, in the
  background, and keeps its result in memory for the *Agents* view, which shows it once it is there; a checkout asked for
  while one runs follows it.
- **Pause and quit.** *Pause* stops taking jobs, and the API answers new work with `paused`; jobs already running go on
  and can still be followed and cancelled. *Quit* names the jobs still running, which then end as cancelled, and stops the
  watching, the tunnels and the server.
- **Updates** (`THE BRIDGE IS UPDATED ONLY BY THE PERSON'S CHOICE`), through electron-updater with `autoDownload` off and
  `autoInstallEvent` set to `manual`. At start and once a day the shell reads the update feed of the instance it was
  built for, which downloads no release; it offers a newer release only when the feed's detached signature holds
  against the publisher's key built into the app and the signed feed names the version and files electron-updater
  read. The offer shows the release's notes, rendered by the site's renderer. *Download* — the person's click — fetches
  the file, which becomes installable only when its own detached signature holds, checked in electron-updater's
  `verifyUpdateFile` step on every platform; otherwise the file is deleted and the window says that it is not the
  publisher's. *Install and restart* — a second click, after a decision that names the jobs that would end as cancelled
  — calls `quitAndInstall()`. On macOS and Windows electron-updater also checks the file's code signature. A feed that
  cannot be read, a download that fails and a signature that does not hold each leave the running Bridge as it is, and
  the window says which.

## Files

Reads and writes `settings.json` in the Bridge's per-user data folder, readable by its user only. Reads the app's
resources `build.json`, `update-key.pem` and `app-update.yml`, and a settings export the person chooses, of which it keeps
only its part. A downloaded update lies in electron-updater's cache until it is installed, or is deleted when its
signature does not hold. Writes no repository file; the jobs it composes write through MOD-bridge-jobs.

## Uses

- `MOD-bridge-http.bridgeApi`, `BridgeHandlers`, `serveBridge`, `pairAnew` — the server with the Bridge's handlers and its
  default port; the pairing token shown, and renewed on *Pair anew* or with the token of a Bridge reached through the
  jump host, from an export.
- `MOD-bridge-jobs.jobHandlers`, `startWatching`, `stopWatching`, `checkOut`, `keepRepositoryTokens`, `useRepositoryTokens`,
  `listJobs`, `jobLog`, `keepJobLogs` — the jobs routes; watching the served products while not paused; the checkout of the working
  folders; the repository tokens the paired browser hands the Bridge, kept and read by its git; the jobs it took, the
  running ones named before quitting or installing, and each one's console in the *Jobs* view; their logs kept in the
  data folder.
- `MOD-mail-protocols.mailHandlers` — the mail routes.
- `MOD-tunnels.ensureKey`, `openTunnels`, `closeTunnels`, `tunnelState`, `tunnelHandlers` — the key shown; the tunnels
  opened, closed and shown; the tunnels route.
- `MOD-bridge-client.TunnelPlan`, `JumpHost`, `BridgeEntry`, `tunnelCommands` — the plans in the settings, made from an
  export's jump host and its Bridges reached through the jump host by the same function that writes the dashboard's
  commands.
- `MOD-browser-store.readExport` — reading the dashboard's export with the code that writes it.
- `MOD-agent-processes.Agent`, `installedAgents` — the agents of this computer, with their vendors' installation pages,
  and, in each offered agent's enclosure, whether it is logged in there.
- `MOD-agent-enclosure.agentEnclosure`, `AgentEnclosure` — the enclosure of each offered agent, made for its working
  folder and the Bridge's data folder and handed to MOD-bridge-jobs; its state, its *Set up* and its *Log in* in the
  window.
- `MOD-job-runner.registerStrategies` — the registry of the Bridge's job runner, filled with the strategies of every kind
  a Bridge may run: `MOD-approvals.approvalStrategies`, `MOD-spec-changes.specStrategies`,
  `MOD-artifact-edits.editStrategies`, `MOD-source-register.sourceStrategies`, `MOD-reuse-facts.reuseStrategies`,
  `MOD-resource-list.resourceStrategies`, `MOD-work-plans.workStrategies`, `MOD-run-planner.runStrategies`,
  `MOD-test-schedule.scheduleStrategies`,
  `MOD-result-records.resultStrategies`, `MOD-issue-handling.issueStrategies`, `MOD-runtimes.routeStrategies`. The
  strategies of the mail kinds are not registered: a mail kind runs in the page, which asks an agent on the Bridge only
  to draft.
- `MOD-site-frame.PageSetup`, `View`, `Route`, `startPage`, `explain`, `confirmDecision`, `notice` — the window, drawn as
  the page `bridge` in the site's look; its explanations; the decisions of *Pair anew*, *Quit* and *Install and restart*; its notices.
- `MOD-markdown-render.renderArtifact` — a release's notes, rendered sanitised.
