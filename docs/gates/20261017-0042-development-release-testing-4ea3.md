---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 9fcafa871966a54ceb006b1c84090030ff45991d
  - https://github.com/akmaier/agent-m/pull/661
date: 2026-10-17 00:42 UTC
---
# Development → Release testing: ITM-623, The review pages' test harness is a file of its own

**REGISTER**

## Reason

ITM-623, pull request #661 into `sprint/team1/58`, at head `9fcafa87`. developer-sonnet-c wrote it.

1. **No red run, by the item's nature.** It is a refactoring of tests, and its evidence is the golden master. The Scrum
   Master read it, run on Node 22, CI's version. Each of the 21 importing files has the same failures, `todo` and exit
   as on the base, and exactly sixteen fewer tests: the repeated runs.
2. **CI is green on the head**: run 38987378309 passed ten of ten jobs. GitHub reports the pull request mergeable.
3. **The changes stay in the item's scope**: MOD-review-pages' tests and the new helper `tests/review-pages-harness.mjs`.
   - It carries the DOM and `localStorage` globals byte for byte, and `emptyStorage()` for what `kept = new Map()` did.
   - The diff removes no assertion, and no expected value, name or identifier changed.
   - The importers are eleven test files and two helpers, where the item said ten test files. The item's count was the
     Product Owner's slip.
4. **The planted fault is caught.** With `emptyStorage` a no-op, TST-358004, 472683 and 472684 fail.
5. **The Acceptance holds.** No test file imports another for its harness. The UC-019 counter-proof table, ITM-018, the
   UC-008 and UC-018 release and system tests, and the Python checks pass.

**Points judged.**
- **A path in a release test.**
  - `tests/release-uc-019-change-requirements-by-prompt.test.mjs:642` names the helper in place of the test file, in
    the list of files its counter-proof harness copies.
  - That is the harness's setup, not an expected result. Without it, the copy would lack the helper.
  - "No release test changes" in `58.md` meant expected results, and none changes. The file's header names
    MOD-review-pages.
- **`tests/uc-006-batched-reads-harness.mjs` is the item's.** It has no `Module:` line, but its header names its page as
  MOD-review-pages'. Its one change is the import of the moved harness, which the move forces.
  `WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS` covers a helper "whose header names no module", and this one names one.
- **The release level was run locally.** The pull requests into the sprint branch run CI without the release level. The
  sprint's pull request into `main` runs every level, and its Release testing gate reads that run.

**A side effect, noted.** On Node 26, the four UC-019 test files that failed to load on the base, for ITM-566's cycle,
load on the head. The move changed the order of their imports. ITM-566 stays open: its cycle is in the product's
modules, not in the tests.
