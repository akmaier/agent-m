---
id: ITM-1072
title: A job's input is its prompt with its recipes' inputs and nothing else
level: component
realises:
  - AN AGENT'S RETROSPECTIVE CHANGES NO PROCESS BY ITSELF
modules:
  - MOD-job-runner
builds_on:
tests:
  - component
origin:
  - akmaier's acceptance of the SPEC change `39c071a3` (2026-10-19), relayed by scrum-master-opus
---
# ITM-1072 A job's input is its prompt with its recipes' inputs and nothing else

**REGISTER**

## Outcome

SPEC.md:1912-1919 names this check for AN AGENT'S RETROSPECTIVE CHANGES NO PROCESS BY ITSELF: "`tests/test_job_reading.py`
— the input of each kind of job is its prompt with its recipes' inputs and nothing else; counter-proof: an input that adds an
instruction from a file outside the repository fails". `tests/test_job_reading.py` today compares only the chapters a job
receives.

The other check the sentence names, `tests/test_time_box_close.py`, does not exist. ITM-991 writes it, and reads the
sentence as it now stands.

## Acceptance

- `tests/test_job_reading.py` builds the input of every kind of MOD-job-catalogue with MOD-job-runner's `prepareJob` and
  finds in it the kind's prompt and its recipes' parts and nothing else.
- Counter-proof: an input that adds an instruction from a file outside the repository fails the test.
- The first commit holds only the tests. If they pass before any code changes, the item stops and asks, as the implement
  prompt says.
