---
id: ITM-783
title: A sprint is ended on the backlog page
level: module
realises:
  - UC-032
  - ONE CLICK PER DECISION
modules:
  - MOD-implementation-pages
builds_on:
  - ITM-681
  - ITM-781
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-783 A sprint is ended on the backlog page

**REGISTER**

## Outcome

UC-032 6b. The route `backlog` offers *End sprint* for the person's team's running sprint without a time box, with
`endSprint` (ITM-781), as MOD-implementation-pages' file states it. A sprint with a time box offers no *End sprint*; its
end is its date.

## Acceptance

- *End sprint* is one click that writes `## Ended`; it is not offered for a sprint with a time box or one already ended.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
