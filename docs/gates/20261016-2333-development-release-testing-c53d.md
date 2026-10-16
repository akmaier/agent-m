---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - d9c149dacd70d11eaa26a56bd488343bc85f5d8a
  - https://github.com/akmaier/agent-m/pull/650
date: 2026-10-16 23:33 UTC
---
# Development → Release testing: ITM-575, The add-product page explains the choices of a new repository

**REGISTER**

## Reason

ITM-575, pull request #650 into `sprint/team1/56`, at head `d9c149da`. developer-sonnet-e wrote it.

1. **The tests-only commit is red.** `2582046b` was pushed alone, and run 38981266369 failed on it. The Scrum Master read
   the saved logs: exactly the eight new tests failed, TST-575001 to 575008. The one `todo` is the standing ITM-369-1.
   - The missing topic hid every assertion, so the developer also ran an uncommitted stub topic. Under it, six of the
     eight failed on behaviour.
2. **CI is green on the head**: run 38981702115 passed ten of ten jobs. GitHub reports the pull request mergeable.
3. **The changes stay in the item's two modules**, with three new test files, and no existing test changed.
   - MOD-settings-pages: `missingRepositoryNotice` carries `explain("new-repository")`.
   - MOD-site-frame: `explanations.md` gains `## new-repository`.

   The related settings-pages, site-frame, release and system tests pass. So do `test_step_explanations`,
   `test_no_backend` and ITM-018.
4. **Both counter-proofs are caught.** With the topic present and the call removed, TST-575001 to 575003 and 575008 fail
   on behaviour.
5. **The Acceptance holds.** The notice of a missing repository carries the folded explanation of the choices on the
   server's page, and the frame's topic check finds the topic.

**Tests changed after the red run, against sprint 54's agreement.** `3f07f72b`, after the red run and before the code,
did two things:
- It corrected the GitLab case's setup, storing a project token so that Step B offers *Check*.
- It narrowed one assertion of TST-575001 from "the only folded explanation in Step C" to "in the notice", with its
  `// expect:` line.

The decision: they are taken, with no fresh red required.
- Both corrections fit the test to the page as it stood before this item, not to the new code. Step C holds the
  explanations `review-layout-commit`, `reverting-the-commit` and `the-product-list` (`products.mjs:399`), so the old
  assertion could never have held.
- The counter-proof on the head shows that the corrected tests fail without the call. That is what a fresh red of the
  corrected file would show.

The agreement was still broken, so it goes to the sprint's feedback. A test whose setup or assertion is wrong is
corrected and run red again before the code, not after.

**Found: another test file used as a harness.** The new unit file imports `tests/settings-pages-add-product.test.mjs`
for its harness, the pattern ITM-623 removes for the review pages. It is MOD-settings-pages' tests, another module, so
it is its own item, ITM-624. That keeps one module per item.
