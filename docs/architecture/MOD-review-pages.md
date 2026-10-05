---
id: MOD-review-pages
title: One review flow for every reviewed kind
folder: src/review-pages/
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
  - MOD-markdown-render.renderArtifact
  - MOD-markdown-render.openEditor
  - MOD-markdown-render.showDifference
  - MOD-browser-store.readSetting
  - MOD-bridge-client.bridgeAt
  - MOD-repository-hosts.readSnapshot
  - MOD-repository-hosts.repositoryInfo
  - MOD-repository-hosts.webLinks
  - MOD-text-tools.blobSha
  - MOD-documents.artifactSchemas
  - MOD-documents.readDocument
  - MOD-documents.documentFindings
  - MOD-documents.readRegister
  - MOD-spec-document.parseSpec
  - MOD-spec-document.sectionText
  - MOD-spec-document.requirementFindings
  - MOD-test-document.testDeclarations
  - MOD-group-document.parseGroupFile
  - MOD-group-document.groupFileText
  - MOD-group-document.applyMoves
  - MOD-group-document.hierarchy
  - MOD-trace-graph.traceGraph
  - MOD-trace-graph.graphFindings
  - MOD-trace-graph.coverageGaps
  - MOD-trace-graph.requirementImpact
  - MOD-trace-graph.architectureImpact
  - MOD-approvals.statuses
  - MOD-approvals.statusOf
  - MOD-approvals.lastAcceptedText
  - MOD-approvals.acceptShown
  - MOD-approvals.acceptanceBlockers
  - MOD-approvals.fallbackAcceptLink
  - MOD-approvals.approvalStrategies
  - MOD-spec-changes.queues
  - MOD-spec-changes.openQueueOf
  - MOD-spec-changes.proposeSection
  - MOD-spec-changes.entryView
  - MOD-spec-changes.acceptEntries
  - MOD-spec-changes.specStrategies
  - MOD-artifact-edits.saveFile
  - MOD-artifact-edits.saveGroupFile
  - MOD-artifact-edits.fallbackEditLinks
  - MOD-artifact-edits.editStrategies
  - MOD-release-evidence.acceptAndRelease
  - MOD-source-register.sourceSchemas
  - MOD-source-register.linkedVersion
  - MOD-source-register.sourceStrategies
  - MOD-reuse-facts.reuseStrategies
  - MOD-participant-list.participantSchema
  - MOD-participant-list.eligible
  - MOD-participant-list.differs
  - MOD-job-catalogue.kindOf
  - MOD-job-runner.prepareJob
  - MOD-job-runner.writeResult
  - MOD-job-ledger.newJobId
  - MOD-job-ledger.listJobs
  - MOD-runtimes.routesFor
  - MOD-runtimes.queueJob
  - MOD-runtimes.runOnTab
  - MOD-runtimes.liveState
provides:
  - view
---
# MOD-review-pages One review flow for every reviewed kind

## Responsibility

It belongs to the Site (ARC-038). Its one responsibility is the review flow of every reviewed kind of artifact, written
once as a template method: a list with statuses; one file with its difference to its last accepted text; accepting one,
the ticked ones or all shown; editing; changing by prompt; drafting; and arranging groups. A kind takes part through its
**descriptor** — data —, and the flow calls the service the descriptor names for each decision, once. The kinds are use
cases, architecture decisions, module files, SPEC change entries and release test reports; arranging groups covers every
kind of `EVERY HIERARCHY IS KEPT IN A GROUP FILE OF ITS OWN`, requirements and tests included.

It serves UC-005, UC-006, UC-007, UC-008, UC-018, UC-019, UC-021, UC-022 and UC-023, and the acceptance of an open
release test report of UC-030. It derives no status of its own: every status comes from MOD-approvals (`STATUS IS
DERIVED FROM THE RECORDS`).

It runs in a browser, loaded by `docs/index.html` through MOD-site-frame.

## Parts

- `index.mjs` — the interface: `view`.
- `flow.mjs` — the template method: list, file, review all, accept, edit, change by prompt, draft, arrange.
- `kinds.mjs` — the five descriptors.
- `jobs.mjs` — preparing, starting and following the drafting jobs of a kind, and letting a result that waits for the
  person go on.
- `sections.mjs` — the extra sections a descriptor names: the architecture's rounds and due diligence, a SPEC entry's
  current text, rationale and impact list, an architecture change's impact list, a report's limitations.
- `arrange.mjs` — the hierarchy of a group file, moves, pending changes.

## Data

It keeps nothing but the screen, the edits in an open editor, and the result of a drafting job that waits for the
person's click. It owns the **descriptor** of a reviewed kind:

