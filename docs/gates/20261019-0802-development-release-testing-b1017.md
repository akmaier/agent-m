---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 6341251b6f276f55d165880ded58378e8cea64bd
  - https://github.com/akmaier/agent-m/pull/982
date: 2026-10-19 08:02 UTC
---
# Development → Release testing: ITM-1017, rejected — a hand-kept list of the files not yet fixed

**REGISTER**

## Reason

ITM-1017 (MOD-test-document), pull request #982 into `sprint/team1/93`, is rejected on `6341251b`.

**What holds.**
- Both commits carry the trailer `developer-sonnet-d`, with no merge. The red is `6aea0204` (run 39219440410), exactly
  TST-1017001.
- The 84 headers name a module, and the cases' `module:` lines stand, as ruled.
- **The basis is accepted,** and it refines the ruling in 93.md. Where a module file's Parts name the test as taken over,
  that module is the header's, since the accepted architecture says so. Otherwise the module whose interface the file
  drives, as its first import shows. Where two module files name one test, the PR's choice stands, named in its table.
- The check uses the engine `test_coverage_report` uses, and its known positive (`MOD-ghost`) is listed.

**What fails: `RELEASE_LEVEL_OPEN`, a hand-kept list of 29 files the check skips** (`tests/trace-graph-module-rows.test.mjs:300`).
- It is the kind of list that ITM-947 removed. It must be kept by hand as the files change.
- It is no part of the item's Acceptance: every test names a module.

**What passes on the next head:**
- The 29 files' headers are fixed in a commit of their own, on the item's branch, by a participant who builds none of
  ITM-1017: developer-sonnet-b or developer-sonnet-c, whichever is free first.
- The check holds no list but `tests/fixtures/`, which holds other products' files.
