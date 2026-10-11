---
id: ITM-322
title: Agent M's job workflow for a product
level: module
realises:
  - UC-010
  - A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET
  - A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET
  - NO SECRET IN THE REPOSITORY
  - A SELF-HOSTED RUNNER SERVES AGENT M ONLY FROM A PRIVATE REPOSITORY
  - AGENT M WORKS WITHOUT A LOCAL INSTALLATION
modules:
  - MOD-runtimes
builds_on:
  - ITM-253
tests:
  - unit
origin:
  - UC-010 precondition
  - UC-011 1c
---
# ITM-322 Agent M's job workflow for a product

**REGISTER**

## Outcome

MOD-runtimes' `jobWorkflowFiles` and the templates `workflow/github.yml` and `workflow/gitlab.yml`, as its file states
them: `.github/workflows/agent-m-jobs.yml` on GitHub, and `.gitlab/agent-m-jobs.yml` on GitLab with the include the
product's `.gitlab-ci.yml` needs; started by a push to the default branch that changes `docs/jobs/` or `docs/gates/`, a
pull request closed or merged, a completed check, a daily schedule and a start from the server's own page with a job's
identifier; one job per route of the product's CI agents — the server's runners and each self-hosted runner by its label
—, each checking out the product with the secret `AGENT_M_TOKEN` and the instance at the commit the file names, and
running `node src/workflow-entries/main.mjs <entry>`; agents' keys only by their secrets' names. The files are returned
for the caller to commit. The entries (ITM-365) and the settings line that installs the files (ITM-351) are not part of
this item.

## Acceptance

- Unit tests that name MOD-runtimes state, before the code exists: for GitHub and for GitLab, an instance at a commit,
  two secret names and one runner label, every event mapped to its entry, one job per route, the instance pinned to
  that commit, the secrets by name only, and GitLab's include entry.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/runtimes/` and the tests that name MOD-runtimes change.
