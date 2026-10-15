---
id: ITM-495
title: A conversation's work is handed over to CI or a Bridge
level: module
realises:
  - UC-049
  - THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
  - A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
  - A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
  - A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET
modules:
  - MOD-runtimes
builds_on:
  - ITM-490
  - ITM-491
  - ITM-494
tests:
  - unit
  - component
origin:
  - the architecture of the prompt bar, accepted by akmaier at 7e893c63 (110d2499)
  - MOD-runtimes, Data: the job workflow's start; Interfaces: handOverJob, retryJob
---
# ITM-495 A conversation's work is handed over to CI or a Bridge

**REGISTER**

## Outcome

`handOverJob` commits the start record of the handed-over job — its task travelling with the hand-over, never in the
record — and starts the product's job workflow with `startWorkflow` and the inputs `job`, `task` and, for a model
endpoint, `endpoint`, or hands it to a Bridge with `handOver` and the task; it refuses a job that is blocking, does not
fit, or has the gate point `before-write`. The job workflow's templates take those inputs. `retryJob` refuses such a job
with `TaskNotInRecord`.

## Acceptance

- Against a fixture host and a fixture Bridge, each route commits the record without the task's words and starts the
  run with them; a refused start after the commit ends the record as failed with the server's reason.
- A counter-proof: the task planted in the record is found by the test.
