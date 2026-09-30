---
id: MOD-ci-generator
title: Generates a product's CI configuration and Agent M's workflows from the test schedule, and the Definition of Done check
realises:
  - THE TEST SCHEDULE IS DECLARED PER PRODUCT
  - THE DEFAULT SCHEDULE FOLLOWS THE BOOK
  - COMMIT TESTS CALL NO PAID SERVICE
  - THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE
  - A JOB RECORD STARTS NO CI RUN
  - A RELEASE RUNS EVERY TEST AT EVERY LEVEL
  - A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS
  - AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST
  - A REFACTORING JOB BEGINS WITHOUT A FAILING TEST
  - A REFACTORING JOB CHANGES NO EXPECTED RESULT
  - AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES
  - CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI
  - UC-024
  - UC-027
follows:
  - ARC-003
  - ARC-010
  - ARC-015
uses:
  - MOD-process-model.definitionOfDone
  - MOD-traceability.headerTags
provides:
  - parseSchedule
  - defaultSchedule
  - generateGitHub
  - generateGitLab
  - generateAgentWorkflows
  - doneCheck
---
# MOD-ci-generator Generates a product's CI configuration and Agent M's workflows from the test schedule, and the Definition of Done check

## Responsibility

The generator of ARC-015 and the check of the Definition of Done. Pure core: from the schedule, the
product's host and the runner choices, it produces files that reach the product through a pull
request; `doneCheck` runs as a CI step.

**Current state.** No code exists; Agent M's own `.github/workflows/tests.yml` is hand-written.

## Interfaces

- `parseSchedule(text) -> schedule` — `docs/tests/schedule.md`; a paid-service row ticked for every commit or pull request is an error.
- `defaultSchedule() -> schedule` — the book's default: unit, component, system on every commit and pull request; paid services nightly; everything on a release candidate.
- `generateGitHub(schedule, options) -> { ".github/workflows/agent-m-tests.yml": text }` — one job per occasion running its levels, `paths-ignore` for `docs/jobs/**`, the result-record step, the Definition of Done step; byte-identical for the same input.
- `generateGitLab(schedule, options) -> { ".gitlab-ci.yml": text, schedules }` — the same for GitLab, with the nightly run as a pipeline schedule to create through the API.
- `generateAgentWorkflows(product, options) -> files` — the engine workflow and the job workflow of ARC-010 and ARC-009, each reading an agent key only from a named CI secret.
- `doneCheck({ dod, job, commits, runs, changedFiles }) -> { ok } | { failed: [condition] }` — the step CI runs on a job's pull request: first commit tests only and red (or, for refactoring, green throughout with no changed expectation), only the job's modules changed, every gate recorded, plus the product's own conditions.

Uses, as declared above: `MOD-process-model.definitionOfDone`, `MOD-traceability.headerTags`.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; open until accepted.*
