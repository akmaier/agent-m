---
id: ITM-596
title: The specification tree narrows by text and by filters
level: module
realises:
  - UC-020
modules:
  - MOD-trace-pages
builds_on:
  - ITM-595
tests:
  - unit
origin:
  - the coverage of UC-001 to UC-020 (docs/measurements/2026-10-16_coverage-uc-001-020.md), at akmaier's request of 2026-10-16
---
# ITM-596 The specification tree narrows by text and by filters

**REGISTER**

## Outcome

UC-020 step 4: "narrows the tree by typing … or by filter".

**The reading of 2026-10-17 (sprint team1/63): it waits for ITM-595's merge,** whose tree it narrows. The descriptor's
`filters` (MOD-trace-pages, Data) is the route's own and is not built yet. It copies no rule.

## Acceptance

- Typing narrows the tree, and so do the filters by status, source and realised.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
