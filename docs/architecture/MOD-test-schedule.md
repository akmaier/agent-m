---
id: MOD-test-schedule
title: The test schedule and the CI configuration generated from it
folder: src/test-schedule/
realises:
follows:
  - ARC-043
uses:
  - MOD-documents.Schema
  - MOD-documents.Document
  - MOD-documents.loadSchema
  - MOD-documents.readDocument
  - MOD-documents.readRegister
  - MOD-participant-list.participantSchema
  - MOD-participant-list.eligible
  - MOD-resource-list.resourceSchema
  - MOD-repository-hosts.Host
  - MOD-repository-hosts.Snapshot
  - MOD-repository-hosts.PullRequest
  - MOD-repository-hosts.readSnapshot
  - MOD-repository-hosts.createBranch
  - MOD-repository-hosts.commitFiles
  - MOD-repository-hosts.openPullRequest
  - MOD-repository-hosts.setPipelineSchedule
  - MOD-text-tools.Finding
  - MOD-text-tools.finding
  - MOD-job-runner.Strategies
  - MOD-job-runner.JobContext
  - MOD-job-runner.JobResult
  - MOD-job-runner.provenanceLines
provides:
  - scheduleSchema
  - defaultSchedule
  - scheduleFindings
  - ciConfiguration
  - configurationDrift
  - secretsNeeded
  - occasionsOf
  - proposeSchedule
  - applyPipelineSchedule
  - scheduleStrategies
---
# MOD-test-schedule The test schedule and the CI configuration generated from it

## Responsibility

It belongs to Tests and releases (ARC-043). It keeps a product's declaration of which test levels run on which occasion
(`THE TEST SCHEDULE IS DECLARED PER PRODUCT`), with the book's default where none is declared
(`THE DEFAULT SCHEDULE FOLLOWS THE BOOK`), and generates the product's CI configuration from it — never by hand
(`THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE`). The generated configuration carries Agent M's
Definition-of-Done check — the only place it runs —, hands every run's outcomes on as a JUnit XML report so that each
run leaves a result record, calls no paid service on a commit or a pull request (`COMMIT TESTS CALL NO PAID SERVICE`),
and starts no run for a commit that only records jobs (`A JOB RECORD STARTS NO CI RUN`). It proposes a schedule together
with the configuration generated from it in one pull request, and on a GitLab server sets the nightly run as the
project's pipeline schedule once that pull request is merged. It runs in the browser and in Node.

## Parts

- `index.mjs` — the interface.
- `schedule.schema.md` — the schema of the schedule, in MOD-documents' schema language.
- `default-schedule.md` — the book's default schedule, as a schedule file.
- `rules.mjs` — the findings of a schedule.
- `generate.mjs` — the configuration for GitHub Actions and for GitLab CI, and the comparison with a committed one.
- `templates/` — the fixed parts of both configurations, as data.
- `propose.mjs` — the pull request of a schedule, and the pipeline schedule after its merge.
- `strategies.mjs` — the writer of `scheduleStrategies`.

## Data

It keeps nothing. It owns the schedule.

**Schema `schedule`** (`schedule.schema.md`), the file `docs/tests/schedule.md` of a product:

| Part of the schema | Value |
|---|---|
| shape | document: front matter, then sections |
| front matter `nightly` | the time of the nightly run, `HH:MM` in UTC |
| front matter `command` | the command that runs the product's tests where they do not run with node's test runner; empty otherwise |
| front matter `report` | the path of the JUnit XML report `command` writes; empty with node's test runner, whose JUnit reporter the generated configuration sets itself |
| section `## Levels` | a table with the columns `Row`, `every commit`, `pull request`, `nightly`, `release candidate`, `on demand`, `runs on`; the rows `unit`, `component`, `system`, `paid` (tests that call a paid service or a model), `release`, `user`; a cell is `✓` or empty; `runs on` is `hosted` or a participant of the instance with *run code and tests* whose route is a self-hosted runner |

The default (`default-schedule.md`):

| Row | every commit | pull request | nightly | release candidate | on demand |
|---|:-:|:-:|:-:|:-:|:-:|
| unit | ✓ | ✓ | ✓ | ✓ | ✓ |
| component | ✓ | ✓ | ✓ | ✓ | ✓ |
| system | ✓ | ✓ | ✓ | ✓ | ✓ |
| paid | | | ✓ | ✓ | ✓ |
| release | | | | ✓ | ✓ |
| user | | | | ✓ | ✓ |

The generated configuration is a file of Agent M's own, beside any configuration the product has, which stays as it is
(UC-027 1a): `.github/workflows/agent-m-tests.yml` on GitHub; on a GitLab server `.gitlab/agent-m-tests.yml`, which the
product's `.gitlab-ci.yml` includes with one entry `- local: .gitlab/agent-m-tests.yml` under its `include:` — added
where it is missing, with the `include:` key where the file has none, and the file itself where the product has none;
every other line stays as it is. MOD-runtimes' job workflow `.gitlab/agent-m-jobs.yml` is included the same way, by that
module. The file holds:
- one job per row and occasion the schedule ticks; a push to the default branch that changes only files under
  `docs/jobs/` starts nothing;
- the nightly occasion as a schedule at the declared time on GitHub, and on GitLab as the project's pipeline schedule,
  which is a setting of the project rather than a line of the file;
- the release candidate occasion on a pushed tag `v*-rc.*`, running every row;
- on demand as a manual start naming the rows to run;
- on every pull request, the job `agent-m done`, which runs MOD-workflow-entries' `onDoneCheck` from the instance
  repository at a named commit — the only place the Definition-of-Done check runs;
