---
id: MOD-work-plans
title: Implementation plans, backlogs and sprints, and the state of each item
folder: src/work-plans/
realises:
follows:
  - ARC-042
uses:
  - MOD-product-process.Workflow
  - MOD-product-process.gateStates
  - MOD-product-process.holdsRole
  - MOD-model-catalogue.Model
  - MOD-approvals.statuses
  - MOD-spec-changes.Queue
  - MOD-spec-changes.queues
  - MOD-spec-document.parseSpec
  - MOD-trace-graph.traceGraph
  - MOD-trace-graph.moduleOrder
  - MOD-trace-graph.coverageGaps
  - MOD-documents.Schema
  - MOD-documents.Document
  - MOD-documents.loadSchema
  - MOD-documents.readDocument
  - MOD-documents.writeDocument
  - MOD-documents.appendSection
  - MOD-documents.classifyCandidates
  - MOD-documents.artifactSchemas
  - MOD-identifiers.identifiersIn
  - MOD-identifiers.nextIdentifier
  - MOD-job-ledger.JobRow
  - MOD-participant-list.Participant
  - MOD-result-records.flakyTests
  - MOD-repository-hosts.Host
  - MOD-repository-hosts.Snapshot
  - MOD-repository-hosts.PullRequest
  - MOD-repository-hosts.Issue
  - MOD-repository-hosts.readHistory
  - MOD-repository-hosts.listPullRequests
  - MOD-repository-hosts.listIssues
  - MOD-repository-hosts.createBranch
  - MOD-repository-hosts.commitFiles
  - MOD-text-tools.Finding
  - MOD-text-tools.finding
  - MOD-job-runner.Strategies
  - MOD-job-runner.JobContext
  - MOD-job-runner.Part
  - MOD-job-runner.JobResult
  - MOD-job-runner.provenanceLines
provides:
  - ItemState
  - planSchemas
  - itemStates
  - startable
  - planFindings
  - backlogFindings
  - sprintFacts
  - savePlan
  - saveItems
  - saveOrder
  - startSprint
  - endSprint
  - closeSprint
  - workStrategies
---
# MOD-work-plans Implementation plans, backlogs and sprints, and the state of each item

## Responsibility

It belongs to Process (ARC-042). It keeps the order in which a product's work is done: the implementation plan of a model
that plans its work (`THE IMPLEMENTATION PLAN LIVES IN THE PRODUCT REPOSITORY`, `AN IMPLEMENTATION PLAN ASSEMBLES THE SYSTEM
FROM ITS MODULES`, `A PLAN STEP NAMES THE TESTS OF ITS LEVEL`), and the backlog and sprints of a model that pulls its work
(`THE BACKLOG LIVES IN THE PRODUCT REPOSITORY`, `A BACKLOG ITEM NAMES WHAT IT REALISES`, `A BACKLOG ITEM NAMES THE MODULES IT
CHANGES`). It derives each step's or item's state and every reason it cannot start (`NOTHING IS IMPLEMENTED BEFORE IT IS
ACCEPTED`, `NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT`, `A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT`), never
storing a state (`PROGRESS AND JOB STATE ARE DERIVED, NOT STORED`), and records a sprint from its start to its review and
retrospective (`A SPRINT ENDS WITH A REVIEW OF ITS INCREMENT`, `A SPRINT ENDS WITH A RETROSPECTIVE`). It commits each save
of a plan, of items, of an order, and of a sprint's start, end and close as one commit on the head that was read, checked
by its findings — a person's own input on the page, and the same functions behind the writers of the kinds that draft a
plan, propose items and close a sprint, whose recipes and checks it offers too. It runs in the browser and in Node.

## Parts

- `index.mjs` — the interface.
- `plan-order.schema.md`, `backlog-order.schema.md`, `sprint.schema.md` — the schemas, in MOD-documents' schema language.
- `states.mjs` — item states and startability.
- `checks.mjs` — the findings of a plan and of a backlog.
- `sprints.mjs` — the facts of a sprint.
- `saves.mjs` — the commits of a plan, of items, of an order and of a sprint.
- `strategies.mjs` — the recipes, checks and writers of `workStrategies`.

## Data

