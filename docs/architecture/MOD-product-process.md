---
id: MOD-product-process
title: A product's process — its declaration, workflow, gates and Definition of Done
folder: src/product-process/
realises:
follows:
  - ARC-042
uses:
  - MOD-model-catalogue.Model
  - MOD-model-catalogue.catalogue
  - MOD-model-catalogue.modelFindings
  - MOD-participant-list.participantSchema
  - MOD-participant-list.eligible
  - MOD-source-register.sourceSchemas
  - MOD-source-register.permittedPlaces
  - MOD-spec-document.parseSpec
  - MOD-test-document.testDeclarations
  - MOD-documents.Schema
  - MOD-documents.Document
  - MOD-documents.loadSchema
  - MOD-documents.readDocument
  - MOD-documents.writeDocument
  - MOD-documents.readRegister
  - MOD-repository-hosts.Host
  - MOD-repository-hosts.Snapshot
  - MOD-repository-hosts.PullRequestFacts
  - MOD-repository-hosts.commitFiles
  - MOD-text-tools.Finding
  - MOD-text-tools.finding
  - MOD-text-tools.blobSha
  - MOD-job-runner.Strategies
  - MOD-job-runner.JobContext
  - MOD-job-runner.Part
  - MOD-job-runner.JobResult
  - MOD-job-runner.provenanceLines
provides:
  - Workflow
  - declarationSchema
  - declarationFindings
  - workflowOf
  - holdsRole
  - gateSchema
  - gateStates
  - mayDecide
  - recordGateDecision
  - doneCheck
  - processStrategies
---
# MOD-product-process A product's process — its declaration, workflow, gates and Definition of Done

## Responsibility

It belongs to Process (ARC-042). It reads and checks the declaration of how a product is developed — exactly one process
model, its roles and their holders, practices, branches, the Definition of Done, who closes a sprint (`THE PROCESS MODEL IS
DECLARED PER PRODUCT`, `A PROCESS MODEL ORGANISES PEOPLE AND AGENTS`, `A PRODUCT DECLARES ITS DEFINITION OF DONE`) —, and
derives the product's workflow from the model, the practices and the gates the product's process requirements add, and
from nothing else (`THE MODEL DETERMINES THE PHASES AND THE GATES`, `A PROCESS REQUIREMENT ADDS TO THE MODEL`). It keeps
gate records and derives each gate's state, decides who may decide a gate (`A GATE NAMES WHO DECIDES IT`, `A GATE IS NOT
DECIDED BY THE PARTICIPANT WHOSE WORK IT CHECKS`), records a decision as a gate record (`THE GATE IS RECORDED`), and checks a pull request against the Definition of Done in the
product's CI (`A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS`). It runs in the browser and in Node.

## Parts

- `index.mjs` — the interface.
- `declaration.schema.md`, `gate-record.schema.md` — the two schemas, in MOD-documents' schema language.
- `declaration.mjs` — the declaration's findings and the roles.
- `workflow.mjs` — the workflow of a product.
- `gates.mjs` — gate states, who may decide, and the record of a decision.
- `done.mjs` — the Definition-of-Done check of a pull request.
- `strategies.mjs` — the recipe and writer of `processStrategies`.

## Data

It keeps nothing. It owns two formats.

**Schema `declaration`** (`declaration.schema.md`), the file `docs/process.md` of a product:

| Part of the schema | Value |
|---|---|
| front matter | `model` (its name), `model_file` (its path in the instance or in the shipped catalogue), `model_version` (the commit of the instance that holds the declared file), `sprint_close` (the participant who closes a sprint; the Product Owner when empty) |
| `## Roles` | a table: `Role`, `Participants` — participants by name from the instance's list, several where the role allows it |
| `## Practices` | a list of practice names, or `none` |
| `## Branches` | a table: `Phase or time box`, `Branch`; without a row, work merges into the default branch (`WORK MERGES INTO THE DEFAULT BRANCH UNLESS A BRANCH IS SET`) |
| `## Definition of Done` | the conditions added to the job rules, one per line — `review: <n> by participants other than the implementer`, `check: <CI check name>`, `gate: <gate>` —, or the sentence that the job rules hold and no condition is added |
| `## Gates added by requirements` | optional; a table: `Requirement`, `Between`, `Artifacts`, `Condition`, `Decider` — a gate a process requirement adds, named by the requirement of the instance's SPEC that adds it (a process requirement: MOD-spec-document) |
| other sections | free text — the model in words, how sprints run, boundaries |

