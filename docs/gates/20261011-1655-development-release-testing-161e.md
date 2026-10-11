---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - b9e1a366dfed139fcee78b31e78f9e4caf3bc325
  - https://github.com/akmaier/agent-m/pull/383
date: 2026-10-11 16:55 UTC
---
# Development → Release testing: ITM-393

**REGISTER**

## Reason

ITM-393, pull request #383 by developer-sonnet-a into `sprint/team1/17`, on head `b9e1a36`, against the item and
MOD-spec-changes' accepted file as they stand on the sprint's branch. All five points hold:
- The first commit, `365d2de`, holds only `tests/spec-changes-sections.test.mjs`, and CI was red on it (run
  38157132285): node failed on exactly its 10 tests. The second tests-only commit, `b73baee`, adds what the faults
  planted on the draft left alive, red on all 12 (run 38157269595).
- CI is green on the head (run 38157285250): node 1519 tests, 0 failed; python 441 tests, OK.
- Only MOD-spec-changes' folder — `entrySections` in the new `propose.mjs`, the export of `index.mjs` — and the new test
  whose header names the module change; no existing test or expected result changes.
- The 12 new tests name what they guard — `A CHANGE IS PROPOSED UNDER THE EXISTING NAME`, `A DUPLICATE ADDS A SOURCE, NOT
  A REQUIREMENT`, `A CONFLICT IS DECIDED BY A PERSON` and `THE PERSON WHO PROMPTS IS A SOURCE` — and MOD-spec-changes,
  with 24 planted faults recorded.
- The Acceptance holds: one candidate of each class composed into its section; an undecided conflict left out; the
  job's source and a pointed-to source named; every other byte of the section unchanged. Run over this repository's
  SPEC, a duplicate and a change of each of its 406 requirements gave the one section expected.

Noted for the sprint's review, no condition of this gate: the readings the pull request names — a new requirement at
the end of the section it belongs in, a pointed-to rule keeping its sources, one source item per passage, `until` null.
