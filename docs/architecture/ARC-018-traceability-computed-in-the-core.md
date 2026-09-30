---
id: ARC-018
title: Traceability, gaps, impact lists and the audit view are computed in the core from the artifacts of one pinned commit
forced_by:
  - THE TRACEABILITY MATRIX IS DERIVED
  - EVERY ARTIFACT NAMES ITS ORIGIN
  - A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION
  - A REQUIREMENT SHOWS WHAT TRACES TO IT
  - UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN
  - MODULE GAPS ARE REPORTED, NOT FORBIDDEN
  - A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST
  - AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST
  - ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS
  - THE AUDIT VIEW LISTS EVERY REQUIREMENT OF THE RELEASE
  - THE BROWSER SHOWS ANY RELEASED VERSION
  - A RUN ENDS WITH THE VALIDATION OF ITS MODULES
  - UC-020
  - UC-023
  - UC-025
  - UC-030
---
# ARC-018 Traceability is computed in the core

## Context

Each artifact names what it descends from: a use case its requirements, a decision what forces it, a
module what it realises and follows, a code file its module, a test its requirement and module
(`EVERY ARTIFACT NAMES ITS ORIGIN`). From these links the dashboard shows what traces to a
requirement, the gaps, the impact of a change, the validation of modules and the audit view of a
release — all derived, never stored (`THE TRACEABILITY MATRIX IS DERIVED`). The current core already
derives parts of this: `parseArchitecture`, `specRequirements`, `architecturePrerequisites`,
`moduleHeaders`, `impactList`, `componentDiagram`.

## Decision

1. **One link graph per pinned commit.** `MOD-traceability` builds a graph from a snapshot: nodes are
   requirements (from the SPEC and the open queues), use cases, decisions, modules, code files and tests
   by identifier; edges are the names each artifact states — `realises`, `forced_by`, `follows`, `uses`,
   the `Module:` header of a code file, the `Guards:` and `Module:` headers of a test (ARC-020). An edge
   whose target does not exist is kept as an *unknown name* with the note whether it was withdrawn.
2. **Every view is a function of the graph:** what traces to a requirement; the coverage matrix and
   gaps of UC-020; the module rows and gaps of UC-025; the impact list of a requirement change (every
   artifact naming it) and of an architecture change (modules following a decision or using a changed
   interface, their code and tests, the names before and after); the audit rows of UC-030, joined with
   the result records of the release commit; the component diagram as Mermaid.
3. **Versions are commits.** A released version is the snapshot at its tag; comparing two versions
   compares two graphs. The history of a requirement is computed from the approval records and the
   git history of the SPEC section, read through the git-host adapter.
4. **Gaps never block.** Gap functions return lists; no write path consults them, except the one
   acceptance rule the SPEC does make blocking: a decision or module is accepted only when everything
   it names is accepted (`ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS`).
5. **Export.** The audit view is rendered as one Markdown document naming tag, commit, source
   versions with hashes and the blob SHAs of report and approvals, so it can be checked without Agent M.

## Alternatives

- **A stored matrix file** — rejected by `THE TRACEABILITY MATRIX IS DERIVED`.
- **Links by section number or file path** — rejected by `A REFERENCE NAMES THE IDENTIFIER, NOT THE
  POSITION`; a renamed file keeps its identifier.
- **Computing traceability in CI and committing the result** — rejected: a committed result is a
  stored matrix with a delay; the browser computes it for the commit it shows.

## Consequences

- The dashboard reads every code and test file's first lines to find their headers; for large
  products this is many requests per commit. The graph is kept in memory per commit for the page's
  lifetime, as `headersAt` does today.
- The quality of the graph depends on the headers: code without a `Module:` line is a gap, not an
  error (`MODULE GAPS ARE REPORTED, NOT FORBIDDEN`).
- The same functions run in a run's final validation step (UC-043) and in the audit export, so the
  dashboard and the exported document cannot disagree.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; open until accepted.*