It keeps nothing. It owns three formats; the files of the steps and items themselves (`ITM-<nnn>-<slug>.md`) are of the
item schema of MOD-documents (`artifactSchemas().item`).

| Schema | File | Content |
|---|---|---|
| `plan-order` | `docs/plan/order.md` | a table `Step`, `Phase`: every step of the plan by identifier, in its order, with the phase of the model it belongs to |
| `backlog-order` | `docs/backlog/order.md` | a table `Item`: every backlog item by identifier, in its order |
| `sprint` | `docs/backlog/sprints/<nn>.md` | front matter `sprint`, `goal`, `start`, `end` (the date the time box gives, empty without one), `closer` (the participant who closes it), `branch` (its own branch, empty for none), `selection` (the items); then sections appended as the sprint goes on, never rewritten: `## Selection` when the selection is changed by a new start decision, `## Ended` when the Product Owner ends a sprint without a time box, `## Review` (the increment, the items not done with their reasons, each feedback line with where it goes — new item, change to an item, noted —, who took part, and for an agent the sources of its feedback), `## Unfinished items` (each to the backlog or into the next sprint, with the reason), `## Retrospective` (what went well, what did not, each change with where it goes — process model, Definition of Done, a participant's instructions, team agreement —; an agent's changes as proposals only) |

An item's state, `ItemState`, is derived from the approval records, the queues, the job records and the pull requests:
`waiting for acceptance`, `waiting for an item it builds on`, `ready`, `in progress` (a job runs, or its pull request is
open), `blocked` (a job failed, or waits for a person), `done` (its pull request is merged). A plan step that waits for
the gate before its phase is `waiting` with that gate named.

## Interfaces

- `ItemState` — `{ item: string, state: "waiting for acceptance" | "waiting for an item it builds on" | "waiting" |
  "ready" | "in progress" | "blocked" | "done" | "unknown", reason: string | null, job: string | null, pullRequest:
  string | null }`; `unknown` when the state needs pull requests the host could not read.
- `planSchemas: { planOrder: Schema, backlogOrder: Schema, sprint: Schema }` — the three schemas, for MOD-documents and
  for the page's forms.
- `itemStates(items: Document[], order: Document, facts: { statuses: Map<string, { id: string, kind: string, status:
  string }>, queues: Queue[], jobs: JobRow[], pullRequests: PullRequest[] | "unknown", gates: Array<{ gate: string,
  state: string }>, workflow: Workflow | null }) -> ItemState[]` — every step or item in its order with its state, from
  the approval statuses, the change queues, the jobs, the pull requests and the gate states `gateStates` gives; with the
  pull requests `"unknown"` — a host that does no server operations —, a step or item whose state needs them is
  `unknown`, never guessed; a requirement an item realises that has been withdrawn or changed marks the item.
- `startable(item: string, states: ItemState[], context: { workflow: Workflow, declaration: Document, sprint: Document |
  null, wip: number | null, participants: Participant[] }) -> { startable: true } | { startable: false, reasons:
  string[] }` — every reason a job for this step or item cannot start: not selected for the current sprint; a requirement
  or use case it names not accepted, named; an item it builds on not done, named; the work-in-progress limit reached,
  naming the items in progress and those waiting for review; the gate before its phase not recorded, naming it and its
  decider; no holder of the implementing role with what the role needs.
- `planFindings(plan: Document, steps: Document[], architecture: Document[], workflow: Workflow) -> Finding[]` — a
  module, a subsystem or the system without a step; a module ordered before one whose interface it uses; a step without
  the tests of its level, or with the tests of another; a step without a phase of the model; a cycle in the modules'
  uses, naming its modules.
- `backlogFindings(items: Document[], order: Document, architecture: Document[]) -> Finding[]` — an item that realises
  nothing; that names no module the architecture describes; that stands before an item it builds on, naming that item; and,
  as a warning, an item that restates an existing one.
- `sprintFacts(sprint: Document, facts: { states: ItemState[], jobs: JobRow[], results: Snapshot, pullRequests:
  PullRequest[], issues: Issue[] }) -> { increment: Array<{ item: string, pullRequest: string, realises: string[],
  tests: string[] }>, notDone: ItemState[], numbers: { failedJobs: number, retriedJobs: number, correctionRounds: number,
  waitingAtGates: string, waitingForAPerson: string, flakyTests: string[], cost: string } }` — the sprint's increment,
  what is not done and why, and the numbers of the sprint, each derived; `results` is the branch `test-results`; a cost
  only where a job's row has one (`NO COST IS GUESSED`).
