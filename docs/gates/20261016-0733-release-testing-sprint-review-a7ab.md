---
gate: Release testing → Sprint review
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - a98a5db54462093b99525fec2635afd314c8dec4
  - https://github.com/akmaier/agent-m/pull/559
date: 2026-10-16 07:33 UTC
---
# Release testing → Sprint review: sprint team1/36

**REGISTER**

## Reason

Sprint team1/36 was ended on `sprint/team1/36` at `a98a5db5`. Its one item, ITM-525, is merged with #558 at `902201ec`,
the head its gate passed.

**The release tests of the selected item.** ITM-525 is guarded by unit tests only, and the sprint wrote and changed no
release test. So no release test was written by the implementer of the behaviour it tests.

**Green on the sprint branch.** Run 38867486999, on #559 at `a98a5db5`, runs every test, the release tests among them,
and passes ten of ten jobs.
- Its first attempt failed on node (1), in one test, TST-472076 (`tests/bridge-jobs-access.test.mjs`): git's background
  maintenance removed `.git/objects/maintenance.lock` between the test's `readdirSync` and `statSync`.
- That test and MOD-bridge-jobs are untouched by this sprint. The job's re-run passed.
- The race is registered as ITM-526.
