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
  - MOD-documents.writeDocument
  - MOD-test-document.isNamedTestFile
  - MOD-test-document.testHeader
  - MOD-test-document.testDeclarations
  - MOD-participant-list.participantSchema
  - MOD-participant-list.participantsOf
  - MOD-participant-list.eligible
  - MOD-resource-list.resourceSchema
  - MOD-repository-hosts.Host
  - MOD-repository-hosts.Snapshot
  - MOD-repository-hosts.PullRequest
  - MOD-repository-hosts.readSnapshot
  - MOD-repository-hosts.repositoryInfo
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
  - testsOfRow
  - proposeSchedule
  - applyPipelineSchedule
  - scheduleStrategies
---
# MOD-test-schedule The test schedule and the CI configuration generated from it

## Responsibility

It belongs to Tests and releases (ARC-043). It keeps a product's declaration of which test levels run on which occasion
(`THE TEST SCHEDULE IS DECLARED PER PRODUCT`), with the book's default where none is declared
(`THE DEFAULT SCHEDULE FOLLOWS THE BOOK`), and generates the product's CI configuration from it — never by hand
(`THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE`), for Agent M's own repository as for every managed product. It
says which test files a row runs. The generated configuration splits a row's tests across the parallel jobs the schedule
declares, bounds every job of a commit or a pull request by the schedule's time limit (for Agent M's own repository,
`A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES`), and prepares each job with the schedule's setup. It carries Agent M's
Definition-of-Done check — the only place it runs — after the tests, and hands every run's outcomes on as JUnit XML
reports so that each run leaves one result record. It gives the person's token only to the jobs that run no code of the
product, calls no paid service on a commit or a pull request (`COMMIT TESTS CALL NO PAID SERVICE`), and starts no run for
a commit that only records jobs (`A JOB RECORD STARTS NO CI RUN`). It proposes a schedule together with the configuration
generated from it in one pull request, and on a GitLab server sets the nightly run as the project's pipeline schedule
once that pull request is merged. It runs in the browser and in Node.

## Parts

- `index.mjs` — the interface.
- `schedule.schema.md` — the schema of the schedule, in MOD-documents' schema language.
- `default-schedule.md` — the book's default schedule, as a schedule file.
- `rules.mjs` — the findings of a schedule.
- `rows.mjs` — the test files a row runs.
- `generate.mjs` — the configuration for GitHub Actions and for GitLab CI, and the comparison with a committed one.
- `templates/` — the fixed parts of both configurations, as data.
- `propose.mjs` — the pull request of a schedule, and the pipeline schedule after its merge.
- `strategies.mjs` — the writer of `scheduleStrategies`.
- **Taken over, outside this folder** (`CODE OUTSIDE THE ARCHITECTURE IS MOVED INTO IT`; the count in `docs/measurements/2026-10-17_code-outside-every-module.md`). Each file goes as stated, in this module's own implementation jobs:
  - `.github/workflows/tests.yml`, `.github/workflows/nightly.yml`: named here, since GitHub fixes their place. They are
    removed once the `agent-m-tests.yml` generated from Agent M's own `docs/tests/schedule.md` performs their coverage.
    Their reading of a test's level is `testsOfRow`. What their steps do that is Agent M's alone becomes the `command`
    and the `setup` of Agent M's schedule — test helpers under `tests/` whose headers name this module — and no line of
    the generator: running the Python and the node suite into one report, keeping the test files that start Electron in
    shards of their own, installing xvfb and openbox, and installing the Bridge app's packages.
  - `tests/test_ci_budget.py`: its header names this module.

## Data

It keeps nothing. It owns the schedule.

**Schema `schedule`** (`schedule.schema.md`), the file `docs/tests/schedule.md` of a product:

| Part of the schema | Value |
|---|---|
| shape | document: front matter, then sections |
| front matter `nightly` | the time of the nightly run, `HH:MM` in UTC |
| front matter `command` | the command that runs the test files a job is given, as stated below; empty where the product's tests run with node's test runner |
| front matter `setup` | a command run in every test job before its tests, which installs what they need; empty where nothing is installed |
| front matter `cache` | the paths `setup` fills that the CI service keeps between runs; empty where nothing is kept |
| front matter `minutes` | the time limit of every job the configuration runs on every commit and on a pull request, a whole number of minutes; empty where none is set |
| section `## Levels` | a table with the columns `Row`, `every commit`, `pull request`, `nightly`, `release candidate`, `on demand`, `runs on`, `shards`; the rows `unit`, `component`, `system`, `paid` (tests that call a paid service or a model), `release`, `user`; a cell is `✓` or empty; `runs on` is `hosted` or a participant of the instance with *run code and tests* whose route is a self-hosted runner; `shards` is the number of parallel jobs the row's tests are split across on every occasion, a whole number from 1, empty for 1 |

The default (`default-schedule.md`), with no command, setup, cache or time limit, one shard per row:

