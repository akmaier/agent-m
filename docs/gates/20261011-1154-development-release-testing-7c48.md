---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 8f4e68abe40b1494969d155658b782a3b121adf2
  - https://github.com/akmaier/agent-m/pull/347
date: 2026-10-11 11:54 UTC
---
# Development → Release testing: ITM-387

**REGISTER**

## Reason

ITM-387, pull request #347 by developer-sonnet-c into `sprint/team1/14`, on head `8f4e68a`, against the item and the
accepted files of MOD-job-runner and MOD-documents as they stand on the sprint's branch and on `main`. All five points hold:
- The first commit, `80850e2`, holds only `tests/job-runner-candidate-classes.test.mjs`, and CI was red on it (run
  38136667866): node failed on exactly its 5 tests — 1284 tests, 5 failed.
- CI is green on the head (run 38136961050): node 1284 tests, 0 failed; python passed.
- In scope: `builtins.mjs`, `loop.mjs`, `index.mjs` and a comment of `prepare.mjs` in MOD-job-runner's folder; the new
  test, whose header names the module; and `tests/job-runner-run.test.mjs` and `tests/test_correction_loop.py`, which
  name MOD-job-runner and change only how they prepare their kind — the stand-in that feeds their conflict registered under a
  name of its own, in the place of `candidate-classes` —, no expected result.
- The 5 new tests name what they guard and MOD-job-runner, and have 20 counter-proofs.
- The Acceptance holds: with a part carrying two requirements, an exact duplicate classed new goes back naming the existing
  one; a change naming no carried artifact goes back; two candidates of one key are merged in `classes` naming both; a
  fixed draft passes; a kind without the check gives `classes: null`.

Noted, no condition of this gate: only drafts of requirements are classified, since MOD-documents' `Candidate` gives the
key of a requirement only — the sprint record names the question for akmaier, and no item is written before it is
answered. For the review: a check is handed the parts as a third argument, which the `Strategies` type does not name;
`prepareJob` leaves a part without `artifacts` rather than `[]`, so that an existing test's expected result stands; and
`writeResult` has no parameter for the classes a person changed.
