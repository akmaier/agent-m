---
id: ITM-765
title: The release panel shows the audit of its candidate
level: module
realises:
  - UC-013
  - UC-030
  - THE AUDIT VIEW LISTS EVERY REQUIREMENT OF THE RELEASE
modules:
  - MOD-test-pages
builds_on:
  - ITM-641
  - ITM-768
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
  - ITM-256's Outcome: "The audit drawn inside the panel (UC-030) … not part of this item"
---
# ITM-765 The release panel shows the audit of its candidate

**REGISTER**

## Outcome

Once the candidate's run has ended, the route `release` draws the audit of its candidate inside itself. It does this
through the frame's `embedRoute` (ITM-641) with MOD-trace-pages' route `trace/audit` (ITM-768), without using that
module, as MOD-test-pages' file states. Where the route is not loaded, the frame's link stands in its place.

## Acceptance

- With a fake frame, the panel embeds `trace/audit` with the candidate's tag and commit once the run has ended, and not
  before.
- `RouteNotLoaded` leaves the link.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/test-pages/` and the tests that name MOD-test-pages change.
