---
id: ITM-547
title: An entry reads its environment on GitLab CI
level: module
realises:
  - UC-049
  - A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET
modules:
  - MOD-workflow-entries
builds_on:
tests:
  - unit
origin:
  - MOD-workflow-entries, Interfaces: CiEnvironment — "the CI service (`github` or `gitlab`) and its event with its payload"
  - ITM-532's reading in sprint team1/46: `ciEnvironment` (`src/workflow-entries/compose.mjs`) reads only GitHub's variables, and its `service` is always `github`
---
# ITM-547 An entry reads its environment on GitLab CI

**REGISTER**

## Outcome

MOD-workflow-entries' `CiEnvironment`, as its file states it, for an entry run by the GitLab job workflow that
MOD-runtimes writes (`src/runtimes/workflow/gitlab.yml`). Today `ciEnvironment` in `src/workflow-entries/compose.mjs`
reads only GitHub Actions' variables, and its `service` is always `github`. On GitLab, `onDispatch` therefore finds no
input `job`.

The readings, settled from the module file, the GitLab template and GitLab's predefined variables (docs.gitlab.com,
"Predefined CI/CD variables"):
- **Which service.** It is `gitlab` where `GITLAB_CI` is `true`, and `github` otherwise, as today.
- **The event and the inputs.**
  - The event's `name` is `CI_PIPELINE_SOURCE`.
  - Its `payload` is `{ inputs }`, where `inputs` holds `job`, `task` and `endpoint` from `AGENT_M_INPUT_JOB`,
    `AGENT_M_INPUT_TASK` and `AGENT_M_INPUT_ENDPOINT`, which ITM-532's template sets. Each is held only where it is not
    empty. `onDispatch` reads `env.event.payload?.inputs` as it does on GitHub.
- **The checkouts and the repository.** The template runs the entry from `../instance`, a clone of the instance next to
  the product's checkout.
  - `checkout` is `CI_PROJECT_DIR`.
  - `repository` is `CI_PROJECT_URL`, and `branch` is `CI_COMMIT_REF_NAME`.
  - `agentM.commit` is `CI_COMMIT_SHA`, as `GITHUB_SHA` is on GitHub.
  - `job.productDir` is `AGENT_M_PRODUCT_DIR`, and `job.instanceDir` is `../instance` from `CI_PROJECT_DIR`.
- **The job's own fields.**
  - `job.actor` is `GITLAB_USER_LOGIN`.
  - `job.runUrl` is `CI_PIPELINE_URL`. This is the pipeline's `web_url`, which ITM-546's `listCiRuns` gives as a run's
    `url`, so ITM-535's lookup by `by:` finds the run.
  - `job.summaryFile` is `null`: GitLab has no step summary, and the answer stays in the job's log.
  - `token` is `null`: no instance workflow runs on GitLab.
- **Unchanged.** `job.runner`, `job.tokenName`, `job.personToken` and `job.keys` keep the names the template already
  sets: `AGENT_M_RUNNER`, `AGENT_M_TOKEN_NAME`, `AGENT_M_TOKEN` and `AGENT_M_KEY_NAMES`.
- **Left as they are.** The other entries that read a GitHub event's payload are not changed: for them, the payload on
  GitLab holds only `inputs`.

No existing test's expected result changes: without `GITLAB_CI`, every field is read as today.

## Acceptance

- `runEntry("onDispatch", env)` with a GitLab environment gives the entry the service `gitlab`, the event `api` with the
  inputs `job`, `task` and `endpoint`, and each field above. An empty input is absent.
- Without `GITLAB_CI`, a GitHub environment gives the same `CiEnvironment` as before.
- The first commit holds only the tests, and CI is red on it.
- Each test states its expected values in its own text.
