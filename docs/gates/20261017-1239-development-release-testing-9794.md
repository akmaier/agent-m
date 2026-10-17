---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - a82d400589871b08dceb7b72243c132d5c9a06f4
  - https://github.com/akmaier/agent-m/pull/727
date: 2026-10-17 12:39 UTC
---
# Development → Release testing: ITM-707, the dashboard's release tests reach the app through the harness

**REGISTER**

## Reason

ITM-707, pull request #727, at head `a82d4005`. Following the order in `docs/backlog/sprints/team1/72.md`, it is based on
`item/ITM-574-batched-page-load` and was merged into that branch as `cb51c796`, whose tree equals `a82d4005`'s. CI run
39032894461 on the head passed ten of ten.

**The outcome is met.**
- The three release files import `APP_FILE` from `tests/app-harness.mjs`: release-sprint-02-a at :31 (used at :490 and
  :531), and release-uc-003 at :13 (used at :55).
- release-sprint-01's `writesOf` leaves out the batch `POST …/graphql`. The expected `[]` stays.
- No local copy of the app's location remains. `git diff 1af0d28d -- tests/app-harness.mjs` is empty, so ITM-707 does
  not change the harness.
- No expected value changed.

**Whole files** (sprint 70's agreement), read from the coordinator's saved logs:

| File | `c7eb36b1` alone | the merge `cb51c796` |
|---|---|---|
| release-sprint-01 | 32 pass, 2 fail, 2 todo | 34 pass, 2 todo |
| release-sprint-02-a | stops after 2, both fail | 17 pass, 2 todo |
| release-uc-003 | 5 pass, 1 fail | 6 of 6 |

ITM-018 passes 8 of 8.

**Written by a participant who builds none of ITM-574** (sprint 68's agreement). This time the developer read in full,
as files: AGENTS.md, SPEC.md, chapters 9, 11, 12 and 13, and the five module files. The earlier lapse was sent to the
feedback.

**Not redone on `a82d4005`:** the five planted faults. The last commit replaces two local constants with an import of the
same value, and no assertion changed, so the earlier counter-proofs still hold. They are not asked again.

**What follows in ITM-574.** The headers of release-sprint-01 and release-sprint-02-a still name `MOD-dashboard-app`,
which has no module file. They are moved into MOD-site-frame in ITM-574's rework
(`docs/gates/20261017-1239-development-release-testing-eb82.md`), by a participant who builds none of ITM-574.
