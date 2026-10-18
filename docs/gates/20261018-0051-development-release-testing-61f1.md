---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - e422eb43971328b4c264804e2c3afe456875fb7f
  - https://github.com/akmaier/agent-m/pull/825
date: 2026-10-18 00:51 UTC
---
# Development → Release testing: ITM-762, the user-level checklist of a release candidate

**REGISTER**

## Reason

ITM-762, pull request #825 into `sprint/team2/84`, at head `e422eb43`. It changes `src/test-pages/runs.mjs` and adds
`tests/test-pages-user-checklist.test.mjs` (TST-762001 to 006).

- **Red, then code.** The tests-only commit `8ce710ec` was red on node (6), with exactly the six new tests failing. Run
  39084019038 on the head passed all twelve jobs.
- **Expected results unchanged.** The one later change to a test, in TST-762001, replaces `assert.equal(…, undefined)`
  with `assert.ok(!…)` on a node-or-undefined. It asserts the same thing.
- **Faults replayed.** Five planted faults were replayed in the PO's own checkout of the head: TST-762003 (participant
  and occasion), TST-762001, TST-762002 and TST-762005. Each failed exactly its test.
- **Agreement 83.** On the head, with the Bridge packages installed as CI does: release-itm-289-pending-report 1/1,
  release-uc-013-release-version 2/2, system-uc-013-release-version 8/8, release-sprint-02-d-traceability 8/8.
- **Readings accepted.**
  - A candidate is a tag `v<version>-rc.<N>`.
  - Under the book's default, the checklist reads "No one assigned".
  - A failed outcome records its Observed text and the Log "entered by hand". The schema requires both.
  - `|` is written as `/`.
  - No retry on Exists/Moved: each press re-reads the head and makes a new path. Moved is untested.
- **For akmaier.** The Uses gap: readDocument, isTestFile, commitFiles.
