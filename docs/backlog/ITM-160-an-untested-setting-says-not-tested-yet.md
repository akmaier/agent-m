---
id: ITM-160
title: An untested browser setting reads "not tested yet", not "not tested on this page yet"
kind: implementation
level: 1
realises:
  - A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN
  - UC-042
modules:
  - MOD-dashboard-app
depends_on: []
origin: sprint 02 review (ITM-136's report, point 3)
---
# ITM-160 An untested browser setting reads "not tested yet", not "not tested on this page yet"

**REGISTER**

## Outcome

Since ITM-136 a setting's last test is kept across reloads, so "stored — not tested on this page yet" says something that is no longer true. Soll: an untested setting reads "stored — not tested yet"; every test asserting the old sentence changes that one expectation (PO planning practice).

## Realises

- `A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN`
- UC-042

## Where it came from

ITM-136's developer kept the old wording so that no existing expectation changed, and named it as a small follow-up.

## Modules

- MOD-dashboard-app

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/dashboard/settings-view.mjs`
- `tests/test_settings_page.py`
- `tests/dashboard-settings-last-test.test.mjs`

## Kind and level

- Job kind: **implementation** — the first commit holds only tests, and CI on it is red (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.
