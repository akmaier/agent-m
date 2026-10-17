---
id: ITM-721
title: The modules view shows its table and row pages
level: module
realises:
  - UC-025
  - MODULE GAPS ARE REPORTED, NOT FORBIDDEN
modules:
  - MOD-trace-pages
builds_on:
  - ITM-720
  - ITM-692
tests:
  - unit
origin:
  - ITM-720's stop (sprint team1/73), the split of the modules view
---
# ITM-721 The modules view shows its table and row pages

**REGISTER**

## Outcome

ITM-720 builds MOD-trace-pages' `modules` view with its component diagram only. The rest of the view, as
`docs/architecture/MOD-trace-pages.md:113` describes it, needs MOD-trace-graph's `moduleRows`. That function is stated
and not built; ITM-692 builds it. The rest of the view is:
- the table of modules: subsystem, the requirements its tests guard with their statuses, its file, code and tests;
- every gap;
- the module's file and folder when a row is opened.

## Acceptance

- The `modules` view shows the table and opens a row as the module's text says, through `moduleRows`.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
