---
id: ITM-598
title: An opened requirement shows its history of accepted changes
level: module
realises:
  - UC-020
  - A REQUIREMENT SHOWS ITS HISTORY
modules:
  - MOD-spec-changes
  - MOD-trace-pages
builds_on:
  - ITM-597
tests:
  - unit
  - component
origin:
  - the coverage of UC-001 to UC-020 (docs/measurements/2026-10-16_coverage-uc-001-020.md), at akmaier's request of 2026-10-16
---
# ITM-598 An opened requirement shows its history of accepted changes

**REGISTER**

## Outcome

UC-020 step 5 (history) and 5d. `requirementHistory` is in MOD-spec-changes' file but not built (`src/spec-changes/index.mjs:4-5`).

**The reading of 2026-10-17 (sprint team1/63): it waits for ITM-597's merge,** whose opened requirement shows the history.
- `requirementHistory(name, host)` is stated in MOD-spec-changes' file, and its part `history.mjs` is not built.
- It reads through `MOD-repository-hosts.readHistory`, which MOD-spec-changes' Uses names. That call is built with real
  calls on both hosts (`github.mjs:202-219`, `gitlab.mjs:162-179`).
- `readHistory` gives a file's commits, not a section's. So the history reads `SPEC.md` at each commit through
  `readSnapshot` and keeps the commits where the requirement's text changed.

## Acceptance

- Every accepted change of a requirement's text is shown with its commit.
- A requirement older than its records shows the commit that introduced it.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
