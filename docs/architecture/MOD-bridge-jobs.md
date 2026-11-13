---
id: MOD-bridge-jobs
title: The Bridge as a route for its computer's agents
folder: src/bridge-jobs/
realises:
follows:
  - ARC-040
  - ARC-054
  - ARC-055
uses:
  - MOD-agent-enclosure.AgentEnclosure
  - MOD-agent-processes.Enclosure
  - MOD-repository-hosts.HostError
  - MOD-bridge-http.bridgeApi
  - MOD-bridge-http.BridgeHandlers
  - MOD-endpoint-calls.EndpointConfig
  - MOD-endpoint-calls.testEndpoint
  - MOD-endpoint-calls.listModels
  - MOD-endpoint-calls.endpointDriver
  - MOD-endpoint-calls.endpointExchange
  - MOD-repository-hosts.connect
  - MOD-repository-hosts.parseAddress
  - MOD-repository-hosts.readSnapshot
  - MOD-documents.readDocument
  - MOD-documents.readRegister
  - MOD-participant-list.participantSchema
  - MOD-participant-list.participantsOf
  - MOD-agent-processes.installedAgents
  - MOD-agent-processes.agentDriver
  - MOD-agent-processes.testAgent
  - MOD-agent-processes.startSession
  - MOD-job-runner.JobContext
  - MOD-job-runner.Prepared
  - MOD-job-runner.prepareJob
  - MOD-job-runner.runJob
  - MOD-job-runner.failedBecause
  - MOD-job-catalogue.kindOf
  - MOD-job-ledger.JobRecord
  - MOD-job-ledger.RecordPart
  - MOD-job-ledger.takeJob
  - MOD-job-ledger.appendToRecord
  - MOD-job-ledger.jobState
  - MOD-job-ledger.recordsNewestFirst
  - MOD-job-ledger.newJobId
  - MOD-job-ledger.jobCost
  - MOD-progress-measures.productFacts
  - MOD-runtimes.queueJob
  - MOD-product-process.declarationSchema
  - MOD-product-process.productWorkflow
  - MOD-product-process.gateStates
  - MOD-work-plans.sprintFacts
  - MOD-work-plans.sprintsToClose
provides:
  - jobHandlers
  - startWatching
  - stopWatching
  - checkOut
  - keepRepositoryTokens
  - useRepositoryTokens
  - listJobs
  - jobLog
  - keepJobLogs
---
# MOD-bridge-jobs The Bridge as a route for its computer's agents

## Responsibility

