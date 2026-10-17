---
id: ITM-602
title: The trace views explain themselves
level: module
realises:
  - UC-020
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-trace-pages
  - MOD-site-frame
builds_on:
tests:
  - unit
origin:
  - the coverage of UC-001 to UC-020 (docs/measurements/2026-10-16_coverage-uc-001-020.md), at akmaier's request of 2026-10-16
---
# ITM-602 The trace views explain themselves

**REGISTER**

## Outcome

UC-020: "explains the statuses … what a release tag is". `src/trace-pages` calls no `explain`.

**The reading of 2026-10-17 (sprint team1/63): it waits for ITM-594, ITM-595 and ITM-598.** Those draw the release tags,
the statuses and the history that UC-020 asks to be explained.
- The accepted `explain(topic)` of MOD-site-frame is enough. No label is named, so the draft `4ecbabdf` is not needed.
- The topics go into `src/site-frame/explanations.md`.
- "The frame's check" is not built (`src/site-frame/index.mjs:5`). Whether this item builds it is read at its start.

## Acceptance

- Each view's statuses, versions and gaps carry their folded explanations, and the frame's check finds their topics.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
