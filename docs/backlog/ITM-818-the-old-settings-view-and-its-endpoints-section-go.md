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

`docs/assets/dashboard/settings-view.mjs` and `docs/assets/dashboard/settings/endpoints.mjs` were removed by `28d00c697`,
and no file of `src/` or `tests/` reads them; only comments and fixture items name them. That commit removed nine cases of
`tests/review-core.d/dashboard-app.test.mjs` and `tests/load-per-view.test.mjs` and named the keeper of one: the GitLab
server check, moved to `tests/repository-hosts.test.mjs:870`. For the other eight, neither the commit nor a test names the test that keeps its
requirement:
- load-per-view's "Clear everything also removes the kept file texts", whose keepers TST-819001 and TST-819002 are
  (`tests/settings-pages-clear-everything.test.mjs`, `tests/settings-pages-clear-everything-live.test.mjs`);
- dashboard-app's "A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN — the GitLab check reports reach, branch and role…",
  "THE TOKEN LINK IS PREFILLED · ONE GITHUB TOKEN SERVES EVERY FEATURE…", "THE REPOSITORY CHOICE IS SPELLED OUT…",
  "ONE GITHUB TOKEN SERVES EVERY FEATURE — the link, the steps and the guidance…", "UC-014: setup names only the
  instance", and the two cases of "A PRODUCT'S TOKEN IS NAMED AFTER THE PRODUCT".

This item names, for each of the eight, the test of MOD-settings-pages, MOD-site-frame or MOD-repository-hosts that
keeps its requirement, and where none keeps it, adds one to the module's tests.

## Acceptance

- No file reads `settings-view.mjs` or `settings/endpoints.mjs`, and both are removed.
- Every removed case names the test that keeps its requirement.
