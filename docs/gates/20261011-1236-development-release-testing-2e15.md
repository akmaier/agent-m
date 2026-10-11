---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 50be2982e1ddfb292809ea63d5081634257dbc5e
  - https://github.com/akmaier/agent-m/pull/350
date: 2026-10-11 12:36 UTC
---
# Development → Release testing: ITM-330

**REGISTER**

## Reason

ITM-330, pull request #350 by developer-sonnet-c into `sprint/team1/14`, on head `50be298`, against the item and the
accepted files of MOD-job-runner and MOD-trace-graph as they stand on the sprint's branch and on `main`. All five points
hold:
- The first commit, `7194442`, holds only `tests/job-runner-graph-checks.test.mjs`, and CI was red on it (run
  38139407086): node failed on exactly its 3 tests — 1305 tests, 3 failed.
- CI is green on the head (run 38139527586): node 1305 tests, 0 failed; python passed.
- In scope: `builtins.mjs` and the header comment of `index.mjs` in MOD-job-runner's folder; the new test, whose header
  names the module; and `tests/job-runner-run.test.mjs` and `tests/test_correction_loop.py`, which name MOD-job-runner
  and change only how they prepare their kinds — the stand-in that feeds their findings registered under a name of its own,
  in the place of `graph-checks` —, no expected result.
- The 3 new tests name what they guard and MOD-job-runner, and have 10 counter-proofs.
- The Acceptance holds: a drafted use case that realises a name the SPEC lacks goes back; one that links the instance's
  dashboard goes back; a corrected draft ends the loop. As `A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT` asks,
  only the draft's own findings go back: the check leaves out what the repository as it stands already holds, which the
  tests show with findings of a use case the draft does not touch and of one whose lines it moves.

Noted for the sprint's review, no condition of this gate: MOD-job-runner's file does not state that the repository's own
findings are left out — built within the check from the two functions it names, matched by artifact, kind, rule and words,
the line left out; the instance's `owner/name` taken from its snapshot's repository path; and two graph builds a call.
