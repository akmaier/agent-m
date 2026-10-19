---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 55332e07777277dc19d646cbd3047b8082c394fd
  - https://github.com/akmaier/agent-m/pull/1081
date: 2026-10-19 14:45 UTC
---
# Development → Release testing: ITM-761, Run on this commit

**REGISTER**

## Reason

ITM-761, pull request #1081 into `sprint/team2/96`, passes on `55332e07`, after its rejection on `e490f3f9`. CI is green on
the head, on 20 of 20 jobs.

1. **The rejection's point is met.** *Check progress* is gone. While the route is shown, `liveState` is read again every
   5000 ms by one `setTimeout` (`src/test-pages/runs.mjs:37`, `:243-245`). This is the pattern of `readAgainLater` in
   `src/main-page/jobs.mjs`.
   - Once the job has ended, the page is redrawn through `again()`, so the new record shows (UC-028 step 7).
   - It stops when the job ends, or when the progress element is no longer in the page (`:233`), that is, when the route
     was left.
2. **Red first.** `94bb77ee` holds only the tests, and CI failed on it.
   - TST-761005 is rewritten with a fake clock, and TST-761009 and TST-761010 are new.
   - TST-761010 was already green on the base. It guards that the route stops reading once it is left, which held
     before. It is named as such and is not counted as red.
   - There are 5 new counter-proofs.
3. **Scope.** `src/test-pages/runs.mjs`, `index.mjs` and the test. The merge with the sprint branch keeps:
   - the routes `release`, `schedule`, `runs` and `generate`;
   - the strategies `resultStrategies`, `approvalStrategies` and `routeStrategies`.
4. **The readings of the first gate stand.**