```text
ReviewKind = {
  key: "use-case" | "decision" | "module" | "spec-entry" | "release-report",
  entry: "use-cases" | "architecture" | "requirements" | "releases",   // the menu entry it is under
  files: { folder: string, pattern: string },                           // where its files are
  schema: "useCase" | "decision" | "module" | null,                     // its schema among MOD-documents' artifactSchemas; null for a SPEC entry and a report
  marks: (text, context) -> Finding[],                                  // the editor's marks, from the artifact model
  draftKinds: string[],                                                 // kinds of MOD-job-catalogue that draft it
  changeKinds: string[],                                                // kinds that change it by prompt
  save: "file" | "proposal" | null,                                     // MOD-artifact-edits.saveFile, MOD-spec-changes.proposeSection, or never edited
  accept: "records" | "queue" | "release",                              // MOD-approvals.acceptShown, MOD-spec-changes.acceptEntries, MOD-release-evidence.acceptAndRelease
  groupKind: string | null,                                             // its group file, for arranging
  sections: string[]                                                    // the extra sections shown with a file
}
```

| Kind | Files | Draft and change kinds | Save | Accept | Extra sections |
|---|---|---|---|---|---|
| use case | `docs/use-cases/UC-<nnn>-<slug>.md`, schema `useCase` | `derive-use-cases`; `change-use-case` | file | records | — |
| decision | `docs/architecture/ARC-<nnn>-<slug>.md`, schema `decision` | `derive-architecture`; `change-architecture` | file | records | rounds, due diligence, impact list of a change, what it rests on that is not accepted |
| module | `docs/architecture/MOD-<slug>.md`, schema `module` | `derive-architecture`; `change-architecture` | file | records | rounds, impact list of a change, what it rests on that is not accepted |
| SPEC entry | `docs/spec-freigaben/<queue>/`, read by MOD-spec-changes | `derive-requirements`; `change-requirements` | proposal | queue | the current section beside the proposal with the difference, rationale, impact list, other proposals on the same section, the queue's order and anchors |
| release test report | `docs/tests/releases/v<version>.md` | — | never edited | release | the limitations — a reason for every failing test and every worse rate — and the changelog entry the person confirms |

## Interfaces

- `view: View` — the routes of the review flow, and the strategies its kinds use in the tab — `specStrategies`,
  `approvalStrategies`, `editStrategies`, `sourceStrategies`, `reuseStrategies`. Its routes, for each kind `<k>`:
  - `<k>` — the files of the kind with their status — open, accepted, changed since acceptance —, each with a tick.
  - `<k>/<id>` — one file rendered, with its diagram; changed since acceptance, its difference to the text the most
    recent approval record of its identifier names (`A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT`); its extra
    sections; *Accept*, *Edit*, *Change by prompt*. Without a token for GitHub, *Accept* and *Edit* open GitHub's
    prefilled pages, the text never in the address (`NO TEXT TRAVELS IN A URL`); for a GitLab product without a token,
    neither is offered, and the token's step is linked.
  - `<k>/all` — *Review all*: every open or changed file of the kind in sequence, a changed one as its difference, a new
    one in full, and *Accept all N shown*: one commit with one record per file shown; a file that changed after it was
    shown, or that names a requirement or use case not yet accepted, is left out and named (`SEVERAL FILES ARE ACCEPTED IN
    ONE CLICK`, `ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS`). For the architecture, this is the review page of the whole
    architecture: the decision that states the system first, then the subsystems' decisions, the module files, the
    further decisions with their due diligence, and the rounds of the job that drafted them.
  - `<k>/<id>/edit`, and `requirement/<name>/edit` and `requirements/new` for a requirement — the editor with live
    preview and the descriptor's marks; for a requirement, its SPEC section, a *Why* field and its impact list, saved as
    an entry of the person's open queue of the day (`A SPEC EDIT IS SAVED AS A PROPOSAL`); every save only on the blob the
    file or section was opened on. Before saving an edit of the architecture, *Check this edit* runs the kind
    `review-architecture` on the edited files as its draft, and its findings stand beside them for the author to weigh.
  - `<k>/<id>/prompt`, `requirement/<name>/prompt` — *Change by prompt*: the instruction, the participant, the run panel,
    the draft in the editor as its difference against the current text, *Refine*, and *Save*, which lets the job's result
    go on as the person left it; a CI agent's draft arrives as an open file or a queue entry instead.
  - `<k>/draft` — drafting: for use cases, the requirements to cover — by default those no use case realises —; for
    requirements, the linked source and its part; for the architecture, what the derivation covers, its preconditions,
    the drafting and the reviewing participant — a reviewer offered only if it differs from the drafter in participant
    and model —; then the run panel and *Run*. A job the person starts here and waits for runs in this tab, attended: a
    kind whose result waits for a person ends with its draft — the candidates of a derivation of requirements, grouped by
    class beside the requirement each refers to, with their classes changeable and every conflict decided; the
    architecture as a whole with its rounds, the findings left and the due diligence, its reuse candidates choosable —,
    and *Write proposals* lets it go on, writing the draft as the person left it; while a step leaves an error — a reuse
    decision whose due diligence could not be fetched —, nothing is written and the findings left are named. A kind
    whose result does not wait — drafting use cases — writes its files open at once, and they appear in the list. A job
    on another route — a CI agent, an agent behind a Bridge it is handed to — is queued there and followed on the page;
    its route writes its result as open files or queue entries.
  - `arrange/<group kind>` — *Arrange* for requirements, use cases, decisions, modules or tests: the hierarchy with every
    item once, moves, new and renamed groups, the pending changes listed, *Propose groups*, whose proposal arrives as
    pending changes, and *Save arrangement*, which commits the group file only.

