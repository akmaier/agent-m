---
gate: Release testing → Sprint review
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 6a823721406185662f098a18ecbb9f5f3013eade
date: 2026-10-07 14:24 UTC
---
# Release testing → Sprint review: sprint 08

**REGISTER**

## Reason

Sprint 08, ended by the Product Owner, on `sprint/08` at `6a82372`. Of its selection, ITM-243, ITM-255 and ITM-258 are
done, with the changes between jobs #160 and #163.

**The release tests of the selected items.** ITM-243's (#166):
- the system tests of UC-047 in `tests/system-uc-047-be-told-what-waits-for-your-acceptance.test.mjs`;
- they now run the tests of F1 and F2 with no todo mark, after #163 settled both.

ITM-255 and ITM-258 add no behaviour that a release test must reach yet:
- no page names ITM-255's topics before ITM-207 and ITM-256;
- ITM-258's reading of a model stands under UC-002's release tests of sprint 06, which stay green.

**Written by a participant other than the implementer of the behaviour they test.**
- developer-sonnet-e wrote ITM-243's and implemented none of UC-047 nor #163, which is developer-sonnet-a's.
- UC-002's release tests are tester-opus's, who built none of ITM-258 (developer-sonnet-b's).

**Green on the sprint branch.** Run 37636069947, on `sprint/08` merged into `main`, passes:
- node: 851 tests, 840 pass, 0 fail, 11 todo; python: 396, OK.
- The 11 todo tests are the 9 from before sprint 07 and the two of ITM-238's F3, which waits for ITM-207's move and
  ITM-244.
