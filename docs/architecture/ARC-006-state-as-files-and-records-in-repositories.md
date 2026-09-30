---
id: ARC-006
title: All state is Markdown files and records in repositories; every status is derived; test results on the branch test-results
forced_by:
  - ARTIFACTS ARE MARKDOWN
  - STATUS IS DERIVED FROM THE RECORDS
  - A RECORD IS EVIDENCE, NOT A PROPOSAL
  - PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
  - THE TRACEABILITY MATRIX IS DERIVED
  - A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
  - TEST RESULTS ARE KEPT IN THE REPOSITORY
  - A RESULT RECORD IS NEVER REWRITTEN
  - A PRODUCT'S SETTINGS LIVE IN ITS REPOSITORY
  - THE PRODUCT REPOSITORY IS SELF-SUFFICIENT
  - THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING
  - ONE REVIEW LAYOUT FOR EVERY PRODUCT
---
# ARC-006 All state is files and records in repositories; every status is derived

## Context

With no server and no database (ARC-001), there are three places state can live: the repositories,
the issue trackers of their servers, and one browser. The SPEC forbids stored status
(`STATUS IS DERIVED FROM THE RECORDS`, `PROGRESS AND JOB STATE ARE DERIVED, NOT STORED`,
`THE TRACEABILITY MATRIX IS DERIVED`) and requires records that are written once
(`A RECORD IS EVIDENCE, NOT A PROPOSAL`, `A RESULT RECORD IS NEVER REWRITTEN`). The product
repository must stay readable without Agent M.

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
| `docs/groups/<kind>.md` | hierarchies (ARC-020, MOD-groups) | a person, committed directly |
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
the product list and the identifiers of mails marked *not an issue*.

**Derived, never stored:** review status, SPEC entry status, traceability, gaps, impact lists,
progress, job states, flaky tests, audit views. Each is a pure function over the files of one
pinned commit (plus, for live job state, what the runtimes report).

**The test results branch** is append-only: each run adds new files in one commit on top of the
branch head, with `force: false`; no commit there changes or deletes an existing file. It has no
CI trigger, and records on it never touch the default branch.

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

## Consequences

- Reading a product means reading many small files; the dashboard reads one pinned tree and fetches
  files in parallel, as now. Large products may need a cache per commit in memory; nothing is
  cached across page loads except what the browser caches by itself.
- Every record commit is a commit; job records are excluded from CI triggers
  (`A JOB RECORD STARTS NO CI RUN`, ARC-015) and the run engine's workflow is the only workflow
  that reacts to them (ARC-010).
- Protection of records against rewriting is a check over git history (a test reads the branch and
  fails on any modified or deleted record), not a property of the server; branch protection can
  enforce it where the host offers it.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; open until accepted.*
