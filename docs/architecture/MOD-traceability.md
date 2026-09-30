---
id: MOD-traceability
title: Computes traceability, gaps, impact lists, module validation and the audit view from one commit's artifacts
realises:
  - THE TRACEABILITY MATRIX IS DERIVED
  - EVERY ARTIFACT NAMES ITS ORIGIN
  - A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION
  - A REQUIREMENT SHOWS WHAT TRACES TO IT
  - UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN
  - MODULE GAPS ARE REPORTED, NOT FORBIDDEN
  - A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST
  - AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST
  - THE AUDIT VIEW LISTS EVERY REQUIREMENT OF THE RELEASE
  - THE BROWSER SHOWS ANY RELEASED VERSION
  - A RUN ENDS WITH THE VALIDATION OF ITS MODULES
  - UC-020
  - UC-023
  - UC-025
  - UC-029
  - UC-030
follows:
  - ARC-003
  - ARC-018
  - ARC-020
uses:
  - MOD-review-core.parseArchitecture
  - MOD-spec-queue.specRequirements
  - MOD-test-records.commitOutcomes
provides:
  - headerTags
  - linkGraph
  - tracesTo
  - coverageGaps
  - moduleRows
  - requirementImpact
  - architectureImpact
  - auditRows
  - auditMarkdown
  - componentDiagram
---
# MOD-traceability Computes traceability, gaps, impact lists, module validation and the audit view from one commit's artifacts

## Responsibility

All derived views over the links artifacts state: what traces to a requirement, coverage and module
gaps, impact lists for requirement and architecture changes, the validation of a run's modules, the
audit rows of a release, and the component diagram. Pure core; it reads nothing itself — the caller
gives it the files of one pinned commit and, for the audit, the result records.

**Current state.** In `review-core.mjs` today: `HEADER_LINES`,
`isCodePath`, `isTestPath`, `headerModules`, `moduleHeaders` (its reading moves to the caller),
`impactList`, `componentDiagram`. `impactHtml` and `prerequisitesHtml` move to MOD-dashboard-app.
`linkGraph`, `tracesTo`, `coverageGaps`, `moduleRows`, `requirementImpact`, `auditRows` and
`auditMarkdown` do not exist yet.

## Interfaces

- `headerTags(path, text) -> { modules, guards, level, cases }` — the `Module:`, `Guards:` and `Level:` lines among a file's first 20 lines, and the `TST-` identifiers of its cases (ARC-020).
- `linkGraph(snapshot) -> graph` — nodes by identifier (requirements from SPEC and open queues, use cases, decisions, modules, code files, tests) and one edge per stated name; a name without a node is kept as unknown, marked withdrawn where it was.
- `tracesTo(graph, name) -> { sources, useCases, decisions, modules, tests, proposals }` — everything that names one requirement, at the version the graph was built from.
- `coverageGaps(graph) -> { unrealised, realisingNothing, unknownNames, … }` — the lists of UC-020 step 7; they block nothing.
- `moduleRows(graph, selection?) -> { rows, gaps }` — per module what it realises and follows (with status), its code files and tests, and every gap of UC-025 step 4.
- `requirementImpact(graph, name) -> [artifact]` — every artifact that names a requirement, shown beside a proposal that changes it.
- `architectureImpact({ before, after, graph }) -> { affected, removedInterfaces, alteredInterfaces, names }` — modules following the decision or using a changed interface (those that break first), their code and tests, and the names before and after.
- `auditRows(graph, outcomes, release) -> { summary, rows }` — one row per requirement valid at the release, with its sources, tests by level with outcome or rate and counter-proof, and the acceptance of the report; gaps included.
- `auditMarkdown(audit) -> string` — the self-contained export naming tag, commit, source versions with hashes and the blob SHAs of report and approvals.
- `componentDiagram(modules) -> mermaid` — one box per module, one arrow per used interface; an interface no module provides is drawn dashed and marked missing.

Uses, as declared above: `MOD-review-core.parseArchitecture`, `MOD-spec-queue.specRequirements`, `MOD-test-records.commitOutcomes`.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; open until accepted.*
