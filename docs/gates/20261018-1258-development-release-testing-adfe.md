---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 16c7cb30782664a50a4299cdca442433a0fea36b
  - https://github.com/akmaier/agent-m/pull/894
date: 2026-10-18 12:58 UTC
---
# Development → Release testing: ITM-913, statuses gives the status of a release test report, reworked

**REGISTER**

## Reason

ITM-913, pull request #894 into `sprint/team2/92`, was reworked on the condition of the first rejection
(`369fb54d`). It passes on `16c7cb30`. I checked it in a clone of my own.

**The condition holds.** MOD-approvals' own uses of `statuses` stay correct for a release test report:
- `acceptanceBlockers` (`src/approvals/accept.mjs:45-46`) does not read a report and gives `[]`.
- `architecture-ready` and `rests-on-accepted` with `architecture: true` (`src/approvals/strategies.mjs:154, :178`)
  count only the kinds `architecture-decision` and `module`. The third caller had the same fault, and it is fixed too.
- The new tests TST-913003 to TST-913005 (`tests/approvals-release-report-callers.test.mjs`) name MOD-approvals. Each
  has a known positive: a use case with an unaccepted requirement, and the module file MOD-sample.

**Red first.** The rework's tests-only commit `4843fb4b` is red in CI run 39129067723. Its fixture misnamed the use
case's record, which `766247b0` corrected, also in tests only. The CI run on that commit is missing, so I replayed it:
with `src/approvals/` of `b83dcd07` and the head's tests, all three of TST-913003 to TST-913005 fail. With the head's
sources, they and TST-913001 and TST-913002 pass, 5 of 5.

**What holds besides.**
- CI run 39129094760 is green on the head, on 12 of 12 jobs.
- Only `src/approvals/` and two new test files naming MOD-approvals changed.
- On the merge with the sprint head `4303c583`, which holds #895 and #896, with the Bridge packages and LC_ALL=C, I ran
  every release test file and the tests of MOD-approvals, MOD-review-pages, MOD-progress-measures and MOD-trace-pages:
  958 tests, 949 pass, 1 skipped, 7 todo, and 1 fails. The failure is the known TST-320321902.
- On that merge, ITM-910's `reviewedFiles` lists each report once, from `statuses`.
