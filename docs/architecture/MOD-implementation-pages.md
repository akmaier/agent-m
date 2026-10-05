---
id: MOD-implementation-pages
title: The pages of implementation
folder: src/implementation-pages/
realises:
follows:
  - ARC-038
uses:
  - MOD-site-frame.View
  - MOD-site-frame.chosenProduct
  - MOD-site-frame.explain
  - MOD-site-frame.notice
  - MOD-site-frame.runPanel
  - MOD-site-frame.confirmDecision
  - MOD-site-frame.schemaForm
  - MOD-markdown-render.renderArtifact
  - MOD-markdown-render.renderMermaid
  - MOD-markdown-render.showDifference
  - MOD-browser-store.readSetting
  - MOD-bridge-client.bridgeAt
  - MOD-repository-hosts.readSnapshot
  - MOD-repository-hosts.repositoryInfo
  - MOD-repository-hosts.listPullRequests
  - MOD-repository-hosts.pullRequestFacts
  - MOD-repository-hosts.openPullRequest
  - MOD-repository-hosts.mergePullRequest
  - MOD-repository-hosts.listCiRuns
  - MOD-repository-hosts.webLinks
  - MOD-documents.artifactSchemas
  - MOD-documents.readDocument
  - MOD-documents.writeDocument
  - MOD-documents.readRegister
  - MOD-artifact-edits.saveFile
  - MOD-approvals.approvalStrategies
  - MOD-model-catalogue.catalogue
  - MOD-model-catalogue.modelSchema
  - MOD-model-catalogue.modelFindings
  - MOD-model-catalogue.planGrid
  - MOD-model-catalogue.modelDiagram
  - MOD-product-process.declarationSchema
  - MOD-product-process.declarationFindings
  - MOD-product-process.workflowOf
  - MOD-product-process.holdsRole
  - MOD-product-process.doneCheck
  - MOD-product-process.processStrategies
  - MOD-work-plans.planSchemas
  - MOD-work-plans.itemStates
  - MOD-work-plans.startable
  - MOD-work-plans.planFindings
  - MOD-work-plans.backlogFindings
  - MOD-work-plans.sprintFacts
  - MOD-work-plans.savePlan
  - MOD-work-plans.saveItems
  - MOD-work-plans.saveOrder
  - MOD-work-plans.startSprint
  - MOD-work-plans.endSprint
  - MOD-work-plans.closeSprint
  - MOD-work-plans.workStrategies
  - MOD-run-planner.runOf
  - MOD-run-planner.nextActions
  - MOD-run-planner.raiseLimits
  - MOD-run-planner.runStrategies
  - MOD-progress-measures.productFacts
  - MOD-progress-measures.progressIn
  - MOD-progress-measures.gateOverview
  - MOD-progress-measures.blocked
  - MOD-progress-measures.whoWorksOnWhat
  - MOD-test-schedule.scheduleStrategies
  - MOD-result-records.resultStrategies
  - MOD-participant-list.participantSchema
  - MOD-participant-list.eligible
  - MOD-job-catalogue.kindOf
  - MOD-job-runner.prepareJob
  - MOD-job-runner.writeResult
  - MOD-job-ledger.newJobId
  - MOD-job-ledger.listJobs
  - MOD-job-ledger.jobState
  - MOD-runtimes.routesFor
  - MOD-runtimes.queueJob
  - MOD-runtimes.runOnTab
  - MOD-runtimes.liveState
  - MOD-runtimes.cancelJob
  - MOD-runtimes.retryJob
  - MOD-runtimes.routeStrategies
provides:
  - view
---
# MOD-implementation-pages The pages of implementation

## Responsibility

It belongs to the Site (ARC-038). Its one responsibility is the menu entry Implementation: how a product is developed
and the process models of the instance; the implementation plan, or the backlog with its sprints and their close;
starting the jobs of steps or items and a run over a selection; and progress in the model's own measure. It shows what
Process derives and turns each decision into one call of the service that owns it.

It serves UC-002, UC-024, UC-031, UC-032, UC-034, UC-035, UC-041, UC-043 and UC-045.

It runs in a browser, loaded by `docs/index.html` through MOD-site-frame.

## Parts