| Row | every commit | pull request | nightly | release candidate | on demand |
|---|:-:|:-:|:-:|:-:|:-:|
| unit | ✓ | ✓ | ✓ | ✓ | ✓ |
| component | ✓ | ✓ | ✓ | ✓ | ✓ |
| system | ✓ | ✓ | ✓ | ✓ | ✓ |
| paid | | | ✓ | ✓ | ✓ |
| release | | | | ✓ | ✓ |
| user | | | | ✓ | ✓ |

**The test files of a row** (`testsOfRow`). The files that run are the product's committed files named as tests are
named in their language (MOD-test-document's `isNamedTestFile`); a helper, a fixture or a manual test in Markdown is
none of them. A file's level is its header's `Level:`, or else the one level all its declarations share. The row of a
level runs the files of that level none of whose declarations names a paid service; the row `paid` runs every file one
of whose declarations does (`COMMIT TESTS CALL NO PAID SERVICE`). A named test file whose level cannot be read is in no
row, and is named.

**The command.** A test job runs `command` with the files of its row as its arguments and with these variables in its
environment:

| Variable | Value |
|---|---|
| `AGENT_M_ROW` | the row |
| `AGENT_M_OCCASION` | the occasion that started the job: `commit`, `pull-request`, `nightly`, `release-candidate` or `on-demand` |
| `AGENT_M_SHARD` | the job's place among the row's shards, from 1 |
| `AGENT_M_SHARDS` | the number of the row's shards |
| `AGENT_M_REPORT` | the path the report is written to |

The command runs its share — shard `AGENT_M_SHARD` of `AGENT_M_SHARDS` — of the files it is given, writes their
outcomes as one JUnit XML report to `AGENT_M_REPORT`, and ends with a status other than 0 when a test failed. How the
share is drawn is the command's, so that a product keeps its own constraints — files that must not share a job — in its
own command. With `command` empty, node's test runner runs the files, drawing the share with its own sharding and writing
the report with its own JUnit reporter. A product with several suites names one command that runs them all and writes one
report. A test that must run only on some occasions reads `AGENT_M_OCCASION`; a test that must run only in its row's job
reads `AGENT_M_ROW`.

**The generated configuration.** It is a file of Agent M's own, beside any configuration the product has, which stays as
it is (UC-027 1a): `.github/workflows/agent-m-tests.yml` on GitHub; on a GitLab server `.gitlab/agent-m-tests.yml`, which
the product's `.gitlab-ci.yml` includes with one entry `- local: .gitlab/agent-m-tests.yml` under its `include:` — added
where it is missing, with the `include:` key where the file has none, and the file itself where the product has none;
every other line stays as it is. MOD-runtimes' job workflow `.gitlab/agent-m-jobs.yml` is included the same way, by that
module. The file holds:
- the triggers of the occasions the schedule ticks, and the pull request, on which `agent-m done` runs; a push to the
  default branch that changes only files under `docs/jobs/` or `docs/conversations/` starts nothing — job records
  (`A JOB RECORD STARTS NO CI RUN`), and the conversation records of the prompt bar, of which every message adds one
  commit;
- one test job per row and occasion the schedule ticks, run as the row's `shards` parallel jobs — on GitHub a matrix, on
  GitLab `parallel:` —, on the runner the row's `runs on` names. Each checks out the product, provides the Node.js
  release Agent M's entries run with, checks out the instance at `instanceCommit`, and restores the cache where `cache`
  names paths. It runs `setup`, then MOD-workflow-entries' `runTests`, which runs the row's files through `command`.
  Whatever their outcome, it keeps the report as an artifact of the run, which only the run's own jobs take, in the
  folder and under the name MOD-workflow-entries' `CiEnvironment` fixes. A test job reads no token, since it runs code
  of the product, which a participant may have written; only the jobs of the row `paid` read the secrets of the services
  they call;
- on every commit and on a pull request, `minutes` as the time limit of every job of the file, after which the CI service
  stops the job and the run fails;
- where `cache` names paths, one job `agent-m setup` before the test jobs of the run: it runs `setup` once and keeps
  those paths in the CI service's cache under a key made of `setup` and the week, so that the shards restore them instead
  of all fetching at once;
- the nightly occasion as a schedule at the declared time on GitHub, and on GitLab as the project's pipeline schedule,
  which is a setting of the project rather than a line of the file;
- the release candidate occasion on a pushed tag `v*-rc.*`, running every row;
- on demand as a manual start naming the rows to run;
- the job `agent-m records`, after every test job of the run, whatever their outcome: it takes the reports the run's
  test jobs kept — the JUnit XML report every common test runner can write — and runs MOD-workflow-entries'
  `onTestsFinished`, which adds the run's one result record to the branch `test-results` (the reading of the reports and
  the record's format are MOD-result-records');
- on every pull request, the job `agent-m done`, after the pull request's test jobs and `agent-m records`, whatever
  their outcome. It runs MOD-workflow-entries' `onDoneCheck` with the outcomes of those jobs — the only place the
  Definition-of-Done check runs;