- `savePlan(host: Host, plan: { steps: Document[], order: Document, removed: string[] }, context: { architecture:
  Document[], workflow: Workflow, head: string, trailers: string[] }) -> Promise<{ commit: string, written: string[] }>` —
  **Save plan** (UC-045): `planFindings` first, and with an error finding nothing is written; a new step gets an
  identifier that no history of `docs/plan/` and `docs/backlog/` holds; one commit of one file per step under
  `docs/plan/` and `docs/plan/order.md`, the files of removed steps deleted. `trailers` are a job's provenance lines,
  empty for a person's own input — the same for every save below. Crosses the network. Errors: `PlanRefused { findings
  }`, `Moved`, `TokenRefused`, `PermissionMissing`, `RateLimited`, `Unreachable` — the host's errors, here and below.
- `saveItems(host: Host, change: { items: Document[], removed: string[], order: Document }, context: { architecture:
  Document[], head: string, trailers: string[] }) -> Promise<{ commit: string, written: string[], warnings: Finding[] }>`
  — **Add to backlog** and **+ Item** (UC-032), an item pointed at a replacing requirement or removed (UC-032 1a), and
  **Move to backlog** (UC-033): `backlogFindings` first, and with an error finding nothing is written; a warning — an item
  that restates an existing one — is returned with the commit; a new item gets an identifier that no history holds; one
  commit of the item files under `docs/backlog/` and the order, each new item after the items it builds on. An item
  added while a sprint runs enters the backlog, never the sprint's selection. Errors: `ItemsRefused { findings }`, and
  the host's.
- `saveOrder(host: Host, order: Document, context: { items: Document[], head: string, trailers: string[] }) -> Promise<{
  commit: string }>` — **Save order** (UC-032 step 5): one commit of `docs/backlog/order.md`. Errors: `OrderRefused {
  item, buildsOn }` for an item placed above an item it builds on, naming both, with nothing written; and the host's.
- `startSprint(host: Host, sprint: { goal: string, start: string, closer: string, selection: string[] }, context: {
  states: ItemState[], model: Model, declaration: Document, running: Document | null, head: string, trailers: string[] })
  -> Promise<{ commit: string, path: string, added: string[], removed: string[] }>` — **Start sprint** (UC-032 step 6):
  `end` set to the date the model's time box gives from `start`, empty without one; `branch` the one the declaration
  gives the time box, created from the head where it does not exist yet; `docs/backlog/sprints/<nn>.md` committed with the
  next number. While a sprint runs, a new start decision is appended to its file as `## Selection`, and `added` and
  `removed` name what it changes (UC-032 6a). Errors: `SprintRefused { reasons }` — an item waiting for acceptance, or one
  selected without the items it builds on that are not done —, and the host's.
- `endSprint(host: Host, sprint: string, context: { head: string, now: Date, trailers: string[] }) -> Promise<{ commit:
  string }>` — **End sprint** (UC-032 6b): appends `## Ended` with the date to a sprint without a time box. Errors:
  `NotEndable` for a sprint with a time box, whose end is its date, or one already ended; and the host's.
- `closeSprint(host: Host, close: { sprint: string, review: { feedback: Array<{ line: string, goes: "new item" | "change
  to an item" | "noted", item: string | null }>, tookPart: string[], sources: string[] | null }, unfinished: Array<{ item:
  string, to: "backlog" | "next sprint", reason: string }>, retrospective: Array<{ text: string, kind: "went well" | "did
  not go well" | "change", goes: "process model" | "Definition of Done" | "a participant's instructions" | "team
  agreement" | null }>, newItems: Document[] }, context: { facts: ReturnType<typeof sprintFacts>, architecture:
  Document[], order: Document, head: string, trailers: string[] }) -> Promise<{ commit: string, written: string[] }>` —
  **Close sprint** (UC-041 step 6): appends `## Review` — the increment and the items not done from `facts`, the feedback,
  who took part, for an agent the sources of its feedback —, `## Unfinished items` and `## Retrospective` to the sprint's
  file; adds the feedback's new items to the backlog as `saveItems` does and places the unfinished items going back in
  the order; all in one commit. Errors: `RetrospectiveMissing` (UC-041 6a), `Undecided { items }` for an unfinished item
  without a decision, `AlreadyClosed`, `ItemsRefused { findings }`, and the host's.
