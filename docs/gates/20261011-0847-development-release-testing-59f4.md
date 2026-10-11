---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 6b6aa76b21369f29eaef83eae6b721210988100d
  - https://github.com/akmaier/agent-m/pull/332
date: 2026-10-11 08:47 UTC
---
# Development → Release testing: ITM-329

**REGISTER**

## Reason

ITM-329, pull request #332 by developer-sonnet-c into `sprint/team1/13`, on head `6b6aa76`, against the item and
MOD-job-runner's and MOD-spec-document's accepted files as they stand at the sprint's commit and on `main`. All five
points hold:
- The first commit, `f6b4a9d`, holds only `tests/job-runner-requirement-form.test.mjs`, and CI was red on it (run
  38125372394): node failed on its 2 new tests alone, no module having registered `requirement-form` — 1229 tests, 2
  failed.
- CI is green on the head (run 38125549461): node 1229 tests, 0 failed; python passed.
- In scope: `builtins.mjs` and the header comment of `index.mjs` in MOD-job-runner's folder; the new test, whose header
  names the module; and `tests/job-runner-run.test.mjs` and `tests/test_correction_loop.py`, whose headers name
  MOD-job-runner, changed only so that two prepared kinds run without `requirement-form`, whose stand-ins return no
  finding; no asserted value changes.
- The 2 new tests name what they guard and MOD-job-runner, and have 12 counter-proofs.
- The Acceptance holds: a candidate without a check goes back as an error; a rule with "and" as a warning, ended by a
  one-line justification; a corrected draft ends the loop.

Noted for the sprint's review, no condition of this gate:
- A question for akmaier: `change-requirements` names no source — no `source` parameter in MOD-job-catalogue's row,
  no source field in its candidates, nothing in UC-019 —, so the check, which reads a candidate's source as the job's
  `source` as the item says, reports "no source" on every candidate of that kind, which its drafter cannot fix.
- A candidate whose name is not in capitals is not read as a requirement and is not judged; no accepted text says which
  check judges a candidate's name.
- MOD-job-runner's file lists `requirementFindings` but not `parseSpec` among its uses.
