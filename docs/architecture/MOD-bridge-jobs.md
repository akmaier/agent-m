---
id: MOD-bridge-jobs
title: The Bridge as a route for its computer's agents
folder: src/bridge-jobs/
realises:
follows:
  - ARC-040
uses:
  - MOD-bridge-http.bridgeApi
  - MOD-bridge-http.BridgeHandlers
  - MOD-endpoint-calls.EndpointConfig
  - MOD-endpoint-calls.testEndpoint
  - MOD-endpoint-calls.endpointDriver
  - MOD-endpoint-calls.endpointExchange
  - MOD-repository-hosts.connect
  - MOD-repository-hosts.readSnapshot
  - MOD-documents.readDocument
  - MOD-documents.readRegister
  - MOD-participant-list.participantSchema
  - MOD-agent-processes.installedAgents
  - MOD-agent-processes.agentDriver
  - MOD-agent-processes.testAgent
  - MOD-job-runner.JobContext
  - MOD-job-runner.Prepared
  - MOD-job-runner.prepareJob
  - MOD-job-runner.runJob
  - MOD-job-catalogue.kindOf
  - MOD-job-ledger.JobRecord
  - MOD-job-ledger.RecordPart
  - MOD-job-ledger.takeJob
  - MOD-job-ledger.appendToRecord
  - MOD-job-ledger.jobState
  - MOD-progress-measures.productFacts
  - MOD-runtimes.queueJob
  - MOD-run-planner.runOf
  - MOD-run-planner.nextActions
  - MOD-product-process.declarationSchema
  - MOD-product-process.gateStates
  - MOD-work-plans.sprintFacts
provides:
  - jobHandlers
  - startWatching
  - stopWatching
  - testAccess
---
# MOD-bridge-jobs The Bridge as a route for its computer's agents

## Responsibility

