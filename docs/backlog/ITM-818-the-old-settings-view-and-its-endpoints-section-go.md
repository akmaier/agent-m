---
id: ITM-818
title: The old settings view and its endpoints section go
level: module
realises:
  - CODE OUTSIDE THE ARCHITECTURE IS MOVED INTO IT
modules:
  - MOD-settings-pages
  - MOD-site-frame
builds_on:
  - ITM-810
  - ITM-713
  - ITM-690
tests:
  - unit
origin:
  - ITM-810's draft stop (sprint team1/75), stop 1 and 2
---
# ITM-818 The old settings view and its endpoints section go

**REGISTER**

## Outcome

ITM-810 moves the three settings Checks onto the live settings pages. `docs/assets/dashboard/settings-view.mjs` and
`settings/endpoints.mjs` cannot go with it yet, because tests of other modules still read them:
- `tests/review-core.d/authority.test.mjs` (MOD-review-pages). Its known positive needs `saveCollaborators` and
  `savePseudonymisation`, which only `settings-view.mjs` calls. They are in `writes.mjs`, which ITM-713 removes.
- `tests/review-core.test.mjs:209`. It names `MOD-review-core`, MOD-approvals takes it over (ITM-690), and it asserts
  that the dashboard's files contain `gitlabRole(`.
- `tests/load-per-view.test.mjs`, "Clear everything also removes the kept file texts" (MOD-site-frame), whose handler was
  `settings-view.mjs`'s.
- `tests/review-core.d/dashboard-app.test.mjs` (MOD-site-frame), eight cases on the old token texts. ITM-810's draft
  named a keeper for each, and moved `productTokenName` and `productTokenDescription` into a test of MOD-settings-pages.

While team 2's ITM-702 changes MOD-group-document, team 1 may not change MOD-review-pages, whose file uses it
(`SPRINTS OF DIFFERENT TEAMS CHANGE NO MODULE THE OTHER CHANGES OR USES`). Once ITM-713 and ITM-690 have moved their
readers, this item:
- re-points or removes the two MOD-site-frame tests, each case naming its keeper;
- then removes both files, as MOD-settings-pages' Parts say;
- searches the readers again by every name a harness loads them under (sprint 74's agreement).

## Acceptance

- No file reads `settings-view.mjs` or `settings/endpoints.mjs`, and both are removed.
- Every removed case names the test that keeps its requirement.
