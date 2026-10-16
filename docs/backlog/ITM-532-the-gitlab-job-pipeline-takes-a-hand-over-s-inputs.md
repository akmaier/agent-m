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

The GitLab files that `jobWorkflowFiles` writes take the inputs `job`, `task` and `endpoint` of a pipeline started
through the API, as the GitHub template takes them since ITM-495. They give each input to the job as a variable, and run
the entry `onDispatch` for a pipeline that the API started as well as for one started from the server's own page.

MOD-repository-hosts' GitLab `startWorkflow` already sends the inputs in the body of `POST …/pipeline`
(`src/repository-hosts/gitlab.mjs:237`). How `onDispatch` reads these variables is ITM-547's, in MOD-workflow-entries.

The readings, settled from MOD-runtimes' Data and from GitLab's documentation (docs.gitlab.com, "CI/CD inputs", read
2026-10-16):
- **Where the inputs are declared.** "Inputs for pipelines must be defined in the `spec:inputs` header of the main
  `.gitlab-ci.yml` file."
  - The `.gitlab-ci.yml` that `jobWorkflowFiles` writes therefore starts with a `spec:` header that declares `job`,
    `task` and `endpoint`, each with `default: ""`. GitLab says: "If any input is missing a default, the pipeline fails
    when it triggers automatically", and a push starts this pipeline without inputs.
  - After the header's `---`, the file includes `.gitlab/agent-m-jobs.yml` with `inputs:`, passing each of the three on
    as `$[[ inputs.<name> ]]` ("Use `include:inputs` to set the values for inputs when the included configuration is
    added to the pipeline").
- **The included file.** `src/runtimes/workflow/gitlab.yml` starts with the same `spec:` header and `---`. Each job sets
  the variables `AGENT_M_INPUT_JOB`, `AGENT_M_INPUT_TASK` and `AGENT_M_INPUT_ENDPOINT`, each to `$[[ inputs.<name> ]]` as
  the whole value. An input that is a whole value is "interpolated into the configuration as its specified type", so a
  task with quotes or line breaks stays one string. The task goes into a variable of the job, never into a file (MOD-
  runtimes, Data: "the task is given to the job and written to no file").
- **The source.** GitLab names a pipeline that the pipelines API created by `CI_PIPELINE_SOURCE` `api`. MOD-runtimes'
  table runs `onDispatch` both for "a start from the server's own page" (`web`) and "from a hand-over" (the API). So the
  one rule of `onDispatch` becomes `$CI_PIPELINE_SOURCE == "web" || $CI_PIPELINE_SOURCE == "api"`. Each entry keeps
  exactly one rule.

One existing test's expected result changes: TST-472723 (`tests/runtimes-workflow.test.mjs`). It expects `.gitlab-ci.yml`
to be only the `include:`. TST-472724, which expects one rule for each entry that includes `$CI_PIPELINE_SOURCE ==
"web"` for `onDispatch`, holds as it is. TST-472727, which expects every variable the GitLab file reads to be
predefined or Agent M's own, holds too, since `$[[ inputs.… ]]` is not a variable.

## Acceptance

- `jobWorkflowFiles("gitlab", …)` writes a `.gitlab-ci.yml` whose `spec:` declares the three inputs with an empty
  default, and which passes them to the included file.
- The included file declares the same three inputs, and gives each job the three `AGENT_M_INPUT_…` variables.
- `onDispatch` runs for the sources `web` and `api`.
- The variables test of the GitLab file still finds only predefined variables and Agent M's own.
- The first commit holds only the tests, and CI is red on it.
- Each test states its expected values in its own text.
