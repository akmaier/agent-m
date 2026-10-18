---
id: ITM-965
title: The system and release tests of UC-038
level: system
realises:
  - UC-038
modules:
  - MOD-maintenance-pages
builds_on:
  - ITM-963
  - ITM-964
  - ITM-994
tests:
  - system
  - release
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-038-6, verified against the accepted texts on main at ee5d1364
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-965 The system and release tests of UC-038

**REGISTER**

## Outcome

UC-038 (blob `fa251a24`) through the route `mail`: the main flow 1-10 (UC-038:83-125) and the alternative flows 2a, 4b, 4c,
6a, 6c, 8a (:153-183), with the postcondition (:191-195): "Every created issue carries neutral technical text, a product,
the label `defect` or `change`, and the `MAIL-` identifiers of its mails; ... The mails are unchanged in the mailbox".
`tests/` holds `system-uc-037-*` and `release-uc-037-*` and nothing for UC-038.

## Acceptance

- A system test through the frame's route `mail` over a fixture mailbox on each route (Graph fake, Bridge fixture), fake
  hosts and fixture participants: *Read mailbox*, *Propose*, one decision per mail; the clicks are counted as UC-038:195
  states them.
- A release test, written by a participant other than the implementer of ITM-963 and ITM-964, of the main flow and
  the named alternative flows, each with a counter-proof on a planted fault in `src/maintenance-pages/`.
- After the run, the mailbox fixture holds no changed flag and no write outside it holds a sender, name or body.
- Only tests that name MOD-maintenance-pages change.