It belongs to the Bridge (ARC-040). It makes the Bridge one of the three routes a job takes (ARC-046): it runs the jobs
of the coding agents it offers — those of its computer's installed agents the person chose in its window (`THE BRIDGE
FINDS THE INSTALLED AGENTS`) —, each in that agent's working folder (`THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN
EXPORT`): those the page hands over, and the queued ones it takes itself from the product repositories it serves — with
the same job runner, catalogue and ledger as the page and CI, and the agent's own login on this computer (`A LOCAL AGENT
USES THE PERSON'S OWN LOGIN`). Every process of an agent it starts runs in that agent's enclosure (ARC-054). Before a
CLI session starts — a job's, or a conversation's of the prompt bar —, it brings the clones of the working folder to the
job's commits — the product's clone in `products/<name>/`, whose origin is the product's repository, is where the
session works — and leaves in
it, in a file git ignores, the repository token the paired browser handed it for that product (`A CLI SESSION FINDS ITS
REPOSITORY'S TOKEN IN AN IGNORED FILE`); the session's input names the file and says to use the token without reading it
(`A CLI SESSION IS TOLD NOT TO READ ITS TOKEN FILE`). The session then pushes, opens its pull request, follows its CI and
merges itself, as any session of that agent does (UC-011, step 4); for a product the Bridge holds no token for, no file
is left and the session works with the computer's own git login (UC-011, 4a). The Bridge's own git reaches the
repositories with the tokens it keeps, or with the computer's own login (`A TOKEN GOES ONLY TO THE SERVER THAT ISSUED
IT`). It checks out every working folder as soon as the Bridge's agents, its
folder, its served products or its tokens change (UC-044, step 3). For a job of the page, it also calls a model endpoint the page cannot call. While no tab is open, it starts an agent's sprint close when the sprint ends (`A SPRINT CLOSED BY AN AGENT STARTS BY
ITSELF`). It keeps the CLI session of a conversation of the prompt bar running from the conversation's first message
to it until it is cancelled, its agent exits or the Bridge ends, and types every message of that conversation into it
(ARC-055). It answers the agents, jobs, ask and probe routes of the Bridge's API. It runs in Node, in the Bridge's main
process.

## Parts

- `index.mjs` — the interface.
- `handlers.mjs` — the agents, jobs, ask and probes routes.
- `conversations.mjs` — the running CLI sessions of the prompt bar's conversations: started, typed into, answered,
  ended (ARC-055).
- `watch.mjs` — reading the served products, taking and resuming jobs, sprint ends.
- `session.mjs` — a CLI session's start: the clones brought to the session's commits, its checkout with the token file,
  and what its input is told of its checkout.
- `workfolders.mjs` — the clones of a working folder, the checkout of one CLI session made from the Bridge's clone of its
  product, the token file left in it; the host of a repository through its clone.
- `token.md` — what a CLI session is told of its token file, data like a kind's prompt.
- `branch.md` — what the CLI session of a job whose kind delivers a branch is told of its branch and its merge, data
  like a kind's prompt.
- `checkout.mjs` — the checkout of every working folder: the instance and each served product (`checkOut`).
- `tokens.mjs` — the repository tokens' file, the Bridge's git told to read it, and a repository's token read back from
  it (`keepRepositoryTokens`, `useRepositoryTokens`).
- `joblogs.mjs` — the jobs' logs and listings kept on disk for six weeks (`keepJobLogs`).
- `enclosures.mjs` — the working enclosure of an agent, or the refusal to start it, naming why.
- `probes.mjs` — the harmless requests of the probes.

## Data

It keeps no state of a job beyond its record and its log: in memory, the jobs it runs, the asks in flight and the running CLI sessions of the prompt bar, and, of each
job it took since it started, the last lines of its log, so that a reader that keeps up is answered without reading the
log's file; on
disk, the repository tokens' file, the jobs' logs, and the working folder of each agent it offers — `<folder>/<agent>`, `<folder>` the
one folder of the Bridge's settings (MOD-desktop-shell) —, laid out as a local clone of Agent M is:

- **the working folder is a clone of the instance**, made in the folder itself, so that an agent started there — an ask
  of the prompt bar, or the person in a terminal — works in Agent M's tree and finds Agent M's `AGENTS.md` at its root as
  its guidance: Codex and opencode read `AGENTS.md`, Claude Code reads `CLAUDE.md`, which in Agent M's repository only
  imports it (`@AGENTS.md`). What the folder already holds stays; git refuses the first checkout where a file of the
  folder would be overwritten. A folder that holds a clone of another repository is refused, naming it;
- **one clone per served product in `products/<name>/`**, `<name>` the repository's name, the folder `git clone` gives
  it, which Agent M's `.gitignore` ignores (`A LOCAL CLONE HOLDS ITS PRODUCTS IN ITS PRODUCTS FOLDER`). The Bridge clones
  a served product there at its checkout, and a product a job connects to when the job connects to it; the agent,
  which cannot write `products/` itself, clones none. A product whose folder holds a clone of another repository of the
  same name is refused, naming both. The product's clone is the one folder a CLI session may write: the agent itself is
  started in the working folder, at the clone of the instance, and works on the product in its clone. One agent works
  on one product at a time; more at once take more Bridges;
- **the agent's home `home/`** (MOD-agent-enclosure).

`home/` is excluded from the instance's clone in its `.git/info/exclude`, so that no command of git there sees it.

**The clones at the session's start.** Before every CLI session starts, the Bridge fetches its clone of the product and
its clone of the instance from their origins, checks the instance's clone out at the commit the job's record names
(`agent_m`, MOD-job-ledger) — for a session of the prompt bar, at the head of the instance's default branch as just fetched — and removes
every file of it that git neither tracks nor ignores, so that nothing an earlier session left there is read as the
present state; the agent's home and `products/`, which git ignores there, stay. The product's clone is pulled: its
default branch fast-forwarded to the head the fetch brought.

**The jobs' logs** — `job-logs/` in the Bridge's per-user data folder (MOD-desktop-shell), readable by its user only and
hidden by every enclosure (MOD-agent-enclosure), written only by `joblogs.mjs` (`THE BRIDGE KEEPS EACH JOB'S LOG FOR SIX
WEEKS`): for each job the Bridge took, `<id>.log`, what its agent's process wrote to its standard output, appended as it
wrote it — the job's log, whose lines are those text's lines without their line breaks, numbered from the first at 0 —,
and `<id>.json`, the job as `listJobs` lists it, written when the job is taken and when it ends. A session of the
prompt bar is kept alike, its log what its terminal shows (UC-044 step 6): the lines `startSession`'s `onLine` hands as
they scroll off its screen, and, when it ends, the lines its screen still shows. The Bridge writes nothing else into
them: no request, task, token or key; what a session's terminal shows of the messages typed into it is part of its
console. A file last written more than six weeks ago is removed whenever
`keepJobLogs` opens the folder — at every start — and whenever a job is taken.

**The repository tokens** — `repository-tokens.gitconfig` in the Bridge's per-user data folder (MOD-desktop-shell),
readable by its user only and hidden by every enclosure (MOD-agent-enclosure), written only by `keepRepositoryTokens`: in
git's configuration format, for each repository the browser handed a token for, a section for its address and one for
its address with `.git`, each holding the header that authorises git's requests there:

```text
[http "https://github.com/acme/widget"]
	extraHeader = Authorization: Basic eC1hY2Nlc3MtdG9rZW46Z2l0aHViX3BhdF8…
