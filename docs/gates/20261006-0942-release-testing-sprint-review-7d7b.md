---
gate: Release testing → Sprint review
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 1f180038c8cb240c6eede8c9be0f5767afbcedb5
date: 2026-10-06 09:42 UTC
---
# Release testing → Sprint review: sprint 04

**REGISTER**

## Reason

Sprint 04, with the selection ITM-203, ITM-205, ITM-206, ITM-208 and ITM-211, on `sprint/04` at `1f18003`.

**The release tests of the selected items.**
- ITM-203: `tests/release-sprint-04-trace-pages.test.mjs` (#103).
- ITM-205, ITM-206 and ITM-211: the system test and the three release files of ITM-208 (#106), which check UC-001 through
  the add-product page as it calls their modules.
- ITM-208 is those tests.

**Written by a participant other than the implementer of the behaviour they test.**
- tester-opus wrote both.
- The behaviour is developer-opus-a's (ITM-203), developer-opus-b's (#102, #105), developer-opus-c's (ITM-205) and
  developer-opus-d's (ITM-206, ITM-211).
- No commit of tester-opus changes the page or the modules these tests check. Its one change outside the tests is a CI
  step of the SPEC-read watcher.

**Green on the sprint branch.**
- `1f18003` has the tree of `055331e`, which run 37444029218 tested.
- All 41 cases of these files pass there, none as todo or skipped.
- The run's nine todo cases are findings of earlier sprints.
