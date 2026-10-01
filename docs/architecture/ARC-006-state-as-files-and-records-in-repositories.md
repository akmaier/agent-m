---
id: ARC-006
title: All state is Markdown files and records in repositories; every status, traceability view, gap, impact list and audit view is derived from the files of one pinned commit; test results on the branch test-results
forced_by:
  - ARTIFACTS ARE MARKDOWN
  - STATUS IS DERIVED FROM THE RECORDS
  - A RECORD IS EVIDENCE, NOT A PROPOSAL
  - PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
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
  - A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
  - TEST RESULTS ARE KEPT IN THE REPOSITORY
  - A RESULT RECORD IS NEVER REWRITTEN
  - A PRODUCT'S SETTINGS LIVE IN ITS REPOSITORY
  - THE PRODUCT REPOSITORY IS SELF-SUFFICIENT
  - THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING
  - ONE REVIEW LAYOUT FOR EVERY PRODUCT
  - UC-020
  - UC-023
  - UC-025
  - UC-030
---
# ARC-006 All state is files and records in repositories; every status and view is derived

## Context

With no server and no database (ARC-001), there are three places state can live: the repositories,
the issue trackers of their servers, and one browser. The SPEC forbids stored status
(`STATUS IS DERIVED FROM THE RECORDS`, `PROGRESS AND JOB STATE ARE DERIVED, NOT STORED`,
`THE TRACEABILITY MATRIX IS DERIVED`) and requires records that are written once
(`A RECORD IS EVIDENCE, NOT A PROPOSAL`, `A RESULT RECORD IS NEVER REWRITTEN`). The product
repository must stay readable without Agent M.

Each artifact names what it descends from: a use case its requirements, a decision what forces it, a
module what it realises and follows, a code file its module, a test its requirement and module
(`EVERY ARTIFACT NAMES ITS ORIGIN`). From these links the dashboard shows what traces to a requirement,
the gaps, the impact of a change, the validation of modules and the audit view of a release — all
derived, never stored. The current core already derives parts of this: `parseArchitecture`,
`specRequirements`, `architecturePrerequisites`, `moduleHeaders`, `impactList`, `componentDiagram`.

This is the book's repository pattern (ch. 10): tools interact only through a shared store, here
git, which also gives history, authorship and integrity by hash.

## Decision

**Two kinds of file.** *Artifacts* are Markdown the reader reviews: SPEC queue entries, use cases,
architecture decisions, modules, test descriptions, backlog items. *Records* are small Markdown
files written once as evidence: approval records, gate records, job records, test result records,
sprint records. An artifact is open until an approval record names its blob SHA; a record is never
shown for acceptance and never edited.

**Where each lives** (one layout for every product, `ONE REVIEW LAYOUT FOR EVERY PRODUCT`):

| Path (product repository unless noted) | Content | Written by |
|---|---|---|
| `SPEC.md` | accepted requirements | acceptance of a queue entry |
| `docs/spec-freigaben/<date>_<name>/` | change queues | a person's edit, a derivation job |
| `docs/use-cases/UC-<nnn>-<slug>.md` | use cases | a person, a derivation job |
| `docs/architecture/ARC-…`, `MOD-…` | decisions, modules | a person, a derivation job |
| `docs/approvals/` | approval records | the accepting person's click |
| `docs/groups/<kind>.md` | hierarchies (ARC-020) | a person, committed directly |
| `docs/jobs/JOB-<id>.md` | job and run records (ARC-010) | the starting click, then the job |
| `docs/jobs/gates/` | gate records | the gate's decider |
| `docs/settings.md`, `docs/collaborators.md`, `docs/resources.md`, `docs/sources.md` | product settings | a person |
| `docs/process.md` | declared model, roles, Definition of Done, branches | a person (UC-002) |
| `docs/tests/schedule.md` | test schedule (ARC-015) | a person |
| `docs/tests/releases/v<version>.md` | release test reports | the release run |
| `docs/backlog/` | backlog items and sprint records | a person, a sprint-close job |
| branch `test-results`: `results/<commit>/<run>.md` | test result records | a CI step or the bridge (ARC-015) |
| instance: `docs/participants.md`, `docs/sources/`, `docs/process-models/`, `docs/resources.md` | instance-wide data | a person |

**Issues** hold the state of reports from mail (`THE ISSUE IS THE ONLY RECORD OF A MAIL'S
HANDLING`): the `MAIL-` identifiers, labels and reply notes. The browser holds only credentials,
the product list and the identifiers of mails marked *not an issue* (ARC-003, the browser store).

