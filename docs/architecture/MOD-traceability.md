---
id: MOD-traceability
title: Computes the link graph of one commit and every view derived from it — what traces to a requirement, gaps, impact lists, module rows, the run order, the audit view and the component diagram
realises:
  - THE TRACEABILITY MATRIX IS DERIVED
  - A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION
  - THE BROWSER SHOWS ANY RELEASED VERSION
  - A REQUIREMENT SHOWS WHAT TRACES TO IT
  - OPEN PROPOSALS ARE SHOWN IN THE BROWSER
  - UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN
  - A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST
  - AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST
  - MODULE GAPS ARE REPORTED, NOT FORBIDDEN
  - THE AUDIT VIEW LISTS EVERY REQUIREMENT OF THE RELEASE
  - A RUN FOLLOWS THE MODULES' INTERFACES
  - A RUN ENDS WITH THE VALIDATION OF ITS MODULES
  - UC-020
  - UC-023
  - UC-025
  - UC-029
  - UC-030
follows:
  - ARC-003
  - ARC-006
  - ARC-020
uses:
  - MOD-artifacts.parseRequirements
  - MOD-artifacts.parseUseCase
  - MOD-artifacts.parseArchitecture
  - MOD-artifacts.headerTags
  - MOD-artifacts.reviewedId
  - MOD-artifacts.headerModules
  - MOD-artifacts.isCodePath
  - MOD-artifacts.isTestPath
  - MOD-artifacts.kindOfPath
  - MOD-review-core.deriveStatus
  - MOD-review-core.deriveSpecStatus
  - MOD-review-core.parseQueueIndex
  - MOD-review-core.sectionForEntry
provides:
  - linkGraph
  - tracesTo
  - coverageGaps
  - moduleRows
  - requirementImpact
  - architectureImpact
  - moduleOrder
  - auditRows
  - auditMarkdown
  - componentDiagram
  - moduleHeaders
---
# MOD-traceability The link graph of one commit and every derived view

## Responsibility

Kernel. The traceability of ARC-006: one graph of the names every artifact states, built from the files
of one pinned commit, and every view that is a function of it — what traces to a requirement, the
coverage and module gaps, the impact list of a requirement change and of an architecture change, the
order in which a run implements modules, the validation that ends a run, the audit rows of a release and
their Markdown export, and the component diagram. Each artifact's status in a view comes from the
approval engine. It reads nothing itself: the caller gives it the files of one commit and, for the audit,
the outcomes of the release commit. Gaps are lists; nothing here blocks.

## Interfaces

- `linkGraph(snapshot) -> graph` — nodes by identifier (requirements from the SPEC and the open queues, use cases, decisions, modules, code files, tests) and one edge per stated name; a name without a node is kept as unknown, marked withdrawn where it was.
- `tracesTo(graph, name) -> { sources, useCases, decisions, modules, tests, proposals }` — everything that names one requirement, and the open queue entries that would change it, at the version the graph was built from.
- `coverageGaps(graph) -> { unrealised, realisingNothing, unknownNames, untested }` — the lists of UC-020 step 7; they block nothing.
- `moduleRows(graph, selection?) -> { rows, gaps }` — per module what it realises and follows (with status), its code files and tests, and every gap of UC-025 step 4; with a selection, the validation that ends a run.
- `requirementImpact(graph, name) -> [artifact]` — every artifact that names a requirement, shown beside a proposal that changes it.
- `architectureImpact({ before, after, graph }) -> { affected, removedInterfaces, alteredInterfaces, names }` — modules following the decision or using a changed interface (those that use a removed one first, marked *breaks*), their code and tests, and the names before and after.
- `moduleOrder(graph, selection) -> { layers } | { cycle }` — the selected modules ordered by their `uses`, independent ones in one layer; a cycle is refused and its modules named.
- `auditRows(graph, outcomes, release) -> { summary, rows }` — one row per requirement valid at the release, with its sources, tests by level with outcome or rate and counter-proof, and the acceptance of the report; gaps included.
- `auditMarkdown(audit) -> string` — the self-contained export naming tag, commit, source versions with hashes and the blob SHAs of report and approvals.
- `componentDiagram(graph) -> mermaid` — one box per module, one arrow per used interface; an interface no module provides is drawn dashed and marked missing.
- `moduleHeaders({ paths, read }) -> [{ path, modules, test }]` — every code file and test among `paths` whose `Module:` lines name a module, by path, with whether it is a test; `read(path)` is a port; what a caller that keeps no texts gives `linkGraph` as its headers.

## Testing

Unit tests over fixture products (`tests/fixtures/architecture/` and small graphs built in the test):
each view against an expected list written in the test, with a counter-proof per rule (a removed
interface not marked *breaks*, a cycle not refused, a requirement without test left out of the audit).
The component diagram is parsed by Mermaid in the test. No seams beyond the snapshot passed in; no model.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; revised on 2026-10-01 by Claude (claude-opus-5-5) against commit d0e5631081876203e719a2508d673d904e7768db — the leaner architecture of the architecture review, as the PO approved it (UC-023): the run order taken over from the run engine, the header format given to MOD-artifacts; revised on 2026-10-03 by Claude (claude-opus-5-5) against commit 230662f4a7d0fe40cae0b00b8973d1d752eb609f — ITM-138, akmaier's option A: the names other modules use are provided and used as the code has them; open until accepted.*
