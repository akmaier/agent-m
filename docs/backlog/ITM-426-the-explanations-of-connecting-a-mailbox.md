---
id: ITM-426
title: The explanations of connecting a mailbox
level: module
realises:
  - UC-037
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-site-frame
builds_on:
  - ITM-221
tests:
  - unit
origin:
  - UC-037 steps 1, 2, 4 and 6
---
# ITM-426 The explanations of connecting a mailbox

**REGISTER**

## Outcome

The topics of MOD-site-frame's `explanations.md` that UC-037 names, written for someone new to them: the two routes,
with the table of UC-037; registering the app, and that an institution may allow it only to its administrators, and whom
to ask; where a mail provider lists its IMAP and SMTP settings; Gmail's app password, 2-Step Verification, and work or
school accounts; the processing places a mailbox's mails may go to. The mailbox page shows them folded (ITM-427,
ITM-428).

## Acceptance

- Unit tests that name MOD-site-frame state, before the code exists, that `explain` gives each new topic, folded, with
  its text.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/site-frame/` and the tests that name MOD-site-frame change.
