---
id: ITM-1225
title: The Tests pages explain their levels, occasions and fields through the frame's explanations
level: module
realises:
  - EVERY STEP EXPLAINS ITSELF
  - EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE
  - UC-026
  - UC-027
modules:
  - MOD-site-frame
  - MOD-test-pages
builds_on:
  - ITM-1223
tests:
  - unit
origin:
  - ITM-1223's report (PR #1347): the schedule's and generate's folds are built in the module, since explanations.md holds no topic of theirs
---
# ITM-1225 The Tests pages explain their levels, occasions and fields through the frame's explanations

**REGISTER**

## Outcome

MOD-site-frame's `explain(topic)` gives the folded *What is this?* of every page from `src/site-frame/explanations.md`.
The schedule and generate pages build their own folds instead (`src/test-pages/schedule.mjs:84`,
`src/test-pages/generate.mjs:84`), because that file holds no topic of a level, an occasion or a field of the schedule.

- **MOD-site-frame:** `explanations.md` gains one topic per level (unit, component, system, paid, release, user), per
  occasion (every commit, pull request, nightly, release candidate, on demand) and per field of the schedule's front
  matter (nightly, command, setup, cache, minutes), with the texts the two pages show now.
- **MOD-test-pages:** the schedule and generate pages show those folds with `explain`, and build none of their own.

## Acceptance

- Unit tests naming MOD-site-frame: each topic is in `explanations.md` and `explain` returns its fold. Unit tests naming
  MOD-test-pages: the schedule's and generate's folds are the frame's `explain` of those topics. Counter-proof: before
  the change each fails.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/site-frame/explanations.md`, `src/test-pages/` and the tests that name either module change.
