---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 186fd576569b867c53fd83eedac6ea3bc493f223
  - https://github.com/akmaier/agent-m/pull/659
date: 2026-10-17 00:36 UTC
---
# Development → Release testing: ITM-624, The add-product tests' harness is a file of its own

**REGISTER**

## Reason

ITM-624, pull request #659 into `sprint/team1/58`, at head `186fd576`. developer-sonnet-a wrote it.

1. **No red run, by the item's nature.** It is a refactoring of tests, with no expected result changed. Its evidence is
   the golden master. The Scrum Master diffed the test results before (`87117725`) and after: the only lines removed
   are the sixteen `ok` lines of add-product tests that the new-repository file ran again through its import. No line
   was added, none is `not ok`, and no name changed.
2. **CI is green on the head**: run 38986896670 passed ten of ten jobs. GitHub reports the pull request mergeable.
3. **The changes stay in the item's scope**: MOD-settings-pages' tests and the new helper `tests/settings-pages-harness.mjs`.
   There is no `src` change, and the diff removes no assertion.
   - `settings-pages-setup.d/dom.mjs` loses its copy. A grep finds no test file importing another test file.
   - ITM-018, the Python checks and the related tests pass.
4. **Two planted faults in the helper are caught.** The third guards nothing, and the pull request says so.
5. **The Acceptance holds.** No test file imports another for its harness, and each test runs once per file that
   declares it.

**The readings are taken.**
- **Only the DOM part is shared.** The add-product file keeps its fake fetch and its scripted steps, which no other file
  uses. Moving them would share what nothing shares.
- **`dom.mjs` re-exports `installDocument` from the helper**, so that MOD-site-frame's
  `tests/site-frame-setup-explanations.test.mjs` stays untouched. A re-export is no copy. Changing that test is MOD-site-frame's
  matter, and this item names only MOD-settings-pages.
- **The comments in other test files** that say their DOM was "brought from" the add-product test import nothing, and
  are no part of this item. They tell where code came from, which AGENTS.md §1 leaves to git. Each file's own next change
  can drop them; they need no item of their own.
