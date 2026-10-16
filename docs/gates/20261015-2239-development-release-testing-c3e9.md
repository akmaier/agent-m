---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 248dc7f6593cc77b50338bbdb04cb24727dceee7
  - https://github.com/akmaier/agent-m/pull/527
date: 2026-10-15 22:39 UTC
---
# Development → Release testing: ITM-481, UC-022's release coverage names the requirement that replaced the withdrawn one

**REGISTER**

## Reason

ITM-481, pull request #527 by developer-sonnet-e into `sprint/team1/28`, head `248dc7f6`, one commit. It is an item of
release tests, which adds no behaviour, so its first commit need not be red.

- CI is green on the head (run 38818379605, ten of ten jobs). The release test does not run on a pull request into a
  sprint's branch. Run locally on the head it passes, two of two, where TST-448101 failed before.
- Only `tests/release-uc-022-derive-architecture.test.mjs` changed. Its author implemented none of UC-022's behaviour.
- Two counter-proofs are recorded in #527.
- The release coverage now names `THE PAGE NAMES WHERE IT SENDS`. Its evidence holds:
  `tests/site-frame-run-panel.test.mjs` asserts that each destination of the run panel names its participant, role,
  model and place.

Noted for the review: `tests/test_destination_disclosure.py` and the run panel's test headers still guard the withdrawn
name. That file covers only the token's destination, though the SPEC names it as the Check of the new requirement.
