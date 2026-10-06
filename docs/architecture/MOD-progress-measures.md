---
id: MOD-progress-measures
title: A product's facts gathered once, and its progress in every measure
folder: src/progress-measures/
realises:
follows:
  - ARC-042
uses:
  - MOD-work-plans.ItemState
  - MOD-work-plans.itemStates
  - MOD-work-plans.planSchemas
  - MOD-product-process.Workflow
  - MOD-product-process.declarationSchema
  - MOD-product-process.workflowOf
  - MOD-product-process.gateSchema
  - MOD-product-process.gateStates
  - MOD-model-catalogue.Model
  - MOD-model-catalogue.catalogue
  - MOD-model-catalogue.planGrid
  - MOD-approvals.statuses
  - MOD-spec-changes.Queue
  - MOD-spec-changes.queues
  - MOD-spec-document.parseSpec
  - MOD-test-schedule.scheduleSchema
  - MOD-test-schedule.defaultSchedule
  - MOD-test-schedule.configurationDrift
  - MOD-result-records.resultsAt
  - MOD-release-evidence.reportsAwaitingAcceptance
  - MOD-test-document.TestDeclaration
  - MOD-test-document.testDeclarations
  - MOD-trace-graph.Graph
  - MOD-trace-graph.traceGraph
  - MOD-trace-graph.tracesTo
  - MOD-job-ledger.JobRow
  - MOD-job-ledger.listJobs
  - MOD-runtimes.liveState
  - MOD-runtimes.jobWorkflowFiles
  - MOD-runtimes.ResourceNeed
  - MOD-resource-list.resourceSchema
  - MOD-resource-list.reachableBy
  - MOD-bridge-client.Bridge
  - MOD-participant-list.Participant
  - MOD-participant-list.participantSchema
  - MOD-documents.Document
  - MOD-documents.readDocument
  - MOD-documents.readRegister
  - MOD-repository-hosts.Host
  - MOD-repository-hosts.Snapshot
  - MOD-repository-hosts.RepositoryInfo
  - MOD-repository-hosts.PullRequest
  - MOD-repository-hosts.CiRun
  - MOD-repository-hosts.readSnapshot
  - MOD-repository-hosts.readHistory
  - MOD-repository-hosts.repositoryInfo
  - MOD-repository-hosts.listPullRequests
  - MOD-repository-hosts.listCiRuns
  - MOD-repository-hosts.listTags
provides:
  - Facts
  - productFacts
  - progressIn
  - stageShares
  - currentStage
  - gateOverview
  - blocked
  - whoWorksOnWhat
  - buildInProgress
  - waitingForAPerson
  - waitingForAcceptance
---
# MOD-progress-measures A product's facts gathered once, and its progress in every measure

## Responsibility

It belongs to Process (ARC-042). It gathers, once per page or per evaluation of a run, every fact of one product that
progress depends on, and derives from them — never from a stored status (`PROGRESS AND JOB STATE ARE DERIVED, NOT
STORED`) — the product's progress in the measure its model names (`PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE`), the
state of every gate, what is blocked and who works on what (UC-035), and, for the main page, the bar of six stages, the
stage the product is in, the build in progress and what waits for a person (`THE MAIN PAGE SHOWS EACH PRODUCT'S PROGRESS
BY STAGE`, `WITHOUT A PRODUCT, THE MAIN PAGE SHOWS AGENT M'S OWN PROGRESS`, `THE BUILD IS SHOWN AS IT HAPPENS`). From a
repository's snapshot and tags alone it derives what waits there for the person's acceptance, for the Site's
notifications (`A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE`). It runs in the browser and in Node.

## Parts

- `index.mjs` — the interface.
- `facts.mjs` — gathering a product's facts.
- `measures.mjs` — progress in the model's measure.
- `stages.mjs` — the six stages, the current stage, the build, what waits for a person, what waits for acceptance.
- `overviews.mjs` — gates, blocked items, who works on what.

## Data

It keeps nothing and owns no file. It owns the structure `Facts`, which MOD-run-planner and the pages read.

The six stages of the main page, each a share between 0 and 1:

| Stage | Share |
|---|---|
| Requirements | the share of the product's SPEC change entries that are decided; full when the SPEC holds requirements and no change is open |
| Use cases | the share of the use cases that are accepted |
| Architecture | the share of the architecture's files — decisions and module files — that are accepted |
| Implementation | the share of the steps of the implementation plan, or of the backlog items, that are done; without a declared process model, no share, and the stage says that the process is configured when implementation starts |
| Tests | the share of the requirements that a passing test guards on the default branch; a test passes by the newest result record of a commit of the default branch that ran it |
| Release | full once the product's first release is tagged |

## Interfaces

