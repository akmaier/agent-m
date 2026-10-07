---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 31c99e7dfee636e62084edc647e22cd107e6121e
  - https://github.com/akmaier/agent-m/pull/160
date: 2026-10-07 12:47 UTC
---
# Development → Release testing: sprint 08, between jobs — three modules read their own data files

**REGISTER**

## Reason

The change between jobs that the record of sprint 08 names before ITM-250, ITM-251 and ITM-252 merge: pull request #160
by scrum-master-session, on head `31c99e7`, branched from `sprint/08` at `7815b0a`, checked against `WHAT NO MODULE OWNS
IS CHANGED BETWEEN JOBS`.
- CI is green on the head (python and node).
- Only `tests/test_no_backend.py` changes, by three entries of `PERMITTED_CHANNELS`: `src/test-schedule/`,
  `src/result-records/` and `src/job-ledger/` may each fetch at most once, and only their own data files — `fetch(url)`
  in `ownFile(url)`, every address resolved from `./` against the module's own.
- That is a check of the whole repository allowing a module what the module's file states that it uses: the Parts of
  MOD-test-schedule (`schedule.schema.md`, `default-schedule.md`), MOD-result-records (`result-record.schema.md`,
  `counter-proof.schema.md`) and MOD-job-ledger (`job.schema.md`, which its Files say it reads) list those files.
- It adds no test.
