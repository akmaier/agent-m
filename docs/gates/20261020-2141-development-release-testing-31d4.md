---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - cca3c51e87088095bc716b152bfc8ef5d31f0499
  - https://github.com/akmaier/agent-m/pull/1243
date: 2026-10-20 21:41 UTC
---
# Development → Release testing: ITM-864, an item keeps its newest job, and a step whose job ended as done shows done

**REGISTER**

## Reason

ITM-864, pull request #1243 into `sprint/team2/99`, passes on `cca3c51e`. CI is green on 23 of 23 checks.

1. **Red first, on CI.** The tests-only commit `c328d1c3` was pushed by itself, and node (8) and node (9) failed on its
   new cases:
   - the four of `itemStates`: in progress with the newest job until a pull request opened after its start is merged;
     only such a pull request ends the stay; only `done` keeps it; `job` set in every branch;
   - `buildInProgress` listing a step whose job ended as done with the state `done`.
2. **The accepted text.** `d480c4eb` (MOD-work-plans.md:125-127, :138-140), accepted in `50a5e84d`.
   - The change is in `src/work-plans/states.mjs`.
   - The row of the build is MOD-progress-measures' test.
   - Both are the item's modules.
3. **i's readings follow the text.**
   - "The newest job" is the order `listJobs` gives, which `jobFor` already reads.
   - Only a job ended as `done` keeps an item in progress, as the text says.
   - "Opened after that job's `start`" is strict.
4. **SPEC.md:928-929.** The counter-proof of `THE BUILD IS SHOWN AS IT HAPPENS` ("once the job has ended, the step shows
   done") now holds on the build's row.
5. **Reading.** The description names one passage each of AGENTS.md, SPEC.md and chapters 9, 11, 12 and 13.
   - developer-sonnet-i first read only sections, and read in full on the coordinator's request, before this gate.
   - The brief asks for the reading before the first commit. That is noted in the sprint's review, and not made a
     rejection here, since the text holds against the code read at this gate.