The job rules, which every Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`): CI is green; the
job's first commit holds only tests and CI was red on it — for a refactoring job, CI was green on every commit and no
test's expected result changed —; every changed code file lies in the folder of one of the job's modules; every new test
names a requirement and a module; every gate the workflow places before the merge is recorded.

**Schema `gate-record`** (`gate-record.schema.md`), a file `docs/gates/<yyyymmdd>-<hhmm>-<gate slug>-<4 hex>.md`, written
once (`THE GATE IS RECORDED`, `A RECORD IS EVIDENCE, NOT A PROPOSAL`):

| Part of the schema | Value |
|---|---|
| front matter | `gate` (the gate as the workflow names it, `<phase> → <phase>` or the requirement that adds it); `job` (the job waiting there, or empty for a phase's gate); `decider` (a participant's name, or `check: <CI check name>`); `role` (the deciding role); `decision` (`passed` or `rejected`); `on` (what was checked: `<path>@<blob>` per artifact, or the commit); `date` |
| `## Reason` | required for `rejected`; an agent's reasoning for either |

## Interfaces

- `Workflow` — `{ model: Model, practices: string[], phases: Array<{ name: string, role: string, produces: string[] }>,
  transitions: Array<{ from: string, to: string, kind: string }>, pairs: Array<{ phase: string, checkedBy: string }>,
  gates: Array<{ name: string, from: string, to: string, artifacts: string, condition: string, decider: string,
  addedBy: { requirement: string, source: string } | null, practice: string | null }>, roles: Array<{ name: string,
  filledBy: string, capabilities: string[], holders: string[] }>, branches: Record<string, string>, done: string[] }`.
- `declarationSchema: Schema` — the declaration's schema, for MOD-documents and for the form of UC-002.
- `declarationFindings(declaration: Document, catalogue: Model[], participants: Document, sources: Document[],
  instanceSpec: string) -> Finding[]` — a model that is not in the catalogue, has error findings or lacks the named
  version; a role that needs a person and has none; a holder that lacks a capability its role needs, naming it (`A ROLE
  NAMES THE CAPABILITIES IT NEEDS`); a practice that does not fit the model; a branch for a phase the model lacks; a gate
  under `## Gates added by requirements` whose requirement the instance's SPEC, `instanceSpec`, does not hold — each an
  error; a holder at a
  processing place a linked source does not permit — a warning naming the source and the role, whose content that holder
  is then never given (`RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS`).
- `workflowOf(declaration: Document, model: Model, practices: Document[], instanceSpec: string) -> Workflow` — the model's
  phases, transitions, pairs and gates, the practices' additions, and the gates and artifacts the process requirements
  add, as the declaration's `## Gates added by requirements` names them, each marked with its requirement and the source
  that requirement names in the instance's SPEC, `instanceSpec`; nothing else enters the workflow. A gate whose
  requirement that SPEC does not hold stays in the workflow with `addedBy.source` null; `declarationFindings` names it.
- `holdsRole(declaration: Document, participant: string, role: string) -> boolean` — whether the declaration assigns the
  participant to the role (`A JOB GOES ONLY TO A HOLDER OF ITS ROLE`).
- `gateSchema: Schema` — the gate record's schema.
- `gateStates(workflow: Workflow, records: Document[], texts: Record<string, string>) -> Array<{ gate: string, state:
  "passed" | "passed on an earlier text" | "rejected" | "pending" | "not reached", record: string | null,
  needs: string | null, difference: string | null }>` — each gate's state: `passed` when a record of its decider passed it
  on the texts that hold now; `passed on an earlier text` — not passed for the current text — with the difference;
  `pending` with what it still needs; `texts` are the blobs of the artifacts the gates check (`STATUS IS DERIVED FROM THE
  RECORDS`).
