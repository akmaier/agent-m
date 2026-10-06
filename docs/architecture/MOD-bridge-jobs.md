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
---
# MOD-bridge-jobs The Bridge as a route for its computer's agents

## Responsibility

It belongs to the Bridge (ARC-040). It makes the Bridge one of the three routes a job takes (ARC-046): it runs the jobs
of its computer's coding agents — those the page hands over, and the queued ones it takes itself from the product
repositories it serves — with the same job runner, catalogue and ledger as the page and CI, and the agent's own login on
this computer (`A LOCAL AGENT USES THE PERSON'S OWN LOGIN`). While no tab is open, it keeps the runs it serves going: it
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

## Data

It keeps no state of a job beyond its record: in memory, the jobs it runs with their logs and the asks in flight; on
disk, in the Bridge's per-user data folder, one clone per served product and one working clone per running job, removed
when the job ends. Which products it serves, and the Bridge's name — the name the route of its participants carries in
`docs/participants.md` —, come from the Bridge's settings (MOD-desktop-shell).

## Interfaces

- `jobHandlers` — the handlers of the `jobs` routes of `bridgeApi`, of MOD-bridge-http's type `BridgeHandlers`:
  - `GET /v1/agents` — the supported coding agents installed on this computer with their versions and whether they are
    ready and logged in, and those missing (`THE BRIDGE FINDS THE INSTALLED AGENTS`).
  - `POST /v1/jobs` — a job the page handed over: its start record is already committed by the person's click; the
    Bridge takes it and runs it as a queued job, from its record; the hand-over only spares it the wait for its next
    reading. Errors: `invalid-request` for an agent this computer does not have; `paused`.
  - `GET /v1/jobs`, `GET /v1/jobs/{id}/log` — the jobs it runs with their live states, and their logs as they grow.
  - `POST /v1/jobs/{id}/cancel` — stops the agent's process and confirms once it has ended; the job then commits nothing
    more (`A CANCELLED JOB WRITES NOTHING MORE`), and the person's page appends the record of the cancel.
  - `POST /v1/ask`, `GET /v1/ask/{ask}` — a drafting request of the page's job runner to one agent, answered with its text
    and the usage it reported; the correction loop stays in the page.
  - `POST /v1/probes/{kind}` — a harmless request: `agent` asks an agent a short question; `endpoint-models` lists the
    models an endpoint on this computer serves; `partitions` lists a cluster's partitions through its scheduler's
    command on this computer (UC-017, UC-040). Errors: `upstream-failed` with the answer.
- `startWatching(config: { dataFolder: string, bridgeName: string, products: { address: string }[], every: number })
  -> void` — starts reading every served product through Access's local clone with the computer's own git login, at the
  given interval and after every hand-over: queued jobs whose participant's route is this Bridge are taken — a commit
  only on the head that was read, so that no other route takes them too — and run; jobs of this Bridge waiting at a gate
  whose record now exists are resumed (`A JOB STOPS AT EVERY GATE`); the next actions of every run of a served product
  are computed from the product's facts, those of this route taken and those of other routes queued by their start
  records; a sprint whose close
  the product assigned to one of this Bridge's agents is closed by that agent when its time box ends or every selected
  item is done. A product that cannot be read is skipped with its reason, and read again at the next interval.
- `stopWatching(reason: "pause" | "quit") -> Promise<void>` — stops taking jobs; on *quit* every job still running is
  stopped and its record ends as cancelled, naming that the Bridge was quit.

Every job it runs, the Bridge runs from its start record alone — its kind, the parameters of its `## Parameters` and its
pinned inputs —, prepared by the job runner on the job's working clone. No person attends a job on a Bridge: as on CI,
its kind's writer writes at once, and a kind that hands its draft back leaves it in the record's end as `draft:`, from
which the page shows it and a run starts the job that follows.

Access's local clone does files and commits only — no pull request, issue or CI run. On a Bridge the coding agent opens
its pull request with its own tools and its own login on this computer; the Bridge records the branch and the pull
request the agent reports in the job's end record, and the Definition-of-Done check in the product's CI
(MOD-workflow-entries' `onDoneCheck`) verifies it.

On a Bridge, `productFacts` runs with the local clone, so the facts that need the server — pull requests, CI runs and
their results — are `unknown`, and `nextActions` starts nothing that depends on them: merges and CI results are advanced
by CI's entries and by the page.

Its `instance` is the instance as the Bridge's clone of it holds it. Its `instanceAt` reads the instance at the commit a
served product's declaration names, through the instance's server's API without a token. The instance is public
(`RESTRICTED CONTENT STAYS OUT OF THE PUBLIC INSTANCE`), so the clone need not hold that commit, and the computer's git
login is not needed for it.

## Files

In each served product, through Access's local clone: reads `docs/process.md`, the plan or backlog, `docs/jobs/` and
`docs/gates/`, and the instance's `docs/participants.md`; appends to job records; the agent's own commits and pull
request come from the working clone. Through the instance's server's API without a token: the instance's process models
at the commit a served product's declaration names. In the Bridge's per-user data folder: the clones. Nothing else.

## Uses

- `MOD-bridge-http.bridgeApi`, `MOD-bridge-http.BridgeHandlers` — the routes it answers.
- `MOD-repository-hosts.connect`, `MOD-repository-hosts.readSnapshot` — the served products, through the local clone with
  the computer's own git login; and the instance at the commit a declaration names, through its server's API without a
  token.
- `MOD-documents.readDocument`, `MOD-documents.readRegister`, `MOD-participant-list.participantSchema`,
  `MOD-product-process.declarationSchema` — the participants of this Bridge and the product's declaration.
- `MOD-agent-processes.installedAgents`, `agentDriver`, `testAgent` — the agents of this computer and their driver.
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
