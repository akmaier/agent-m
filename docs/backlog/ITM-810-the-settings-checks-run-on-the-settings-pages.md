---
id: ITM-810
title: The settings Checks run on the settings pages
level: module
realises:
  - CODE OUTSIDE THE ARCHITECTURE IS MOVED INTO IT
modules:
  - MOD-settings-pages
  - MOD-site-frame
builds_on:
  - ITM-683
  - ITM-811
tests:
  - unit
origin:
  - ITM-683's draft stop (sprint team1/74), finding 1
---
# ITM-810 The settings Checks run on the settings pages

**REGISTER**

## Outcome

`#settings` has been drawn by MOD-settings-pages' route since before ITM-683, and after ITM-683 the token banner is the
frame's. Yet three SPEC Checks still run on the texts and builders of `docs/assets/dashboard/settings-view.mjs`, which
no live page draws any more:
- `tests/test_settings_page.py`, through `settingsView.browserSettingsHtml`, `defaultExpiry` and the other builders;
- `tests/test_settings_disclosure.py`;
- `tests/test_token_scope_documented.py`, the Check of `THE TOKEN LINK IS PREFILLED`, `THE REPOSITORY CHOICE IS SPELLED OUT`
  and `ONE GITHUB TOKEN SERVES EVERY FEATURE`. Its header names `MOD-dashboard-app`, and MOD-settings-pages' Parts take
  it over.

They use `browserSettingsHtml`, `TOKEN_GUIDANCE`, `tokenLinkUrl`, `repositoryChoiceSteps`, `sharedOriginNotice`,
`pseudonymisationOffNotice` and `PSEUDONYMISATION_EXPLANATION`. A Check that runs on code no page draws guards nothing on
the live page.

At the start, each case is read against MOD-settings-pages' route and texts:
- a case whose requirement the module's page shows is re-pointed onto it;
- a case of only the old view goes, and the module test that keeps its requirement is named;
- where the module's page does not show what a requirement asks, that is a fault, and the item stops.

Then `settings-view.mjs` and `settings/endpoints.mjs` go, as MOD-settings-pages' Parts say, once ITM-811 has removed the
last other importer.

## Acceptance

- No test imports `settings-view.mjs` or `settings/endpoints.mjs`, and both are removed.
- Each SPEC Check named above runs on MOD-settings-pages' pages and keeps its requirement; the pull request names each
  case's new place.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