- `Facts` — one product's facts: `{ address: string, info: RepositoryInfo | "unknown", snapshot: Snapshot, graph: Graph,
  requirements: string[], statuses: Map<string, { id: string, kind: string, status: string }>, queues: Queue[],
  declaration: Document | null, workflow: Workflow | null | "unknown", model: Model | null | "unknown", modelUnread: {
  commit: string, error: string } | null, modelSince: string | null, participants:
  Participant[], plan: { order: Document | null, items: Document[], states: ItemState[] }, sprint: Document | null,
  sprints: Document[], gates: Document[], gateStates: Array<{ gate: string, state: string, record: string | null, needs:
  string | null, difference: string | null }>, jobs: JobRow[], pullRequests: PullRequest[] | "unknown", schedule:
  Document, ci: { runs: CiRun[] | "unknown", configured: boolean, drift: Array<{ path: string, difference: string }>,
  jobWorkflow: boolean }, tags: Array<{ name: string, commit: string }> | "unknown", results: Snapshot | null, tests:
  TestDeclaration[], resourceNeeds: ResourceNeed[] }`: `requirements` the accepted ones; `model` the declared model as the
  instance's catalogue held it at the commit the declaration's `model_version` names — the version the product declared
  and keeps (UC-031 6a) —, and `workflow` derived from it. Both are `"unknown"` when that commit cannot be read, and
  `modelUnread` then names the commit and the error it was read with. `modelSince` is the date the declared model was
  declared; `plan`
  the steps of the implementation plan or the backlog items, in their order, with their states; `sprint` the running or
  the last sprint; `jobs` every job of the product with the live state of those that have not ended — a row whose source
  cannot be read says so —; `schedule` the product's test schedule, or the book's default where none is saved; `ci.runs`
  the runs of the default branch's head; `ci.configured` whether the configuration Agent M generates from the schedule
  is present, `ci.drift` how it differs from the schedule, `ci.jobWorkflow` whether the job workflow of MOD-runtimes is
  present; `results` the branch `test-results`, `null` while there is none; `resourceNeeds` the routes that reach the
  product's resources, `reachableBy` of MOD-resource-list over its `docs/resources.md`, which a caller hands to
  MOD-runtimes' `routesFor` for a job whose kind needs the product's resources. A fact only the server gives — `info`,
  `pullRequests`, `ci.runs`, `tags` — is `"unknown"` when the host does no server operations; whatever depends on an
  unknown fact is derived as unknown — a share `null`, a state `unknown` — and never guessed.
- `productFacts(host: Host, instance: Snapshot, instanceAt: (commit: string) -> Promise<Snapshot>, now: Date, bridges:
  Record<string, Bridge>) -> Promise<Facts>` — reads everything once: the default branch of the product — through a
  local clone, the branch it has checked out — and what the repository says about it, the trace graph, the approval
  records, the change queues, the declaration with its model and practices as the instance's catalogue held them at the
  commit the declaration's `model_version` names, read with `instanceAt`, and the history of the declaration, the
  instance's participants, the plan or the backlog
  and the sprints, the gate records, the job records and the live state of every job that has not ended — from the CI
  service, from the Bridges given in `bridges` and from this tab, through MOD-runtimes' `liveState` —, the pull
  requests, the CI runs of the head, the tags, the branch `test-results`, the test declarations and the resource list.
  Considers:
  - `instance` is the instance as the caller reads it, for its participants, process models and `SPEC.md`: on a page
    its default branch; in CI the checkout of the instance at the commit of Agent M that runs (MOD-workflow-entries).
  - `instanceAt` reads the instance at any commit, for the commit a declaration names. That is another commit than the
    one a CI job checks out, and the two are not related.
    - On a page, `instanceAt` reads through the frame's host of the instance.
    - In CI and on a Bridge, it reads through the instance's checkout or clone, connected as a host. A commit the clone
      does not hold is fetched from its origin with the clone's own credentials (MOD-repository-hosts' `readSnapshot`).
      So it reaches the commit exactly as far as the checkout or clone reached the instance, through no API and with no
      further token.
  - When `instanceAt` cannot read the commit, `productFacts` does not fail. `model` and `workflow` are `"unknown"`, as a
    fact a host cannot give is, and whatever depends on them is derived as unknown, never guessed. `modelUnread` keeps
    the error, which tells the causes apart:
    - `NotFound`: the instance does not hold the commit the declaration names;
    - `TokenRefused`, `PermissionMissing` or `Unreachable`: the instance cannot be read from there.
  - It also accepts a host that does no server operations, such as a Bridge's local clone, whose functions for the pull
    requests, the CI runs, the tags and the repository's information refuse with `NotSupported`: those facts are then
    `"unknown"`, and merges and CI results are advanced by the Workflows' entries and the page.
  - A source of live states that cannot be read — a Bridge that does not answer — leaves its jobs as their records say,
    marked as not reachable (UC-035 1b), and progress is still computed from the repository.
  - Crosses the network. Errors, all of the product's host: `NotFound` (a private repository without a token that
    reaches it), `TokenRefused`, `RateLimited`, `Unreachable`.
- `progressIn(facts: Facts, now: Date) -> { measure: string, planned: { grid: { entries: Array<{ requirement: string,
  phase: string, state: "open" | "in progress" | "done" }>, count: string }, timeline: Array<{ phase: string, from: string
  | null, to: string | null, gate: string | null, passed: string | null }>, steps: ItemState[] } | null, sprint: { items:
  ItemState[], burnDown: Array<{ day: string, remaining: number }>, final: boolean } | null, flow: { columns: Array<{
  name: string, items: string[] }>, wip: number | null, cumulative: Array<{ day: string, counts: Record<string, number>
  }> } | null, since: string | null }` — the progress in the declared model's measure. For a planned model, the grid of
  every accepted requirement in every phase, each cell done when what the phase produces for the requirement is accepted
  — or, for implementation and tests, merged and passing —, in progress while it is open or a job works on it, and open
  otherwise; the phases on a timeline with their gates as milestones; beside it the steps of the implementation plan with
  their states; with no accepted requirement, the phases empty. For a model with time boxes, the sprint's items and the
  remaining items per day of the sprint; with no running sprint, the last sprint's final burn-down. For a model with a
  work-in-progress limit, the board with its columns and its limit and the items per state per day. Each item's state on
  a day is dated by the records and the pull requests. After a change of model, `since` is the change, and the chart starts
  there. Errors: `NoModel` when the product declares none.
- `stageShares(facts: Facts) -> Array<{ stage: string, share: number | null, detail: string }>` — the six stages of the
  table above, in their order; a stage whose share needs an unknown fact has none, and its detail says which; for the
  instance's own repository, which has no product, the same bar for Agent M, full once its first release is tagged.
- `currentStage(shares: Array<{ stage: string, share: number | null }>) -> string` — the first stage that is not full.
- `gateOverview(facts: Facts) -> Array<{ gate: string, state: "passed" | "passed on an earlier text" | "rejected" |
  "pending" | "not reached", decided: { by: string, date: string, on: string, record: string } | null, needs: string |
  null, difference: string | null, addedBy: { requirement: string, source: string } | null }>` — the workflow's gates in
  their order: passed with who decided, when and on which text, and the record; pending with what it still needs; not
  reached; a gate whose record names a text that has changed since, as passed on an earlier text, with the difference;
  each gate a process requirement adds, with its requirement and source.
- `blocked(facts: Facts) -> Array<{ item: string, reason: "failed job" | "waiting at a gate" | "requirement not
  accepted" | "work-in-progress limit", detail: string }>` — every item or plan entry that cannot move, each with its
  reason; for a gate, the role or check that decides it.
- `whoWorksOnWhat(facts: Facts) -> { participants: Array<{ participant: string, roles: string[], jobs: string[] }>,
  unreachable: Array<{ route: string, reason: string | null }> }` — each participant of the product with its roles and
  current jobs; and each source of jobs that could not be read, whose running jobs are not shown.
- `buildInProgress(facts: Facts) -> Array<{ item: string, job: string, participant: string, state: string, elapsed:
  number, reachable: boolean }>` — the steps or items in progress, each with the job working on it, its participant,
  state and elapsed time, jobs on Bridges included; a job whose runtime does not answer is listed as not reachable, with
  the state its record gives; a step or item leaves the list as done once its pull request is merged.
- `waitingForAPerson(facts: Facts) -> Array<{ kind: "use case" | "SPEC change" | "gate" | "failed job", id: string, path:
  string }>` — what waits for a person in the product: open use cases, open SPEC change entries, gates whose decider is a
  person and that are pending, failed jobs; `path` is the file or record it concerns, from which the page links to where
  it is decided.
- `waitingForAcceptance(host: Host, snapshot: Snapshot) -> Promise<Array<{ kind: "SPEC change" | "use case" |
  "architecture decision" | "module" | "release test report", id: string, path: string, blob: string }>>` — what waits
  for the person's acceptance in one repository, the instance's or a product's, the snapshot being its default branch
  through `host`, derived from its files, records and tags alone, as `waitingForAPerson` derives open use cases and SPEC
  changes (`A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE`, `STATUS IS DERIVED FROM THE RECORDS`): every entry of a
  change queue in the state `open`, `stale` or `waiting for its anchor` (MOD-spec-changes); every use case, architecture
  decision and module file whose status is `open` or `changed` (MOD-approvals); and the release test report that waits
  for *Accept and release*, if one does (MOD-release-evidence' `reportsAwaitingAcceptance`). `id` is the identifier an
  approval record names it by — `UC-<nnn>`, `ARC-<nnn>`, `MOD-<slug>`, `spec-<queue>-<NN>` for an entry,
  `release-v<version>` for a report —; `path` is its file — for an entry its proposal, for a report the record of its
  candidate's complete run —; `blob` is that file's blob. Considers: it reads the snapshot and the tags, not the
  product's facts, so that a caller that asks every few minutes reads no pull requests, CI runs or test results, and job
  records only while a release candidate is pending, newest first and no further back than the first run of a candidate.
  Crosses the network through the host and the snapshot, for the texts it has not read yet; fails with their errors —
  `TokenRefused`, `PermissionMissing`, `RateLimited`, `Unreachable` —, and with `NotSupported` through a host that does
  no server operations.

`Workflow` is MOD-product-process'; `Model` MOD-model-catalogue's; `ItemState` MOD-work-plans'; `Queue`
MOD-spec-changes'; `TestDeclaration` MOD-test-document's; `Graph` MOD-trace-graph's; `JobRow` MOD-job-ledger's;
`Participant` MOD-participant-list's; `Document` MOD-documents'; `Host`, `Snapshot`, `RepositoryInfo`, `PullRequest` and
`CiRun` MOD-repository-hosts'; `Bridge` MOD-bridge-client's.

## Files

- Reads, for `productFacts`: the product's `SPEC.md`, `docs/approvals/`, `docs/spec-freigaben/`, `docs/use-cases/`,
  `docs/architecture/`, `docs/process.md` and its history, `docs/plan/` or `docs/backlog/` with `docs/backlog/sprints/`,
  `docs/gates/`, `docs/jobs/`, `docs/tests/schedule.md`, the generated configurations, the test files, `docs/resources.md`
  and the branch `test-results`; its pull requests, CI runs and tags; of the instance, `docs/participants.md`, the process models and `SPEC.md`, whose requirements are the process
  requirements, and the process models at the commit the product's declaration names.
- Reads, for `waitingForAcceptance`, through the snapshot it is given: `docs/approvals/`, `docs/spec-freigaben/`,
  `docs/use-cases/` and `docs/architecture/`; and, through MOD-release-evidence, the tags, `docs/tests/releases/` and,
  only while a release candidate is pending, `docs/jobs/` back to the first run of a candidate.
- Writes nothing.

## Uses

- MOD-work-plans.ItemState, itemStates, planSchemas — the steps and items, their order, the sprints, and each one's state.
- MOD-product-process.Workflow, declarationSchema, workflowOf, gateSchema, gateStates — the declared process, its gates
  and their states. The workflow is read with the instance's SPEC, where the process requirements stand.
- MOD-model-catalogue.Model, catalogue, planGrid — the declared model, from the catalogue at the commit the declaration
  names (UC-031 6a; ARC-042: earlier work keeps the model it was done under), and its plan of requirements times phases.
- MOD-approvals.statuses — accepted, open and changed files, for the stages and for what waits.
- MOD-spec-changes.Queue, queues — decided and open SPEC changes, for the stages and for what waits.
- MOD-spec-document.parseSpec — the requirements.
- MOD-test-schedule.scheduleSchema, defaultSchedule, configurationDrift — the schedule, or its default, and whether the
  CI configuration is generated from it.
- MOD-result-records.resultsAt — the outcomes recorded for the default branch.
- MOD-release-evidence.reportsAwaitingAcceptance — the release test report that waits for acceptance, if one does.
- MOD-test-document.TestDeclaration, testDeclarations, MOD-trace-graph.Graph, traceGraph, tracesTo — which tests guard
  which requirement, and the traces behind a cell of the grid.
- MOD-job-ledger.JobRow, listJobs — the product's jobs with their states, elapsed times and costs.
- MOD-runtimes.liveState, jobWorkflowFiles, ResourceNeed — the live state of jobs that have not ended, the paths of the
  job workflow, and the type of a resource need.
- MOD-resource-list.resourceSchema, reachableBy — the product's resources and the routes that reach them.
- MOD-bridge-client.Bridge — the Bridges whose jobs' live states are asked.
- MOD-participant-list.Participant, participantSchema — the participants and their roles.
- MOD-documents.Document, readDocument, readRegister — the files by their schemas.
- MOD-repository-hosts.Host, Snapshot, RepositoryInfo, PullRequest, CiRun, readSnapshot, readHistory, repositoryInfo,
  listPullRequests, listCiRuns, listTags — the repository's state and the history that dates it; the snapshots
  `instanceAt` gives of the instance at the commit a declaration names.
