---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 866f4dc8b342af57e444af295f663da2e2059a2b
  - https://github.com/akmaier/agent-m/pull/821
date: 2026-10-18 00:24 UTC
---
# Development → Release testing: ITM-856, the chosen product says whether a token is stored

**REGISTER**

## Reason

ITM-856, pull request #821 into `sprint/team1/81`, at head `866f4dc8`. Run 39082448033 passed all twelve jobs. It changes
`src/site-frame/routing.mjs`, `src/main-page/home.mjs` and `jobs.mjs`, and four test files, +141/−7.

**Red, then code.** The tests-only commit `d2c3593f` was red in run 39082247007 on exactly TST-856001 to 004 and TST-531005.
The same tests pass on the head.

**The acceptance is met.**
- `chosenProduct` gives `tokenStored`, as MOD-site-frame's file states.
- `home` takes it from there for a product's card. Agent M's own card reads the instance's key, which is a key the frame
  states, not a copy of a rule.
- Two planted faults are caught: always true, and the instance's key read for a product. Each fails seven tests.

**One copy remains.** The route `jobs` keeps a private `tokenKeyOf` (`src/main-page/jobs.mjs:24`), because it connects each
product with the token itself. The item's outcome said "its own copy goes", and `home`'s use of it does go. Changing the
route `jobs` is beyond what the item names, so the copy is registered as ITM-866 and does not hold this gate.

**No release-test item is needed.** No release test was changed. The sprint pull request's run in mode=all shows whether a
release result moved.

**Finding.** `test_expected_results_stated` fails locally in the worktree with a missing module (`src/tunnels/index.mjs:8`).
That is the known environment gap, and it passes on CI.
