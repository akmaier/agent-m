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
depends_on: []
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
