---
id: ITM-737
title: The specification browser links Arrange
level: module
realises:
  - UC-021
  - ARTIFACTS ARE ARRANGED IN NESTED GROUPS
modules:
  - MOD-trace-pages
builds_on:
  - ITM-726
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-737 The specification browser links Arrange

**REGISTER**

## Outcome

UC-021 step 1 begins "In the specification browser (UC-020) ... the author presses **Arrange**". MOD-trace-pages lists
*Arrange* among the extras of the `specification` view, on the default branch only; `src/trace-pages/` holds no such
link. This item adds it, leading to `arrange/requirements` (ITM-726). On a tag, the link is not shown.

## Acceptance

- In a small DOM with a fixture snapshot: on the default branch the view links *Arrange* to `arrange/requirements`; on a
  tag it does not.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
