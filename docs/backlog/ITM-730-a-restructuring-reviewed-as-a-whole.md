---
id: ITM-730
title: A restructuring of the architecture reviewed as a whole
level: module
realises:
  - UC-023
  - AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST
  - SEVERAL FILES ARE ACCEPTED IN ONE CLICK
modules:
  - MOD-review-pages
builds_on:
  - ITM-729
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-730 A restructuring of the architecture reviewed as a whole

**REGISTER**

## Outcome

UC-023 step 5: a change that touches many files is accepted on the architecture's review page — "every changed file
with its difference and its impact list, every new file in full, every removed decision with its impact list, and
**Accept all N shown** for all of them in one commit". `decision/all` (ITM-441) shows the changed files with their
difference and the new ones in full; it shows no impact list and no removed decision.

This item adds to `decision/all` the impact list of ITM-729 beside each changed file, and each decision or module file
removed since its last acceptance — an approval record names it and the default branch no longer holds it — with its
impact list (`architectureImpact` with `after: null`). *Accept all N shown* is unchanged.

## Acceptance

- In a small DOM with a fixture snapshot holding a changed decision, a new module file and a removed module file: each
  changed and removed file with its impact list, the new file in full, and one commit with one record per file shown.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