## Files

It writes nothing itself: every decision is one call of the service the descriptor names — MOD-approvals,
MOD-spec-changes, MOD-artifact-edits, MOD-release-evidence —, a drafting job's start record through MOD-runtimes, or,
for a result that waited for the person, the writer of its kind through MOD-job-runner. It reads the product's snapshot
through its host — the reviewed files, the SPEC, the group files, the tests, the approval records, the job records —,
and `docs/participants.md` of the instance.

## Uses

- MOD-site-frame.View, MOD-site-frame.chosenProduct, MOD-site-frame.explain, MOD-site-frame.notice,
  MOD-site-frame.runPanel, MOD-site-frame.confirmDecision — the frame's parts of every route.
- MOD-markdown-render.renderArtifact, MOD-markdown-render.openEditor, MOD-markdown-render.showDifference — files,
  editors, differences.
- MOD-browser-store.readSetting — the endpoints' configurations and the Bridges' settings a job in the tab needs;
  MOD-bridge-client.bridgeAt — a handle for each Bridge, handed to the runtimes.
- MOD-repository-hosts.readSnapshot, MOD-repository-hosts.repositoryInfo, MOD-repository-hosts.webLinks — the
  product's files, whether the person may write and the repository's visibility, GitHub's own pages.
- MOD-text-tools.blobSha — the blob of each text as it was shown, which an acceptance names (`AN APPROVAL NAMES THE EXACT
  TEXT`).
- MOD-documents.artifactSchemas, MOD-documents.readDocument, MOD-documents.documentFindings,
  MOD-documents.readRegister — the kinds' files, their marks, the participant list; MOD-spec-document.parseSpec,
  MOD-spec-document.sectionText, MOD-spec-document.requirementFindings — requirements, their sections and marks;
  MOD-test-document.testDeclarations — the tests to arrange.
- MOD-group-document.parseGroupFile, MOD-group-document.groupFileText, MOD-group-document.applyMoves,
  MOD-group-document.hierarchy — arranging.
- MOD-trace-graph.traceGraph, MOD-trace-graph.graphFindings, MOD-trace-graph.coverageGaps,
  MOD-trace-graph.requirementImpact, MOD-trace-graph.architectureImpact — the marks across artifacts, the requirements
  no use case realises, and the impact lists.
- MOD-approvals.statuses, MOD-approvals.statusOf, MOD-approvals.lastAcceptedText, MOD-approvals.acceptShown,
  MOD-approvals.acceptanceBlockers, MOD-approvals.fallbackAcceptLink — statuses and acceptance.
- MOD-spec-changes.queues, MOD-spec-changes.openQueueOf, MOD-spec-changes.proposeSection, MOD-spec-changes.entryView,
  MOD-spec-changes.acceptEntries — SPEC entries and their acceptance in the queue's order, with the product's links and
  the instance's register, so that an entry whose requirement names no linked source is named and not accepted.
- MOD-artifact-edits.saveFile, MOD-artifact-edits.saveGroupFile, MOD-artifact-edits.fallbackEditLinks — saves.
- MOD-release-evidence.acceptAndRelease — accepting an open release test report.
- MOD-source-register.sourceSchemas, MOD-source-register.linkedVersion — the product's links file and register, and its
  linked sources with their parts.
- MOD-approvals.approvalStrategies, MOD-spec-changes.specStrategies, MOD-artifact-edits.editStrategies,
  MOD-source-register.sourceStrategies, MOD-reuse-facts.reuseStrategies — the strategies of its kinds, handed to the frame.
- MOD-participant-list.participantSchema, MOD-participant-list.eligible, MOD-participant-list.differs — who may draft and
  who may review, a reviewer differing from the drafter in participant and model.
- MOD-job-catalogue.kindOf — a kind's purpose and whether its result waits for a person; MOD-job-runner.prepareJob —
  the run panel; MOD-job-runner.writeResult — a result that waited for the person, written on their click.
- MOD-job-ledger.newJobId — the identifier of a job started here; MOD-job-ledger.listJobs — the record of the job that
  drafted a file, with its rounds.
- MOD-runtimes.routesFor, MOD-runtimes.queueJob, MOD-runtimes.runOnTab, MOD-runtimes.liveState — the route of a
  participant, the start record, a job run in this tab attended, and a job followed on its route.
