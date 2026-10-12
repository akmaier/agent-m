---
id: ITM-464
title: Clearing a Bridge names the resources that name it
level: module
realises:
  - UC-042
  - A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN
modules:
  - MOD-settings-pages
builds_on:
  - ITM-456
  - ITM-460
tests:
  - unit
origin:
  - ITM-405, #404; ITM-456, #420
  - UC-042 2a
---
# ITM-464 Clearing a Bridge names the resources that name it

**REGISTER**

## Outcome

In MOD-settings-pages' settings lines, as its file states them: a Bridge's *Clear* names first, beside the endpoints,
participants and mailbox that name it (ITM-405, ITM-456), the resources whose route is `bridge <name>` for that Bridge —
in the instance's `docs/resources.md` and in the chosen product's, read with MOD-resource-list's `resourceSchema` — so
that the person sees what stops working in this browser (UC-042 2a). A list that cannot be read is said with its reason,
and the question is still asked.

## Acceptance

- Unit tests that name MOD-settings-pages state, before the code exists, over a fixture host whose instance and product
  each list a resource on one Bridge and one on another: *Clear* of the first names its two resources and none of the
  other Bridge's; nothing is cleared on a no; the lists are left as they were on a yes; an unreadable list said with
  its reason.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/settings-pages/` and the tests that name MOD-settings-pages change.
