---
gate: Release testing → Sprint review
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 1713ff2c2e14ccfb9b7017ab0d7a5e843272450f
date: 2026-10-07 11:45 UTC
---
# Release testing → Sprint review: sprint 07

**REGISTER**

## Reason

Sprint 07, with the selection ITM-204, ITM-207, ITM-209, ITM-210, ITM-225, ITM-232 to ITM-242, on `sprint/07` at `1713ff2`.

**The release tests of the selected items:**
- ITM-238's (#158): `tests/release-sprint-07-uc-047-notifications.test.mjs`, one release test for each of the 10
  requirements UC-047 realises, and `tests/system-uc-047-be-told-what-waits-for-your-acceptance.test.mjs`, 13 system tests
  of its main flow and alternative flows;
- ITM-242's (#148): ITM-223's release and system tests of UC-002, now without the findings ITM-240, ITM-241 and the SPEC
  settled.

**Written by a participant other than the implementer of the behaviour they test.**
- developer-sonnet-e wrote ITM-238's and has no other commit in the sprint. UC-047's behaviour is developer-sonnet-a's,
  -b's, -c's and -d's.
- tester-opus wrote ITM-242's and has no other commit in the sprint. ITM-240 and ITM-241 are developer-sonnet-b's and -c's.

**Green on the sprint branch.** Run 37615922584, on `sprint/07` merged into `main`, passes, node and python: 823 pass,
0 fail, 13 todo. Of the 13 todo tests, 9 stood before the sprint. 4 are ITM-238's findings, each failing on the dashboard
as it stands, and each goes to the backlog:
- F1, the line *Notifications* beside *This browser*;
- F2, the instance checked without its token;
- F3, no product this browser keeps checked.
