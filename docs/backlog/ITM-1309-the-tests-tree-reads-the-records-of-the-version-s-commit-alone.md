---
id: ITM-1309
title: The tests tree reads the records of the version's commit alone
level: module
realises:
  - UC-029
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
modules:
  - MOD-trace-pages
builds_on:
  - ITM-1276
tests:
  - component
origin:
  - developer-sonnet-j's point on ITM-1276 (PR #1429), and po-opus-c's gate, docs/gates/20261029-1015-development-release-testing-7dc6.md
  - akmaier, 2026-10-28: "It is unlikely that a user needs all records at once." Then: "Please follow up. I want all pages fixed this way."
---
# ITM-1309 The tests tree reads the records of the version's commit alone

**REGISTER**

## Outcome

The tests tree of the trace pages shows each test's outcome on the commit of the version shown (`outcomesOf`,
`src/trace-pages/tests.mjs:43-54`). To do that it reads the whole tree of the branch `test-results`
(`host.readSnapshot(RESULTS_BRANCH)`, `:48`) and hands it to `resultsAt`, which needs only the records under
`runs/<commit>/`.

After the change, the tests tree reads `test-results` through a snapshot narrowed to `runs/<commit>` (MOD-repository-hosts'
`readSnapshot` with `folders`), as the route `runs` already does (`src/test-pages/runs.mjs:353`) and as a test's history
does since ITM-1276. MOD-trace-pages' text names what is read, the result records on `test-results`
(MOD-trace-pages.md:150-151), and not how. So the text does not change.

Design principles (AGENTS.md §2 *Designing*): §2.2 — ITM-1266's one way of reading part of a commit is reused; akmaier —
what is read is what the page shows.

## Acceptance

Tests written first, each red on the commit that holds only them:

- A component test of MOD-trace-pages, over the harness of `tests/trace-pages-harness.mjs` with records of several
  commits: the tests tree shows the outcomes on the version's commit, as `trace-pages-test-detail` expects them. It reads
  one snapshot of `test-results`, narrowed to `runs/<commit>`, and no whole tree. Counter-proof: a record of another
  commit is not read.
- The first commit holds only the tests, and CI is red on it.
- **The functions it needs are named in MOD-trace-pages' Uses:** `MOD-repository-hosts.readSnapshot`
  (MOD-trace-pages.md:19), and `MOD-result-records.resultsAt`.
- **A changed expectation of the module's own tests, in the tests-only commit:**
  `tests/trace-pages-test-history-newest.test.mjs`, TST-1276004, asserts that the whole tree of the branch is read once,
  "for the outcomes of the tests tree". It becomes none.
- Tests of other modules this Outcome changes: none known; to be named before selection.
- It removes no test.
