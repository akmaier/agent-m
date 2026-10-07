---
gate: Release testing → Sprint review
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 6152d38b6ee0c6668fd7a4d10e61f01537bf672b
date: 2026-10-07 03:14 UTC
---
# Release testing → Sprint review: sprint 06

**REGISTER**

## Reason

Sprint 06, with the selection ITM-219 to ITM-223, ITM-226, ITM-228, ITM-229, ITM-230 and ITM-231, on `sprint/06` at
`6152d38`.

**The release tests of the selected items** are ITM-223's (#139):
- `tests/release-sprint-06-uc-002-implementation-pages.test.mjs`, 22 release tests, one or more for each of UC-002's 19
  requirements;
- `tests/system-uc-002-choose-a-process-model.test.mjs`, 20 system tests of its main flow and each alternative flow.

**Written by a participant other than the implementer of the behaviour they test.** tester-opus wrote them. The behaviour
is that of developer-opus-a to -d, developer-sonnet-a to -c and scrum-master-session (#126); tester-opus has no commit
among the sprint's items.

**Green on the sprint branch.** Run 37565696106 on `6152d38` passes, node and python. Of the 42 tests, 32 pass with their
counter-proofs, and 10 are marked todo: the findings F1–F8, each failing on the page as it stands. F2–F7 are ITM-240 and
ITM-241; F1, F8 and the question of where the process requirements stand go to akmaier.