**Derived, never stored:** review status, SPEC entry status, traceability, gaps, impact lists,
progress, job states, flaky tests, audit views. Each is a pure function over the files of one
pinned commit (plus, for live job state, what the runtimes report).

**The test results branch** is append-only: each run adds new files in one commit on top of the
branch head, with `force: false`; no commit there changes or deletes an existing file. It has no
CI trigger, and records on it never touch the default branch.

**Traceability is computed from one pinned commit.**
1. **One link graph per pinned commit.** Nodes are requirements (from the SPEC and the open queues), use
   cases, decisions, modules, code files and tests by identifier; edges are the names each artifact
   states — `realises`, `forced_by`, `follows`, `uses`, the `Module:` header of a code file, the
   `Guards:` and `Module:` headers of a test (ARC-020). An edge whose target does not exist is kept as an
   *unknown name* with the note whether it was withdrawn.
2. **Every view is a function of the graph:** what traces to a requirement; the coverage matrix and gaps
   of UC-020; the module rows and gaps of UC-025; the impact list of a requirement change (every artifact
   naming it) and of an architecture change (modules following a decision or using a changed interface,
   their code and tests, the names before and after); the order in which a run implements modules; the
   audit rows of UC-030, joined with the result records of the release commit; the component diagram as
   Mermaid.
3. **Versions are commits.** A released version is the snapshot at its tag; comparing two versions
   compares two graphs. The history of a requirement is computed from the approval records and the git
   history of the SPEC section, read through the git-host adapter.
4. **Gaps never block.** Gap functions return lists; no write path consults them, except the one
   acceptance rule the SPEC does make blocking: a decision or module is accepted only when everything
   it names is accepted (`ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS`).
5. **Export.** The audit view is rendered as one Markdown document naming tag, commit, source versions
   with hashes and the blob SHAs of report and approvals, so it can be checked without Agent M.

## Alternatives

- **A JSON or SQLite store committed to the repository** — rejected: not reviewable as Markdown,
  merge conflicts on every concurrent write, and a second representation beside the artifacts.
- **Status fields in the artifacts' front matter** — rejected: a stored status drifts from the
  text; editing the text would have to reset it (`STATUS IS DERIVED FROM THE RECORDS`).
- **Test results as CI artifacts or in the default branch** — rejected: CI servers delete logs after
  a retention period; commits to the default branch per run would trigger CI again
  (`TEST RESULTS ARE KEPT IN THE REPOSITORY`).
- **Job state in the browser** — rejected: a job started in another browser or on a bridge that is
  off would be invisible (`A JOB IS RECORDED IN ITS PRODUCT REPOSITORY`).
- **A stored matrix file** — rejected by `THE TRACEABILITY MATRIX IS DERIVED`.
- **Links by section number or file path** — rejected by `A REFERENCE NAMES THE IDENTIFIER, NOT THE
  POSITION`; a renamed file keeps its identifier.
- **Computing traceability in CI and committing the result** — rejected: a committed result is a
  stored matrix with a delay; the browser computes it for the commit it shows.
- **A separate decision for traceability** (ARC-018 until 2026-10-01) — merged here: traceability is
  one of the views derived from the files of one commit, the subject of this decision.

## Consequences

- Reading a product means reading many small files; the dashboard reads one pinned tree, then each view
  reads the files it shows, each kept in the browser by its blob SHA (ARC-003). Nothing derived is kept
  across page loads.
- Every record commit is a commit; job records are excluded from CI triggers
  (`A JOB RECORD STARTS NO CI RUN`, ARC-015) and the run engine's workflow is the only workflow
  that reacts to them (ARC-010).
- Protection of records against rewriting is a check over git history (a test reads the branch and
  fails on any modified or deleted record), not a property of the server; branch protection can
  enforce it where the host offers it.
- The dashboard reads every code and test file's first lines to find their headers; for large products
  this is many requests per commit, read once per commit and kept by blob SHA.
- The quality of the graph depends on the headers: code without a `Module:` line is a gap, not an
  error (`MODULE GAPS ARE REPORTED, NOT FORBIDDEN`).
- The same functions run in a run's final validation step (UC-043) and in the audit export, so the
  dashboard and the exported document cannot disagree.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; revised on 2026-10-01 by Claude (claude-opus-5-5) against commit d0e5631081876203e719a2508d673d904e7768db — the leaner architecture of the architecture review, as the PO approved it (UC-023): ARC-018 merged into this decision; open until accepted.*