- `index.mjs` — the interface: `view`.
- `process.mjs` — how the product is developed, and the instance's process models.
- `plan.mjs` — the implementation plan.
- `backlog.mjs` — the backlog, its order, sprints, the board, closing a sprint.
- `implement.mjs` — starting the jobs of steps or items, the merge of a pull request.
- `run.mjs` — a run over a selection.
- `progress.mjs` — progress in the model's measure, gates, what is blocked, who works on what.

## Data

It keeps nothing but the screen, an unsaved form, and the result of a drafting job that waits for the person's click.
Its formats are those of the modules it uses.

## Interfaces

- `view: View` — its routes, and the strategies its kinds use in the tab — `workStrategies`, `runStrategies`,
  `processStrategies`, `scheduleStrategies`, `resultStrategies`, `routeStrategies`, `approvalStrategies`:
  - `process` — *How this product is developed*: the five models in their two groups with their risks, the roles with
    whether a person, an agent or either may hold them and the capabilities each needs, the participants offered for a
    role — only those with every capability, each with where it processes data —, phases, transitions, verification
    pairs and gates with their deciders, a branch for a phase or sprint, practices, what the product's process
    requirements add, the Definition of Done, in a form from the declaration's schema; *Save* writes the declaration with
    `saveFile`.
  - `models`, `models/<name>` — the instance's process models: the catalogue, *Adapt* and *+ New model* with a form from
    the model's schema, the live diagram, the errors beside their fields, the preview of every accepted requirement in
    every phase, *Save* only without errors, with `saveFile`.
  - `plan` — the architecture's subsystems and modules beside the plan's steps with their derived states and what each
    waits for; *Draft the plan* with its run panel, run in this tab and attended, whose result waits for the planner; the
    draft reviewed in order, reordered, split, merged or edited where its dependencies allow; *Save plan*, which lets the
    drafted plan go on as the planner left it, or writes a plan made by hand with `savePlan`; *+ Step*.
  - `backlog`, `board` — the items in their order with their derived states, the requirements and use cases no item
    realises; *Propose items* with its run panel, whose drafts wait for the Product Owner, and *Add to backlog*, which
    lets them go on as edited; *+ Item*, an item pointed at a replacing requirement or removed, with `saveItems`;
    reordering and *Save order* with `saveOrder`, refused above an item it builds on, naming both; *Plan sprint* and
    *Start sprint* with `startSprint`, *End sprint* with `endSprint`; for a model with a work-in-progress limit, the board
    and *Pull*, refused at the limit with the items in progress named.
  - `sprint/<n>/close` — the increment and the items not done, the feedback lines, the unfinished items' decisions, the
    retrospective with the sprint's numbers as material; *Close sprint* with `closeSprint`, offered only with a
    retrospective entry and a decision for every unfinished item; *Merge increment* as a pull request whose CI must be
    green, for a sprint with a branch of its own.
  - `implement` — the steps of the plan or the ready items, each with its state and, if it cannot start, the reasons;
    the participants that hold the implementing role and can write and run tests, the attempt limit, who merges, the
    target branch, the gates the jobs will meet and who decides them; *Start jobs*, which queues each job on its
    participant's route — handed to a Bridge at once where the route is one; for each pull request its CI runs and
    whether the Definition of Done holds, and *Merge* once it does.
  - `run` — the selection with the order and what each waits for as a diagram, the limits — jobs at once, cost,
    correction rounds —, the plan from the model, *Start run*, which commits the run's record and starts the first
    actions `nextActions` returns, each on its route; while the page is open, the run's next actions of this page's route
    started as the records change; *Stop run*, which cancels every job of the run that has not ended, and then the run itself, through `cancelJob`,
    which records each end; and
    *Continue* once the person has raised the limit that stopped it.
  - `progress` — the progress in the model's measure — the grid of requirements by phases with the steps of the plan,
    the sprint's burn-down, or the board's cumulative flow —, the gates passed, pending and not reached, what is
    blocked, who works on what; a cell, card or point leads to the trace page of what is behind it.

## Files

It writes, only on a person's click and as that person's commit: the product's `docs/process.md` and a model under
`docs/process-models/` of the instance, with `saveFile`; the plan, items, order and sprints through MOD-work-plans'
functions, or, for a drafted plan or drafted items, through the writer of their kind; a job's start record, and the end of a cancelled job, through
MOD-runtimes; merges of pull requests, and the pull
request of a sprint branch. It reads the product's snapshot, its pull requests and CI runs, and the instance's
participants and process models.