[http "https://github.com/acme/widget.git"]
	extraHeader = Authorization: Basic eC1hY2Nlc3MtdG9rZW46Z2l0aHViX3BhdF8…
```

The header is Basic with the user `x-access-token` on GitHub and `oauth2` on a GitLab server, and the token as its
password, which both servers accept for git over HTTPS. Git applies a section to a request by its own matching of
addresses; a repository's token for the API is read back from the file with that same matching (`git config --file …
--get-urlmatch http.extraHeader <address>`), so that one file and one rule say which token goes where. The Bridge's
process includes the file in the configuration of every git it starts — its environment names the file by its path
(`GIT_CONFIG_COUNT`, `GIT_CONFIG_KEY_<n>` = `include.path`, `GIT_CONFIG_VALUE_<n>` = the file) —, so that no token stands
on a command line, in a remote address, in a clone's configuration or in an environment; an agent's environment is
chosen by its enclosure and names no such file. For an address the file holds no section for, git asks the computer's own
credential helpers, as it would without the Bridge.

**The token file.** Where the Bridge holds a repository token for the product (*The repository tokens*), it leaves that
token, alone, as the text of the file `.agent-m-token` at the root of the product's clone, readable by its user only, and
names the file in the clone's `.git/info/exclude`, so that git ignores it: `git status` does not list it and no
commit takes it. The clone's configuration names, as its credential helper, after an empty entry that sets aside the
computer's own helpers, a shell function that answers git's `get` with the server's user — `x-access-token` on GitHub,
`oauth2` on a GitLab server — and the file's text as the password: the session's git authenticates with the token
without the token standing in the configuration, a remote address or a command line. No other credential is left: not
the instance's token, not the Bridge's pairing token. Where the Bridge holds no token for the product, no file is left
and no helper is named: the session's git asks the computer's own helpers, as it would without the Bridge (UC-011, 4a).

**What the session is told of its checkout.** `token.md` is text, held once (`ONE DEFINITION, THREE DRIVERS`), with a
named place for the file's path. Where a token file is left, the Bridge adds it, filled in, after the input it is given,
as the description of where the session works, the way MOD-checkout-tools' `checkoutPrompt` describes a checkout to a
model endpoint on CI. It names the file, says that the session's git uses the token by itself, that a command that
needs the token — the server's command-line client opening a pull request, reading CI, merging — is given it as
`"$(cat <file>)"`, and that the session uses the token without reading the file: it never prints, shows or copies the
token. For a job whose kind's writer is `branch-and-pull-request` (MOD-runtimes), the kinds that deliver a branch,
`branch.md`, filled in with the job's branch — named by the job's identifier — and who merges, follows: the session
pushes that branch, opens its pull request, follows its CI and, where it merges, merges once the check `agent-m done`
of the product's CI (MOD-test-schedule) has succeeded on the pull request's head (`A PULL REQUEST IS MERGED ONLY WHEN THE
DEFINITION OF DONE HOLDS`); where the job's `## Parameters` say `merges: person`, a person merges. The Bridge relays
nothing between the session and the server, and runs git in the checkout only before the session starts.

