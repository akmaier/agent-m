---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - f2f96413b11f09a691a6dc262ace819608e4b69b
  - https://github.com/akmaier/agent-m/pull/387
date: 2026-10-11 17:12 UTC
---
# Development → Release testing: ITM-348

**REGISTER**

## Reason

ITM-348, pull request #387 by developer-sonnet-b into `sprint/team1/17`, on head `f2f9641`, against the item and
MOD-site-frame's accepted file as they stand on the sprint's branch. All five points hold:
- The first commit, `0ac8b8c`, holds only `tests/site-frame-drafting-explanations.test.mjs`, and CI was red on it (run
  38158266867): node failed on exactly its 10 tests.
- CI is green on the head (run 38158448457): node 1594 tests, 0 failed; python 441 tests, OK.
- Only MOD-site-frame's folder — nine topics in `explanations.md`, `explain` unchanged — and the new test whose header
  names the module change; no existing test or expected result changes.
- The 10 new tests name what they guard — `EVERY STEP EXPLAINS ITSELF` and the requirements each topic states — and
  MOD-site-frame, with 78 planted faults recorded.
- The Acceptance holds: `explain` gives each new topic folded, with its text — the requirements to cover, the
  participant and where it processes data, the run panel, the correction loop, drafted use cases written open, the
  instruction with UC-019's examples, the difference, *Save*, and a CI agent's draft, as the Outcome lists them.

Noted for the sprint's review, no condition of this gate: the readings the pull request names — the slugs, no pointer to
the book, which the Outcome does not ask for here, and *Save* explained for a use case only.