It belongs to the Bridge (ARC-040). It makes the Bridge one of the three routes a job takes (ARC-046): it runs the jobs
of the coding agents it offers — those of its computer's installed agents the person chose in its window (`THE BRIDGE
FINDS THE INSTALLED AGENTS`) —, each in that agent's working folder (`THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN
EXPORT`): those the page hands over, and the queued ones it takes itself from the product repositories it serves — with
the same job runner, catalogue and ledger as the page and CI, and the agent's own login on this computer (`A LOCAL AGENT
USES THE PERSON'S OWN LOGIN`). For a job of the page, it also calls a model endpoint the page cannot call. While no tab is open, it keeps the runs it serves going: it
computes their next actions from the records and takes those of its own route (`A RUN CONTINUES WITHOUT A CLICK BETWEEN
ITS JOBS`), and it starts an agent's sprint close when the sprint ends (`A SPRINT CLOSED BY AN AGENT STARTS BY
ITSELF`). It answers the agents, jobs, ask and probe routes of the Bridge's API. It runs in Node, in the Bridge's main
process.

## Parts

- `index.mjs` — the interface.
- `handlers.mjs` — the agents, jobs, ask and probes routes.
- `watch.mjs` — reading the served products, taking and resuming jobs, advancing runs, sprint ends.
- `workfolders.mjs` — a working clone per job.
- `probes.mjs` — the harmless requests of the probes.
- `access.mjs` — whether this computer's own git login reaches the repositories: one fetch of each into an empty
  repository in a temporary folder (`testAccess`).

## Data

It keeps no state of a job beyond its record: in memory, the jobs it runs with their logs and the asks in flight; on
disk, in the working folder of each agent it offers, a clone of the instance, one clone per served product, and one
working clone per running job of that agent, removed when the job ends. Before an agent starts a job, the job's working
clone holds the product's branch, and the instance's clone the commit of the instance the job's record names
(`agent_m`, MOD-job-ledger). Which agents it offers with their working folders, which products it serves, and the
Bridge's name — the name the route of its participants carries in `docs/participants.md` —, come from the Bridge's
settings (MOD-desktop-shell).

## Interfaces

- `jobHandlers` — the handlers of the `jobs` routes of `bridgeApi`, of MOD-bridge-http's type `BridgeHandlers`:
  - `GET /v1/agents` — the coding agents it offers, with their versions and whether they are ready and logged in, and
    the supported agents missing on this computer (`THE BRIDGE FINDS THE INSTALLED AGENTS`).
  - `POST /v1/jobs` — a job the page handed over: its start record is already committed by the person's click; the
    Bridge takes it and runs it as a queued job, from its record; the hand-over only spares it the wait for its next
    reading. A job whose record says that its task travels with the hand-over is run with the request's `task` as its
    instruction, which the Bridge keeps only in memory while the job runs and writes to no file, log line, commit message
    or record; such a job's end names its commits, files and pull request and no draft, and the agent's answer stays in
    the job's log, from which the page reads it. Such a job is never taken from the repository by the Bridge's own
    reading, since only its hand-over carries its task. Errors: `invalid-request` for an agent this Bridge does not
    offer, for one whose working folder is not set, and for a job whose task travels with the hand-over handed over
    without a task; `paused`.
  - `GET /v1/jobs`, `GET /v1/jobs/{id}/log` — the jobs it runs with their live states, and their logs as they grow.
  - `POST /v1/jobs/{id}/cancel` — stops the agent's process and confirms once it has ended; the job then commits nothing
    more (`A CANCELLED JOB WRITES NOTHING MORE`), and the person's page appends the record of the cancel.
  - `POST /v1/ask`, `GET /v1/ask/{ask}` — a request of the page's job runner: to one agent it offers, answered with its
    draft and the usage it reported; or to a model endpoint, whose configuration the request carries, sent with
    MOD-endpoint-calls' `endpointDriver` in Node and answered the same way (`A RUNTIME IS INTERCHANGEABLE`) — or, where
    the request carries one exchange of a tool loop, with `endpointExchange`, answered with the endpoint's text, its tool
    calls and the usage. The correction loop and the tool loop stay in the page, which carries every tool call out.
  - `POST /v1/probes/{kind}` — a harmless request: `agent` asks an agent a short question; `endpoint-models` lists the
    models an endpoint on this computer serves; `endpoint-test` receives the valid endpoint configuration of an endpoint
    whose configuration in the page names this Bridge, maps its fields to MOD-endpoint-calls' `EndpointConfig`,
    calls `testEndpoint` in Node once, and returns the structurally corresponding `{ works: true, model }` or
    `{ works: false, diagnosis }` answer unchanged; `partitions` lists a cluster's
    partitions through its scheduler's command on this computer (UC-003, UC-017, UC-040). An invalid endpoint-test body
    is `invalid-request`; a provider or local-endpoint failure is the returned diagnosis; `upstream-failed` names another
    probe-handler failure.
- `startWatching(config: { bridgeName: string, agents: { name: string, folder: string }[], products: { address: string
  }[], every: number }) -> void` — with the agents the Bridge offers and their working folders, starts reading every
  served product through Access's local clone with the computer's own git login, at the
  given interval and after every hand-over: queued jobs whose participant's route names this Bridge and an agent it
  offers are taken — a commit
  only on the head that was read, so that no other route takes them too — and run; jobs of this Bridge waiting at a gate
  whose record now exists are resumed (`A JOB STOPS AT EVERY GATE`); the next actions of every run of a served product
  are computed from the product's facts, those of this route taken and those of other routes queued by their start
  records; a sprint whose close
  the product assigned to one of this Bridge's agents is closed by that agent when its time box ends or every selected
  item is done. A product that cannot be read is skipped with its reason, and read again at the next interval.
- `stopWatching(reason: "pause" | "quit") -> Promise<void>` — stops taking jobs; on *quit* every job still running is
  stopped and its record ends as cancelled, naming that the Bridge was quit.
- `testAccess(config: { instance: string, products: string[] }) -> Promise<{ repository: string, reachable: boolean,
  reason: string | null }[]>` — whether this computer's own git login reaches the instance and each served product: one
  fetch of each, changing nothing; a repository it does not reach is named with the reason git gives (UC-044). Crosses
  the network to the repository servers.

Every job it runs, the Bridge runs from its start record alone — its kind, the parameters of its `## Parameters` and its
pinned inputs —, prepared by the job runner on the job's working clone. No person attends a job on a Bridge: as on CI,
its kind's writer writes at once, and a kind that hands its draft back leaves it in the record's end as `draft:`, from
which the page shows it and a run starts the job that follows.

