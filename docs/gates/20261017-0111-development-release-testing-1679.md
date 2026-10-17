---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - dace5bc386ecef58ca3654dc4fc287616e8d706b
  - https://github.com/akmaier/agent-m/pull/666
date: 2026-10-17 01:11 UTC
---
# Development → Release testing: ITM-629, The UC-019 system tests' harness is a file of its own

**REGISTER**

## Reason

ITM-629, pull request #666 into `sprint/team1/59`, at head `dace5bc3`. developer-sonnet-d wrote it.

1. **No red run, by the item's nature.** It is a refactoring of tests, and its evidence is the golden master. On Node 22
   it is identical on the base and on the head, file by file and test by test.
2. **CI is green on the head**: run 38989549383 passed ten of ten jobs. GitHub reports the pull request mergeable.
3. **The changes stay in the item's scope**, which is tests only:
   - the new helper `tests/uc-019-prompt-bar-harness.mjs`;
   - the two system files and the two release files, which import it.

   The 46 assertion lines the diff removes are the same 46 it adds in the helper. They are moved, not changed. The UC-019
   table gives the same 29 receipts, with the same faults in the same order.
4. **The planted fault in the helper is caught**: TST-377002 fails.
5. **The Acceptance holds.**
   - No test file imports another for its harness.
   - Every test keeps its expected values and runs once per file that declares it.
   - Both `Module:` lines name MOD-prompt-bar.

**The item's premise did not hold, and the pull request says so.** No run was repeated: an argument wrapper already kept
the system file's tests from running again in its importers. With the harness moved, nothing imports that file, so the
wrapper goes. The golden master shows no change.

**Points judged.**
- **TST-377002's path.**
  - The item listed `REQUIREMENTS` (`:36`) as "evidence that stays". TST-377002 also reads the harness's text through
    it, and three of the strings it asserts now stand in the helper.
  - So the developer pointed that read at the helper, with `HARNESS`, and left the assertions unchanged.
  - The hit was named, so carrying on was right. The item's account of what the line does was incomplete, which is the
    Product Owner's slip. Under sprint 58's agreement a named hit is no stop.
- **`Level: system`** for this helper and `unit` for ITM-623's both follow the level of the tests that use each helper.
  ITM-018 and `test_test_levels` pass for both.
- **The six modules of the helper's `Module:` line**: MOD-review-pages, MOD-prompt-bar, MOD-trace-pages,
  MOD-site-frame, MOD-job-runner and MOD-runtimes. They are those whose code the harness composes, the real frame, bar,
  pages and runner. Taken.