**Gates.** A job's context carries the gates of the product's workflow at its kind's gate points — the workflow
MOD-product-process' `productWorkflow` gives from the declaration at the head the job was taken on and the instance at
the commit it names, each gate with whether a record passes it (`gateStates`). At `before-merge`, MOD-job-runner stops
the job after its writer while such a gate is not passed; the Bridge appends that the job waits at the gate (`onGate`,
MOD-job-ledger's `appendToRecord`), and the job's run ends without an end. Resumed once a record passes the gate (`A JOB
STOPS AT EVERY GATE`), the job runs again from its record as a job taken does: its CLI session finds its branch and pull
request on the server and goes on to the merge.

Which agents it offers with their declarations, the folder that holds their working folders, which products it serves, and the
Bridge's name — the name the route of its jobs' records carries, `bridge <name> agent <agent>` (MOD-job-ledger) —, come from the Bridge's
settings (MOD-desktop-shell).

## Interfaces

- `jobHandlers({ agents, enclosures, instance, products, … })` — the handlers of the `jobs` routes of `bridgeApi`, of
  MOD-bridge-http's type `BridgeHandlers`, for the agents the Bridge offers (`{ name, folder, chrome }`, `chrome` the Bridge's setting of UC-044 step 3,
  handed to every start of that agent — `agentDriver`'s and `startSession`'s `chrome`), their enclosures
  (`enclosures: (folder: string) -> AgentEnclosure`), the instance's address and the products it serves (`{ address }`):
  - `GET /v1/agents` — the coding agents it offers, with their versions and whether they are ready and logged in — both
    asked in the agent's enclosure, and not ready where the enclosure does not work —, each with its declaration as the
    Bridge's settings keep it — place, capabilities, models with their context —, and the supported agents missing on
    this computer (`THE BRIDGE FINDS THE INSTALLED AGENTS`).
  - `POST /v1/jobs` — a job the page handed over: its start record is already committed by the person's click; the
    Bridge takes it and runs it as a queued job, from its record; the hand-over only spares it the wait for its next
    reading. A job whose record says that its task travels with the hand-over is run with the request's `task` as its
    instruction, which the Bridge keeps only in memory while the job runs and writes to no file, log line, commit message
    or record; such a job's end names its commits, files and pull request and no draft, and the agent's answer stays in
    the job's log, from which the page reads it. Such a job is never taken from the repository by the Bridge's own
    reading, since only its hand-over carries its task. Errors: `invalid-request` for an agent this Bridge does not
    offer, for one whose working folder is not set, and for a job whose task travels with the hand-over handed over
    without a task; `paused`.
  - `GET /v1/jobs`, `GET /v1/jobs/{id}/log` — the jobs it took in the last six weeks with their live states
    (`listJobs`), and their logs as they grow: the `lines`, `next`, `partial` and `ended` of `jobLog` from the `from` asked.
  - `POST /v1/jobs/{id}/cancel` — stops the agent's process and confirms once it has ended; the job then commits nothing
    more (`A CANCELLED JOB WRITES NOTHING MORE`), and the person's page appends the record of the cancel. A CLI session
    of the prompt bar is cancelled alike — its agent and every process it started, `Session.stop` —, and has no record
    (UC-049 5a, 6d).
  - `POST /v1/ask`, `GET /v1/ask/{ask}` — a request of the page: to one agent it offers, started with the model the
    request names (`A JOB RUNS ON A CONNECTION THAT OFFERS ITS PARTICIPANT'S MODEL`), answered with its text and the
    usage it reported. A request that names a `product` — a served product's address, or the instance's own — is a
    message of the prompt bar to a CLI session (UC-049 step 4, ARC-055). Without a `session`, the Bridge starts one as
    it starts a job's — *The clones at the session's start*, *The token file* —, with
    MOD-agent-processes' `startSession` in the agent's enclosure, lists it as a job of the kind `converse` under a new
    identifier, and types into it the request's `input` followed by `token.md` where a file is left; with a `session` it
    holds running, it types the request's `input` into that one. The ask's `session` is the session's identifier; its
    answer is the session's `answer` to that input, with no usage, or `failed` with the agent's exit code where the
    agent exits first. A request that names a session the Bridge holds no running session under is `not-found`;
    `invalid-request` for a product it does not serve. A session ends when it is cancelled, when its agent exits, or
    when the Bridge quits; its checkout and its token file are then removed, and its log is kept. A request without a `product` is a draft of the page's job
    runner, asked in the agent's working folder, which the agent may not write; or to a model endpoint, whose configuration the request carries, sent with
    MOD-endpoint-calls' `endpointDriver` in Node and answered the same way (`A RUNTIME IS INTERCHANGEABLE`) — or, where
    the request carries one exchange of a tool loop, with `endpointExchange`, answered with the endpoint's text, its tool
    calls and the usage. The correction loop and the tool loop stay in the page, which carries every tool call out.
  - `POST /v1/probes/{kind}` — a harmless request: `agent` asks an agent a short question; `endpoint-models` receives the
    endpoint configuration as `endpoint-test` does, calls MOD-endpoint-calls' `listModels` in Node once, and returns its
    `{ models }` or `{ diagnosis }` unchanged; `endpoint-test` receives the valid endpoint configuration of an endpoint
    whose configuration in the page names this Bridge, maps its fields to MOD-endpoint-calls' `EndpointConfig`,
    calls `testEndpoint` in Node once, and returns the structurally corresponding `{ works: true, model }` or
    `{ works: false, diagnosis }` answer unchanged; `partitions` lists a cluster's
    partitions through its scheduler's command on this computer — SLURM's `sinfo --noheader --format=%P|%a`, each line a
    partition's name and its state — as `{ partitions: [{ name, state }] }` (UC-003, UC-017, UC-040); a computer without
    `sinfo`, or a command that fails, is `upstream-failed` naming the command and its message. An invalid endpoint-test body
    is `invalid-request`; a provider or local-endpoint failure is the returned diagnosis; `upstream-failed` names another
    probe-handler failure.
