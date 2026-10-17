---
id: ITM-711
title: The comments name the app where it is
level: unit
realises:
  - EVERY CODE FILE BELONGS TO A MODULE
modules:
  - MOD-markdown-render
builds_on:
  - ITM-574
tests:
  - unit
origin:
  - ITM-574's pull request #728 (sprint team1/72), from developer-sonnet-d's finding
---
# ITM-711 The comments name the app where it is

**REGISTER**

## Outcome

ITM-574 moves the app from `docs/assets/dashboard-app.mjs` to `src/site-frame/dashboard-app.mjs`. A `git grep` on its
head `cb51c796` finds the old path in comments of files the item does not change:
- `src/markdown-render/difference.mjs:2` and `src/markdown-render/render.mjs:1`;
- `src/site/views.mjs:2`;
- tests outside the architecture: `dashboard-notifications-wiring` (:2, :143), `dashboard-notifications` (:4, :6, :133),
  `dashboard-roles` (:15), `dashboard-settings-last-test` (:2), `dashboard-spec-impact` (:3), `release-sprint-04-trace-pages`
  (:16), `review-page` (:2) and `system-uc-047-be-told-what-waits-for-your-acceptance` (:3).

The same grep finds the new path in five tests on that head, which shows the search works.

This item corrects MOD-markdown-render's two comments. The other files belong to no module, so each comment is corrected
by the job that moves its file (`CODE OUTSIDE THE ARCHITECTURE IS MOVED INTO IT`).

## Acceptance

- MOD-markdown-render's comments name `src/site-frame/dashboard-app.mjs`. Its tests pass unchanged.
