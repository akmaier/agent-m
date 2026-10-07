---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - b4f110061aa5f97a3f65d1cacd0ca70beb62d25d
  - https://github.com/akmaier/agent-m/pull/158
date: 2026-10-07 11:39 UTC
---
# Development → Release testing: ITM-238

**REGISTER**

## Reason

ITM-238, the system and release tests of UC-047: pull request #158 by developer-sonnet-e, on head `b4f1100`, branched from
`sprint/07` at `32b837e`, which holds the change between jobs that lets the dashboard reach MOD-notifications.
- Only tests change and the item adds no behaviour, so no red first commit is asked of it.
- CI is green on the head, run on its merge into `sprint/07`, with the 9 todo tests from before and this item's 4.
- Only two new test files changed, both naming MOD-notifications. developer-sonnet-e implemented none of UC-047.
- Every new test names what it guards — each release test its requirement, each system test UC-047 and its step. Each of
  the 19 passing tests has its counter-proof recorded in the pull request; the 4 todo tests fail on their findings, as
  ITM-223's did.
- The Acceptance holds:
  - each of the 10 requirements UC-047 realises has a release test;
  - the main flow and the alternative flows are walked through the dashboard as it reaches MOD-notifications;
  - where the page and UC-047 disagree, the tests follow UC-047 and name the finding: F1, the line beside *This browser*;
    F2, the instance checked without its token; F3, no product this browser keeps checked, since the dashboard keeps its
    products under another key.

Noted for the sprint's end, no reason by itself: `SPEC.md`'s check of `A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE`
and `NOTIFICATIONS ARE SWITCHED ON BY THE PERSON` names `tests/dashboard-notifications.test.mjs`, which does not exist.