- `startWatching(config: { bridgeName: string, agents: { name: string, folder: string, chrome: boolean, place: string,
  capabilities: string[], models: { model: string, context: number }[] }[], products: { address: string }[], every: number,
  enclosures: (folder: string) -> AgentEnclosure }) -> void` — with the agents the Bridge offers and their declarations,
  their working folders and their enclosures, starts reading every
  served product through Access's local clone with the Bridge's credentials, at the
  given interval and after every hand-over: queued jobs whose record's route names this Bridge and an agent it
  offers, `bridge <name> agent <agent>`, are taken — a commit
  only on the head that was read, so that no other route takes them too — and run, the agent started with the record's
  `model`, its participant the one its record names on the connection its route, `model`, `declares` and `##
  Destinations` give (MOD-job-ledger); queued jobs of the route `any` whose `model` an agent's declaration offers are
  taken by that agent, `## Taken` naming its connection's route and what its declaration declares for the model, and run
  on it alike; a run that MOD-job-runner's
  `failedBecause` fails ending its job `failed` with that reason; jobs of this Bridge waiting at a gate
  whose record now exists are resumed (`A JOB STOPS AT EVERY GATE`); a sprint whose close
  the product assigned to an agent whose model one of this Bridge's agents offers is queued for that model, on the route
  `any`, once — no close of the sprint queued or running —, when MOD-work-plans' `sprintsToClose` names it — its time box
  ended, or, without one, every selected item done or ended by the Product Owner —, and taken as above. A product that cannot be read is skipped with its reason, and read again at the next interval.
- `stopWatching(reason: "pause" | "quit") -> Promise<void>` — stops taking jobs; on *quit* every job still running is
  stopped and its record ends as cancelled, naming that the Bridge was quit, and every running CLI session of the prompt
  bar is ended as a cancel ends it (UC-049 4g).
