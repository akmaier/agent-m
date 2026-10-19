---
id: ITM-973
title: retryJob queues a new job with the same inputs that names the job it retries
level: module
realises:
  - UC-036
  - A JOB IDENTIFIER IS NEVER REUSED
  - A JOB GOES ONLY TO A HOLDER OF ITS ROLE
  - A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
modules:
  - MOD-runtimes
builds_on:
  - ITM-253
  - ITM-495
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-036-6, verified against the accepted texts on main at ee5d1364
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-973 retryJob queues a new job with the same inputs that names the job it retries

**REGISTER**

## Outcome

MOD-runtimes.md:200-204: "`retryJob(record: JobRecord, choice: { participant: Participant, route: Route }, host: Host,
head: string)` — queues a new job with a new identifier and the same inputs and parameters, which names the one it
retries; the participant is the same or another holder of the role. A job whose task travelled with its hand-over is
not retried here … Fails with `TaskNotInRecord` for such a job." Not built: `src/runtimes/index.mjs:7-8,11`. UC-036:105-107
(step 7).

## Acceptance

- Over a fake host: a failed fixture job's retry commits a new start record with a new identifier, the same inputs and
  parameters, and the earlier job's identifier; a participant who does not hold the role is refused; a hand-over job
  fails with `TaskNotInRecord`. Counter-proof: a retry reusing the identifier fails.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/runtimes/` and the tests that name MOD-runtimes change.
