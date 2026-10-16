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

MOD-runtimes' `handOverJob` queues the work a conversation handed over, on the person's click *Hand over*.
- It commits the start record of the handed-over job, whose task travels with the hand-over and never in the record.
- On the CI route, it starts the product's job workflow with `startWorkflow` and the inputs `job`, `task` and, for a model
  endpoint, `endpoint`.
- On a Bridge, it hands the job over with `handOver` and the task.
- It refuses a job that is blocking, does not fit, or has the gate point `before-write`.
- The GitHub job workflow's template takes the inputs `task` and `endpoint`.

Cut off, each named for later:
- **The GitLab template taking these inputs** is ITM-532. A pipeline started through the API has the source `api`, and its
  inputs must be declared in the pipeline's `spec`, which the template does not have yet.
- **`retryJob`** is not built. Its refusal of such a job (`TaskNotInRecord`) is built with it.

What the module file leaves unstated, and what is built:
- **The record.** `startRecord` of `start` with `task: "with the hand-over"`, committed as the person's commit on `head`
  with the message `Queue job <id>: <kind>`, as `queueJob` commits one.
- **The refusal.** `RuntimeError("NotStartable", { findings })` before anything is written:
  - the findings of `prepared.blocking` and `prepared.notFitting`;
  - for a kind whose gate points hold `before-write`, one finding naming that gate point.
- **The CI route.**
  - `WorkflowMissing` exactly as `queueJob` raises it when the head lacks the job workflow's file.
  - Then `startWorkflow` with the file `jobWorkflowFiles` writes for the server, on the default branch, with the inputs
    `{ job: <id>, task }`, and `endpoint` as the JSON text of `target.endpoint` where it is given.
  - A refusal of the server after the commit appends an end `failed` with the server's reason to the record, through
    MOD-job-ledger's `appendToRecord`, and is thrown again.
- **The Bridge route.** MOD-bridge-client's `handOver(bridge, { product, record, commit, task })` (ITM-491). A refusal
  ends the record as failed in the same way.
- **The GitHub template.** `workflow_dispatch` declares `task` and `endpoint` beside `job`, both not required.

No existing test's expected result changes, release tests included. TST-472724 (`tests/runtimes-workflow.test.mjs`)
matches `workflow_dispatch:` with `job` as its first input, which stays first. The tests of `queueJob` and `runOnTab` call
neither the new function nor the new inputs.

## Acceptance

- Against a fixture host and a fixture Bridge, each route commits the record without the task's words and starts the
  run with them. A refused start after the commit ends the record as failed with the server's reason.
- A blocking job, one that does not fit, and a kind with `before-write` are refused before anything is written.
- A counter-proof: the task planted in the record is found by the test.
- The first commit holds only the tests, and CI is red on it, the stub run recorded where only a missing export makes it
  red.
- Each test states its expected values in its own text (`A TEST DOES NOT TAKE ITS EXPECTED RESULT FROM A DOCUMENT`); an
  existing test that the change turns red is not changed here: the Developer stops and names it.
- Only `src/runtimes/` and the tests that name MOD-runtimes change.
