---
id: ITM-820
title: A local run of the node tests runs no file of the architecture fixture
level: module
realises:
  - A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS
modules:
  - MOD-trace-graph
  - MOD-approvals
  - MOD-documents
  - MOD-review-pages
  - MOD-site-frame
builds_on:
tests:
  - unit
origin:
  - ITM-702's gate on pull request #746 (docs/gates/20261017-1911-development-release-testing-8943.md), and sprint team2/76's review
---
# ITM-820 A local run of the node tests runs no file of the architecture fixture

**REGISTER**

## Outcome

`node --test tests/` runs every `*.test.js` below `tests/`, so it also runs
`tests/fixtures/architecture/tests/reader.test.js`, which is a fixture product's file and not a test of Agent M. CI picks
its files by list and does not run it. The fixture's file keeps its contents and stops being matched as a test of this
repository, in the way ITM-702 took for the groups fixture: it is kept under another name, and its readers build it.

Its readers load the whole fixture, so each sees the file. Each is changed only by the module whose file names it as taken
over:
- MOD-trace-graph: `tests/test_coverage_report.py`, `tests/test_impact_list.py`, `tests/test_matrix_derived.py`,
  `tests/test_references.py`;
- MOD-approvals: `tests/architecture.test.mjs`, `tests/review-page-core.test.mjs`;
- MOD-documents: `tests/architecture-format.test.mjs`;
- MOD-review-pages: `tests/review-core.d/dashboard-writes.test.mjs`;
- MOD-site-frame: `tests/load-per-view.test.mjs`, `tests/review-page.test.mjs`.

The list is read again at the start, by every name a harness loads the fixture under.

## Acceptance

- `node --test tests/` runs no file below `tests/fixtures/architecture/`, and every reader finds the fixture as before.
- It is declared as refactoring: CI is green on every commit.
