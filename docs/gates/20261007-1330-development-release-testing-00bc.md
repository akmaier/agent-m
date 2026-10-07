---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - cdd5d3d6f993b324b0189e3e0e93edab4ac13c78
  - https://github.com/akmaier/agent-m/pull/164
date: 2026-10-07 13:30 UTC
---
# Development → Release testing: ITM-252

**REGISTER**

## Reason

ITM-252, the record of a job: pull request #164 by developer-sonnet-d, on head `cdd5d3d`, branched from `sprint/08` at
`7815b0a`. What holds:
- The first commit, `6af6a2c`, holds only `tests/job-ledger.test.mjs`, and CI was red on it: the module did not exist
  yet.
- CI is green on the head (python and node). The run used its merge with `sprint/08`, which holds #160's entry for
  `src/job-ledger/`.
- Only `src/job-ledger/` and the new test, whose header names MOD-job-ledger, changed.
- The six new tests name what they guard and the module, and each has its counter-proof recorded.

Why it is rejected: check 5. The Acceptance's "a record with each kind of part appended, read" does not hold for a
record in the form MOD-job-ledger's Data states.
- The Data table writes the lines `gate record:` (`## Resumed`), `works on:` (`## Job started`) and `jobs at once:`
  (`## Limits raised`).
- `job.schema.md` reads them only as `gate_record:`, `works_on:` and `jobs_at_once:`, and the test's record is written
  that way.
- Run on the head:
  - a record whose resumption is written as the file states is read with that gate's `resumedBy` undefined;
  - the same record with `gate_record:` is read with the gate record.
- An End's round record, which the Data table places in the End, is never read: `rounds` is always empty.
- MOD-documents reads a key of `[a-z][a-z0-9_-]*` only. That leaves the module to read these lines itself, or a change to
  its file drafted for akmaier, not a format of its own.

Noted, no reason by itself: `usage:` and `cost:` as one line of JSON each, a form the file does not fix. A question
stands under `## Gate reached`, as the file states.

The item is not done; the review at the sprint's end decides what needs more work in the next sprint. ITM-253, ITM-254,
ITM-256, ITM-257 and ITM-239 build on it.
