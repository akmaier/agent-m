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

It builds on ITM-495, whose GitHub template declares the inputs `task` and `endpoint`.

What the module file leaves unstated, and what is built:
- **The inputs.** `task` and `endpoint` are read from the event's inputs, as `onDispatch` reads `job` today
  (`src/workflow-entries/product.mjs`).
  - `endpoint` is the JSON text of `{ kind, baseUrl, model }`.
  - The key is read from the environment variable the participant's route names (` secret <NAME>`), which the template's
    `AGENT_M_KEY_NAMES` passes.
- **A record whose task travels with the hand-over, dispatched without `task`.** The run ends failed with the reason
  `the task travels with its hand-over, and this run was started without it`, and nothing is written but the end.
- **The task's place.** It is the job's parameter `instruction`, in memory only, as on the Bridge (ITM-492).
- **The refused branch.** A commit message or the pull request's text holding the task's text, trimmed, as one string
  refuses the branch by name. The job ends failed, and nothing is merged.
- **The answer.** It is appended to the file `GITHUB_STEP_SUMMARY` names where it is set, and printed to the log.
- **An unreachable endpoint.** The run ends failed with `diagnoseEndpoint`'s reason and, as MOD-workflow-entries' file
  says, "the routes that would work — a self-hosted runner, or a Bridge (UC-049 4d)". `routesFor` is not among the
  module's Uses and is not called.
- **`onRecordsChanged`.** It leaves every record whose `task` is `with the hand-over` queued.

No existing test's expected result changes, release tests included. The tests of `onDispatch` and `onRecordsChanged`
(`tests/workflow-entries-job-workflow.test.mjs`) use records without `task`, which read as `in parameters`.

## Acceptance

- Over a fixture checkout, a dispatched hand-over runs a fixture agent with the task and writes it nowhere; a branch
  holding the task's words is refused, nothing merged.
- `onRecordsChanged` does not take the job.
- The first commit holds only the tests, and CI is red on it, the stub run recorded where only a missing export makes it
  red.
- Each test states its expected values in its own text (`A TEST DOES NOT TAKE ITS EXPECTED RESULT FROM A DOCUMENT`); an
  existing test that the change turns red is not changed here: the Developer stops and names it.
- Only `src/workflow-entries/` and the tests that name MOD-workflow-entries change.
