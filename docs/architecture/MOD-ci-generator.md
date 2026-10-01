---
id: MOD-ci-generator
title: A product's CI — test workflows from the schedule, the engine and job workflows with their secrets named, and the CI-agent driver
realises:
  - THE TEST SCHEDULE IS DECLARED PER PRODUCT
  - THE DEFAULT SCHEDULE FOLLOWS THE BOOK
  - COMMIT TESTS CALL NO PAID SERVICE
  - THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE
  - A JOB RECORD STARTS NO CI RUN
  - A SELF-HOSTED RUNNER SERVES AGENT M ONLY FROM A PRIVATE REPOSITORY
  - A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET
  - A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET
  - UC-010
  - UC-027
follows:
  - ARC-003
  - ARC-009
  - ARC-010
  - ARC-015
uses: []
provides:
  - parseSchedule
  - defaultSchedule
  - generateTestCi
  - generateJobWorkflows
  - secretSetup
  - checkRunner
  - driver
---
# MOD-ci-generator A product's CI

## Responsibility

Feature. The CI of ARC-015: from a product's test schedule, its host and its runner choices, the test
workflows; the engine workflow and the job workflow that run Agent M's jobs on the server's machines, with
the two secrets they read named and their pages linked, never their values; the check that a self-hosted
runner serves a private repository only; and the CI-agent driver with which a job is dispatched (ARC-009),
through the forge passed in. Every generated workflow step calls `MOD-ci-entry.ciEntry`, the CI runtime's
shell; this module only writes that call into the files and chooses no adapter. Generation is
deterministic: the same schedule gives byte-identical files.

## Interfaces

- `parseSchedule(text) -> schedule` — `docs/tests/schedule.md`; a paid-service row ticked for every commit or pull request is an error.
- `defaultSchedule() -> schedule` — the book's default: unit, component and system on every commit and pull request; paid services nightly; everything on a release candidate.
- `generateTestCi(schedule, host, options) -> files` — GitHub `.github/workflows/agent-m-tests.yml` or GitLab `.gitlab-ci.yml` (with the nightly run as a pipeline schedule to create through the API): one job per occasion running its levels, `docs/jobs/**` ignored, no trigger on the branch `test-results`, the result-record step and the Definition of Done step, each a call of `MOD-ci-entry.ciEntry`.
- `generateJobWorkflows(product, options) -> files` — the engine workflow and the job workflow of ARC-010 and ARC-009: the agent's key read only from one named secret, every write made only on the person's token from a second named secret, `GITHUB_TOKEN` and `CI_JOB_TOKEN` given no write; a generated file that writes with either is refused by the generator's own check (the counter-proof of `A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET`).
- `secretSetup(product, permissions) -> [{ name, holds, url, explanation }]` — the two secrets a product needs and the server's page for each: on GitHub the agent's key and the person's Agent M token, as Actions secrets; on GitLab the agent's key and the product's project access token, as protected, masked CI/CD variables; the explanation says that a secret cannot be read back (ARC-015).
- `checkRunner(info, label) -> { ok } | { refused: reason }` — a self-hosted runner only for a repository the server reports as private.
- `driver(participant, product, forge) -> { describe(), start(job), state(handle), log(handle), cancel(handle) }` — the CI-agent driver: dispatches the job workflow with the job identifier through the forge passed in; `describe()` states that calls to the agent's provider are billed per use.

## Testing

Unit tests for the generator: the configuration generated for a schedule triggers exactly the levels the
schedule names for each event (`tests/test_ci_schedule.py`); a push touching only `docs/jobs/` starts
nothing; a generated job workflow reads the key only from the named secret, and one that writes with
`GITHUB_TOKEN` fails (`tests/test_runtime_levels.py`); two generations of one schedule are byte-identical.
A component test of `driver` with a fake forge. A system test on a test repository runs the generated workflows once per host
before a release (ARC-016). No model is called by the module itself.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; revised on 2026-09-30 by Claude (claude-opus-5-5) against commit 1110607b6dc4d9c888549a23a680fbe4b38dd3f1 — SPEC and use cases as accepted that day, and `docs/measurements/2026-09-30_architecture-open-points.md`; revised on 2026-10-01 by Claude (claude-opus-5-5) against commit d0e5631081876203e719a2508d673d904e7768db — the leaner architecture of the architecture review, as the PO approved it (UC-023): takes over MOD-participant-ci and adds the CI runtime's entry; the Definition of Done check went to MOD-process-model, the credentials' reasons to ARC-015; revised on 2026-10-01 by Claude (claude-opus-5-5) against commit 069522c1cd5696307322bea74bad3953924a38e0 — PO follow-up: the CI runtime's entry as a shell of its own (MOD-ci-entry), and the three rules of queues 2026-10-01 and 2026-10-01b cited; open until accepted.*
