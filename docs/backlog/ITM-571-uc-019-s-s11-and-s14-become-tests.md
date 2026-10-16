---
id: ITM-571
title: UC-019's S11 and S14 become tests
level: system
realises:
  - UC-019
modules:
  - MOD-review-pages
builds_on:
  - ITM-559
tests:
  - system
  - release
origin:
  - ITM-559's settling at sprint team1/51: the todo tests TST-377012 (S11) and TST-418126 (S14) hold once ITM-559 is merged
---
# ITM-571 UC-019's S11 and S14 become tests

**REGISTER**

## Outcome

Once ITM-559 is merged, two `todo` tests hold, and they become plain tests with their expected values kept:
- TST-377012 (S11, `tests/system-uc-019-change-by-prompt.test.mjs:410`);
- TST-418126 (S14, `tests/release-uc-019-change-requirements-by-prompt.test.mjs:597`).

Their entries move from the findings maps to the evidence maps, as ITM-563 moved S7, S8 and S15. The author implements
none of ITM-559 (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).

**The release test's other changes, which ITM-559 makes necessary**, as a release test is changed by a developer who
implements none of the item (`tests/release-uc-019-change-requirements-by-prompt.test.mjs`):
- **TST-418104** (`:107`). Its fixture's second answer becomes a readable draft, as ITM-559 changes TST-377007's. Its
  expected values stay: two requests, the draft and the follow-up sent.
- **TST-418115** (`:340`). Its expected finding is written in `formatFinding`'s form, as TST-418126 expects on the same
  page.
- **The counter-proof table's entry for TST-418104 and TST-377007**, which plants a fault in
  `src/site-frame/subject.mjs`'s `drawn()`. After S11 the draft travels through `draft?`, not the page's text, so the
  entry is read again. Where that fault no longer breaks them, it is moved to the subject of the route `draft`.

**Order.** This item merges into `sprint/team1/51` before the sprint's pull request into `main`. TST-418104 and
TST-418115 run only there, since the sprint branch's pull requests leave out the release files.

## Acceptance

- **The tests.** Both pass as plain tests. A planted fault in each mend fails its test.
- **Only test files change.** The release test records its local run before and after.
