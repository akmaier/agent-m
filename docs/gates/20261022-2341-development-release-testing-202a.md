---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 5e51e2b03594192296179cd2f084b4758ab890ba
  - https://github.com/akmaier/agent-m/pull/1317
date: 2026-10-22 23:41 UTC
---
# Development → Release testing: ITM-977, a run's next actions, second round

**REGISTER**

## Reason

ITM-977, pull request #1317 into `sprint/team2/105`, passes on `5e51e2b0`. The branch merges `sprint/team2/105` first
(`ff803d0d`). CI is green on 28 of 28 on the rerun of run 39872620544.

1. **The rejection is answered.** `next.mjs` counts every job of the run that has not ended against `jobs at once`, a
   job waiting at a gate among them. `ENDED` holds `done`, `failed`, `cancelled` and `ended without record`, the
   ended states of MOD-job-ledger's `JobState`.
2. **Red first, from the full job log.** The tests-only commit `864e2494` fails in one job, 120150355769, with
   `not ok 373` and `# fail 1`. The case: two jobs wait at a gate, and ITM-007 starts at `jobs at once` 3 and not at
   1 or 2.
3. **The change not asked for: resumptions are no longer capped by free places. Kept, because the text needs it.**
   - MOD-run-planner.md:91-97 says "resume a job whose gate has been decided" with no limit. "As many as `jobs at once`
     allows" binds the starts of `implement`.
   - A job waiting at a gate now holds its place. Resuming it starts no further job, and the count is unchanged.
   - A cap by free places would leave a run whose places are all held by waiting jobs unable to resume any of them, a
     deadlock UC-043 6a ("the others go on") does not allow.
   - So this follows from the first change, and is not a feature beyond the text.
4. **The first round's other findings stand:**
   - only the module changes;
   - 18 counter-proofs;
   - readings 1 to 5 and 7 to 9 are accepted, as recorded in the first gate.

## Noted

- On `5e51e2b0`'s first attempt, node (1), job 120150727285, failed TST-367004 (`tests/desktop-shell-bridge-jobs.test.mjs`),
  which this pull request does not touch. The rerun is green. It is a flaky test under agreement 94, registered as
  ITM-1194.
- A run held by a limit still gets starts until ITM-979.
