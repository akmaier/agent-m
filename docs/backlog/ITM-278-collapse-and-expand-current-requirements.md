---
id: ITM-278
title: Collapse and expand current requirements
level: module
realises:
  - UC-020
  - A REQUIREMENT HAS FOUR FIELDS
modules:
  - MOD-trace-pages
builds_on:
  - ITM-277
tests:
  - unit
  - system
  - release
origin:
  - UC-020
---
# ITM-278 Collapse and expand current requirements

**REGISTER**

## Outcome

In the current requirements overview, every SPEC section starts collapsed on a fresh load. Its heading remains readable;
clicking it expands that section's requirement list and clicking it again collapses the list. Each requirement name
keeps its existing button and opens its row-local four fields; clicking the same name again closes those details,
and another click opens them again. Requirements outside sections remain reachable. Keep this state only on the screen.

Use MOD-trace-pages' existing public view/trace route, pinned Host/Snapshot, parseSpec and sanitised renderer.
Choose the simplest accessible section control; the existing native details/summary pattern is suitable if it meets
the behaviour. The unit DOM must not be presented as simulating native browser default actions it does not implement.
No new route, parser, library, stored collapse setting or architecture is needed. The current legacy adapter already
calls this public view; no additional adapter implementation is selected.

## Acceptance

- New unit cases call the public trace/specification Route.render: multiple sections are collapsed initially; each
  heading opens, closes and reopens only its own requirement list. Section and requirement order, names exactly once,
  and requirements outside sections are preserved.
- A requirement button opens readable name/source/rule/check, a second click closes its detail, and a third reopens it.
  Toggling one requirement or section does not change another section's state. Fresh rendering starts collapsed.
- Independent system/release cases exercise actual openDashboard #spec controls: the requested toggles work above
  the preserved change queues. They retain the real pinned snapshot, sanitisation and zero repository writes.
  Browser verification distinguishes visible collapsed content from text merely present in the DOM.
- Only src/trace-pages/ and tests naming MOD-trace-pages change. Keep existing requirement button shape and all old
  guards. If section controls are buttons, the existing ITM-277-01 name scan may narrowly select .requirement-name
  instead of every button; its exact names, order and uniqueness assertions stay unchanged. No other old expectation,
  helper, parser, diagram, SPEC, use case or architecture change is authorised.
- The implementation's first commit contains only failing tests with actual red CI before production changes.
  Final-head full CI is green; each new case has an executed relevant planted-fault failure and restored positive
  recorded in the PR. Independent E implements none of the behaviour it release-tests. No paid service is called.
