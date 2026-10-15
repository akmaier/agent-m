---
id: ITM-498
title: CI runs a task a conversation handed over
level: module
realises:
  - UC-049
  - A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET
  - A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET
  - A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
  - AN UNSUPPORTED ENDPOINT SAYS SO
modules:
  - MOD-workflow-entries
builds_on:
  - ITM-489
  - ITM-490
  - ITM-495
tests:
  - unit
  - component
origin:
  - the architecture of the prompt bar, accepted by akmaier at 7e893c63 (110d2499)
  - MOD-workflow-entries, Interfaces: onDispatch, onRecordsChanged
---
# ITM-498 CI runs a task a conversation handed over

**REGISTER**

## Outcome

`onDispatch` takes a queued job whose task travels with the hand-over and runs it with the input `task` — for a model
endpoint with opencode working with the input `endpoint` and the key from the participant's secret —; it writes the task
to no file, refuses by name a branch whose commit messages or pull request text hold it, appends the end with commits,
files and pull request, and leaves the answer in the run's summary and log. An unreachable endpoint ends the run failed,
naming `diagnoseEndpoint`'s reason and the routes that would work. `onRecordsChanged` leaves such a job to
`onDispatch`.

## Acceptance

- Over a fixture checkout, a dispatched hand-over runs a fixture agent with the task and writes it nowhere; a branch
  holding the task's words is refused, nothing merged.
- `onRecordsChanged` does not take the job.
