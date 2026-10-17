---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 5990f8326827baecad821ab564253099c9906ffa
  - https://github.com/akmaier/agent-m/pull/814
date: 2026-10-17 23:28 UTC
---
# Development → Release testing: ITM-781, a sprint without a time box is ended

**REGISTER**

## Reason

ITM-781, pull request #814 into `sprint/team2/83`, at head `5990f832`. It adds MOD-work-plans' `endSprint`.

**The five checks.**
- **Red first.** The tests-only commit `647b728c` was red in run 39078631356, failing only the new file.
- **Green.** Run 39078793941 passed 12/12.
- **Scope.** Three files: `src/work-plans/saves.mjs`, `src/work-plans/index.mjs`, and the new
  `tests/work-plans-end-sprint.test.mjs` (MOD-work-plans).
- **Counter-proofs.** TST-481781 and TST-481782 name UC-032, A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT and ONE
  CLICK PER DECISION. All three planted faults were replayed and each is caught.
- **Acceptance.** `## Ended` with the day is appended in one commit at the head that was read. `NotEndable` is thrown,
  and nothing is written, for a time box and for an existing `## Ended`.

**Release tests on the head, with the Bridge packages installed as CI does.** These all pass: release-itm-268,
release-itm-269, release-uc-003 (both files), release-itm-290 (both files), release-uc-019 (both files, 2 todo) and
release-uc-011. release-itm-276 is skipped: it needs xvfb and runs only on Linux CI.

**Readings.**
- **"The day of `now`" is read as UTC: accepted.** It is the same reading as `progressIn`.
- **An unknown sprint name: no error is asked for** by MOD-work-plans.md. **Finding:** for a name without a record,
  `endSprint` commits a new file that holds only `## Ended`. This is a question for akmaier at the review: should there
  be a `NotFound` as closeSprint has?