An endpoint configuration and its key — of a test or of an ask — exist only for that request. The handler retains
neither in a clone, job record, log, disk file, shell setting nor process command.

Access's local clone does files and commits only — no pull request, issue or CI run. On a Bridge the coding agent opens
its pull request with its own tools and its own login on this computer; the Bridge records the branch and the pull
request the agent reports in the job's end record, and the Definition-of-Done check in the product's CI
(MOD-workflow-entries' `onDoneCheck`) verifies it.

On a Bridge, `productFacts` runs with the local clone, so the facts that need the server — pull requests, CI runs and
their results — are `unknown`, and `nextActions` starts nothing that depends on them: merges and CI results are advanced
by CI's entries and by the page.

Its `instance` is the instance as the Bridge's clone of it holds it: the commits that clone last fetched. Its `instanceAt`
reads the instance at the commit a served product's declaration names, through that same clone connected as a host. A
commit the clone does not hold is fetched from its origin with the computer's own git login, the clone's own
credentials (MOD-repository-hosts' `readSnapshot`).

## Files

In each served product, through Access's local clone: reads `docs/process.md`, the plan or backlog, `docs/jobs/` and
`docs/gates/`, and the instance's `docs/participants.md`; appends to job records; the agent's own commits and pull
request come from the working clone. Through its clone of the instance, which fetches that commit: the instance's
process models at the commit a served product's declaration names. In the working folder of each agent it offers: the
clones. Nothing else.

## Uses

- `MOD-bridge-http.bridgeApi`, `MOD-bridge-http.BridgeHandlers` — the routes it answers.
- `MOD-repository-hosts.connect`, `MOD-repository-hosts.readSnapshot` — the served products, through the local clone with
  the computer's own git login; the instance at the commit a declaration or a job's record names, through its clone,
  which fetches the commit with that login; and the test of that login.
- `MOD-documents.readDocument`, `MOD-documents.readRegister`, `MOD-participant-list.participantSchema`,
  `MOD-product-process.declarationSchema` — the participants of this Bridge and the product's declaration.
- `MOD-agent-processes.installedAgents`, `agentDriver`, `testAgent` — the agents of this computer and their driver.
- `MOD-endpoint-calls.EndpointConfig`, `testEndpoint`, `endpointDriver` — an endpoint's test and the requests of a job of
  the page to a model endpoint.
- `MOD-job-runner.JobContext`, `Prepared`, `prepareJob`, `runJob`, `MOD-job-catalogue.kindOf` — running a job of any kind
  from its record, unattended.
- `MOD-job-ledger.JobRecord`, `RecordPart`, `takeJob`, `appendToRecord`, `jobState` — taking, resuming and ending jobs in
  their records, a draft handed back in the end.
- `MOD-runtimes.queueJob` — queueing the next actions of other routes.
- `MOD-progress-measures.productFacts` — the facts of a served product, read through the local clone, from which its runs'
  next actions are computed.
- `MOD-run-planner.runOf`, `MOD-run-planner.nextActions` — the runs it serves and their next actions.
- `MOD-product-process.gateStates` — whether a waiting job's gate is decided.
- `MOD-work-plans.sprintFacts` — whether a sprint has ended, and who closes it.
