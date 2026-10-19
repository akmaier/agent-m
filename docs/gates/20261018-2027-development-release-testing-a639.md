---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - ffc18e68ef85cbcdaa95c77a88b5f0f8d7c0327a
  - https://github.com/akmaier/agent-m/pull/921
date: 2026-10-18 20:27 UTC
---
# Development → Release testing: ITM-639, the release test of UC-015

**REGISTER**

## Reason

ITM-639 (MOD-settings-pages), pull request #921 into `sprint/team1/92`, passes on `ffc18e68`.
- MOD-settings-pages is accepted again at `c865b058` (`66940da8`), so the item no longer waits.
- developer-sonnet-b wrote it. ITM-590 was built by developer-sonnet-e, so the release test is not written by the
  implementer.

1. **The participant trailer is present:** `developer-sonnet-b`.
2. **No red run is possible, and the planted faults stand in for it,** as at ITM-627's gate. The route `sources` exists,
   so the tests pass on the base. The developer planted six faults in `src/settings-pages/sources.mjs`, and each fails a
   named test.
3. **My replay in a clean checkout of the head:**
   - the file gives 7 passing tests and one todo;
   - with `affectedRequirements` replaced by `[]` (`sources.mjs:154`), TST-639006 fails ("the requirements that name its
     source are listed, not deleted").
4. **The change stays in scope:** one new release file, `tests/release-uc-015-link-sources.test.mjs`. No source file and
   no other test changes. It finds the page by what the use case names.
5. **The Acceptance holds for UC-015's main flow, 2a, 2b and 3a.**
   - Step 1, "In the product's view, the author opens **Requirement sources**", is a todo naming ITM-638, which builds
     that control. It looks on Settings after a known positive. ITM-638's gate turns it into a passing test, or ITM-638
     changes the place it looks in its own pull request.
   - TST-639001 has no counter-proof of its own. Steps 2 to 4 and 2a, 2b and 3a each have one.
6. **Green.** CI run 39153232593 passes all twenty jobs, and GitHub reports the pull request as mergeable.
   `git merge-tree --write-tree` merges the head into today's `sprint/team1/92` without a conflict (tree `5cd4ed40`). A
   pull request into a sprint branch skips the release level, so this file first runs in CI on the sprint's pull request
   into `main`, whose Release testing gate reads it.
7. **The developer's finding:** `sources.mjs:19` says "an empty part is written as the empty cell", while a save writes
   "—". It is a comment against the code, in ITM-638's file. ITM-638 corrects it.