- the person's token only in `agent-m records` and `agent-m done`, which run Agent M's entries from the instance's
  checkout and no code of the product, on the server's own runners. On GitHub these two jobs alone name the secret
  `AGENT_M_TOKEN`, the one MOD-runtimes' job workflow reads. On GitLab they alone are of the environment `agent-m-write`,
  with the action `verify` — the one scope MOD-runtimes' `gitlabVariableScopes` gives the token —, and take neither the
  product's `default:` nor its global `variables:`;
- the secrets the scheduled tests need, by name only, read from the CI's secrets.

## Interfaces

- `scheduleSchema: Schema` — the schedule's schema, for MOD-documents.
- `defaultSchedule() -> Document` — the book's default as a schedule, marked as the default.
- `scheduleFindings(schedule: Document, participants: Document) -> Finding[]` — what a schedule may not say: the release
  candidate column not ticked for a row (`A RELEASE RUNS EVERY TEST AT EVERY LEVEL`); the row `paid` ticked for every
  commit or a pull request (`COMMIT TESTS CALL NO PAID SERVICE`); `runs on` naming a participant without *run code and
  tests* or without a runner route. Each finding names the row and column.
- `ciConfiguration(schedule: Document, target: { server: "github" | "gitlab", instance: string, instanceCommit: string
  }, resources: Document, participants: Document) -> { files: Record<string, string>, include: { file: ".gitlab-ci.yml", entry: string } | null,
  pipelineSchedule: { cron: string, rows: string[] } | null }` — the configuration generated from the schedule; on
  GitLab also the include entry the product's `.gitlab-ci.yml` must hold, and the pipeline schedule to set after the
  configuration is merged. Considers: the schedule must have no error finding; `instanceCommit` pins the Agent M whose
  `runTests`, `onTestsFinished` and `onDoneCheck` the configuration runs — for Agent M's own repository a commit of its
  own history, so that the code of a pull request never runs the entries that hold the token. Errors: `InvalidSchedule`
  with its findings.
- `configurationDrift(files: Record<string, string>, schedule: Document, target: { server: "github" | "gitlab",
  instance: string, instanceCommit: string }, resources: Document, participants: Document) -> Array<{ path: string,
  difference: string }>` — where the committed configuration differs from the one `ciConfiguration` generates from the
  same schedule, target, resources and participants, on GitLab including a `.gitlab-ci.yml` without the include
  entry; empty when they agree, and for a configuration Agent M did not generate, the triggers it has and which rows they
  run, as far as they can be read.
- `secretsNeeded(schedule: Document, resources: Document) -> Array<{ name: string, for: string }>` — the names of the
  secrets the scheduled tests need, taken from the product's resources that the ticked rows call; never a value.
- `occasionsOf(row: string, schedule: Document) -> string[]` — the occasions on which a row runs, so that a level without
  a result on a commit can name the occasion that would run it.
- `testsOfRow(row: string, files: Array<{ path: string, text: string }>) -> { files: string[], unreadable: string[] }` —
  the test files a row runs, as stated under Data, in the order of their paths, from the product's committed files given
  with their texts; `unreadable` the named test files whose level cannot be read. Pure; it never throws on content.
  Errors: `UnknownRow` for a row the schema does not name.
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
  committed configuration for its drift, and on GitLab the product's `.gitlab-ci.yml`; `testsOfRow` reads no file, its
  caller gives it the texts.
- Writes, through `proposeSchedule`, a branch with `docs/tests/schedule.md` and `.github/workflows/agent-m-tests.yml`,
  or `.gitlab/agent-m-tests.yml` and the include entry in `.gitlab-ci.yml`, and the pull request that holds them; on a
  GitLab server, through `applyPipelineSchedule`, the project's pipeline schedule of the nightly run.

## Uses

- MOD-documents.Schema, Document, loadSchema, readDocument, readRegister, writeDocument — the schedule, the participants and the
  resources by their schemas, and the schedule's text to commit.
- MOD-test-document.isNamedTestFile, testHeader, testDeclarations — which committed files are tests that run, their
  levels, and which of them call a paid service.
- MOD-participant-list.participantSchema, participantsOf, eligible — the instance's register, its participants and which
  may run a row on a self-hosted runner.
- MOD-resource-list.resourceSchema — the services the tests call and the names of their secrets.
- MOD-repository-hosts.Host, Snapshot, PullRequest, readSnapshot, repositoryInfo, createBranch, commitFiles,
  openPullRequest, setPipelineSchedule — the product's `.gitlab-ci.yml` at the head, the pull request of a schedule and
  the default branch it goes into and the pipeline schedule runs on, and the pipeline schedule on GitLab.
- MOD-text-tools.Finding, finding — the findings of a schedule.
- MOD-job-runner.Strategies, JobContext, JobResult, provenanceLines — the form of the strategy and the provenance of its
  commit.
