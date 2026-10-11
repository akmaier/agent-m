---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 818f622537e5c721e595d50b3aff2401c1cc2691
  - https://github.com/akmaier/agent-m/pull/398
date: 2026-10-11 18:47 UTC
---
# Development → Release testing: ITM-322, Agent M's job workflow for a product

**REGISTER**

## Reason

ITM-322, pull request #398 by developer-sonnet-c into `sprint/team1/18`, head `818f622`. The tests-only commits
`f8045c5` and `edfe42e` each hold only `tests/runtimes-workflow.test.mjs`, and CI was red on each (runs 38164452035,
38164647640). CI is green on `818f622` (run 38164928905, 1693 tests, 0 failures). The code changes only
`src/runtimes/`: `ci.mjs`, `index.mjs` and the templates `workflow/github.yml` and `workflow/gitlab.yml`. The new
test names MOD-runtimes and its guards, and 52 faults are recorded. The Acceptance holds for GitHub and GitLab: every
event mapped to its entry, one job per route, the instance pinned to its commit, the secrets by name only, and GitLab's
include.

The reading weighed: `jobWorkflowFiles` reads its templates from disk in Node and throws, by name, in a browser.
Reading them there would need a channel that `tests/test_no_backend.py` does not permit MOD-runtimes, and that file is
changed between jobs, not by this item (`WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS`); #399 is decided by the same
rule. The function is synchronous, as the module file types it. Reading the templates in a browser is needed by
ITM-351, whose settings line installs the files. Noted for the review, as a change between jobs before ITM-351.