- `checkOut(config: { instance: string, products: string[], agents: { name: string, folder: string }[] }) ->
  Promise<{ agent: string, repository: string, folder: string, commit: string | null, reason: string | null }[]>` — the
  checkout of every working folder (UC-044, step 3): in each agent's working folder the clone of the instance, then in
  `products/<name>/` the clone of each served product, each made or brought up to its origin as the watching does, the
  agents in the order given and in each the instance first; for each, the commit its clone's default branch holds, or,
  for a repository not reached or a folder refused, `commit` null and the reason in git's words. One repository's failure
  stops none of the others. Crosses the network to the repository servers.
- `keepRepositoryTokens(dataFolder: string, tokens: { repository: string, token: string }[]) -> Promise<number>` — the
  repository tokens the paired browser handed the Bridge (`PUT /v1/repository-tokens`), written as the file of Data,
  replacing every token kept before, so that a token the browser no longer holds is forgotten; the number of tokens kept.
  A repository that is no repository's address (MOD-repository-hosts' `parseAddress`), a repository named twice, and a
  token MOD-repository-hosts' `connect` refuses for that repository — a GitLab token for GitHub, a text that is no token —
  throw `invalid-request`, naming the repository and never the token, and nothing is written.
- `listJobs() -> { id, product, kind, agent, state, started, usage }[]` — the jobs this Bridge took in the last six
  weeks, this start's and those `job-logs/` keeps of earlier ones, in the order it took them: `state` `running` while the
  agent works and, once the job has ended, the state of its end (`done`, `failed` or `cancelled`), or `interrupted` for a
  job an earlier start left running; `started` the moment it took the job; `usage` null while it runs, and the usage its
  end records afterwards. A CLI session of the prompt bar is listed among them, of the kind `converse`, `running` while it
  lives (UC-044 step 6), then `cancelled` when it was cancelled or the Bridge quit, `done` when its agent exited with 0,
  and `failed` when its agent exited otherwise; its `usage` is always null (`NO COST IS GUESSED`). A job another route
  took is not listed.
- `jobLog(id: string, from: number) -> { lines: string[], first: number, next: number, partial: string, ended: boolean }`
  — the log of a job this Bridge took (Data): `lines` the lines from `from` on, or, for a negative `from`, the last
  -`from` of them; `first` the number of the first line given; `next` the number after the last line the agent ended, the
  `from` to ask next; `partial` the line the agent is writing — for a CLI session of the prompt bar, the lines its screen shows —, `""`
  where there is none; `ended` whether the job has ended,
  its last unended line then among `lines`. A job of an earlier start is read from its kept log and has ended; a job taken
  in no start of the last six weeks is `not-found`. The Bridge's window and `GET /v1/jobs/{id}/log` read the one log.
- `keepJobLogs(dataFolder: string) -> void` — from then on keeps the jobs' logs and listings in `job-logs/` of the data
  folder (Data), made readable by its user only, and removes those last written more than six weeks ago. Called once, by
  the composing program, before any job is taken; without it nothing is kept on disk.
- `useRepositoryTokens(dataFolder: string) -> void` — includes the file of Data in the configuration of every git the
  Bridge's process starts from then on, by its environment, the entries it held before kept. Called once, by the
  composing program, before anything reaches a repository.

The host of a repository through its clone (`hostOf`, workfolders.mjs) is MOD-repository-hosts' `connect` with the clone
and the token the file holds for the repository's address: its files, history and commits through the clone, its pull or
merge requests, issues and the rest through the server's API with that token; without a token those are `NotSupported`.

Every job it runs, the Bridge runs from its start record alone — its kind, the parameters of its `## Parameters` and its
pinned inputs —, prepared by the job runner on the job's working clone. No person attends a job on a Bridge: as on CI,
its kind's writer writes at once, and a kind that hands its draft back leaves it in the record's end as `draft:`, from
which the page shows it.

An endpoint configuration and its key — of a test, of a models listing or of an ask — exist only for that request. The handler retains
neither in a clone, job record, log, disk file, shell setting nor process command.

