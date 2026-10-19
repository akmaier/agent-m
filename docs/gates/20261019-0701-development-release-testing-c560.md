---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - b6d4c9df4d3d4fa7df046f29a1d46cab9f3e5897
  - https://github.com/akmaier/agent-m/pull/963
date: 2026-10-19 07:01 UTC
---
# Development → Release testing: ITM-560 S13, the bar names the limit of correction rounds before the first round

**REGISTER**

## Reason

ITM-560's first pull request, S13 (MOD-prompt-bar), #963 into `sprint/team1/93`, passes on `b6d4c9df`.

1. **The participant trailer is present** on both commits: `developer-sonnet-c`.
2. **The red is `056faf3e`.** It holds tests only, and run 39212071701 fails exactly TST-560001 and 560002.
3. **The change** is one line of `src/prompt-bar/bar.mjs`'s *Send*.
   - With the destinations, before the exchange, the bar says "The correction loop runs at most `<limit>` rounds."
   - `limit` is `prepared.limit` (`src/job-runner/prepare.mjs:137`), which is what UC-019 step 7 asks: "fixed before
     the first round and named in the conversation".
   - No request is added.
4. **Counter-proof, replayed by me in a clean checkout of the head:**
   - `tests/prompt-bar.test.mjs` passes 16 of 16;
   - with the line emptied, TST-560001 and 560002 fail.
5. **Green.** All twenty CI jobs pass, and `git merge-tree --write-tree` merges the head into `sprint/team1/93` without a
   conflict (tree `73fbe462`).
6. **TST-418125** (`release-uc-019-change-requirements-by-prompt.test.mjs:584`) now passes as a todo. Its mark is removed
   after this merge by a participant who builds none of ITM-560 (93.md).
