---
id: ITM-456
title: Clearing a Bridge names the participants and the mailbox that name it
level: module
realises:
  - UC-042
  - A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN
modules:
  - MOD-settings-pages
builds_on:
  - ITM-405
  - ITM-422
tests:
  - unit
origin:
  - ITM-405, #404
  - UC-042 2a
---
# ITM-456 Clearing a Bridge names the participants and the mailbox that name it

**REGISTER**

## Outcome

In MOD-settings-pages' settings lines, as its file states them: a Bridge's *Clear* names first, beside the endpoints
that name it (ITM-405), the participants whose route in the instance's `docs/participants.md` is `bridge <name> agent
<agent>` for that Bridge, and the mailbox whose connection names it (ITM-422) — what stops working in this browser
(UC-042 2a). The resources that name a Bridge are not part of this item: no item builds MOD-resource-list yet.

## Acceptance

- Unit tests that name MOD-settings-pages state, before the code exists, on a fixture instance whose
  `docs/participants.md` names two agents on one Bridge and one on another: *Clear* of the first names its two
  participants and the mailbox that names it, and none of the other Bridge's; nothing is cleared on a no; the
  participants file and the mailbox are left as they were on a yes.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/settings-pages/` and the tests that name MOD-settings-pages change.
