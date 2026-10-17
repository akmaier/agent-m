---
id: ITM-643
title: The settings page folds its explanations through the frame
level: module
realises:
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-settings-pages
  - MOD-site-frame
builds_on:
tests:
  - unit
origin:
  - ITM-590's gate (docs/gates/20261017-0406-development-release-testing-9d71.md), from developer-sonnet-e's findings on pull request #684
---
# ITM-643 The settings page folds its explanations through the frame

**REGISTER**

## Outcome

`src/settings-pages/settings.mjs:40` builds its own folded explanation, `whatIsThis`, used at :165, :279, :323 and
:386. Every other route uses MOD-site-frame's `explain`. That is two rules for one fold, the defect ITM-588 was
rejected for. The four texts become topics of `src/site-frame/explanations.md`, `whatIsThis` goes, and the tests that
pin its texts are named at the start.

**Settled at sprint team1/65's start. Selectable.**
- `whatIsThis` (`src/settings-pages/settings.mjs:40-42`) has four calls, at :165, :279, :323 and :386. Each text
  becomes a topic of `src/site-frame/explanations.md`, and its call becomes `explain(<topic>)`, as every other route
  of the module calls it (for example `library.mjs:191`'s `explain("file-only-hashed")`). `whatIsThis` goes.
- **The grep of what goes:**
  - The class `settings-what-is-this` is found once, in `tests/release-sprint-07-uc-047-notifications.test.mjs`.
  - The four texts are found in no test. The same `grep -c` counts the class in that file, which is the known positive.
  - `whatIsThis` is found in no file but `settings.mjs`.
- **The expected results that change** (sprint 64): the developer runs MOD-settings-pages' and MOD-site-frame's tests,
  release tests included, on a draft of the change, and lists every changed one before the tests-only commit. The
  release test above is among them.
- **Uses:** `MOD-site-frame.explain`, already in MOD-settings-pages' Uses.
- **Reached** on the live page: `#settings` calls MOD-settings-pages' route `settings`
  (`docs/assets/dashboard-app.mjs:538-555`).
- **Measurement:** no effect is claimed.

## Acceptance

- Each of the four folds is `explain` of a topic in `explanations.md`, and `whatIsThis` is gone.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**Correction (2026-10-17, po-opus, at ITM-643's gate on #688).** `whatIsThis` has 16 calls in `settings.mjs`, not four: `git grep -c whatIsThis` counts 17 with its definition. The start read only the first lines of its grep. The Outcome's "`whatIsThis` goes" covers all 16, so all 16 are the item.