- `workStrategies: Strategies` — the strategies this module offers the job runner (ARC-046):
  - recipe `architecture-and-model` — the decision that states the system, the subsystems' decisions, the module files,
    the process model with its phases and gates, and the existing plan;
  - recipe `backlog-inputs` — the accepted requirements and use cases, those no item realises yet, the architecture, and
    the existing items in their order;
  - recipe `sprint-facts` — the sprint's facts, the product's issues opened or closed during the sprint, its job records
    and result records — each named as a source; never a mail;
  - check `plan-checks` — `planFindings` on a drafted plan;
  - check `backlog-checks` — `backlogFindings` on drafted items;
  - check `sprint-record-checks` — an agent's review that does not name the sources of its feedback, or does not say that
    no stakeholder took part when none did (`AN AGENT'S REVIEW NAMES WHERE ITS FEEDBACK CAME FROM`); a retrospective
    without an entry; a change to the process written as applied rather than proposed (`AN AGENT'S RETROSPECTIVE CHANGES
    NO PROCESS BY ITSELF`);
  - writer `plan-steps` — the drafted plan through `savePlan`, with the job's provenance lines;
  - writer `backlog-items` — the drafted items through `saveItems`, with the job's provenance lines;
  - writer `sprint-record` — an agent's close through `closeSprint`, with the job's provenance lines, under the closer's
    name; the proposals of the retrospective stay proposals.

`Workflow` is MOD-product-process'; `Model` MOD-model-catalogue's; `Queue` MOD-spec-changes'; `JobRow` MOD-job-ledger's;
`Participant` MOD-participant-list's; `Schema` and `Document` MOD-documents'; `Host`, `Snapshot`, `PullRequest` and
`Issue` MOD-repository-hosts'.

## Files

- Reads `docs/plan/`, `docs/backlog/`, `docs/backlog/sprints/`, `docs/process.md` through the workflow, the architecture
  under `docs/architecture/`, `SPEC.md`, the approval records, the change queues, `docs/jobs/`, the branch `test-results`,
  the pull requests and the issues of the product, and the history of `docs/plan/` and `docs/backlog/`.
- Writes, through its saves, `docs/plan/ITM-*.md`, `docs/plan/order.md`, `docs/backlog/ITM-*.md`,
  `docs/backlog/order.md` and `docs/backlog/sprints/<nn>.md`, and creates a sprint's own branch.

## Uses

- MOD-product-process.Workflow, gateStates, holdsRole — the phases and gates, a gate's state, the implementing role's
  holders.
- MOD-model-catalogue.Model — the phases a plan's steps belong to.
- MOD-approvals.statuses, MOD-spec-changes.Queue, queues, MOD-spec-document.parseSpec — whether what an item names is
  accepted.
- MOD-trace-graph.traceGraph, moduleOrder, coverageGaps — the order of modules by their uses, and what no item realises.
- MOD-documents.Schema, Document, loadSchema, readDocument, writeDocument, appendSection, classifyCandidates,
  artifactSchemas — the files by their schemas, the item schema, the appended sprint sections, and items that restate
  existing ones.
- MOD-identifiers.identifiersIn, nextIdentifier — new item identifiers, never one the history holds.
- MOD-job-ledger.JobRow — the jobs of an item, with their states and costs.
- MOD-participant-list.Participant — the holders of the implementing role and their capabilities.
- MOD-result-records.flakyTests — the flaky tests of a sprint.
- MOD-repository-hosts.Host, Snapshot, PullRequest, Issue, readHistory, listPullRequests, listIssues, createBranch,
  commitFiles — the product's files and history, its pull requests and issues, a sprint's branch, and the saves'
  commits.
- MOD-text-tools.Finding, finding — the findings.
- MOD-job-runner.Strategies, JobContext, Part, JobResult, provenanceLines — the form of the strategies and the
  provenance of a drafted commit.
