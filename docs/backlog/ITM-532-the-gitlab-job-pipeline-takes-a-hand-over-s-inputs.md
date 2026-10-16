---
id: ITM-532
title: The GitLab job pipeline takes a hand-over's inputs
level: module
realises:
  - UC-049
  - A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
modules:
  - MOD-runtimes
builds_on:
  - ITM-495
tests:
  - unit
origin:
  - ITM-495, as cut in sprint team1/42's start decision
  - MOD-runtimes, Data: the job workflow's inputs `job`, `task` and `endpoint`
---
# ITM-532 The GitLab job pipeline takes a hand-over's inputs

**REGISTER**

## Outcome

The GitLab template that `jobWorkflowFiles` writes takes the inputs `job`, `task` and `endpoint` of a pipeline started
through the API, as the GitHub template takes them since ITM-495. It declares them in the pipeline's `spec`, and runs the
entry `onDispatch` for a pipeline whose source is `api`. MOD-repository-hosts' GitLab `startWorkflow` passes `inputs` to
`POST …/pipeline`.

## Acceptance

- `jobWorkflowFiles("gitlab", …)` declares the three inputs and runs `onDispatch` for the source `api`. The variables test
  of the GitLab file still finds only predefined and Agent M's own variables.
- Each test states its expected values in its own text.