- after the tests of every run, a step that hands the run's outcomes to MOD-workflow-entries' `onTestsFinished` as a
  JUnit XML report — the report every common test runner can write —, from which the run's result record is added to the
  branch `test-results` (the reading of the report and the record's format are MOD-result-records');
- the secrets the scheduled tests need, by name only, read from the CI's secrets.

## Interfaces

- `scheduleSchema: Schema` — the schedule's schema, for MOD-documents.
- `defaultSchedule() -> Document` — the book's default as a schedule, marked as the default.
- `scheduleFindings(schedule: Document, participants: Document) -> Finding[]` — what a schedule may not say: the release
  candidate column not ticked for a row (`A RELEASE RUNS EVERY TEST AT EVERY LEVEL`); the row `paid` ticked for every
  commit or a pull request (`COMMIT TESTS CALL NO PAID SERVICE`); `runs on` naming a participant without *run code and
  tests* or without a runner route. Each finding names the row and column.
- `ciConfiguration(schedule: Document, target: { server: "github" | "gitlab", instance: string, instanceCommit: string
  }, resources: Document) -> { files: Record<string, string>, include: { file: ".gitlab-ci.yml", entry: string } | null,
  pipelineSchedule: { cron: string, rows: string[] } | null }` — the configuration generated from the schedule; on
  GitLab also the include entry the product's `.gitlab-ci.yml` must hold, and the pipeline schedule to set after the
  configuration is merged. Considers: the schedule must have no error finding; `instanceCommit` pins the Agent M whose
  `onDoneCheck` and `onTestsFinished` the configuration runs. Errors: `InvalidSchedule` with its findings.
- `configurationDrift(files: Record<string, string>, schedule: Document, target: { server: "github" | "gitlab",
  instance: string, instanceCommit: string }) -> Array<{ path: string, difference: string }>` — where the committed
  configuration differs from the one the schedule generates, on GitLab including a `.gitlab-ci.yml` without the include
  entry; empty when they agree, and for a configuration Agent M did not generate, the triggers it has and which rows they
  run, as far as they can be read.
- `secretsNeeded(schedule: Document, resources: Document) -> Array<{ name: string, for: string }>` — the names of the
  secrets the scheduled tests need, taken from the product's resources that the ticked rows call; never a value.
- `occasionsOf(row: string, schedule: Document) -> string[]` — the occasions on which a row runs, so that a level without
  a result on a commit can name the occasion that would run it.
- `proposeSchedule(host: Host, schedule: Document, context: { server: "github" | "gitlab", instance: string,
  instanceCommit: string, resources: Document, participants: Document, head: string, trailers: string[] }) -> Promise<{
  pullRequest: PullRequest, branch: string }>` — the person's **Save** (UC-027 step 5) and the writer below: generates the
  configuration with `ciConfiguration`, creates a branch from the head that was read, commits the schedule file, the
  generated file and, on GitLab, the product's `.gitlab-ci.yml` with the include entry in one commit, and opens one pull
  request that holds them, so that schedule and configuration never disagree on the default branch; where the product
  has a configuration Agent M did not generate, Agent M's file stands beside it and the pull request says so (UC-027
  1a). `trailers` are a job's provenance lines, empty for a person's own save. Considers: a schedule
  with an error finding writes nothing. Crosses the network. Errors: `InvalidSchedule { findings }`, `Moved`,
  `TokenRefused`, `PermissionMissing`, `RateLimited`, `Unreachable`.
- `applyPipelineSchedule(host: Host, schedule: Document) -> Promise<{ url: string } | null>` — on a GitLab server, once
  the pull request of `proposeSchedule` is merged: creates or updates the project's pipeline schedule of the nightly run
  at the declared time, with the rows it runs, through the host's `setPipelineSchedule`, and returns the address of the
  project's pipeline schedules for the person to see (UC-027 3a); `null` on GitHub, where the nightly run is part of the
  configuration. Considers: whoever merged calls it — the page after the person's merge, the Workflows after a run's
  merge. Crosses the network. Errors: `TokenRefused`, `PermissionMissing`, `RateLimited`, `Unreachable`.
- `scheduleStrategies: Strategies` — the strategies this module offers the job runner (ARC-046):
  - writer `ci-configuration` — the writer of the kind that sets up CI in a run: the product's schedule, or the default
    where there is none, through `proposeSchedule` with the job's provenance lines.

`Schema` and `Document` are MOD-documents' types; `Host`, `Snapshot` and `PullRequest` MOD-repository-hosts'.

## Files

- Reads `docs/tests/schedule.md`, the instance's `docs/participants.md` and the product's `docs/resources.md`, the
  committed configuration for its drift, and on GitLab the product's `.gitlab-ci.yml`.
- Writes, through `proposeSchedule`, a branch with `docs/tests/schedule.md` and `.github/workflows/agent-m-tests.yml`,
  or `.gitlab/agent-m-tests.yml` and the include entry in `.gitlab-ci.yml`, and the pull request that holds them; on a
  GitLab server, through `applyPipelineSchedule`, the project's pipeline schedule of the nightly run.

## Uses

- MOD-documents.Schema, Document, loadSchema, readDocument, readRegister — the schedule, the participants and the resources by their
  schemas.
- MOD-participant-list.participantSchema, eligible — which participants may run a row on a self-hosted runner.
- MOD-resource-list.resourceSchema — the services the tests call and the names of their secrets.
- MOD-repository-hosts.Host, Snapshot, PullRequest, readSnapshot, createBranch, commitFiles, openPullRequest,
  setPipelineSchedule — the product's `.gitlab-ci.yml` at the head, the pull request of a schedule, and the pipeline
  schedule on GitLab.
- MOD-text-tools.Finding, finding — the findings of a schedule.
- MOD-job-runner.Strategies, JobContext, JobResult, provenanceLines — the form of the strategy and the provenance of its
  commit.
