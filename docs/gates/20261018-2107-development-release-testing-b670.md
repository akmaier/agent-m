---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 8603efeeb5dfe5273f0281bf64715076d189819f
  - https://github.com/akmaier/agent-m/pull/939
date: 2026-10-18 21:07 UTC
---
# Development → Release testing: ITM-670, the frame's fixture DOM is a helper of its own

**REGISTER**

## Reason

ITM-670 (MOD-site-frame), pull request #939 into `sprint/team1/92`, passes on `8603efee` as refactoring.

1. **The participant trailer is present:** `developer-sonnet-d`. It is one commit, declared as refactoring, so CI green on
   every commit stands in for a red.
2. **The move is verbatim.** Of the 204 non-empty lines that leave `tests/site-frame.test.mjs`, all but one stand
   unchanged in `tests/site-frame-dom.mjs`. The one is a header comment of the old file. That file is a helper, not a test
   file, so the sorted test list does not shift.
3. **MOD-site-frame's 13 importers** now import the helper, and no MOD-site-frame test imports a test file. This is sprint
   56's agreement: "A shared test harness lives in a helper file of its own, never in a test file."
4. **The results are identical.** The importers' group falls from 1,194 to 960 tests, which is exactly the frame's 18 tests
   times 13 copies. The release, system, review and dashboard groups show no per-test difference.
5. **Green.** All twenty CI jobs pass, and `git merge-tree --write-tree` merges the head into `sprint/team1/92` without a
   conflict (tree `f61fe1a4`).
6. **The 16 other modules' importers and the second DOM copy in `tests/settings-pages-harness.mjs`** are the rest of
   ITM-670's Outcome. They move in its further pull requests (92.md).
