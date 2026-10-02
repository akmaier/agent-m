---
id: ITM-161
title: A token kept as refused is shown as working again after its next successful request
kind: implementation
level: 1
realises:
  - A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN
  - UC-042
modules:
  - MOD-dashboard-app
  - MOD-settings-store
depends_on:
  - ITM-157
origin: sprint 02 review (ITM-136's report, point 1)
---
# ITM-161 A token kept as refused is shown as working again after its next successful request

**REGISTER**

## Outcome

UC-042 step 1 shows a token as "refused at the last use". Since ITM-136 a kept refusal is cleared only by Test, a new value or Clear; a later successful request with the same token leaves "✗ refused" standing. Soll: a successful request with a stored token replaces its kept refusal by "✓ works — tested <date>", as a successful Test does.

## Realises

- `A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN`
- UC-042

## Where it came from

ITM-136's developer left open whether any successful use should clear the mark; the Scrum Master reads "at the last use" as: the last use decides.

## Modules

- MOD-dashboard-app
- MOD-settings-store

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/dashboard-app.mjs`
- `docs/assets/settings-store.mjs`
- `tests/dashboard-settings-last-test.test.mjs`

## Kind and level

- Job kind: **implementation** — the first commit holds only tests, and CI on it is red (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Depends on

- ITM-157 — changes `docs/assets/dashboard-app.mjs` before this item (sprint 03, strand A); ITM-160 changes
  `tests/dashboard-settings-last-test.test.mjs` before it (same strand).

## From the sprint 03 planning

The Product Owner adopts the Scrum Master's reading: the last use decides. A refusal is a `401` (`tokenRefusal`,
`git-host.mjs`), noted by `noteRefusal` in `dashboard-app.mjs` through `store.setTokenTest({ refused: true })`; the success
this item notes is a request that carried the stored token and was answered — the page's own reads included —, written as
a successful *Test* is (`{ ok: <date> }`), for the GitHub token and for a GitLab product token (`setGitLabTokenTest`) alike.
Callers checked: the kept state is read by `settings-view.mjs`, `setup-view.mjs` and `add-product-view.mjs` (ITM-136's list)
and only written here; their expectations hold. Tests that assert the refused line: `tests/dashboard-settings-last-test.test.mjs`
(listed), `tests/dashboard-review-flows.test.mjs` ("UC-042 1b": the refusal is the `GET /repos/<repo>` of *Test* and no successful
request lies between it and the assertion) and `tests/test_settings_page.py` (a rendered page, no request) — both expected to
hold; the implementer runs them and lists them in the pull request if one changes.
