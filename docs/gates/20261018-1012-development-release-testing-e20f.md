---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 24d1702c23c0c6eac3db35e91ba14914f035e628
  - https://github.com/akmaier/agent-m/pull/880
date: 2026-10-18 10:12 UTC
---
# Development → Release testing: ITM-912, The Bridge app's installed packages are ignored by git

**REGISTER**

## Reason

ITM-912 (MOD-bridge-build, unit). Its pull request #880 into `sprint/team2/90` passes on `24d1702c`.
- The first commit `5348f7ab` holds only `tests/bridge-build-installed-packages-ignored.test.mjs`. CI run 39118074557
  is red on it (node (5)). CI run 39118149030 is green on the head.
- The branch came from `614aa418`. The merge with the sprint head `34b75c2c` is clean, and I ran the set below on it.
- Changed: `.gitignore` (a blank line, a comment and `/src/bridge-build/node_modules/`) and the new test, whose header
  names `Module: MOD-bridge-build` and `Level: unit`. The item's Acceptance names exactly these two files.
- The known positive: TST-912001 finds `/node_modules/` for `node_modules/x`. TST-912003: `package.json` and
  `package-lock.json` of `src/bridge-build/` are not ignored, and both stay tracked.
- `--no-index` asks the rule alone, so the answer is the same whether or not CI's checkout has the folder or tracks a
  path in it.
- Counter-proof replayed: without the line, TST-912002 fails ("src/bridge-build/node_modules/x is not ignored"); TST-912001
  and 912003 stay green.
- The comment in `.gitignore` says what the rule ignores and how it is installed. It holds no history (AGENTS.md §1).
- With LC_ALL=C: the new test 3 of 3, `tests/release-sprint-02-d-traceability.test.mjs` 8 of 8,
  `tests/test_products_folder.py` 7 passed.
