---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - dce78987ccaeaf45cd2e703532134be1bf92c6a8
  - https://github.com/akmaier/agent-m/pull/1312
date: 2026-10-22 23:06 UTC
---
# Development → Release testing: ITM-1189, onDispatch takes the endpoint's key from the named secret

**REGISTER**

## Reason

ITM-1189, pull request #1312 into `sprint/team2/104`, passes on `dce78987`. CI is green on 28 of 28. The head merges
#1311's head, so it is merged after #1311.

1. **The change** (`src/workflow-entries/product.mjs`, `compose.mjs`).
   - For a hand-over with `endpoint`, `runHandOver` takes the key from the secret the input `secret` names. It reads
     the name only as an own property of `env.job.keys`, which the workflow's `AGENT_M_KEY_NAMES` lists.
   - So `AGENT_M_TOKEN` and a name like `constructor` are refused.
   - A name the file lacks, or one without a value, ends the run `not run` with "<SECRET> is missing". For a name the
     file lacks, it adds that the job workflow is installed again from Settings, as ITM-1189's Acceptance asks.
2. **Red, from the full job logs.**
   - At `05c27064`, job 120133355150 fails TST-1189001 to 004 (`# fail 4`).
   - Job 120133355058 fails GitLab's `AGENT_M_INPUT_SECRET` case (`not ok 392`).
3. **Counter-proofs: three,** listed in the pull request. The reading is named.

## Found, and registered as ITM-1192

i names one gap, not built (YAGNI). `runHandOver` looks up the record's participant in the instance's list
(`product.mjs`, `runHandOver`), and fails a hand-over whose drafter is not listed.
- Once ITM-1187 is built, a prompt-bar endpoint is never in that list. The SPEC's THE PROMPT BAR'S ENDPOINTS AND CLI
  SESSIONS ARE BOUND AS PARTICIPANTS ARE: "except that it is not listed in the instance's participant list".
- So every hand-over of an endpoint's own job would fail.
- MOD-workflow-entries.md:169-174 says the job runs "with opencode working with the endpoint the input `endpoint` names
  and the key from the CI secret the input `secret` names". It does not say where the run's drafter comes from.
- The gap is in MOD-workflow-entries, not in ITM-1187's MOD-prompt-bar. It is registered as ITM-1192, which stops for a
  draft where the text does not settle what the run needs of the endpoint.