After the session has answered, the job's writer takes the pull request open or merged of the branch the session
reports — on GitLab the merge request —, or opens it where the session did not, as it does in the page, through the
server's API with the token the Bridge holds for the product, outside every enclosure; a branch the Bridge's clone does
not hold is read, after a fetch of the clone, as the origin holds it. For a product the Bridge holds no token for, `listPullRequests` and
`openPullRequest` fail with `NotSupported`, and the writer records the branch without a pull request. The Bridge records
the branch and the pull request in the job's end record, and the Definition-of-Done check in the product's CI
(MOD-workflow-entries' `onDoneCheck`) verifies it.

**No enclosure, no agent.** The agents' enclosures are given by the composing program, one per working folder
(`enclosures`). Without them, or where an agent's enclosure answers that it does not work, no process of that agent is
started: `GET /v1/agents` names the agent as not ready, a job ends failed and an ask fails, each with the enclosure's
reason and its one-time step.

Its `instance` is the instance as the Bridge's clone of it holds it: the commits that clone last fetched. Its `instanceAt`
reads the instance at the commit a served product's declaration names, through that same clone connected as a host. A
commit the clone does not hold is fetched from its origin with the Bridge's credentials (MOD-repository-hosts'
`readSnapshot`).

## Files

In each served product, through Access's local clone: reads `docs/process.md`, the plan or backlog, `docs/jobs/` and
`docs/gates/`, and the instance's `docs/participants.md`; appends to job records; through the server's API, the pull
request of a job's branch. Through its clone of the instance, which fetches that commit: the instance's
process models at the commit a served product's declaration names. In the working folder of each agent it offers: the
clones, which it fetches and checks out before every session, removing in the instance's clone what git neither tracks
nor ignores, and of each running session its checkout with the token file, made before the session starts. Its own
`token.md` and `branch.md`. In the Bridge's data folder: `repository-tokens.gitconfig` and `job-logs/`. Nothing else.

## Uses

- `MOD-bridge-http.bridgeApi`, `MOD-bridge-http.BridgeHandlers` — the routes it answers.
- `MOD-agent-enclosure.AgentEnclosure` — whether an agent's enclosure works, its preparation before a start, its home;
  `MOD-agent-processes.Enclosure` — the part of it given to the agent's driver, to the list of installed agents and to the
  probe.
- `MOD-repository-hosts.HostError` — `NotFound`, on which the host of a product through its clone reads a branch as the
  origin holds it.
- `MOD-repository-hosts.connect`, `MOD-repository-hosts.readSnapshot`, `MOD-repository-hosts.parseAddress` — the served
  products, each connected by its address, through the local clone and with the token the Bridge holds for it; the
  instance at the commit a declaration or a job's record names, through its clone, which fetches the commit with the
  Bridge's credentials; a handed repository's address read, and its token checked against it.
- `MOD-documents.readDocument`, `MOD-documents.readRegister`, `MOD-participant-list.participantSchema`,
  `MOD-participant-list.participantsOf`, `MOD-product-process.declarationSchema` — the instance's participants, joined
  with the one connection a job's record gives, or with this Bridge's agents for the closers of sprints, and the product's declaration.
- `MOD-agent-processes.installedAgents`, `agentDriver`, `testAgent` — the agents of this computer and their driver;
  `MOD-agent-processes.startSession` — the CLI session of a conversation of the prompt bar.
- `MOD-endpoint-calls.EndpointConfig`, `testEndpoint`, `listModels`, `endpointDriver` — an endpoint's test, its models'
  listing and the requests of a job of the page to a model endpoint.
- `MOD-job-runner.JobContext`, `Prepared`, `prepareJob`, `runJob`, `MOD-job-catalogue.kindOf` — running a job of any kind
  from its record, unattended; `MOD-job-runner.failedBecause` — whether its job ends failed, and why.
- `MOD-job-ledger.JobRecord`, `RecordPart`, `takeJob`, `appendToRecord`, `jobState` — taking, resuming and ending jobs in
  their records, a draft handed back in the end; `recordsNewestFirst` — the job records of a served product it looks
  through; `jobCost` — the cost an end records; `newJobId` — the identifier of a sprint's close it starts.
- `MOD-runtimes.queueJob` — queueing the close of a sprint one of this Bridge's agents closes.
- `MOD-progress-measures.productFacts` — the facts of a served product, read through the local clone, from which the
  sprints to close are found.
- `MOD-product-process.productWorkflow`, `MOD-product-process.gateStates` — the gates of a job's context, and whether a
  waiting job's gate is decided.
- `MOD-work-plans.sprintFacts`, `MOD-work-plans.sprintsToClose` — a sprint's facts, and whether it has ended and who
  closes it.
