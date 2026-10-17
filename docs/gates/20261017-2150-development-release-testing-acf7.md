---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: rejected
on:
  - fde029ad88243a8298c9bd3be94c92d86a64c140
  - https://github.com/akmaier/agent-m/pull/788
date: 2026-10-17 21:50 UTC
---
# Development → Release testing: ITM-745, the committed configuration against the schedule

**REGISTER**

## Reason

This is ITM-745, pull request #788 into `sprint/team2/79`, at head `fde029ad`. It is the first rejection.

**Checks 1 to 4 hold.**
- The tests-only commit `e4e43245` was red. Its CI node (0) failed on the missing export `configurationDrift`. CI is
  green on the head.
- Only `src/test-schedule/generate.mjs`, `src/test-schedule/index.mjs` and the new test
  `tests/test-schedule-configuration-drift.test.mjs` changed. That test's header names MOD-test-schedule and its
  requirements.
- Four faults were planted in the head, and each was caught:
  - compared text altered;
  - include check off;
  - `schedule` trigger dropped;
  - line loop cut to one.

**Check 5 does not hold.** The Acceptance says "The files ciConfiguration generates give no difference", and that fails
for a real schedule. `configurationDrift` generates with empty resources and participants. In a replay on the head:
- Files generated with a resource that names a paid secret (`ci:ORACLE_KEY`) were left unedited. They give 166
  differences on GitHub and 89 on GitLab. These are false drifts.
- A schedule whose `runs on` names a participant with a runner route makes `configurationDrift` throw
  `InvalidSchedule`. `ciConfiguration` accepts the same schedule with those participants.

The signature in MOD-test-schedule has no resources and no participants, but the module's Files section reads both. If a
rework cannot avoid this without them, the signature is a question for akmaier.

**Noted for the rework and the review, not conditions:**
- Rows of a foreign workflow are the schedule's rows on its triggers' occasions, not rows read from the workflow.
- A foreign GitLab pipeline is checked only for the include entry.
- A missing `.gitlab-ci.yml` gives no difference, although the Data has the file created where the product has none.
- One inserted line gives 499 differences: every line after it shifts.
