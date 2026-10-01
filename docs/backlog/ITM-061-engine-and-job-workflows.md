---
id: ITM-061
title: The engine and job workflows of a product, their two named secrets, the runner check and the CI-agent driver
kind: implementation
level: 1
realises:
  - A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET
  - A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET
  - A SELF-HOSTED RUNNER SERVES AGENT M ONLY FROM A PRIVATE REPOSITORY
  - UC-010
  - UC-043
modules:
  - MOD-ci-generator
  - MOD-ci-entry
depends_on:
  - ITM-059
  - ITM-060
  - ITM-038
  - ITM-039
  - ITM-040
  - ITM-055
origin: backlog refinement 2026-10-01
---
# ITM-061 The engine and job workflows of a product, their two named secrets, the runner check and the CI-agent driver

**REGISTER**

## Outcome

`generateJobWorkflows`, `secretSetup`, `checkRunner` and `driver` of MOD-ci-generator, and the CI entry's `engine` and `job` steps: the agent's key read only from one named secret, every write on the person's token from a second named secret, `GITHUB_TOKEN`/`CI_JOB_TOKEN` given no write (a generated file that writes with them is refused); a self-hosted runner only for a repository the server reports as private.

## Realises

- `A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET`
- `A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET`
- `A SELF-HOSTED RUNNER SERVES AGENT M ONLY FROM A PRIVATE REPOSITORY`
- UC-010 — Run a job in GitHub Actions
- UC-043 — Run the process over a selection

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-ci-generator (takes over the withdrawn MOD-participant-ci), MOD-ci-entry; ARC-009 decision 3, ARC-010 decision 3, ARC-015 decision 7.

Architecture decisions its modules follow: ARC-003, ARC-009, ARC-010, ARC-015.

## Modules

- MOD-ci-generator (features) — uses no other module
- MOD-ci-entry (shells) — uses MOD-artifacts, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-participants, MOD-process-model, MOD-review-core, MOD-run-engine, MOD-source-library, MOD-test-records

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/ci-generator/job-workflows.mjs` (new)
- `docs/assets/ci-generator/driver.mjs` (new)
- `docs/assets/jobs/generate-ci/` (new)
- `tools/ci-entry/engine.mjs` (new)
- `tools/ci-entry/job.mjs` (new)
- `tests/test_runtime_levels.py`
- `tests/review-core.d/self-hosted-runner.test.mjs`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/review-core.test.mjs` — `A SELF-HOSTED RUNNER SERVES AGENT M ONLY FROM A PRIVATE REPOSITORY`
- `tests/test_runtime_levels.py` — `A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET`; `A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET`

## Acceptance criteria

From the SPEC's checks:

- `A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET` — `tests/test_runtime_levels.py` — the generated job workflow reads the key only from the named secret; counter-proof: a workflow with the key written into it fails.
- `A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET` — `tests/test_runtime_levels.py` — the generated job workflow authenticates its pushes and pull requests with the named secret; counter-proof: a workflow that uses `GITHUB_TOKEN` for them fails.
- `A SELF-HOSTED RUNNER SERVES AGENT M ONLY FROM A PRIVATE REPOSITORY` — `tests/review-core.test.mjs` — starting a job on a runner of a repository the API reports as public is refused; counter-proof: a private one is allowed.

From the postcondition of UC-010 (Run a job in GitHub Actions), for the part this item builds:

> - The artifacts are of the same kind the browser runtime would produce.
> - Nothing counts as accepted before a person accepts it on the dashboard.

From the postcondition of UC-043 (Run the process over a selection), for the part this item builds:

> - Every selected module has code and tests merged through pull requests whose Definition of Done held, or
>   is listed with the job that failed or the gate that waits.
> - The run's record names the selection, the limits, every job it started and the end state; each job's
>   record names the run.
> - The author clicked to start, and wherever the model gave a gate to a person — nowhere else.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-059 — the generator
- ITM-060 — the CI entry
- ITM-038 — extends tests/test_runtime_levels.py
- ITM-039 — nextJobs for the engine step
- ITM-040 — runJob for the job step
- ITM-055 — workflow dispatch

## Needs a person

No.
