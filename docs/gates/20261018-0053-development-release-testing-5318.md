---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 0efe7538c6a092de145ece93a61e99b099014ab4
  - https://github.com/akmaier/agent-m/pull/827
date: 2026-10-18 00:53 UTC
---
# Development → Release testing: ITM-867, an opened requirement reads the instance once per load

**REGISTER**

## Reason

ITM-867, pull request #827 into `sprint/team1/82`, at head `0efe7538`. Run 39084180322 passed all twelve jobs. It changes
`src/trace-pages/subject.mjs` and `flow.mjs` and two test files, +202/−8.

**Red, then code.** The tests-only commit `f4076920` was red in run 39084007248 on exactly the six new cases: four unit
cases and two system cases, with and without a token. TST-867004, a failed read asked again, passes on the base, as it
should.

**The acceptance is met.**
- `instanceSnapshot(context)` reads the instance once per context, and drops a read that failed. `personsSource` and
  `sourcesOf` both take it.
- On the probe's fixture, a released version with two register entries, opening a requirement asks the instance for 3
  requests before and none after, with a token or without.
- Two planted faults are caught.

**The record's expected changes did not happen, and that is accepted.** `82.md` expected the counts of
`trace-pages-register-batch` and `system-itm-599-gaps-view` to change. The first counts the snapshot's calls, which stay
the same. The second's existing counts are taken at a release tag, where the default branch is not drawn. The developer
named it at the tests-only commit and in the pull request.

**The reading accepted.** One load is one drawing of the route with one context, with its version choices and openings.

**Findings.**
- The frame and the prompt bar each read the instance on the specification page: three requests each. This is ITM-871,
  registered.
- `export.mjs` is ITM-768 and ITM-770 already.
