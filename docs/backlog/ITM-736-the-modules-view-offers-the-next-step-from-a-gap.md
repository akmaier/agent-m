---
id: ITM-736
title: The modules view offers the next step from a gap
level: module
realises:
  - UC-025
  - MODULE GAPS ARE REPORTED, NOT FORBIDDEN
modules:
  - MOD-trace-pages
builds_on:
  - ITM-721
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-736 The modules view offers the next step from a gap

**REGISTER**

## Outcome

UC-025 step 6: "From a gap, the dashboard offers the next step: **Change the architecture** for a requirement without
module (UC-023), **Implement** for a module without code or tests (UC-024)." MOD-trace-pages names both among the extras
of the `modules` view. ITM-720 builds the diagram and ITM-721 the table, the gaps and the row pages; neither names these
links. This item adds them: *Change the architecture* leading to the architecture's review pages, *Implement* leading
to the route `implement`, each on the default branch only. Neither link blocks or starts anything.

## Acceptance

- In a small DOM with a fixture snapshot: a requirement without module offers *Change the architecture*, a module
  without code and one without tests offer *Implement*, each to its route; other gaps offer neither.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