- `mayDecide(participant: { name: string, kind: "person" | "agent" | "check" }, gate: string, workflow: Workflow,
  workBy: string[]) -> { may: true } | { may: false, reason: "not a holder of the deciding role" | "did the work this gate
  checks" | "not the gate's check", holders: string[] }` — whether a decision would pass the gate; a record by the
  participant whose work the gate checks does not, even when it holds the role.
- `recordGateDecision(host: Host, decision: { gate: string, job: string | null, decider: { name: string, kind: "person" |
  "agent" | "check" }, role: string, decision: "passed" | "rejected", reason: string | null, on: string[] }, context: {
  workflow: Workflow, workBy: string[], head: string, now: Date, trailers: string[] }) -> Promise<{ commit: string, path:
  string }>` — a decision on a gate — a person's on the page, an agent's through the writer `gate-record`, a CI check's
  through the Workflows — written as one gate record in one commit on the head that was read; `on` names each checked
  artifact as `<path>@<blob>`, or the commit; `trailers` are a job's provenance lines, empty for a person's own decision.
  Considers: `mayDecide` runs first, and a decision that would not pass the gate is refused with nothing written; a
  rejection needs its reason; the waiting job is resumed by its route once the record is on the branch (MOD-runtimes'
  `resumeJob`; on CI the record's push). Crosses the network. Errors: `MayNotDecide { reason, holders }`, `ReasonMissing`,
  `Moved` (read again: the gate may have been decided meanwhile), `TokenRefused`, `PermissionMissing`, `RateLimited`,
  `Unreachable`.
- `doneCheck(facts: PullRequestFacts, workflow: Workflow, modules: Document[], gates: Document[], job: { kind: "implement"
  | "refactor" | "fix-bug", modules: string[] }) -> Finding[]` — every condition of the product's Definition of Done the
  pull request does not meet, as findings; empty when it holds. `facts` are the pull request's commits in order with their
  changed files and CI results, and the texts of changed files on both sides; `gates` the product's gate records.
  Considers: it is run by the product's CI, through the job `agent-m done`, so that it holds whoever merges.
- `processStrategies: Strategies` — the strategies this module offers the job runner (ARC-046):
  - recipe `gate-inputs` — for an agent that decides a gate: the gate, what it checks and its condition, the texts of the
    artifacts to examine, and the job waiting there;
  - writer `gate-record` — writes the decision of an agent through `recordGateDecision`, with the job's provenance
    lines; refused, and nothing written, when the agent did the work the gate checks.

`Model` is MOD-model-catalogue's; `Schema` and `Document` are MOD-documents'; `Host`, `Snapshot` and `PullRequestFacts`
MOD-repository-hosts'.

## Files

- Reads `docs/process.md`, `docs/gates/*.md`, the instance's `docs/participants.md`, source register and `SPEC.md` — whose
  requirements are the process requirements —, the product's `docs/sources.md`, the module files under
  `docs/architecture/`, and the test files a pull request changes.
- Writes `docs/gates/<…>.md` through `recordGateDecision`; the declaration itself is committed by the page as the person's own
  input.

## Uses

- MOD-model-catalogue.Model, catalogue, modelFindings — the declared model, its version and its validity.
- MOD-participant-list.participantSchema, eligible — the holders' capabilities and processing places.
- MOD-source-register.sourceSchemas, permittedPlaces — where the content of a linked source may go.
- MOD-spec-document.parseSpec — the process requirements, which the instance's SPEC holds, and their sources.
- MOD-test-document.testDeclarations — whether new tests name a requirement and a module, and whether a refactoring
  changed an expected result.
- MOD-documents.Schema, Document, loadSchema, readDocument, writeDocument, readRegister — declaration, gate records,
  participants and module files by their schemas.
- MOD-repository-hosts.Host, Snapshot, PullRequestFacts, commitFiles — the facts of a pull request, and the gate
  record's commit.
- MOD-text-tools.Finding, finding, blobSha — findings, and the blobs of the checked texts.
- MOD-job-runner.Strategies, JobContext, Part, JobResult, provenanceLines — the form of the strategies and the
  provenance of a gate record's commit.
