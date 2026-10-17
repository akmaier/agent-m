---
id: ITM-711
title: The comments name the app where it is
level: unit
realises:
  - EVERY CODE FILE BELONGS TO A MODULE
modules:
  - MOD-markdown-render
  - MOD-artifact-edits
builds_on:
  - ITM-574
  - ITM-680
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

**Widened at ITM-680's draft stop (sprint team1/73, 2026-10-17, po-opus).** ITM-680 removes the old review views, and
these comments then name files that are gone:
- `src/markdown-render/editor.mjs:2`;
- `src/artifact-edits/fallback.mjs:9`, `layout.mjs:9` and `save.mjs:10`.

This item corrects them too, so MOD-artifact-edits joins its modules. `docs/assets/review-core.mjs:8, 9, 204 and 536` and
`src/home/home.mjs:89` belong to no module, and are corrected by the jobs that move them (ITM-690 and ITM-684). The item
builds on ITM-680 as well.
