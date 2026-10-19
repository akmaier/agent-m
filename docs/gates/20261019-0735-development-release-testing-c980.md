---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 5de3959b64b80ba5e763ad7cbf7231c7f33f971b
  - https://github.com/akmaier/agent-m/pull/936
date: 2026-10-19 07:35 UTC
---
# Development → Release testing: ITM-980, the explanations of a run and its limits

**REGISTER**

## Reason

ITM-980 (MOD-site-frame), pull request #936 into `sprint/team1/93`, passes on `5de3959b`.

1. **Every commit carries the trailer** `developer-sonnet-b`, its merge of the sprint branch included.
2. **The red is `b504245c`,** run 39165369613, which fails exactly TST-980001 to 980005.
3. **The change** is `src/site-frame/explanations.md` only: the topics `run`, `run-jobs-at-once`, `run-cost-limit` and
   `run-correction-rounds`, from UC-043 step 4. No view names them yet, since the route `run` is not built. The frame's
   own check (ITM-646) will find them named once it is.
4. **Counter-proof, replayed by me in a clean checkout of the head:**
   - `tests/site-frame-run-explanations.test.mjs` passes 6 of 6;
   - with `run-cost-limit` renamed, two of its tests fail.
5. **Green.** CI run 39211732387 passes all twenty jobs, and `git merge-tree --write-tree` merges the head into today's
   `sprint/team1/93` without a conflict (tree `76442520`).