## Uses

- MOD-site-frame.View, MOD-site-frame.chosenProduct, MOD-site-frame.explain, MOD-site-frame.notice,
  MOD-site-frame.runPanel, MOD-site-frame.confirmDecision, MOD-site-frame.schemaForm — the frame's parts, the run panel,
  and the forms of the declaration, the models, items and sprints.
- MOD-markdown-render.renderArtifact, MOD-markdown-render.renderMermaid, MOD-markdown-render.showDifference — items,
  diagrams of models, plans and progress, and differences of a drafted plan.
- MOD-browser-store.readSetting — the endpoints' configurations and the Bridges' settings a job needs;
  MOD-bridge-client.bridgeAt — a handle for each Bridge, handed to the runtimes.
- MOD-repository-hosts.readSnapshot, MOD-repository-hosts.repositoryInfo — the product and its visibility;
  MOD-repository-hosts.listPullRequests,
  MOD-repository-hosts.pullRequestFacts, MOD-repository-hosts.openPullRequest, MOD-repository-hosts.mergePullRequest,
  MOD-repository-hosts.listCiRuns — pull requests, their CI and their merge; MOD-repository-hosts.webLinks — the
  server's page for branch protection.
- MOD-documents.artifactSchemas, MOD-documents.readDocument, MOD-documents.writeDocument, MOD-documents.readRegister —
  the item schema of a form, documents of the common shape, the text of a declaration or model to save, the participant
  list; MOD-artifact-edits.saveFile — the declaration and a model, only on the blob they were opened on.
- MOD-model-catalogue.catalogue, MOD-model-catalogue.modelSchema, MOD-model-catalogue.modelFindings,
  MOD-model-catalogue.planGrid, MOD-model-catalogue.modelDiagram — models.
- MOD-product-process.declarationSchema, MOD-product-process.declarationFindings, MOD-product-process.workflowOf,
  MOD-product-process.holdsRole, MOD-product-process.doneCheck — the declaration, its workflow and gates, and the
  Definition of Done of a pull request.
- MOD-work-plans.planSchemas, MOD-work-plans.itemStates, MOD-work-plans.startable, MOD-work-plans.planFindings,
  MOD-work-plans.backlogFindings, MOD-work-plans.sprintFacts — plans, backlogs, sprints and their states;
  MOD-work-plans.savePlan, MOD-work-plans.saveItems, MOD-work-plans.saveOrder, MOD-work-plans.startSprint,
  MOD-work-plans.endSprint, MOD-work-plans.closeSprint — every save of a plan, a backlog or a sprint.
- MOD-run-planner.runOf, MOD-run-planner.nextActions, MOD-run-planner.raiseLimits — a run, its next actions, and the
  limits a person raises to continue it.
- MOD-progress-measures.productFacts, MOD-progress-measures.progressIn, MOD-progress-measures.gateOverview,
  MOD-progress-measures.blocked, MOD-progress-measures.whoWorksOnWhat — the product's facts and its progress.
- MOD-participant-list.participantSchema, MOD-participant-list.eligible — the participants a role or a job may have.
- MOD-job-catalogue.kindOf — a kind's purpose and whether its result waits for a person; MOD-job-runner.prepareJob — the
  run panels; MOD-job-runner.writeResult — a drafted plan or drafted items written on the person's click.
- MOD-job-ledger.newJobId, MOD-job-ledger.listJobs, MOD-job-ledger.jobState — the jobs a page starts and follows;
- MOD-runtimes.routesFor, MOD-runtimes.queueJob, MOD-runtimes.runOnTab, MOD-runtimes.liveState,
  MOD-runtimes.cancelJob, MOD-runtimes.retryJob — starting, following, stopping and retrying jobs on their
  routes, offered for the product's resource needs in its facts.
- MOD-work-plans.workStrategies, MOD-run-planner.runStrategies, MOD-product-process.processStrategies,
  MOD-test-schedule.scheduleStrategies, MOD-result-records.resultStrategies, MOD-runtimes.routeStrategies,
  MOD-approvals.approvalStrategies — the strategies of its kinds, handed to the frame.
