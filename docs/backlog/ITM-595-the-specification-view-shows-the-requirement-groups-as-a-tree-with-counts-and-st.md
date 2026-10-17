---
id: ITM-595
title: The specification view shows the requirement groups as a tree with counts and statuses
level: module
realises:
  - UC-020
  - AN UNGROUPED ITEM IS SHOWN AT THE TOP LEVEL
modules:
  - MOD-trace-pages
builds_on:
  - ITM-594
tests:
  - unit
  - component
  - system
origin:
  - the coverage of UC-001 to UC-020 (docs/measurements/2026-10-16_coverage-uc-001-020.md), at akmaier's request of 2026-10-16
---
# ITM-595 The specification view shows the requirement groups as a tree with counts and statuses

**REGISTER**

## Outcome

UC-020 steps 2, 3 and 3a: "the groups of `docs/groups/requirements.md` … a status". Today the tree is the SPEC's sections (ITM-277).

**The reading of 2026-10-17 (sprint team1/63): it waits for ITM-594's merge.** Both change `src/trace-pages/flow.mjs`.
- **Reached on the live page** through `#spec`, as ITM-594 reads it.
- **Uses:** `MOD-group-document.parseGroupFile` and `hierarchy`, both in MOD-trace-pages' Uses and built
  (`src/group-document/index.mjs:59,61`). They are not copied from the old `docs/assets/artifacts/groups.mjs:72`.
- **Expected results that change:** the tree becomes the groups, in place of the SPEC's sections. These tests pin the
  sections, and each is named and corrected in the tests-only commit:
  - `tests/trace-pages-specification.test.mjs` TST-473163 to 473167;
  - `tests/system-sprint-15-spec-toggles.test.mjs` TST-473081;
  - `tests/release-sprint-15-spec-toggles.test.mjs` TST-472518;
  - `tests/system-sprint-14-spec-overview.test.mjs` TST-473080;
  - `tests/release-sprint-14-spec-overview-readonly.test.mjs` TST-472516;
  - `tests/dashboard-spec-requirements-wiring.test.mjs` TST-472147 and 472148;
  - `tests/trace-pages-edit-links.test.mjs`: *+ Requirement* in each section, TST-360001 to 360004 and 399001 to 399003;
  - the subject's `groups` in `tests/trace-pages-subject.test.mjs`.

  The start reads each one again against the head of that day.

## Acceptance

- Every requirement appears once, with its status.
- Each group shows how many it holds and how many no use case realises.
- An unknown member is shown as such.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
