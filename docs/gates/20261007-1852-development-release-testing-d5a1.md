---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - c56df662d705d2878b65e0c10c336bd786b3e21c
  - https://github.com/akmaier/agent-m/pull/195
date: 2026-10-07 18:52 UTC
---
# Development → Release testing: ITM-250

**REGISTER**

## Reason

ITM-250, the test schedule and its default: pull request #195 by developer-sonnet-d, on head `c56df66`, branched from
`sprint/12` at `a0bc752`.
- The first commit, `fd35f2f`, holds only `tests/test-schedule.test.mjs`, and CI was red on it (run 37669114389). The
  node job failed on exactly that file, whose module did not exist yet, beside the suite's known todo marks.
- CI is green on the head (run 37669363228): node 885 tests, 0 fail, 11 todo; python 396, OK.
- Only `src/test-schedule/` — `index.mjs`, `schedule.schema.md` and `default-schedule.md`, among the module's Parts — and
  the new test, whose header names MOD-test-schedule, changed. The module's one read of its own two data files is the one
  `tests/test_no_backend.py` allows the folder (#160).
- The three new tests name what they guard and the module, and each has its counter-proof recorded. Run on the head with
  the fault planted, each turns its test red: the mark dropped; `runs on` narrowed; the default's `paid` row ticked for
  every commit; and other sections allowed.
- The Acceptance holds:
  - the default is read with the schema, its rows and occasion columns as MOD-test-schedule's Data gives them, every row
    ticked for the release candidate, and marked as the default;
  - a product's schedule is read with the schema, without a finding;
  - a schedule of another shape is named by MOD-documents' findings.

Noted, no reason by themselves; they go to the review:
- The default's nightly time, `02:00`, is given by no accepted text. MOD-test-schedule's file gives the default none, and
  UC-027 lets the author set it (step 3).
- The two gaps the pull request names. The default in MOD-test-schedule's Data shows no column `runs on`, which its
  schema names; the file `default-schedule.md` holds it empty. And "marked as the default" names no mechanism; it is
  built as `default: true` on what `defaultSchedule` returns.
