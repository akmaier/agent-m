---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 5c74878133725d1d10d3e23b536aa94cf2b6f6a9
  - https://github.com/akmaier/agent-m/pull/1315
date: 2026-10-22 23:32 UTC
---
# Development → Release testing: ITM-616, the check backlog-checks

**REGISTER**

## Reason

ITM-616, pull request #1315 into `sprint/team2/105`, passes on `5c748781`. CI is green on 28 of 28. node (8), job
120145268434, ran from 23:19:58 to 23:20:46 UTC, 48 s. The jobs API showed it `in_progress` at 23:31, a status it had not
updated yet.

1. **Red first, from the full job log.** The tests-only commit `fc33a75e` fails TST-616001 to 011, `not ok 419` to
   `429`, with `# fail 11`.
2. **What is built.** `backlogFindings` already existed (ITM-688, `ab62a267`). h built only the missing check
   `backlog-checks`: `src/work-plans/strategies.mjs:235`, registered at :327. That is MOD-work-plans.md:270, at the
   accepted blob `42e17145`.
3. **The item's "not ready" note: its three readings hold.**
   - Every function the check calls is in MOD-work-plans' Uses: `readDocument`, `artifactSchemas`, `finding` and
     `Snapshot`.
   - The tests of `workStrategies` are named, and none pins the checks' keys.
   - The path it reads, `context.product.snapshot`, is what MOD-job-runner's `JobContext` hands every check
     (`src/job-runner/index.mjs:44`), as `plan-checks` reads it.
4. **h's six readings** follow `plan-checks` and the kind's answer schema (`propose-items/answer.schema.json`), and lie
   within :270 and UC-032 step 3:
   - identifiers after the highest;
   - `buildsOn` by identifier or title;
   - the existing items and the module files of the job's snapshot;
   - only the drafted items' findings;
   - a draft without items gives none.
5. **Scope.** `strategies.mjs` and one new unit test file. No registration changes.

## Noted

- `propose-items` still stops at the recipe `backlog-inputs` until ITM-615, and saves nothing until ITM-617.
- `MOD-work-plans.md:112` still says `backlogFindings` is "not built yet". A draft for akmaier corrects that accepted
  text.
