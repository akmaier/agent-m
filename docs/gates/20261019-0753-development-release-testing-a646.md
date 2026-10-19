---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - e092b1ee49dbb8da3ea2d2e15f2fa48b3242c7e8
  - https://github.com/akmaier/agent-m/pull/977
date: 2026-10-19 07:53 UTC
---
# Development → Release testing: ITM-646, the frame's check finds every topic a view names

**REGISTER**

## Reason

ITM-646 (MOD-site-frame), pull request #977 into `sprint/team1/93`, passes on `e092b1ee`. It replaces #926, which was
rejected twice: once for the place of its tests (`20261018-1906-…-b646.md`), once for a merge without its trailer
(`20261019-0735-…-e646.md`).

1. **Both commits carry the trailer** `developer-sonnet-d`, with no merge.
2. **The red is `a2975d23`.** It holds tests only, and node (9) fails exactly TST-646004, the check run over this
   repository's `src/`.
3. **The change:**
   - the check is test code, as ruled in 92.md: `tests/site-frame-topics.mjs`, with its tests in a file of their own,
     `tests/site-frame-topics-check.test.mjs`;
   - `src/site-frame/explanations.md` gains the topic `source-selection`, which `src/review-pages/kinds.mjs:32` names;
   - `src/site-frame/index.mjs:5` says where the check stands.
4. **Counter-proof, replayed by me in a clean checkout of the head:**
   - the file passes 4 of 4;
   - with `source-selection` renamed, TST-646004 fails, naming that topic.
5. **Green.** All twenty CI jobs pass, and `git merge-tree --write-tree` merges the head into today's `sprint/team1/93`,
   which holds ITM-980's and ITM-988's topics, without a conflict (tree `9438dedc`).
