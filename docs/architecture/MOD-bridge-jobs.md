---
id: MOD-bridge-jobs
title: The Bridge as a route for its computer's agents
folder: src/bridge-jobs/
realises:
follows:
  - ARC-040
  - ARC-054
uses:
  - MOD-agent-enclosure.AgentEnclosure
  - MOD-agent-processes.Enclosure
  - MOD-repository-hosts.PullRequest
  - MOD-repository-hosts.PullRequestFacts
  - MOD-repository-hosts.CiRun
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
  - MOD-runtimes.routeStrategies
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
USES THE PERSON'S OWN LOGIN`). Every process of an agent it starts runs in that agent's enclosure (ARC-054); the
repositories are reached only by the Bridge, outside it, with the repository tokens the paired browser handed it, which
it keeps — or, for a repository it holds none for, with the computer's own git login (`NO MODEL READS A CREDENTIAL`, `A
TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT`): it forwards each push of the agent to the origin at once, and makes the
calls to the server the agent asks of it — fetch the origin into its clone of the product, from which the agent fetches
and pulls, and, for its pull request, open it, read it with its CI, read a CI run's log, merge it —, the relay. It checks out every working folder as soon as the Bridge's agents, its
folder, its served products or its tokens change (UC-044, step 3). For a job of the page, it also calls a model endpoint the page cannot call. While no tab is open, it starts an agent's sprint close when the sprint ends (`A SPRINT CLOSED BY AN AGENT STARTS BY
ITSELF`). It answers the agents, jobs, ask and probe routes of the Bridge's API. It runs in Node, in the Bridge's main
process.

## Parts

- `index.mjs` — the interface.
- `handlers.mjs` — the agents, jobs, ask and probes routes.
- `watch.mjs` — reading the served products, taking and resuming jobs, sprint ends.
- `workfolders.mjs` — the clones of a working folder, a working clone per job fetching from the Bridge's clone of its
  product, its outbox and its relay's folders, and the branches forwarded from the outbox; the host of a repository
  through its clone.
- `relay.mjs` — the relay of a running job: the outbox looked at and its pushes forwarded, the agent's requests carried
  out and answered.
- `relay.md` — what the agent of a job with a relay is told of it, data like a kind's prompt.
- `checkout.mjs` — the checkout of every working folder: the instance and each served product (`checkOut`).
- `tokens.mjs` — the repository tokens' file, the Bridge's git told to read it, and a repository's token read back from
  it (`keepRepositoryTokens`, `useRepositoryTokens`).
- `joblogs.mjs` — the jobs' logs and listings kept on disk for six weeks (`keepJobLogs`).
- `enclosures.mjs` — the working enclosure of an agent, or the refusal to start it, naming why.
- `probes.mjs` — the harmless requests of the probes.

## Data

It keeps no state of a job beyond its record and its log: in memory, the jobs it runs and the asks in flight, of each
running job what its relay last forwarded of each branch and the requests it answered, and, of each
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
  which cannot write the folder, clones none. A product whose folder holds a clone of another repository of the same
  name is refused, naming both;
- **one working clone per running job of that agent in `jobs/<id>/`**, made from the Bridge's clone of the job's
  product, with its outbox and, for a job with a relay, the relay's two folders, all removed when the job ends;
- **the agent's home `home/`** (MOD-agent-enclosure).

`home/` and `jobs/` are excluded from the instance's clone in its `.git/info/exclude`, so that no command of git there
sees them. Before an agent starts a job, the job's working clone holds the product's branch, and the instance's clone
the commit of the instance the job's record names (`agent_m`, MOD-job-ledger).

**The jobs' logs** — `job-logs/` in the Bridge's per-user data folder (MOD-desktop-shell), readable by its user only and
hidden by every enclosure (MOD-agent-enclosure), written only by `joblogs.mjs` (`THE BRIDGE KEEPS EACH JOB'S LOG FOR SIX
WEEKS`): for each job the Bridge took, `<id>.log`, what its agent's process wrote to its standard output, appended as it
wrote it — the job's log, whose lines are those text's lines without their line breaks, numbered from the first at 0 —,
and `<id>.json`, the job as `listJobs` lists it, written when the job is taken and when it ends. The Bridge writes nothing
else into them: no request, task, token or key. A file last written more than six weeks ago is removed whenever
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

**The working clone's fetch address.** The working clone fetches from the Bridge's clone of the job's product
(`products/<name>/`), never from the product's server, for every product alike — public or private, on GitHub or on a
GitLab server. Before the agent starts, after the Bridge has brought its clone up to the origin as it does to take the
job, the Bridge makes the working clone: an empty repository with the Bridge's clone as its `origin`, the fetch refspec
`+refs/remotes/origin/*:refs/remotes/origin/*` together with `^refs/remotes/origin/HEAD`, fetched once, `origin/HEAD`
set to the branch the Bridge's clone names as the origin's default, and that branch checked out, tracking it. So the
agent's `git fetch` and `git pull` read the origin's branches and tags as the Bridge last fetched them — never the
Bridge's own branches or the `refs/agent-m/` it forwards through —, over a local path and with no credential: the
tokens stay in the Bridge's tokens' file, which the agent's git does not include. A branch the Bridge forwarded is among
them, since the forward's push updates the clone's `refs/remotes/origin/` of that branch. The relay's `fetch` (below)
brings the Bridge's clone up to the origin. The Bridge names that clone to the agent's enclosure among the folders it
may read, beside the instance's (MOD-agent-enclosure).

**The outbox.** The Bridge then makes the outbox beside the working clone — `jobs/<id>.out.git`, a bare repository
cloned from the working clone — and sets the outbox as the working clone's push address, before the agent starts; the
outbox's branches at that moment are the job's base. The agent may write the working clone, the outbox and its relay's
requests (below), and nothing else of the working folder: the clones of the instance and of the products, in which the
Bridge runs git with its credentials, are read-only to it.

**Each push is forwarded at once.** While the agent's process runs, the Bridge looks at the outbox's branches every two
seconds. A branch that is new or moved against what the Bridge last forwarded of it — at first, against the base — is
fetched into the Bridge's clone of the product, under `refs/agent-m/<job id>/`, pushed to the origin under its name,
never forced, and the clone's own branch of that name pointed at it, so that the relay and the job's writer read it
there; the branch checked out in the clone is pushed and not pointed. So the product's CI runs on every commit the agent
pushes, its tests-only first commit among them (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`). A forward the
origin refuses is kept, with what git said, for the relay's answers, and tried again once the branch moves in the
outbox; it fails nothing yet. After the agent has answered, the Bridge forwards once more what the outbox holds; a
branch the origin still refuses then fails the job, naming the branch and what git said. Once the job is cancelled or
the Bridge quit, nothing more is forwarded (`A CANCELLED JOB WRITES NOTHING MORE`). The Bridge runs git in the working
clone and the outbox only before the agent starts; afterwards it only fetches the outbox's objects from its own clone,
which runs no command the outbox's configuration names: a hook or a command written there would run with the person's
rights.

**The relay** — the calls to the server a job's agent asks for its fetch and its pull request, which the Bridge makes outside the
enclosure through the host of the product, with the token it holds for it (`NO MODEL READS A CREDENTIAL`, `A TOKEN GOES
ONLY TO THE SERVER THAT ISSUED IT`). A job has a relay when its kind's writer is `branch-and-pull-request` (MOD-runtimes),
the kinds that deliver a branch. Before the agent starts, the Bridge makes two empty folders beside the working clone:
`jobs/<id>.requests/`, which the agent may write, and `jobs/<id>.answers/`, which it may read and only the Bridge writes,
so that no answer is written where the agent could have put a link. The agent asks by writing one request as a file
`<name>.json` into the requests, `<name>` of letters, digits, `-` and `_`. Every two seconds, while its process runs, the
Bridge takes each request it has not answered whose file is a regular file with one link and whose text stayed the same
since the look before — a file being written is taken at the next look —, reads it without following a link, carries
it out, and writes the answer as `<name>.json` into the answers, written beside and renamed into place, so that the agent
reads an answer whole or not at all. A request is one JSON object, `{ "call": …, … }`:

| `call` | Its fields | What the Bridge does |
|---|---|---|
| `fetch` | none | fetches the origin into the Bridge's clone of the product — its branches, pruned, and its tags — as the watching does (`cloneOrFetch`, workfolders.mjs), one at a time with that clone's forwards, its watching and the fetches of the other jobs of the agent that share it, with the token the Bridge holds for the product, or, without one, with the computer's own login, as its pushes are |
| `read` | `branch` | reads the branch's state, below |
| `open` | `branch` | opens the branch's pull request — on GitLab the merge request — through MOD-runtimes' writer `branch-and-pull-request`, with this job's context, the branch as the draft's `branch`, the job's participant as its drafter and no rounds yet: the writer takes the one open or merged, or opens it into the branch the job's step or item goes to, with the one description Agent M gives a job's pull request |
| `log` | `run`, the `id` of a CI run a `read` answer named | reads the run's log (`ciRunLog`) |
| `merge` | `branch` | merges the branch's pull request, as *The merge* allows |

`branch` names a branch the agent has made or moved in the outbox in this job; any other is refused. The answer is one JSON
object, `{ "call", "done": boolean, "reason": string | null, "state", "log", "branches" }`: `reason` why the call was
not done — the refusal, the failure MOD-repository-hosts names, `TokenRefused`, `PermissionMissing`, `RateLimited` with
its reset, `NotMergeable` with the server's reason, `Unreachable`, or, for `fetch`, what git said —, `null` where it was
done; `branches`, for `fetch`, the origin's branches, each with its commit, as the Bridge's clone holds them after the
call — `{ "<branch>": commit }`, what the agent's own `git fetch` then reads —, `null` for every other call; `state`,
for `read`, `open` and `merge`,
the branch as it stands after the call — `{ branch, outbox, origin, refused, pullRequest, commits, checks, runs }`: the
commit the outbox holds of it, the commit the origin holds or `null`, the forward the origin refused with what git said
or `null`, so that the agent sees whether its push has reached the origin; its pull request, MOD-repository-hosts'
`PullRequest`, or `null`; and, with a pull request, the CI result of each of its commits and the checks of its head —
`PullRequestFacts`' `commits`, without their files, and `checks` —, without one, the branch's CI runs (`listCiRuns`);
`log`, for `log`, the run's log, `null` where the server keeps it no longer. A request that cannot be read is answered
with what is wrong in it, and no answer holds anything of a request's file but the fields above, read as their schema
reads them. Before an answer is written, every token the repository tokens' file holds is replaced in it by `***`, so
that nothing the server sends — a log among it — carries a credential to the agent. For a product the Bridge holds no
token for, `fetch` is carried out with the computer's own login, and every other call is answered with its forwarding
state alone and `NotSupported`'s words: its branches are fetched and pushed with the computer's own login, and no pull
request is opened. Once the job is cancelled or the Bridge quit, no request
is carried out. Every call crosses the network to the server, but for the forwarding state, which the Bridge keeps; a
server that cannot be reached is an answer not done, never a failure of the job.

**The merge.** The Bridge merges only where all of these hold, and otherwise answers which of them does not:
- the job's `## Parameters` do not say `merges: person`, the author's choice that a person merges (UC-024 step 6, UC-034
  step 8); without the parameter the agent merges, as every job of a run does (UC-043 step 5);
- the branch's pull request is open and no draft, and the origin holds what the outbox holds of the branch: nothing of
  it waits to be forwarded;
- every gate of the job's `gates` at the point `before-merge` is passed (`A JOB STOPS AT EVERY GATE`);
- the check `agent-m done` of the product's CI (MOD-test-schedule) succeeded on the pull request's head, among
  `PullRequestFacts`' `checks` — the Definition of Done checked in the product's CI (`A PULL REQUEST IS MERGED ONLY WHEN
  THE DEFINITION OF DONE HOLDS`), the same check the page's *Merge* waits for (MOD-implementation-pages).

It then merges with `mergePullRequest` on that head, so that a commit pushed after the check is not merged with it;
the server's branch protection stays in force. The Bridge itself checks no condition of the Definition of Done.

**What the agent is told of the relay.** `relay.md` is text, held once (`ONE DEFINITION, THREE DRIVERS`), with named
places for the two folders, the job's branch — named by the job's identifier — and who merges. For a job with a relay,
the Bridge's driver adds it, filled in, after the prompt it sends, as the description of where the agent works, the way
MOD-checkout-tools' `checkoutPrompt` describes a checkout to a model endpoint on CI. It says that the agent's pushes go
to the outbox, which the Bridge forwards, and that the agent holds no token; that its `git fetch` and `git pull` read
the origin's branches as the Bridge last fetched them, and that it asks `fetch` before them where it needs the origin as
it stands — to bring its branch up to a default branch that moved, for one; how to write each request and where its
answer appears; whether the agent merges or a person does; and that a branch whose pull request `read` already shows is
the job's work so far, which the agent goes on with.

**Gates.** A job's context carries the gates of the product's workflow at its kind's gate points — the workflow
MOD-product-process' `productWorkflow` gives from the declaration at the head the job was taken on and the instance at
the commit it names, each gate with whether a record passes it (`gateStates`). At `before-merge`, MOD-job-runner stops
the job after its writer while such a gate is not passed; the Bridge appends that the job waits at the gate (`onGate`,
MOD-job-ledger's `appendToRecord`), and the job's run ends without an end. Resumed once a record passes the gate (`A JOB
STOPS AT EVERY GATE`), the job runs again from its record as a job taken does, with a relay: its agent finds its branch
and pull request through `read` and goes on to the merge.

Which agents it offers with their declarations, the folder that holds their working folders, which products it serves, and the
Bridge's name — the name the route of its jobs' records carries, `bridge <name> agent <agent>` (MOD-job-ledger) —, come from the Bridge's
settings (MOD-desktop-shell).

## Interfaces

- `jobHandlers({ agents, enclosures, … })` — the handlers of the `jobs` routes of `bridgeApi`, of MOD-bridge-http's type
  `BridgeHandlers`, for the agents the Bridge offers (`{ name, folder }`) and their enclosures (`enclosures: (folder:
  string) -> AgentEnclosure`):
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
    (`listJobs`), and their logs as they grow: the `lines`, `next` and `ended` of `jobLog` from the `from` asked.
  - `POST /v1/jobs/{id}/cancel` — stops the agent's process and confirms once it has ended; the job then commits nothing
    more (`A CANCELLED JOB WRITES NOTHING MORE`), and the person's page appends the record of the cancel.
  - `POST /v1/ask`, `GET /v1/ask/{ask}` — a request of the page's job runner: to one agent it offers, started with the
    model the request names (`A JOB RUNS ON A CONNECTION THAT OFFERS ITS PARTICIPANT'S MODEL`), answered with its
    draft and the usage it reported; or to a model endpoint, whose configuration the request carries, sent with
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
- `startWatching(config: { bridgeName: string, agents: { name: string, folder: string, place: string, capabilities:
  string[], models: { model: string, context: number }[] }[], products: { address: string }[], every: number,
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
  stopped and its record ends as cancelled, naming that the Bridge was quit.
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
  end records afterwards. A job another route took is not listed.
- `jobLog(id: string, from: number) -> { lines: string[], first: number, next: number, partial: string, ended: boolean }`
  — the log of a job this Bridge took (Data): `lines` the lines from `from` on, or, for a negative `from`, the last
  -`from` of them; `first` the number of the first line given; `next` the number after the last line the agent ended, the
  `from` to ask next; `partial` the line the agent is writing, `""` where there is none; `ended` whether the job has ended,
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

Through the host of a product with the token the Bridge holds for it, the relay opens, reads and merges the agent's pull
request — on GitLab the merge request —, and, after the agent has answered, the job's writer takes the one open or
merged of the branch the agent reports, or opens it where the agent did not, as it does in the page, through the
server's API, outside every enclosure. For a product the Bridge holds no token for, `listPullRequests` and
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
`docs/gates/`, and the instance's `docs/participants.md`; appends to job records; pushes the branches the agent made, from
the job's outbox, as the agent pushes them, and, through the server's API, opens, reads and merges their pull requests
and reads their CI runs and logs; fetches the origin into its clone of the product as a job's agent asks. Through its
clone of the instance, which fetches that commit: the instance's
process models at the commit a served product's declaration names. In the working folder of each agent it offers: the
clones, and of each running job its working clone, made from its clone of the product before the agent starts, its
outbox, its relay's requests, which it reads, and its relay's answers, which it
writes. Its own `relay.md`. In the Bridge's data folder: `repository-tokens.gitconfig` and `job-logs/`. Nothing else.

## Uses

- `MOD-bridge-http.bridgeApi`, `MOD-bridge-http.BridgeHandlers` — the routes it answers.
- `MOD-agent-enclosure.AgentEnclosure` — whether an agent's enclosure works, its preparation before a start, its home;
  `MOD-agent-processes.Enclosure` — the part of it given to the agent's driver, to the list of installed agents and to the
  probe.
- `MOD-repository-hosts.PullRequest`, `MOD-repository-hosts.PullRequestFacts`, `MOD-repository-hosts.CiRun`,
  `MOD-repository-hosts.HostError` — the form in which the host of a product answers its pull or merge requests, their
  commits' CI and their head's checks, and its CI runs, which the relay's answers carry; `NotSupported` where the Bridge
  holds no token for it. The relay calls the host's `listPullRequests`, `pullRequestFacts`, `listCiRuns`, `ciRunLog` and
  `mergePullRequest`.
- `MOD-runtimes.routeStrategies` — the writer `branch-and-pull-request`, through which the relay opens a pull request.
- `MOD-repository-hosts.connect`, `MOD-repository-hosts.readSnapshot`, `MOD-repository-hosts.parseAddress` — the served
  products, each connected by its address, through the local clone and with the token the Bridge holds for it; the
  instance at the commit a declaration or a job's record names, through its clone, which fetches the commit with the
  Bridge's credentials; a handed repository's address read, and its token checked against it.
- `MOD-documents.readDocument`, `MOD-documents.readRegister`, `MOD-participant-list.participantSchema`,
  `MOD-participant-list.participantsOf`, `MOD-product-process.declarationSchema` — the instance's participants, joined
  with the one connection a job's record gives, or with this Bridge's agents for the closers of sprints, and the product's declaration.
- `MOD-agent-processes.installedAgents`, `agentDriver`, `testAgent` — the agents of this computer and their driver.
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
