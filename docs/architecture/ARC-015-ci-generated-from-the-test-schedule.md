---
id: ARC-015
title: A product's CI is generated from its test schedule — GitHub Actions or GitLab CI —; one job per kind of test runs it on its runner and leaves a note of its run, one job records every run of the pipeline on the branch test-results, and every write from CI is made with the person's token from a named CI secret
forced_by:
  - THE TEST SCHEDULE IS DECLARED PER PRODUCT
  - THE DEFAULT SCHEDULE FOLLOWS THE BOOK
  - COMMIT TESTS CALL NO PAID SERVICE
  - THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE
  - A JOB RECORD STARTS NO CI RUN
  - A RELEASE RUNS EVERY TEST AT EVERY LEVEL
  - EVERY TEST RUN LEAVES A RESULT RECORD
  - TEST RESULTS ARE KEPT IN THE REPOSITORY
  - A RESULT RECORD IS NEVER REWRITTEN
  - A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS
  - A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET
  - A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET
  - A RUN CONTINUES WITHOUT A CLICK BETWEEN ITS JOBS
  - ONE GITHUB TOKEN SERVES EVERY FEATURE
  - A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN
  - A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE
  - NO SECRET IN THE REPOSITORY
  - A RUN SETS UP CI BEFORE IT IMPLEMENTS
  - UC-010
  - UC-014
  - UC-027
  - UC-028
keeps:
  - EVERY TEST RUN LEAVES A RESULT RECORD
  - TEST RESULTS ARE KEPT IN THE REPOSITORY
  - A RESULT RECORD IS NEVER REWRITTEN
  - A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET
---
# ARC-015 CI generated from the test schedule, and the credentials CI writes with

## Context

Each product declares which tests run on every commit, on a pull request, nightly, on a release candidate and on demand
(`THE TEST SCHEDULE IS DECLARED PER PRODUCT`); without a declaration the book's default applies, and the tests that call
a paid service or a model never run on every commit or pull request (`COMMIT TESTS CALL NO PAID SERVICE`). The CI
configuration follows from the schedule and is never a second place that says the same
(`THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE`). Job records start no test run; every run leaves a record on the
branch `test-results`, which only grows (ARC-006, ARC-027). Book ch. 12 §5: CI runs "the complete test suite" on every
commit; ch. 13 §4: paid external calls are mocked and exercised for real only in "a limited nightly integration test".

Writes from CI — the result records here, and the pushes, pull requests and merges of the job runtimes — are made with a
credential the SPEC names: the agent authenticates with a key from a CI secret
(`A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET`), and every write is made with the person's Agent M token from
a CI secret, never with the workflow's built-in token (`A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET`).

## Decision

1. **Two modules.** `MOD-ci-generator`, a feature, reads, writes, defaults and checks the schedule and generates the
   configuration; it reads nothing itself. `MOD-ci-entry`, a shell, runs the steps of the generated jobs that run Agent
   M's code, with the process's environment, its working tree, the network and the clock as ports;
   `src/ci-entry/main.mjs`, the file the jobs call, maps a step's name to its interface.
2. **The schedule is data** in the product repository, `docs/tests/schedule.md` (`MOD-ci-generator.parseSchedule`,
   `MOD-ci-generator.scheduleText`): front matter with the time of the nightly run in UTC and the command that runs the
   product's tests — none for node's test runner —, then the table UC-027 shows, one row per kind of test — unit,
   component, system with recorded responses, tests that call a paid service or a model, release, user — and one column
   per occasion, with where each kind runs: a hosted runner, the self-hosted runner of a CLI or sandboxed agent by its
   name, or people for user tests. A product without the file has the book's default
   (`MOD-ci-generator.defaultSchedule`). A schedule is checked before it is saved (`MOD-ci-generator.scheduleProblems`):
   the tests that call a paid service or a model are never ticked for every commit or a pull request, every kind is
   ticked for a release candidate (`A RELEASE RUNS EVERY TEST AT EVERY LEVEL`), and a runner names a participant with
   *run code and tests* (UC-027 3).
3. **The configuration is generated** (`MOD-ci-generator.testWorkflow`), byte for byte the same for the same schedule,
   so that a configuration edited by hand shows as different from a fresh generation (UC-027 1b):
   - on GitHub, `.github/workflows/agent-m-tests.yml`: a push to any branch but `test-results` and a pull request, both
     with `paths-ignore: ["docs/jobs/**"]`, the nightly `schedule`, and a `workflow_dispatch` with the occasion
     (*release candidate* or *on demand*), the commit and, on demand, the kinds of test; a first job chooses the
     occasion, the commit — a pull request's head, not its merge — and the kinds that run; one job per kind follows,
     `runs-on: ubuntu-latest` for a hosted runner and `runs-on: [self-hosted, <name>]` for the runner a CLI or sandboxed
     agent registered with its name as label; the workflow's own token reads only;
   - on GitLab, `.gitlab-ci.yml`: `workflow:rules` that start no pipeline on `test-results`, start one for a push or a
     merge request only where it changes a path outside `docs/jobs/`, and start one for the nightly pipeline schedule
     and for a pipeline started with the variable `AGENT_M_OCCASION`; one job per kind with `rules` for its occasions,
     and `tags: [<name>]` for the runner of a CLI or sandboxed agent. GitLab matches `changes` with Ruby's
     `File.fnmatch` and the flags `FNM_PATHNAME`, `FNM_DOTMATCH` and `FNM_EXTGLOB`, and a list of patterns matches when
     any does; it has no pattern that excludes, so every path outside `docs/jobs/` is written as the patterns of its
     complement, checked with `File.fnmatch` against paths that must and must not match. The nightly run is a pipeline
     schedule of the project (`MOD-ci-generator.nightlySchedule`).

   A job of a kind checks out the commit to test and the instance's Agent M at the commit the configuration was
   generated with — the instance is a fork of a public repository, so it is read without a token —, runs the tests, and,
   whatever their status, leaves a note of its run and its JUnit report as an artifact (decision 5). One more job —
   `results` on GitHub after every kind's job, `agent-m-results` in GitLab's last stage `.post` — records every run of
   the pipeline.
4. **Which test is which kind.** A job sets `AGENT_M_KIND` — `unit`, `component`, `system`, `paid` or `release` — and
   `AGENT_M_JUNIT`, the file the JUnit report goes to. With node's test runner, `MOD-ci-entry.testCommand` gives the
   command: the files whose `Level:` is the kind (ARC-020 decision 11) and of them every case but those declaring
   `Paid:` or `Runs:` (ARC-027 decision 2), skipped by name; for the kind `paid`, the files that declare such cases, and
   only those. A product with another runner names its command in the schedule; it reads the same two variables.
5. **A pipeline's runs are recorded in one commit.** The last step of a kind's job writes its note, `run.txt` — the
   kind, the job's outcome, the secrets it missed, the run's name, the page of its log and the runner — with plain shell
   lines, so that a job that failed before its tests still leaves one; a job whose secrets are missing fails naming them
   (UC-027 4a). The recording job reads every note and report (`MOD-ci-entry.recordRuns`) and writes the record of
   ARC-027 of each run — not run where secrets were missing or no test is of the kind, a note where no JUnit XML was
   written — as new files on `test-results`, in one commit on the CI secret's authority (ARC-003): the branch is started
   on the tested commit where the repository has none (`MOD-git-host.createBranch`), a record whose path is taken is
   never written over, and a branch that another pipeline moved on is read again, up to three times.
6. **The keys of paid services reach only their job.** The job of tests that call a paid service or a model is the only
   one given them: on GitHub each is passed to that job's steps alone; on GitLab that job accesses the environment
   `agent-m-paid` (`action: access`, which gives access to environment-scoped variables without a deployment), and the
   keys are stored scoped to it. A case that reaches a paid service without declaring it finds no key in a run of every
   commit or pull request, and its call fails that run (ARC-027).
7. **The credentials CI writes with.** The secrets a product's CI needs are named by the dashboard, with the server's
   page where they are stored (`MOD-ci-generator.secretsNeeded`, `MOD-git-host.secretsPageUrl`); their values it never
   asks for, and the generated files name them, never their values (`NO SECRET IN THE REPOSITORY`):
   - the **person's Agent M token**, `AGENT_M_TOKEN`, with which the recording job writes the records — and the job
     runtimes every push, pull request and merge —; on GitHub the one fine-grained token of
     `ONE GITHUB TOKEN SERVES EVERY FEATURE`, passed to the recording step alone; on GitLab the product's project access
     token (`A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN`), masked, scoped to the environment `agent-m-results` that
     only the recording job accesses, and not protected, so that a merge request's pipeline can record its runs. The
     token never reaches a job that runs the product's code;
   - the **keys of paid services** of decision 6;
   - the **agent's key**, read only by the job workflow of the job runtimes and handed only to the agent's provider
     (`A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET`).

   The workflow's built-in token (`GITHUB_TOKEN`, `CI_JOB_TOKEN`) is given no write.
8. **Every generated file reaches the default branch through a pull request with green CI**, like code
   (`CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI`); UC-027 5 opens one pull request with the
   schedule and the configuration together, so that the two never disagree on the default branch.

9. **The workflows of agents' jobs and of runs** (ARC-029, ARC-010): `.github/workflows/agent-m-job.yml`
   (`MOD-ci-generator.jobWorkflow`) — one job per CI agent of the instance on its runner, dispatched with the job and
   named by it, whose last step dispatches the engine workflow where the job belongs to a run
   (`MOD-ci-entry.engineDispatch`) —; `.github/workflows/agent-m-done.yml` (`MOD-ci-generator.doneWorkflow`), the check
   `agent-m done` on pull requests from jobs' branches; and `.github/workflows/agent-m-engine.yml`
   (`MOD-ci-generator.engineWorkflow`), dispatched only and never by a push, one run at a time and one waiting — "any
   existing `pending` job or workflow in the same concurrency group will be canceled and the new queued job or workflow
   will take its place" (`https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax`) —, whose
   step takes the next step of every open run (`MOD-ci-entry.engine`). Their steps run `MOD-ci-entry.jobStart`,
   `MOD-ci-entry.mayWrite`, `MOD-ci-entry.jobObserve`, `MOD-ci-entry.doneCheck` — each the step every runtime performs
   alike (`MOD-job-steps`, ARC-029) on the CI secret's authority, a repair dispatching the job workflow again for the next
   attempt — and `MOD-ci-entry.engine`; the engine's
   step is given the texts of the checked-out tree by their blob, so that it reads the product as the main page does
   without reading each file from the server again. The secrets they read are named by `MOD-ci-generator.jobSecrets` —
   the person's token for Agent M's steps, and each CI agent's key on GitHub's machines for that agent's step alone. A
   GitLab product's job pipeline and engine are designed with the layout of Agent M's CI files beside a product's own
   `.gitlab-ci.yml` (ARC-028).
```mermaid
flowchart LR
    S["docs/tests/schedule.md"]
    G["MOD-ci-generator"]
    W["agent-m-tests.yml or<br/>.gitlab-ci.yml"]
    J["one job per kind of test"]
    E["MOD-ci-entry"]
    TR["branch test-results"]
    S -->|"parseSchedule"| G -->|"testWorkflow"| W --> J
    J -->|"testCommand"| E
    J -->|"notes, JUnit reports"| RJ["recording job"]
    RJ -->|"recordRuns"| E -->|"MOD-git-host, ci-secret"| TR
```

## Alternatives

- **One hand-written workflow reading the schedule at run time** — rejected: the schedule decides the triggers
  themselves (nightly or not), and triggers cannot be computed at run time; also GitLab needs its own file.
- **One job running every kind of test** — rejected: a kind runs on its own runner, and only the job of tests that call
  a paid service or a model may be given the keys of paid services.
- **Each kind's job recording its own run** — rejected: the person's token would stand in a job that has run the
  product's code, which can change the files the recording step then runs; and up to five jobs of one pipeline would
  write `test-results` at once.
- **Result records as CI artifacts** — rejected by `TEST RESULTS ARE KEPT IN THE REPOSITORY`: servers delete them after
  their retention period.
- **Result records in the default branch** — rejected: a commit per run on the default branch would start CI again and
  bury the history.
- **Agent M's code vendored into the product's repository** — rejected: every update of Agent M would change files of
  every product; the jobs read the instance at the commit they were generated with, and a newer Agent M shows as a
  configuration to generate again (UC-027 1b).
- **The built-in token for the job workflows' pushes and pull requests** — rejected by
  `A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET`: its events start no new run, and its pull requests
  wait in "approval-required" (consequences); on GitLab the job token opens no merge request.
- **The built-in token for the result-record step only** (on GitHub it would work, since that push needs to start
  nothing) — not chosen: on GitLab it needs a project setting that is off by default, and two credential paths for one
  kind of step are one more thing to get wrong.
- **A GitHub App installation token** minted in the workflow — GitHub's other documented remedy, which "will expire
  after 1 hour"
  (`https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-an-installation-access-token-for-a-github-app`)
  — not chosen: minting needs the App's private key, and a second credential beside the person's token contradicts
  `ONE GITHUB TOKEN SERVES EVERY FEATURE`.
- **A protected GitLab variable for the person's token** — not chosen: a protected variable is "only available in
  pipelines that run on protected branches or protected tags", so a merge request's pipeline could not record its runs
  (`EVERY TEST RUN LEAVES A RESULT RECORD`); scoping it to `agent-m-results` keeps it from the other jobs instead.

## Consequences

- The other files and steps of the two modules are designed with what they serve, with the credentials of decision 7:
  with the instance, its step that writes an accepted SPEC change without a token (ARC-021); with the sources, its step
  that fetches an EU legal text. The earlier module files
  of `MOD-ci-generator` and `MOD-ci-entry` leave the working tree: this decision is where the modules are designed
  (ARC-020 decision 3).
- Each run of the job workflow for a job of a run ends by dispatching one run of the engine workflow, which reads the
  product as the main page does — the requests ARC-024's consequences count —; the texts of the checked-out tree spare
  it reading again every file the head holds unchanged.
- The steps of UC-027 and UC-028 are realised with the tests pages; creating and updating a GitLab project's pipeline
  schedule (UC-027 3a) needs an interface of `MOD-git-host` designed with them.
- On GitLab, the recording job of every pipeline of the project — a merge request's too — reads `AGENT_M_TOKEN`, so
  whoever may push a branch could change what that job runs; the settings page says so where it names the variable.
- Pipelines of one product write `test-results` one commit each; two that finish at once meet as a branch that moved on,
  and the later one writes again on the new head, which only adds files.
- A pull request from a fork gets no secrets on GitHub: its run cannot write its record, says so in its log, and a
  person runs the tests on its commit from the dashboard (UC-028 5) to record them.
- The append-only property of `test-results` is checked over the branch history by a test (ARC-006); where the host
  offers branch protection against force pushes, the settings page recommends it.
- **Why not the built-in token.** In `https://docs.github.com/en/actions/concepts/security/github_token` (recorded in
  `docs/measurements/2026-09-30_architecture-open-points.md`, point 8): "events triggered by the `GITHUB_TOKEN` will not
  create a new workflow run", except that "`workflow_dispatch` and `repository_dispatch` events always create workflow
  runs"; a pull request opened or updated with it "creates workflow runs in an **approval-required** state", released
  only by "a user with write access" selecting "**Approve workflows to run**". A run would stop at that click
  (`A RUN CONTINUES WITHOUT A CLICK BETWEEN ITS JOBS`). GitHub's remedy is "a GitHub App installation access token or a
  personal access token", which "lets `pull_request` workflows run automatically (without the approval prompt described
  above)"; the PO chose the person's own token. On GitLab, "When you use a job token to push to the project, no CI/CD
  pipelines are triggered", and the job token can only read merge requests
  (`https://docs.gitlab.com/ci/jobs/ci_job_token/`).
- **The token is stored twice.** A secret cannot be read back — the secrets API lists secrets "without revealing their
  encrypted values" (`https://docs.github.com/en/rest/actions/secrets`) —, so the person stores the token in the browser
  and as the secret; the dashboard names the secret and opens its page, and the token's renewal
  (`A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE`) names both places.
- The token a CI job writes with needs, per GitHub's permission table
  (`https://docs.github.com/en/rest/authentication/permissions-required-for-fine-grained-personal-access-tokens`,
  measurement point 8): *Contents* write to push through the git data API and to merge a pull request, *Pull requests*
  write to open one, and *Workflows* write where it writes CI files (`A RUN SETS UP CI BEFORE IT IMPLEMENTS`);
  dispatching a run needs *Actions*, as the occasion of `ONE GITHUB TOKEN SERVES EVERY FEATURE` states.
- **Open measurement 1 — *Workflows* on a push.** GitHub states the need for *Workflows* write only for the releases
  endpoint ("also need the "Workflows" repository permission (write)") and that "The GITHUB_TOKEN available to GitHub
  Actions cannot be authorized for this" (`https://docs.github.com/en/rest/releases/releases`); whether a commit that
  changes `.github/workflows/` through the git data API needs it is not documented in what was read. Measurement: update
  a workflow file with a fine-grained token without *Workflows*, and with it; record both answers.
- **Open measurement 2 — GitLab.** Whether a push and a merge request made with a GitLab project access token start
  pipelines as usual: GitLab documents the exception only for the job token, and the project access token pages say
  nothing about pipelines (measurement point 8). Measurement: push and open a merge request with a project access token
  on a test project; record the pipelines.

## Modules

### MOD-ci-generator

```json module
{
  "id": "MOD-ci-generator",
  "folder": "src/ci-generator/",
  "layer": "feature",
  "responsibility": "Reads, writes, defaults and checks a product's test schedule, and generates from it the CI configuration of the product's server — byte for byte the same for the same schedule —, the secrets its jobs read and the pipeline schedule of a GitLab product's nightly run; and generates the workflow of agents' jobs from the instance's CI agents, the check of the Definition of Done, and the secrets they read; it reads nothing itself.",
  "realises": ["THE TEST SCHEDULE IS DECLARED PER PRODUCT", "THE DEFAULT SCHEDULE FOLLOWS THE BOOK", "THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE", "A JOB RECORD STARTS NO CI RUN", "COMMIT TESTS CALL NO PAID SERVICE", "A RELEASE RUNS EVERY TEST AT EVERY LEVEL", "A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET"],
  "owns": ["ScheduleRow", "Schedule", "CiSetup", "SecretNeed", "NightlySchedule", "ScheduleContent", "JobSecret", "ScheduleFile", "GitHubTestWorkflowFile", "GitLabPipelineFile", "GitHubJobWorkflowFile", "GitHubDoneWorkflowFile", "GitHubEngineWorkflowFile"],
  "uses": ["MOD-contracts", "MOD-artifacts", "MOD-process-model", "MOD-git-host", "MOD-job-runner"]
}
```

```json interface
{
  "id": "MOD-ci-generator.defaultSchedule",
  "summary": "The book's schedule, for a product that declares none: unit, component and system tests on every occasion; tests that call a paid service or a model nightly, on a release candidate and on demand; release and user tests on a release candidate and on demand; every kind on a hosted runner, user tests carried out by people; the nightly run at 02:00 UTC; the tests run with node's test runner.",
  "params": [],
  "result": "Schedule",
  "async": false,
  "refusals": [],
  "examples": [
    {
      "name": "the book's default",
      "input": {},
      "result": {
        "declared": false,
        "nightly": "02:00",
        "command": "",
        "rows": [
          {
            "tests": "unit",
            "occasions": ["every commit", "pull request", "nightly", "release candidate", "on demand"],
            "runsOn": "hosted",
            "line": 0
          },
          {
            "tests": "component",
            "occasions": ["every commit", "pull request", "nightly", "release candidate", "on demand"],
            "runsOn": "hosted",
            "line": 0
          },
          {
            "tests": "system",
            "occasions": ["every commit", "pull request", "nightly", "release candidate", "on demand"],
            "runsOn": "hosted",
            "line": 0
          },
          {
            "tests": "paid",
            "occasions": ["nightly", "release candidate", "on demand"],
            "runsOn": "hosted",
            "line": 0
          },
          { "tests": "release", "occasions": ["release candidate", "on demand"], "runsOn": "hosted", "line": 0 },
          { "tests": "user", "occasions": ["release candidate", "on demand"], "runsOn": "people", "line": 0 }
        ]
      }
    }
  ]
}
```

```json interface
{
  "id": "MOD-ci-generator.parseSchedule",
  "summary": "A product's schedule as docs/tests/schedule.md holds it: front matter with the time of the nightly run and the command that runs its tests — none for node's test runner —, then a table with one row per kind of test, one column per occasion, ✓ where it runs, and where it runs.",
  "params": [{ "name": "text", "type": "string" }],
  "result": "Schedule",
  "async": false,
  "refusals": [
    { "code": "not-a-schedule", "when": "the text has no front matter, no table, a header other than Tests, the five occasions and Runs on, or a row of no known kind" }
  ],
  "examples": [
    {
      "name": "system tests nightly only, the paid ones on a CLI agent's runner",
      "input": { "text": "---\nnightly: 03:30\ncommand: npm test\n---\n\n# Test schedule\n\n| Tests | every commit | pull request | nightly | release candidate | on demand | Runs on |\n|---|:-:|:-:|:-:|:-:|:-:|---|\n| unit | ✓ | ✓ | ✓ | ✓ | ✓ | hosted |\n| component | ✓ | ✓ | ✓ | ✓ | ✓ | hosted |\n| system (with recorded responses) |   |   | ✓ | ✓ | ✓ | hosted |\n| tests that call a paid service or a model |   |   | ✓ | ✓ | ✓ | cli-dev |\n| release |   |   |   | ✓ | ✓ | hosted |\n| user (manual) |   |   |   | ✓ | ✓ | people |\n" },
      "result": {
        "declared": true,
        "nightly": "03:30",
        "command": "npm test",
        "rows": [
          {
            "tests": "unit",
            "occasions": ["every commit", "pull request", "nightly", "release candidate", "on demand"],
            "runsOn": "hosted",
            "line": 10
          },
          {
            "tests": "component",
            "occasions": ["every commit", "pull request", "nightly", "release candidate", "on demand"],
            "runsOn": "hosted",
            "line": 11
          },
          {
            "tests": "system",
            "occasions": ["nightly", "release candidate", "on demand"],
            "runsOn": "hosted",
            "line": 12
          },
          {
            "tests": "paid",
            "occasions": ["nightly", "release candidate", "on demand"],
            "runsOn": "cli-dev",
            "line": 13
          },
          { "tests": "release", "occasions": ["release candidate", "on demand"], "runsOn": "hosted", "line": 14 },
          { "tests": "user", "occasions": ["release candidate", "on demand"], "runsOn": "people", "line": 15 }
        ]
      }
    },
    {
      "name": "a file without its table",
      "input": { "text": "---\nnightly: 02:00\n---\n\n# Test schedule\n" },
      "refused": "not-a-schedule"
    }
  ]
}
```

```json interface
{
  "id": "MOD-ci-generator.scheduleText",
  "summary": "The text of a schedule and where it lies, docs/tests/schedule.md, in the form parseSchedule reads.",
  "params": [{ "name": "schedule", "type": "Schedule" }],
  "result": "FileText",
  "async": false,
  "refusals": [],
  "examples": [
    {
      "name": "the book's default",
      "input": {
        "schedule": {
          "declared": false,
          "nightly": "02:00",
          "command": "",
          "rows": [
            {
              "tests": "unit",
              "occasions": ["every commit", "pull request", "nightly", "release candidate", "on demand"],
              "runsOn": "hosted",
              "line": 0
            },
            {
              "tests": "component",
              "occasions": ["every commit", "pull request", "nightly", "release candidate", "on demand"],
              "runsOn": "hosted",
              "line": 0
            },
            {
              "tests": "system",
              "occasions": ["every commit", "pull request", "nightly", "release candidate", "on demand"],
              "runsOn": "hosted",
              "line": 0
            },
            {
              "tests": "paid",
              "occasions": ["nightly", "release candidate", "on demand"],
              "runsOn": "hosted",
              "line": 0
            },
            { "tests": "release", "occasions": ["release candidate", "on demand"], "runsOn": "hosted", "line": 0 },
            { "tests": "user", "occasions": ["release candidate", "on demand"], "runsOn": "people", "line": 0 }
          ]
        }
      },
      "result": { "path": "docs/tests/schedule.md", "text": "---\nnightly: 02:00\n---\n\n# Test schedule\n\n| Tests | every commit | pull request | nightly | release candidate | on demand | Runs on |\n|---|:-:|:-:|:-:|:-:|:-:|---|\n| unit | ✓ | ✓ | ✓ | ✓ | ✓ | hosted |\n| component | ✓ | ✓ | ✓ | ✓ | ✓ | hosted |\n| system (with recorded responses) | ✓ | ✓ | ✓ | ✓ | ✓ | hosted |\n| tests that call a paid service or a model |   |   | ✓ | ✓ | ✓ | hosted |\n| release |   |   |   | ✓ | ✓ | hosted |\n| user (manual) |   |   |   | ✓ | ✓ | people |\n" }
    },
    {
      "name": "a declared schedule with its command",
      "input": {
        "schedule": {
          "declared": true,
          "nightly": "03:30",
          "command": "npm test",
          "rows": [
            {
              "tests": "unit",
              "occasions": ["every commit", "pull request", "nightly", "release candidate", "on demand"],
              "runsOn": "hosted",
              "line": 10
            },
            {
              "tests": "component",
              "occasions": ["every commit", "pull request", "nightly", "release candidate", "on demand"],
              "runsOn": "hosted",
              "line": 11
            },
            {
              "tests": "system",
              "occasions": ["nightly", "release candidate", "on demand"],
              "runsOn": "hosted",
              "line": 12
            },
            {
              "tests": "paid",
              "occasions": ["nightly", "release candidate", "on demand"],
              "runsOn": "cli-dev",
              "line": 13
            },
            { "tests": "release", "occasions": ["release candidate", "on demand"], "runsOn": "hosted", "line": 14 },
            { "tests": "user", "occasions": ["release candidate", "on demand"], "runsOn": "people", "line": 15 }
          ]
        }
      },
      "result": { "path": "docs/tests/schedule.md", "text": "---\nnightly: 03:30\ncommand: npm test\n---\n\n# Test schedule\n\n| Tests | every commit | pull request | nightly | release candidate | on demand | Runs on |\n|---|:-:|:-:|:-:|:-:|:-:|---|\n| unit | ✓ | ✓ | ✓ | ✓ | ✓ | hosted |\n| component | ✓ | ✓ | ✓ | ✓ | ✓ | hosted |\n| system (with recorded responses) |   |   | ✓ | ✓ | ✓ | hosted |\n| tests that call a paid service or a model |   |   | ✓ | ✓ | ✓ | cli-dev |\n| release |   |   |   | ✓ | ✓ | hosted |\n| user (manual) |   |   |   | ✓ | ✓ | people |\n" }
    }
  ]
}
```

```json interface
{
  "id": "MOD-ci-generator.scheduleProblems",
  "summary": "Every finding of a schedule: a kind of test it has no row for; a nightly time that is no HH:MM; tests that call a paid service or a model ticked for every commit or a pull request; a kind not ticked for a release candidate; a runner that names no CLI or sandboxed agent with \"run code and tests\"; user tests carried out by anything but people.",
  "params": [{ "name": "schedule", "type": "Schedule" }, { "name": "participants", "type": "Participant[]" }],
  "result": "Finding[]",
  "async": false,
  "refusals": [],
  "examples": [
    {
      "name": "four findings",
      "input": {
        "schedule": {
          "declared": true,
          "nightly": "3am",
          "command": "npm test",
          "rows": [
            {
              "tests": "unit",
              "occasions": ["every commit", "pull request", "nightly", "release candidate", "on demand"],
              "runsOn": "hosted",
              "line": 10
            },
            {
              "tests": "component",
              "occasions": ["every commit", "pull request", "nightly", "release candidate", "on demand"],
              "runsOn": "hosted",
              "line": 11
            },
            {
              "tests": "system",
              "occasions": ["nightly", "release candidate", "on demand"],
              "runsOn": "hub-writer",
              "line": 12
            },
            {
              "tests": "paid",
              "occasions": ["pull request", "nightly", "release candidate"],
              "runsOn": "cli-dev",
              "line": 13
            },
            { "tests": "release", "occasions": ["on demand"], "runsOn": "hosted", "line": 14 },
            { "tests": "user", "occasions": ["release candidate", "on demand"], "runsOn": "people", "line": 15 }
          ]
        },
        "participants": [
          {
            "name": "alice",
            "type": "person",
            "model": "",
            "context": null,
            "price": null,
            "capabilities": ["draft text", "read the repository", "write to the repository"],
            "place": "",
            "route": "the GitHub account `alice`",
            "line": 5
          },
          {
            "name": "hub-writer",
            "type": "model endpoint",
            "model": "llama-3.3-70b",
            "context": null,
            "price": null,
            "capabilities": ["draft text"],
            "place": "NHR@FAU, Erlangen",
            "route": "the endpoint hub of this browser",
            "line": 6
          },
          {
            "name": "gw-writer",
            "type": "model endpoint",
            "model": "gateway-model",
            "context": 32000,
            "price": { "currency": "EUR", "input": 0.2, "output": 0.6 },
            "capabilities": ["draft text"],
            "place": "a gateway in Frankfurt, Germany",
            "route": "the endpoint gw of this browser",
            "line": 7
          },
          {
            "name": "ci-dev",
            "type": "CI agent",
            "model": "claude-opus-5-5",
            "context": null,
            "price": null,
            "capabilities": ["read the repository", "write to the repository", "run code and tests"],
            "place": "GitHub's machines, a provider in the USA",
            "route": "the workflow agent-m-job",
            "line": 8
          },
          {
            "name": "cli-dev",
            "type": "CLI agent",
            "model": "claude-opus-5-5",
            "context": null,
            "price": null,
            "capabilities": ["draft text", "read the repository", "write to the repository", "run code and tests", "use tools"],
            "place": "this machine",
            "route": "the bridge on the Mac of `alice`",
            "line": 9
          }
        ]
      },
      "result": [
        { "artifact": "docs/tests/schedule.md", "line": 2, "kind": "error", "what": "the nightly time \"3am\" is no HH:MM", "rule": "THE TEST SCHEDULE IS DECLARED PER PRODUCT", "fix": "write the time of the nightly run as HH:MM in UTC" },
        { "artifact": "docs/tests/schedule.md", "line": 12, "kind": "error", "what": "system tests run on hub-writer, which is no CLI or sandboxed agent with \"run code and tests\"", "rule": "THE TEST SCHEDULE IS DECLARED PER PRODUCT", "fix": "choose a hosted runner or such a participant (UC-017)" },
        { "artifact": "docs/tests/schedule.md", "line": 13, "kind": "error", "what": "tests that call a paid service or a model are ticked for pull request", "rule": "COMMIT TESTS CALL NO PAID SERVICE", "fix": "untick them; a commit's tests use recorded or constructed responses" },
        { "artifact": "docs/tests/schedule.md", "line": 14, "kind": "error", "what": "release tests do not run on a release candidate", "rule": "A RELEASE RUNS EVERY TEST AT EVERY LEVEL", "fix": "tick release candidate" }
      ]
    },
    {
      "name": "a schedule that holds",
      "input": {
        "schedule": {
          "declared": true,
          "nightly": "03:30",
          "command": "npm test",
          "rows": [
            {
              "tests": "unit",
              "occasions": ["every commit", "pull request", "nightly", "release candidate", "on demand"],
              "runsOn": "hosted",
              "line": 10
            },
            {
              "tests": "component",
              "occasions": ["every commit", "pull request", "nightly", "release candidate", "on demand"],
              "runsOn": "hosted",
              "line": 11
            },
            {
              "tests": "system",
              "occasions": ["nightly", "release candidate", "on demand"],
              "runsOn": "hosted",
              "line": 12
            },
            {
              "tests": "paid",
              "occasions": ["nightly", "release candidate", "on demand"],
              "runsOn": "cli-dev",
              "line": 13
            },
            { "tests": "release", "occasions": ["release candidate", "on demand"], "runsOn": "hosted", "line": 14 },
            { "tests": "user", "occasions": ["release candidate", "on demand"], "runsOn": "people", "line": 15 }
          ]
        },
        "participants": [
          {
            "name": "alice",
            "type": "person",
            "model": "",
            "context": null,
            "price": null,
            "capabilities": ["draft text", "read the repository", "write to the repository"],
            "place": "",
            "route": "the GitHub account `alice`",
            "line": 5
          },
          {
            "name": "hub-writer",
            "type": "model endpoint",
            "model": "llama-3.3-70b",
            "context": null,
            "price": null,
            "capabilities": ["draft text"],
            "place": "NHR@FAU, Erlangen",
            "route": "the endpoint hub of this browser",
            "line": 6
          },
          {
            "name": "gw-writer",
            "type": "model endpoint",
            "model": "gateway-model",
            "context": 32000,
            "price": { "currency": "EUR", "input": 0.2, "output": 0.6 },
            "capabilities": ["draft text"],
            "place": "a gateway in Frankfurt, Germany",
            "route": "the endpoint gw of this browser",
            "line": 7
          },
          {
            "name": "ci-dev",
            "type": "CI agent",
            "model": "claude-opus-5-5",
            "context": null,
            "price": null,
            "capabilities": ["read the repository", "write to the repository", "run code and tests"],
            "place": "GitHub's machines, a provider in the USA",
            "route": "the workflow agent-m-job",
            "line": 8
          },
          {
            "name": "cli-dev",
            "type": "CLI agent",
            "model": "claude-opus-5-5",
            "context": null,
            "price": null,
            "capabilities": ["draft text", "read the repository", "write to the repository", "run code and tests", "use tools"],
            "place": "this machine",
            "route": "the bridge on the Mac of `alice`",
            "line": 9
          }
        ]
      },
      "result": []
    }
  ]
}
```

```json interface
{
  "id": "MOD-ci-generator.testWorkflow",
  "summary": "The CI configuration a schedule gives, and where it lies: on GitHub .github/workflows/agent-m-tests.yml — triggered by a push to any branch but test-results and by a pull request, both unless only docs/jobs/ changed, by the nightly cron, and by a dispatch for a release candidate or on demand —; on GitLab .gitlab-ci.yml — a pipeline for a push or a merge request that changes more than docs/jobs/, for the nightly pipeline schedule, and for one started with AGENT_M_OCCASION —; one job per kind of test on its runner, which checks out the commit and the instance's Agent M at the version, runs the tests, and records the run whatever its status; the keys of paid services only in the job of tests that call a paid service or a model; the workflow's own token reads only.",
  "params": [
    { "name": "schedule", "type": "Schedule" },
    { "name": "product", "type": "Product" },
    { "name": "setup", "type": "CiSetup" }
  ],
  "result": "FileText",
  "async": false,
  "refusals": [
    { "code": "not-an-instance", "when": "the instance is no https://github.com/<owner>/<repository>" },
    { "code": "no-version", "when": "the version is no 40-hex commit" },
    { "code": "not-a-secret-name", "when": "a secret's name has other signs than capitals, digits and underscores" }
  ],
  "examples": [
    {
      "name": "the book's default on GitHub, with a paid service's key",
      "input": {
        "schedule": {
          "declared": false,
          "nightly": "02:00",
          "command": "",
          "rows": [
            {
              "tests": "unit",
              "occasions": ["every commit", "pull request", "nightly", "release candidate", "on demand"],
              "runsOn": "hosted",
              "line": 0
            },
            {
              "tests": "component",
              "occasions": ["every commit", "pull request", "nightly", "release candidate", "on demand"],
              "runsOn": "hosted",
              "line": 0
            },
            {
              "tests": "system",
              "occasions": ["every commit", "pull request", "nightly", "release candidate", "on demand"],
              "runsOn": "hosted",
              "line": 0
            },
            {
              "tests": "paid",
              "occasions": ["nightly", "release candidate", "on demand"],
              "runsOn": "hosted",
              "line": 0
            },
            { "tests": "release", "occasions": ["release candidate", "on demand"], "runsOn": "hosted", "line": 0 },
            { "tests": "user", "occasions": ["release candidate", "on demand"], "runsOn": "people", "line": 0 }
          ]
        },
        "product": { "kind": "github", "address": "https://github.com/alice/thesis", "host": "github.com", "server": "https://github.com", "repo": "alice/thesis" },
        "setup": {
          "instance": "https://github.com/alice/agent-m",
          "version": "a100000000000000000000000000000000000000",
          "paidSecrets": ["HUB_KEY"]
        }
      },
      "result": { "path": ".github/workflows/agent-m-tests.yml", "text": "# Generated by Agent M from docs/tests/schedule.md; change the schedule, not this file.\nname: agent-m tests\non:\n  push:\n    branches-ignore: [test-results]\n    paths-ignore: [\"docs/jobs/**\"]\n  pull_request:\n    paths-ignore: [\"docs/jobs/**\"]\n  schedule:\n    - cron: \"0 2 * * *\"\n  workflow_dispatch:\n    inputs:\n      AGENT_M_OCCASION:\n        description: release candidate or on demand\n        type: choice\n        options: [\"on demand\", \"release candidate\"]\n        default: \"on demand\"\n      AGENT_M_COMMIT:\n        description: the commit to test, empty for the head of the branch\n        type: string\n        default: \"\"\n      AGENT_M_TESTS:\n        description: the kinds of test to run on demand, separated by spaces, empty for every kind\n        type: string\n        default: \"\"\npermissions:\n  contents: read\njobs:\n  occasion:\n    runs-on: ubuntu-latest\n    outputs:\n      occasion: ${{ steps.o.outputs.occasion }}\n      commit: ${{ steps.o.outputs.commit }}\n      unit: ${{ steps.o.outputs.unit }}\n      component: ${{ steps.o.outputs.component }}\n      system: ${{ steps.o.outputs.system }}\n      paid: ${{ steps.o.outputs.paid }}\n      release: ${{ steps.o.outputs.release }}\n    steps:\n      - id: o\n        env:\n          EVENT: ${{ github.event_name }}\n          HEAD: ${{ github.event.pull_request.head.sha || github.sha }}\n          OCCASION: ${{ inputs.AGENT_M_OCCASION }}\n          COMMIT: ${{ inputs.AGENT_M_COMMIT }}\n          TESTS: ${{ inputs.AGENT_M_TESTS }}\n        run: |\n          case \"$EVENT\" in\n            push) occasion=\"every commit\" ;;\n            pull_request) occasion=\"pull request\" ;;\n            schedule) occasion=\"nightly\" ;;\n            *) occasion=\"$OCCASION\" ;;\n          esac\n          case \"$occasion\" in\n            \"every commit\") runs=\"unit component system\" ;;\n            \"pull request\") runs=\"unit component system\" ;;\n            \"nightly\") runs=\"unit component system paid\" ;;\n            \"release candidate\") runs=\"unit component system paid release\" ;;\n            \"on demand\") runs=\"unit component system paid release\" ;;\n            *) runs=\"\" ;;\n          esac\n          if [ \"$occasion\" = \"on demand\" ] && [ -n \"$TESTS\" ]; then\n            chosen=\"\"\n            for t in $runs; do case \" $TESTS \" in *\" $t \"*) chosen=\"$chosen $t\" ;; esac; done\n            runs=\"${chosen# }\"\n          fi\n          echo \"occasion=$occasion\" >> \"$GITHUB_OUTPUT\"\n          echo \"commit=${COMMIT:-$HEAD}\" >> \"$GITHUB_OUTPUT\"\n          for t in unit component system paid release; do\n            case \" $runs \" in *\" $t \"*) echo \"$t=yes\" ;; *) echo \"$t=no\" ;; esac >> \"$GITHUB_OUTPUT\"\n          done\n  unit:\n    needs: occasion\n    if: needs.occasion.outputs.unit == 'yes'\n    runs-on: ubuntu-latest\n    env:\n      AGENT_M_HOME: ${{ github.workspace }}/agent-m\n      AGENT_M_KIND: unit\n      AGENT_M_OUT: ${{ github.workspace }}/agent-m-out/unit\n      AGENT_M_JUNIT: ${{ github.workspace }}/agent-m-out/unit/junit.xml\n    steps:\n      - run: rm -rf \"$AGENT_M_OUT\" && mkdir -p \"$AGENT_M_OUT\"\n      - uses: actions/checkout@v4\n        with:\n          ref: ${{ needs.occasion.outputs.commit }}\n          path: product\n      - uses: actions/checkout@v4\n        with:\n          repository: alice/agent-m\n          ref: a100000000000000000000000000000000000000\n          path: agent-m\n      - uses: actions/setup-node@v4\n        with:\n          node-version: \"22\"\n      - id: tests\n        working-directory: product\n        run: node \"$AGENT_M_HOME/src/ci-entry/main.mjs\" test\n      - if: always()\n        env:\n          OUTCOME: ${{ steps.tests.outcome }}\n        run: |\n          missing=\"$(cat \"$AGENT_M_OUT/missing\" 2>/dev/null)\"\n          mkdir -p \"$AGENT_M_OUT\"\n          {\n            echo \"kind: $AGENT_M_KIND\"\n            echo \"outcome: ${OUTCOME:-skipped}\"\n            echo \"missing: $missing\"\n            echo \"run: gh-${{ github.run_id }}-${{ github.run_attempt }}-unit\"\n            echo \"log: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}\"\n            echo \"participant: GitHub Actions, runner $RUNNER_NAME\"\n          } > \"$AGENT_M_OUT/run.txt\"\n      - if: always()\n        uses: actions/upload-artifact@v4\n        with:\n          name: agent-m-unit\n          path: agent-m-out/unit\n  component:\n    needs: occasion\n    if: needs.occasion.outputs.component == 'yes'\n    runs-on: ubuntu-latest\n    env:\n      AGENT_M_HOME: ${{ github.workspace }}/agent-m\n      AGENT_M_KIND: component\n      AGENT_M_OUT: ${{ github.workspace }}/agent-m-out/component\n      AGENT_M_JUNIT: ${{ github.workspace }}/agent-m-out/component/junit.xml\n    steps:\n      - run: rm -rf \"$AGENT_M_OUT\" && mkdir -p \"$AGENT_M_OUT\"\n      - uses: actions/checkout@v4\n        with:\n          ref: ${{ needs.occasion.outputs.commit }}\n          path: product\n      - uses: actions/checkout@v4\n        with:\n          repository: alice/agent-m\n          ref: a100000000000000000000000000000000000000\n          path: agent-m\n      - uses: actions/setup-node@v4\n        with:\n          node-version: \"22\"\n      - id: tests\n        working-directory: product\n        run: node \"$AGENT_M_HOME/src/ci-entry/main.mjs\" test\n      - if: always()\n        env:\n          OUTCOME: ${{ steps.tests.outcome }}\n        run: |\n          missing=\"$(cat \"$AGENT_M_OUT/missing\" 2>/dev/null)\"\n          mkdir -p \"$AGENT_M_OUT\"\n          {\n            echo \"kind: $AGENT_M_KIND\"\n            echo \"outcome: ${OUTCOME:-skipped}\"\n            echo \"missing: $missing\"\n            echo \"run: gh-${{ github.run_id }}-${{ github.run_attempt }}-component\"\n            echo \"log: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}\"\n            echo \"participant: GitHub Actions, runner $RUNNER_NAME\"\n          } > \"$AGENT_M_OUT/run.txt\"\n      - if: always()\n        uses: actions/upload-artifact@v4\n        with:\n          name: agent-m-component\n          path: agent-m-out/component\n  system:\n    needs: occasion\n    if: needs.occasion.outputs.system == 'yes'\n    runs-on: ubuntu-latest\n    env:\n      AGENT_M_HOME: ${{ github.workspace }}/agent-m\n      AGENT_M_KIND: system\n      AGENT_M_OUT: ${{ github.workspace }}/agent-m-out/system\n      AGENT_M_JUNIT: ${{ github.workspace }}/agent-m-out/system/junit.xml\n    steps:\n      - run: rm -rf \"$AGENT_M_OUT\" && mkdir -p \"$AGENT_M_OUT\"\n      - uses: actions/checkout@v4\n        with:\n          ref: ${{ needs.occasion.outputs.commit }}\n          path: product\n      - uses: actions/checkout@v4\n        with:\n          repository: alice/agent-m\n          ref: a100000000000000000000000000000000000000\n          path: agent-m\n      - uses: actions/setup-node@v4\n        with:\n          node-version: \"22\"\n      - id: tests\n        working-directory: product\n        run: node \"$AGENT_M_HOME/src/ci-entry/main.mjs\" test\n      - if: always()\n        env:\n          OUTCOME: ${{ steps.tests.outcome }}\n        run: |\n          missing=\"$(cat \"$AGENT_M_OUT/missing\" 2>/dev/null)\"\n          mkdir -p \"$AGENT_M_OUT\"\n          {\n            echo \"kind: $AGENT_M_KIND\"\n            echo \"outcome: ${OUTCOME:-skipped}\"\n            echo \"missing: $missing\"\n            echo \"run: gh-${{ github.run_id }}-${{ github.run_attempt }}-system\"\n            echo \"log: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}\"\n            echo \"participant: GitHub Actions, runner $RUNNER_NAME\"\n          } > \"$AGENT_M_OUT/run.txt\"\n      - if: always()\n        uses: actions/upload-artifact@v4\n        with:\n          name: agent-m-system\n          path: agent-m-out/system\n  paid:\n    needs: occasion\n    if: needs.occasion.outputs.paid == 'yes'\n    runs-on: ubuntu-latest\n    env:\n      AGENT_M_HOME: ${{ github.workspace }}/agent-m\n      AGENT_M_KIND: paid\n      AGENT_M_OUT: ${{ github.workspace }}/agent-m-out/paid\n      AGENT_M_JUNIT: ${{ github.workspace }}/agent-m-out/paid/junit.xml\n    steps:\n      - run: rm -rf \"$AGENT_M_OUT\" && mkdir -p \"$AGENT_M_OUT\"\n      - uses: actions/checkout@v4\n        with:\n          ref: ${{ needs.occasion.outputs.commit }}\n          path: product\n      - uses: actions/checkout@v4\n        with:\n          repository: alice/agent-m\n          ref: a100000000000000000000000000000000000000\n          path: agent-m\n      - uses: actions/setup-node@v4\n        with:\n          node-version: \"22\"\n      - id: secrets\n        env:\n          HUB_KEY: ${{ secrets.HUB_KEY }}\n        run: |\n          missing=\"\"\n          [ -n \"$HUB_KEY\" ] || missing=\"$missing HUB_KEY\"\n          missing=\"${missing# }\"\n          echo \"$missing\" > \"$AGENT_M_OUT/missing\"\n          [ -z \"$missing\" ] || { echo \"the secret(s) $missing missing\"; exit 1; }\n      - id: tests\n        if: steps.secrets.outcome == 'success'\n        working-directory: product\n        env:\n          HUB_KEY: ${{ secrets.HUB_KEY }}\n        run: node \"$AGENT_M_HOME/src/ci-entry/main.mjs\" test\n      - if: always()\n        env:\n          OUTCOME: ${{ steps.tests.outcome }}\n        run: |\n          missing=\"$(cat \"$AGENT_M_OUT/missing\" 2>/dev/null)\"\n          mkdir -p \"$AGENT_M_OUT\"\n          {\n            echo \"kind: $AGENT_M_KIND\"\n            echo \"outcome: ${OUTCOME:-skipped}\"\n            echo \"missing: $missing\"\n            echo \"run: gh-${{ github.run_id }}-${{ github.run_attempt }}-paid\"\n            echo \"log: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}\"\n            echo \"participant: GitHub Actions, runner $RUNNER_NAME\"\n          } > \"$AGENT_M_OUT/run.txt\"\n      - if: always()\n        uses: actions/upload-artifact@v4\n        with:\n          name: agent-m-paid\n          path: agent-m-out/paid\n  release:\n    needs: occasion\n    if: needs.occasion.outputs.release == 'yes'\n    runs-on: ubuntu-latest\n    env:\n      AGENT_M_HOME: ${{ github.workspace }}/agent-m\n      AGENT_M_KIND: release\n      AGENT_M_OUT: ${{ github.workspace }}/agent-m-out/release\n      AGENT_M_JUNIT: ${{ github.workspace }}/agent-m-out/release/junit.xml\n    steps:\n      - run: rm -rf \"$AGENT_M_OUT\" && mkdir -p \"$AGENT_M_OUT\"\n      - uses: actions/checkout@v4\n        with:\n          ref: ${{ needs.occasion.outputs.commit }}\n          path: product\n      - uses: actions/checkout@v4\n        with:\n          repository: alice/agent-m\n          ref: a100000000000000000000000000000000000000\n          path: agent-m\n      - uses: actions/setup-node@v4\n        with:\n          node-version: \"22\"\n      - id: tests\n        working-directory: product\n        run: node \"$AGENT_M_HOME/src/ci-entry/main.mjs\" test\n      - if: always()\n        env:\n          OUTCOME: ${{ steps.tests.outcome }}\n        run: |\n          missing=\"$(cat \"$AGENT_M_OUT/missing\" 2>/dev/null)\"\n          mkdir -p \"$AGENT_M_OUT\"\n          {\n            echo \"kind: $AGENT_M_KIND\"\n            echo \"outcome: ${OUTCOME:-skipped}\"\n            echo \"missing: $missing\"\n            echo \"run: gh-${{ github.run_id }}-${{ github.run_attempt }}-release\"\n            echo \"log: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}\"\n            echo \"participant: GitHub Actions, runner $RUNNER_NAME\"\n          } > \"$AGENT_M_OUT/run.txt\"\n      - if: always()\n        uses: actions/upload-artifact@v4\n        with:\n          name: agent-m-release\n          path: agent-m-out/release\n  results:\n    needs: [occasion, unit, component, system, paid, release]\n    if: always() && needs.occasion.result == 'success'\n    runs-on: ubuntu-latest\n    env:\n      AGENT_M_HOME: ${{ github.workspace }}/agent-m\n      AGENT_M_OUT: ${{ github.workspace }}/agent-m-out\n    steps:\n      - uses: actions/checkout@v4\n        with:\n          ref: ${{ needs.occasion.outputs.commit }}\n          path: product\n      - uses: actions/checkout@v4\n        with:\n          repository: alice/agent-m\n          ref: a100000000000000000000000000000000000000\n          path: agent-m\n      - uses: actions/setup-node@v4\n        with:\n          node-version: \"22\"\n      - uses: actions/download-artifact@v4\n        continue-on-error: true\n        with:\n          pattern: agent-m-*\n          path: agent-m-out\n      - working-directory: product\n        env:\n          AGENT_M_TOKEN: ${{ secrets.AGENT_M_TOKEN }}\n          AGENT_M_OCCASION: ${{ needs.occasion.outputs.occasion }}\n          AGENT_M_COMMIT: ${{ needs.occasion.outputs.commit }}\n        run: AGENT_M_NOTES=\"$(ls \"$AGENT_M_OUT\" 2>/dev/null | tr '\\n' ' ')\" node \"$AGENT_M_HOME/src/ci-entry/main.mjs\" results\n" }
    },
    {
      "name": "a declared schedule on GitHub, its command and a CLI agent's runner",
      "input": {
        "schedule": {
          "declared": true,
          "nightly": "03:30",
          "command": "npm test",
          "rows": [
            {
              "tests": "unit",
              "occasions": ["every commit", "pull request", "nightly", "release candidate", "on demand"],
              "runsOn": "hosted",
              "line": 10
            },
            {
              "tests": "component",
              "occasions": ["every commit", "pull request", "nightly", "release candidate", "on demand"],
              "runsOn": "hosted",
              "line": 11
            },
            {
              "tests": "system",
              "occasions": ["nightly", "release candidate", "on demand"],
              "runsOn": "hosted",
              "line": 12
            },
            {
              "tests": "paid",
              "occasions": ["nightly", "release candidate", "on demand"],
              "runsOn": "cli-dev",
              "line": 13
            },
            { "tests": "release", "occasions": ["release candidate", "on demand"], "runsOn": "hosted", "line": 14 },
            { "tests": "user", "occasions": ["release candidate", "on demand"], "runsOn": "people", "line": 15 }
          ]
        },
        "product": { "kind": "github", "address": "https://github.com/alice/thesis", "host": "github.com", "server": "https://github.com", "repo": "alice/thesis" },
        "setup": {
          "instance": "https://github.com/alice/agent-m",
          "version": "a100000000000000000000000000000000000000",
          "paidSecrets": ["HUB_KEY"]
        }
      },
      "result": { "path": ".github/workflows/agent-m-tests.yml", "text": "# Generated by Agent M from docs/tests/schedule.md; change the schedule, not this file.\nname: agent-m tests\non:\n  push:\n    branches-ignore: [test-results]\n    paths-ignore: [\"docs/jobs/**\"]\n  pull_request:\n    paths-ignore: [\"docs/jobs/**\"]\n  schedule:\n    - cron: \"30 3 * * *\"\n  workflow_dispatch:\n    inputs:\n      AGENT_M_OCCASION:\n        description: release candidate or on demand\n        type: choice\n        options: [\"on demand\", \"release candidate\"]\n        default: \"on demand\"\n      AGENT_M_COMMIT:\n        description: the commit to test, empty for the head of the branch\n        type: string\n        default: \"\"\n      AGENT_M_TESTS:\n        description: the kinds of test to run on demand, separated by spaces, empty for every kind\n        type: string\n        default: \"\"\npermissions:\n  contents: read\njobs:\n  occasion:\n    runs-on: ubuntu-latest\n    outputs:\n      occasion: ${{ steps.o.outputs.occasion }}\n      commit: ${{ steps.o.outputs.commit }}\n      unit: ${{ steps.o.outputs.unit }}\n      component: ${{ steps.o.outputs.component }}\n      system: ${{ steps.o.outputs.system }}\n      paid: ${{ steps.o.outputs.paid }}\n      release: ${{ steps.o.outputs.release }}\n    steps:\n      - id: o\n        env:\n          EVENT: ${{ github.event_name }}\n          HEAD: ${{ github.event.pull_request.head.sha || github.sha }}\n          OCCASION: ${{ inputs.AGENT_M_OCCASION }}\n          COMMIT: ${{ inputs.AGENT_M_COMMIT }}\n          TESTS: ${{ inputs.AGENT_M_TESTS }}\n        run: |\n          case \"$EVENT\" in\n            push) occasion=\"every commit\" ;;\n            pull_request) occasion=\"pull request\" ;;\n            schedule) occasion=\"nightly\" ;;\n            *) occasion=\"$OCCASION\" ;;\n          esac\n          case \"$occasion\" in\n            \"every commit\") runs=\"unit component\" ;;\n            \"pull request\") runs=\"unit component\" ;;\n            \"nightly\") runs=\"unit component system paid\" ;;\n            \"release candidate\") runs=\"unit component system paid release\" ;;\n            \"on demand\") runs=\"unit component system paid release\" ;;\n            *) runs=\"\" ;;\n          esac\n          if [ \"$occasion\" = \"on demand\" ] && [ -n \"$TESTS\" ]; then\n            chosen=\"\"\n            for t in $runs; do case \" $TESTS \" in *\" $t \"*) chosen=\"$chosen $t\" ;; esac; done\n            runs=\"${chosen# }\"\n          fi\n          echo \"occasion=$occasion\" >> \"$GITHUB_OUTPUT\"\n          echo \"commit=${COMMIT:-$HEAD}\" >> \"$GITHUB_OUTPUT\"\n          for t in unit component system paid release; do\n            case \" $runs \" in *\" $t \"*) echo \"$t=yes\" ;; *) echo \"$t=no\" ;; esac >> \"$GITHUB_OUTPUT\"\n          done\n  unit:\n    needs: occasion\n    if: needs.occasion.outputs.unit == 'yes'\n    runs-on: ubuntu-latest\n    env:\n      AGENT_M_HOME: ${{ github.workspace }}/agent-m\n      AGENT_M_KIND: unit\n      AGENT_M_OUT: ${{ github.workspace }}/agent-m-out/unit\n      AGENT_M_JUNIT: ${{ github.workspace }}/agent-m-out/unit/junit.xml\n    steps:\n      - run: rm -rf \"$AGENT_M_OUT\" && mkdir -p \"$AGENT_M_OUT\"\n      - uses: actions/checkout@v4\n        with:\n          ref: ${{ needs.occasion.outputs.commit }}\n          path: product\n      - uses: actions/checkout@v4\n        with:\n          repository: alice/agent-m\n          ref: a100000000000000000000000000000000000000\n          path: agent-m\n      - uses: actions/setup-node@v4\n        with:\n          node-version: \"22\"\n      - id: tests\n        working-directory: product\n        run: npm test\n      - if: always()\n        env:\n          OUTCOME: ${{ steps.tests.outcome }}\n        run: |\n          missing=\"$(cat \"$AGENT_M_OUT/missing\" 2>/dev/null)\"\n          mkdir -p \"$AGENT_M_OUT\"\n          {\n            echo \"kind: $AGENT_M_KIND\"\n            echo \"outcome: ${OUTCOME:-skipped}\"\n            echo \"missing: $missing\"\n            echo \"run: gh-${{ github.run_id }}-${{ github.run_attempt }}-unit\"\n            echo \"log: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}\"\n            echo \"participant: GitHub Actions, runner $RUNNER_NAME\"\n          } > \"$AGENT_M_OUT/run.txt\"\n      - if: always()\n        uses: actions/upload-artifact@v4\n        with:\n          name: agent-m-unit\n          path: agent-m-out/unit\n  component:\n    needs: occasion\n    if: needs.occasion.outputs.component == 'yes'\n    runs-on: ubuntu-latest\n    env:\n      AGENT_M_HOME: ${{ github.workspace }}/agent-m\n      AGENT_M_KIND: component\n      AGENT_M_OUT: ${{ github.workspace }}/agent-m-out/component\n      AGENT_M_JUNIT: ${{ github.workspace }}/agent-m-out/component/junit.xml\n    steps:\n      - run: rm -rf \"$AGENT_M_OUT\" && mkdir -p \"$AGENT_M_OUT\"\n      - uses: actions/checkout@v4\n        with:\n          ref: ${{ needs.occasion.outputs.commit }}\n          path: product\n      - uses: actions/checkout@v4\n        with:\n          repository: alice/agent-m\n          ref: a100000000000000000000000000000000000000\n          path: agent-m\n      - uses: actions/setup-node@v4\n        with:\n          node-version: \"22\"\n      - id: tests\n        working-directory: product\n        run: npm test\n      - if: always()\n        env:\n          OUTCOME: ${{ steps.tests.outcome }}\n        run: |\n          missing=\"$(cat \"$AGENT_M_OUT/missing\" 2>/dev/null)\"\n          mkdir -p \"$AGENT_M_OUT\"\n          {\n            echo \"kind: $AGENT_M_KIND\"\n            echo \"outcome: ${OUTCOME:-skipped}\"\n            echo \"missing: $missing\"\n            echo \"run: gh-${{ github.run_id }}-${{ github.run_attempt }}-component\"\n            echo \"log: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}\"\n            echo \"participant: GitHub Actions, runner $RUNNER_NAME\"\n          } > \"$AGENT_M_OUT/run.txt\"\n      - if: always()\n        uses: actions/upload-artifact@v4\n        with:\n          name: agent-m-component\n          path: agent-m-out/component\n  system:\n    needs: occasion\n    if: needs.occasion.outputs.system == 'yes'\n    runs-on: ubuntu-latest\n    env:\n      AGENT_M_HOME: ${{ github.workspace }}/agent-m\n      AGENT_M_KIND: system\n      AGENT_M_OUT: ${{ github.workspace }}/agent-m-out/system\n      AGENT_M_JUNIT: ${{ github.workspace }}/agent-m-out/system/junit.xml\n    steps:\n      - run: rm -rf \"$AGENT_M_OUT\" && mkdir -p \"$AGENT_M_OUT\"\n      - uses: actions/checkout@v4\n        with:\n          ref: ${{ needs.occasion.outputs.commit }}\n          path: product\n      - uses: actions/checkout@v4\n        with:\n          repository: alice/agent-m\n          ref: a100000000000000000000000000000000000000\n          path: agent-m\n      - uses: actions/setup-node@v4\n        with:\n          node-version: \"22\"\n      - id: tests\n        working-directory: product\n        run: npm test\n      - if: always()\n        env:\n          OUTCOME: ${{ steps.tests.outcome }}\n        run: |\n          missing=\"$(cat \"$AGENT_M_OUT/missing\" 2>/dev/null)\"\n          mkdir -p \"$AGENT_M_OUT\"\n          {\n            echo \"kind: $AGENT_M_KIND\"\n            echo \"outcome: ${OUTCOME:-skipped}\"\n            echo \"missing: $missing\"\n            echo \"run: gh-${{ github.run_id }}-${{ github.run_attempt }}-system\"\n            echo \"log: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}\"\n            echo \"participant: GitHub Actions, runner $RUNNER_NAME\"\n          } > \"$AGENT_M_OUT/run.txt\"\n      - if: always()\n        uses: actions/upload-artifact@v4\n        with:\n          name: agent-m-system\n          path: agent-m-out/system\n  paid:\n    needs: occasion\n    if: needs.occasion.outputs.paid == 'yes'\n    runs-on: [self-hosted, cli-dev]\n    env:\n      AGENT_M_HOME: ${{ github.workspace }}/agent-m\n      AGENT_M_KIND: paid\n      AGENT_M_OUT: ${{ github.workspace }}/agent-m-out/paid\n      AGENT_M_JUNIT: ${{ github.workspace }}/agent-m-out/paid/junit.xml\n    steps:\n      - run: rm -rf \"$AGENT_M_OUT\" && mkdir -p \"$AGENT_M_OUT\"\n      - uses: actions/checkout@v4\n        with:\n          ref: ${{ needs.occasion.outputs.commit }}\n          path: product\n      - uses: actions/checkout@v4\n        with:\n          repository: alice/agent-m\n          ref: a100000000000000000000000000000000000000\n          path: agent-m\n      - uses: actions/setup-node@v4\n        with:\n          node-version: \"22\"\n      - id: secrets\n        env:\n          HUB_KEY: ${{ secrets.HUB_KEY }}\n        run: |\n          missing=\"\"\n          [ -n \"$HUB_KEY\" ] || missing=\"$missing HUB_KEY\"\n          missing=\"${missing# }\"\n          echo \"$missing\" > \"$AGENT_M_OUT/missing\"\n          [ -z \"$missing\" ] || { echo \"the secret(s) $missing missing\"; exit 1; }\n      - id: tests\n        if: steps.secrets.outcome == 'success'\n        working-directory: product\n        env:\n          HUB_KEY: ${{ secrets.HUB_KEY }}\n        run: npm test\n      - if: always()\n        env:\n          OUTCOME: ${{ steps.tests.outcome }}\n        run: |\n          missing=\"$(cat \"$AGENT_M_OUT/missing\" 2>/dev/null)\"\n          mkdir -p \"$AGENT_M_OUT\"\n          {\n            echo \"kind: $AGENT_M_KIND\"\n            echo \"outcome: ${OUTCOME:-skipped}\"\n            echo \"missing: $missing\"\n            echo \"run: gh-${{ github.run_id }}-${{ github.run_attempt }}-paid\"\n            echo \"log: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}\"\n            echo \"participant: GitHub Actions, runner $RUNNER_NAME\"\n          } > \"$AGENT_M_OUT/run.txt\"\n      - if: always()\n        uses: actions/upload-artifact@v4\n        with:\n          name: agent-m-paid\n          path: agent-m-out/paid\n  release:\n    needs: occasion\n    if: needs.occasion.outputs.release == 'yes'\n    runs-on: ubuntu-latest\n    env:\n      AGENT_M_HOME: ${{ github.workspace }}/agent-m\n      AGENT_M_KIND: release\n      AGENT_M_OUT: ${{ github.workspace }}/agent-m-out/release\n      AGENT_M_JUNIT: ${{ github.workspace }}/agent-m-out/release/junit.xml\n    steps:\n      - run: rm -rf \"$AGENT_M_OUT\" && mkdir -p \"$AGENT_M_OUT\"\n      - uses: actions/checkout@v4\n        with:\n          ref: ${{ needs.occasion.outputs.commit }}\n          path: product\n      - uses: actions/checkout@v4\n        with:\n          repository: alice/agent-m\n          ref: a100000000000000000000000000000000000000\n          path: agent-m\n      - uses: actions/setup-node@v4\n        with:\n          node-version: \"22\"\n      - id: tests\n        working-directory: product\n        run: npm test\n      - if: always()\n        env:\n          OUTCOME: ${{ steps.tests.outcome }}\n        run: |\n          missing=\"$(cat \"$AGENT_M_OUT/missing\" 2>/dev/null)\"\n          mkdir -p \"$AGENT_M_OUT\"\n          {\n            echo \"kind: $AGENT_M_KIND\"\n            echo \"outcome: ${OUTCOME:-skipped}\"\n            echo \"missing: $missing\"\n            echo \"run: gh-${{ github.run_id }}-${{ github.run_attempt }}-release\"\n            echo \"log: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}\"\n            echo \"participant: GitHub Actions, runner $RUNNER_NAME\"\n          } > \"$AGENT_M_OUT/run.txt\"\n      - if: always()\n        uses: actions/upload-artifact@v4\n        with:\n          name: agent-m-release\n          path: agent-m-out/release\n  results:\n    needs: [occasion, unit, component, system, paid, release]\n    if: always() && needs.occasion.result == 'success'\n    runs-on: ubuntu-latest\n    env:\n      AGENT_M_HOME: ${{ github.workspace }}/agent-m\n      AGENT_M_OUT: ${{ github.workspace }}/agent-m-out\n    steps:\n      - uses: actions/checkout@v4\n        with:\n          ref: ${{ needs.occasion.outputs.commit }}\n          path: product\n      - uses: actions/checkout@v4\n        with:\n          repository: alice/agent-m\n          ref: a100000000000000000000000000000000000000\n          path: agent-m\n      - uses: actions/setup-node@v4\n        with:\n          node-version: \"22\"\n      - uses: actions/download-artifact@v4\n        continue-on-error: true\n        with:\n          pattern: agent-m-*\n          path: agent-m-out\n      - working-directory: product\n        env:\n          AGENT_M_TOKEN: ${{ secrets.AGENT_M_TOKEN }}\n          AGENT_M_OCCASION: ${{ needs.occasion.outputs.occasion }}\n          AGENT_M_COMMIT: ${{ needs.occasion.outputs.commit }}\n        run: AGENT_M_NOTES=\"$(ls \"$AGENT_M_OUT\" 2>/dev/null | tr '\\n' ' ')\" node \"$AGENT_M_HOME/src/ci-entry/main.mjs\" results\n" }
    },
    {
      "name": "a declared schedule on GitLab",
      "input": {
        "schedule": {
          "declared": true,
          "nightly": "03:30",
          "command": "npm test",
          "rows": [
            {
              "tests": "unit",
              "occasions": ["every commit", "pull request", "nightly", "release candidate", "on demand"],
              "runsOn": "hosted",
              "line": 10
            },
            {
              "tests": "component",
              "occasions": ["every commit", "pull request", "nightly", "release candidate", "on demand"],
              "runsOn": "hosted",
              "line": 11
            },
            {
              "tests": "system",
              "occasions": ["nightly", "release candidate", "on demand"],
              "runsOn": "hosted",
              "line": 12
            },
            {
              "tests": "paid",
              "occasions": ["nightly", "release candidate", "on demand"],
              "runsOn": "cli-dev",
              "line": 13
            },
            { "tests": "release", "occasions": ["release candidate", "on demand"], "runsOn": "hosted", "line": 14 },
            { "tests": "user", "occasions": ["release candidate", "on demand"], "runsOn": "people", "line": 15 }
          ]
        },
        "product": { "kind": "gitlab", "address": "https://gitlab.example.org/group/tools/thesis", "host": "gitlab.example.org", "server": "https://gitlab.example.org", "repo": "group/tools/thesis" },
        "setup": {
          "instance": "https://github.com/alice/agent-m",
          "version": "a100000000000000000000000000000000000000",
          "paidSecrets": ["HUB_KEY"]
        }
      },
      "result": { "path": ".gitlab-ci.yml", "text": "# Generated by Agent M from docs/tests/schedule.md; change the schedule, not this file.\nworkflow:\n  rules:\n    - if: $CI_COMMIT_BRANCH == \"test-results\"\n      when: never\n    - if: $CI_PIPELINE_SOURCE == \"push\" || $CI_PIPELINE_SOURCE == \"merge_request_event\"\n      changes:\n        - \"*\"\n        - \"[!d]*/**/*\"\n        - \"d[!o]*/**/*\"\n        - \"do[!c]*/**/*\"\n        - \"doc[!s]*/**/*\"\n        - \"d/**/*\"\n        - \"do/**/*\"\n        - \"doc/**/*\"\n        - \"docs?*/**/*\"\n        - \"docs/*\"\n        - \"docs/[!j]*/**/*\"\n        - \"docs/j[!o]*/**/*\"\n        - \"docs/jo[!b]*/**/*\"\n        - \"docs/job[!s]*/**/*\"\n        - \"docs/j/**/*\"\n        - \"docs/jo/**/*\"\n        - \"docs/job/**/*\"\n        - \"docs/jobs?*/**/*\"\n    - if: $CI_PIPELINE_SOURCE == \"push\" || $CI_PIPELINE_SOURCE == \"merge_request_event\"\n      when: never\n    - when: always\nvariables:\n  AGENT_M_HOME: \"/tmp/agent-m-$CI_JOB_ID\"\nunit:\n  image: node:22\n  variables:\n    AGENT_M_KIND: unit\n    AGENT_M_OUT: \"$CI_PROJECT_DIR/agent-m-out/unit\"\n    AGENT_M_JUNIT: \"$CI_PROJECT_DIR/agent-m-out/unit/junit.xml\"\n  rules:\n    - if: $CI_PIPELINE_SOURCE == \"push\"\n    - if: $CI_PIPELINE_SOURCE == \"merge_request_event\"\n    - if: $CI_PIPELINE_SOURCE == \"schedule\"\n    - if: $AGENT_M_OCCASION == \"release candidate\"\n    - if: $AGENT_M_OCCASION == \"on demand\" && ($AGENT_M_TESTS == null || $AGENT_M_TESTS == \"\" || $AGENT_M_TESTS =~ /(^| )unit( |$)/)\n  script:\n    - mkdir -p \"$AGENT_M_OUT\"\n    - if [ -n \"$AGENT_M_COMMIT\" ]; then git fetch --quiet origin \"$AGENT_M_COMMIT\" && git checkout --quiet \"$AGENT_M_COMMIT\"; fi\n    - git clone --quiet https://github.com/alice/agent-m.git \"$AGENT_M_HOME\"\n    - git -C \"$AGENT_M_HOME\" checkout --quiet a100000000000000000000000000000000000000\n    - npm test\n  after_script:\n    - |\n      missing=\"$(cat \"$AGENT_M_OUT/missing\" 2>/dev/null)\"\n      mkdir -p \"$AGENT_M_OUT\"\n      {\n        echo \"kind: $AGENT_M_KIND\"\n        echo \"outcome: $CI_JOB_STATUS\"\n        echo \"missing: $missing\"\n        echo \"run: gl-$CI_PIPELINE_ID-$CI_JOB_ID\"\n        echo \"log: $CI_JOB_URL\"\n        echo \"participant: GitLab CI, runner $CI_RUNNER_DESCRIPTION\"\n      } > \"$AGENT_M_OUT/run.txt\"\n  artifacts:\n    when: always\n    paths:\n      - agent-m-out/unit/\ncomponent:\n  image: node:22\n  variables:\n    AGENT_M_KIND: component\n    AGENT_M_OUT: \"$CI_PROJECT_DIR/agent-m-out/component\"\n    AGENT_M_JUNIT: \"$CI_PROJECT_DIR/agent-m-out/component/junit.xml\"\n  rules:\n    - if: $CI_PIPELINE_SOURCE == \"push\"\n    - if: $CI_PIPELINE_SOURCE == \"merge_request_event\"\n    - if: $CI_PIPELINE_SOURCE == \"schedule\"\n    - if: $AGENT_M_OCCASION == \"release candidate\"\n    - if: $AGENT_M_OCCASION == \"on demand\" && ($AGENT_M_TESTS == null || $AGENT_M_TESTS == \"\" || $AGENT_M_TESTS =~ /(^| )component( |$)/)\n  script:\n    - mkdir -p \"$AGENT_M_OUT\"\n    - if [ -n \"$AGENT_M_COMMIT\" ]; then git fetch --quiet origin \"$AGENT_M_COMMIT\" && git checkout --quiet \"$AGENT_M_COMMIT\"; fi\n    - git clone --quiet https://github.com/alice/agent-m.git \"$AGENT_M_HOME\"\n    - git -C \"$AGENT_M_HOME\" checkout --quiet a100000000000000000000000000000000000000\n    - npm test\n  after_script:\n    - |\n      missing=\"$(cat \"$AGENT_M_OUT/missing\" 2>/dev/null)\"\n      mkdir -p \"$AGENT_M_OUT\"\n      {\n        echo \"kind: $AGENT_M_KIND\"\n        echo \"outcome: $CI_JOB_STATUS\"\n        echo \"missing: $missing\"\n        echo \"run: gl-$CI_PIPELINE_ID-$CI_JOB_ID\"\n        echo \"log: $CI_JOB_URL\"\n        echo \"participant: GitLab CI, runner $CI_RUNNER_DESCRIPTION\"\n      } > \"$AGENT_M_OUT/run.txt\"\n  artifacts:\n    when: always\n    paths:\n      - agent-m-out/component/\nsystem:\n  image: node:22\n  variables:\n    AGENT_M_KIND: system\n    AGENT_M_OUT: \"$CI_PROJECT_DIR/agent-m-out/system\"\n    AGENT_M_JUNIT: \"$CI_PROJECT_DIR/agent-m-out/system/junit.xml\"\n  rules:\n    - if: $CI_PIPELINE_SOURCE == \"schedule\"\n    - if: $AGENT_M_OCCASION == \"release candidate\"\n    - if: $AGENT_M_OCCASION == \"on demand\" && ($AGENT_M_TESTS == null || $AGENT_M_TESTS == \"\" || $AGENT_M_TESTS =~ /(^| )system( |$)/)\n  script:\n    - mkdir -p \"$AGENT_M_OUT\"\n    - if [ -n \"$AGENT_M_COMMIT\" ]; then git fetch --quiet origin \"$AGENT_M_COMMIT\" && git checkout --quiet \"$AGENT_M_COMMIT\"; fi\n    - git clone --quiet https://github.com/alice/agent-m.git \"$AGENT_M_HOME\"\n    - git -C \"$AGENT_M_HOME\" checkout --quiet a100000000000000000000000000000000000000\n    - npm test\n  after_script:\n    - |\n      missing=\"$(cat \"$AGENT_M_OUT/missing\" 2>/dev/null)\"\n      mkdir -p \"$AGENT_M_OUT\"\n      {\n        echo \"kind: $AGENT_M_KIND\"\n        echo \"outcome: $CI_JOB_STATUS\"\n        echo \"missing: $missing\"\n        echo \"run: gl-$CI_PIPELINE_ID-$CI_JOB_ID\"\n        echo \"log: $CI_JOB_URL\"\n        echo \"participant: GitLab CI, runner $CI_RUNNER_DESCRIPTION\"\n      } > \"$AGENT_M_OUT/run.txt\"\n  artifacts:\n    when: always\n    paths:\n      - agent-m-out/system/\npaid:\n  image: node:22\n  tags: [cli-dev]\n  environment:\n    name: agent-m-paid\n    action: access\n  variables:\n    AGENT_M_KIND: paid\n    AGENT_M_OUT: \"$CI_PROJECT_DIR/agent-m-out/paid\"\n    AGENT_M_JUNIT: \"$CI_PROJECT_DIR/agent-m-out/paid/junit.xml\"\n  rules:\n    - if: $CI_PIPELINE_SOURCE == \"schedule\"\n    - if: $AGENT_M_OCCASION == \"release candidate\"\n    - if: $AGENT_M_OCCASION == \"on demand\" && ($AGENT_M_TESTS == null || $AGENT_M_TESTS == \"\" || $AGENT_M_TESTS =~ /(^| )paid( |$)/)\n  script:\n    - mkdir -p \"$AGENT_M_OUT\"\n    - if [ -n \"$AGENT_M_COMMIT\" ]; then git fetch --quiet origin \"$AGENT_M_COMMIT\" && git checkout --quiet \"$AGENT_M_COMMIT\"; fi\n    - git clone --quiet https://github.com/alice/agent-m.git \"$AGENT_M_HOME\"\n    - git -C \"$AGENT_M_HOME\" checkout --quiet a100000000000000000000000000000000000000\n    - |\n      missing=\"\"\n      [ -n \"$HUB_KEY\" ] || missing=\"$missing HUB_KEY\"\n      missing=\"${missing# }\"\n      echo \"$missing\" > \"$AGENT_M_OUT/missing\"\n      [ -z \"$missing\" ] || { echo \"the secret(s) $missing missing\"; exit 1; }\n    - npm test\n  after_script:\n    - |\n      missing=\"$(cat \"$AGENT_M_OUT/missing\" 2>/dev/null)\"\n      mkdir -p \"$AGENT_M_OUT\"\n      {\n        echo \"kind: $AGENT_M_KIND\"\n        echo \"outcome: $CI_JOB_STATUS\"\n        echo \"missing: $missing\"\n        echo \"run: gl-$CI_PIPELINE_ID-$CI_JOB_ID\"\n        echo \"log: $CI_JOB_URL\"\n        echo \"participant: GitLab CI, runner $CI_RUNNER_DESCRIPTION\"\n      } > \"$AGENT_M_OUT/run.txt\"\n  artifacts:\n    when: always\n    paths:\n      - agent-m-out/paid/\nrelease:\n  image: node:22\n  variables:\n    AGENT_M_KIND: release\n    AGENT_M_OUT: \"$CI_PROJECT_DIR/agent-m-out/release\"\n    AGENT_M_JUNIT: \"$CI_PROJECT_DIR/agent-m-out/release/junit.xml\"\n  rules:\n    - if: $AGENT_M_OCCASION == \"release candidate\"\n    - if: $AGENT_M_OCCASION == \"on demand\" && ($AGENT_M_TESTS == null || $AGENT_M_TESTS == \"\" || $AGENT_M_TESTS =~ /(^| )release( |$)/)\n  script:\n    - mkdir -p \"$AGENT_M_OUT\"\n    - if [ -n \"$AGENT_M_COMMIT\" ]; then git fetch --quiet origin \"$AGENT_M_COMMIT\" && git checkout --quiet \"$AGENT_M_COMMIT\"; fi\n    - git clone --quiet https://github.com/alice/agent-m.git \"$AGENT_M_HOME\"\n    - git -C \"$AGENT_M_HOME\" checkout --quiet a100000000000000000000000000000000000000\n    - npm test\n  after_script:\n    - |\n      missing=\"$(cat \"$AGENT_M_OUT/missing\" 2>/dev/null)\"\n      mkdir -p \"$AGENT_M_OUT\"\n      {\n        echo \"kind: $AGENT_M_KIND\"\n        echo \"outcome: $CI_JOB_STATUS\"\n        echo \"missing: $missing\"\n        echo \"run: gl-$CI_PIPELINE_ID-$CI_JOB_ID\"\n        echo \"log: $CI_JOB_URL\"\n        echo \"participant: GitLab CI, runner $CI_RUNNER_DESCRIPTION\"\n      } > \"$AGENT_M_OUT/run.txt\"\n  artifacts:\n    when: always\n    paths:\n      - agent-m-out/release/\nagent-m-results:\n  stage: .post\n  image: node:22\n  when: always\n  environment:\n    name: agent-m-results\n    action: access\n  variables:\n    AGENT_M_OUT: \"$CI_PROJECT_DIR/agent-m-out\"\n  script:\n    - if [ -n \"$AGENT_M_COMMIT\" ]; then git fetch --quiet origin \"$AGENT_M_COMMIT\" && git checkout --quiet \"$AGENT_M_COMMIT\"; fi\n    - git clone --quiet https://github.com/alice/agent-m.git \"$AGENT_M_HOME\"\n    - git -C \"$AGENT_M_HOME\" checkout --quiet a100000000000000000000000000000000000000\n    - |\n      case \"$CI_PIPELINE_SOURCE\" in\n        push) occasion=\"every commit\" ;;\n        merge_request_event) occasion=\"pull request\" ;;\n        schedule) occasion=\"nightly\" ;;\n        *) occasion=\"$AGENT_M_OCCASION\" ;;\n      esac\n      AGENT_M_OCCASION=\"$occasion\" AGENT_M_COMMIT=\"${AGENT_M_COMMIT:-$CI_COMMIT_SHA}\" AGENT_M_NOTES=\"$(ls \"$AGENT_M_OUT\" 2>/dev/null | tr '\\n' ' ')\" node \"$AGENT_M_HOME/src/ci-entry/main.mjs\" results\n" }
    },
    {
      "name": "a key's name in small letters",
      "input": {
        "schedule": {
          "declared": false,
          "nightly": "02:00",
          "command": "",
          "rows": [
            {
              "tests": "unit",
              "occasions": ["every commit", "pull request", "nightly", "release candidate", "on demand"],
              "runsOn": "hosted",
              "line": 0
            },
            {
              "tests": "component",
              "occasions": ["every commit", "pull request", "nightly", "release candidate", "on demand"],
              "runsOn": "hosted",
              "line": 0
            },
            {
              "tests": "system",
              "occasions": ["every commit", "pull request", "nightly", "release candidate", "on demand"],
              "runsOn": "hosted",
              "line": 0
            },
            {
              "tests": "paid",
              "occasions": ["nightly", "release candidate", "on demand"],
              "runsOn": "hosted",
              "line": 0
            },
            { "tests": "release", "occasions": ["release candidate", "on demand"], "runsOn": "hosted", "line": 0 },
            { "tests": "user", "occasions": ["release candidate", "on demand"], "runsOn": "people", "line": 0 }
          ]
        },
        "product": { "kind": "github", "address": "https://github.com/alice/thesis", "host": "github.com", "server": "https://github.com", "repo": "alice/thesis" },
        "setup": {
          "instance": "https://github.com/alice/agent-m",
          "version": "a100000000000000000000000000000000000000",
          "paidSecrets": ["hub-key"]
        }
      },
      "refused": "not-a-secret-name"
    }
  ]
}
```

```json interface
{
  "id": "MOD-ci-generator.secretsNeeded",
  "summary": "The secrets the generated jobs read, by name only, what each holds, the jobs that read it, and on GitLab the environment it is scoped to: the person's Agent M token — on GitLab the product's project access token, scoped to agent-m-results —, read only by the job that records the runs, and each key of a paid service, read only by the job of tests that call a paid service or a model — on GitLab scoped to agent-m-paid.",
  "params": [
    { "name": "schedule", "type": "Schedule" },
    { "name": "product", "type": "Product" },
    { "name": "setup", "type": "CiSetup" }
  ],
  "result": "SecretNeed[]",
  "async": false,
  "refusals": [],
  "examples": [
    {
      "name": "on GitLab, with a paid service's key",
      "input": {
        "schedule": {
          "declared": false,
          "nightly": "02:00",
          "command": "",
          "rows": [
            {
              "tests": "unit",
              "occasions": ["every commit", "pull request", "nightly", "release candidate", "on demand"],
              "runsOn": "hosted",
              "line": 0
            },
            {
              "tests": "component",
              "occasions": ["every commit", "pull request", "nightly", "release candidate", "on demand"],
              "runsOn": "hosted",
              "line": 0
            },
            {
              "tests": "system",
              "occasions": ["every commit", "pull request", "nightly", "release candidate", "on demand"],
              "runsOn": "hosted",
              "line": 0
            },
            {
              "tests": "paid",
              "occasions": ["nightly", "release candidate", "on demand"],
              "runsOn": "hosted",
              "line": 0
            },
            { "tests": "release", "occasions": ["release candidate", "on demand"], "runsOn": "hosted", "line": 0 },
            { "tests": "user", "occasions": ["release candidate", "on demand"], "runsOn": "people", "line": 0 }
          ]
        },
        "product": { "kind": "gitlab", "address": "https://gitlab.example.org/group/tools/thesis", "host": "gitlab.example.org", "server": "https://gitlab.example.org", "repo": "group/tools/thesis" },
        "setup": {
          "instance": "https://github.com/alice/agent-m",
          "version": "a100000000000000000000000000000000000000",
          "paidSecrets": ["HUB_KEY"]
        }
      },
      "result": [
        {
          "name": "AGENT_M_TOKEN",
          "holds": "the product's project access token",
          "jobs": ["results"],
          "scope": "agent-m-results"
        },
        {
          "name": "HUB_KEY",
          "holds": "the key of a paid service the tests call",
          "jobs": ["paid"],
          "scope": "agent-m-paid"
        }
      ]
    }
  ]
}
```

```json interface
{
  "id": "MOD-ci-generator.nightlySchedule",
  "summary": "The pipeline schedule of a GitLab product's nightly run, which lives outside its repository file: the time as a cron line in UTC, and its description.",
  "params": [{ "name": "schedule", "type": "Schedule" }],
  "result": "NightlySchedule",
  "async": false,
  "refusals": [{ "code": "no-time", "when": "the schedule's nightly time is no HH:MM" }],
  "examples": [
    {
      "name": "03:30",
      "input": {
        "schedule": {
          "declared": true,
          "nightly": "03:30",
          "command": "npm test",
          "rows": [
            {
              "tests": "unit",
              "occasions": ["every commit", "pull request", "nightly", "release candidate", "on demand"],
              "runsOn": "hosted",
              "line": 10
            },
            {
              "tests": "component",
              "occasions": ["every commit", "pull request", "nightly", "release candidate", "on demand"],
              "runsOn": "hosted",
              "line": 11
            },
            {
              "tests": "system",
              "occasions": ["nightly", "release candidate", "on demand"],
              "runsOn": "hosted",
              "line": 12
            },
            {
              "tests": "paid",
              "occasions": ["nightly", "release candidate", "on demand"],
              "runsOn": "cli-dev",
              "line": 13
            },
            { "tests": "release", "occasions": ["release candidate", "on demand"], "runsOn": "hosted", "line": 14 },
            { "tests": "user", "occasions": ["release candidate", "on demand"], "runsOn": "people", "line": 15 }
          ]
        }
      },
      "result": { "cron": "30 3 * * *", "timezone": "UTC", "description": "agent-m nightly" }
    }
  ]
}
```

```json interface
{
  "id": "MOD-ci-generator.jobWorkflow",
  "summary": "The workflow of an agent's job on GitHub, .github/workflows/agent-m-job.yml: dispatched with the job and the CI agent that carries it out, named by the job; one job per CI agent of the instance on its runner — GitHub's machines, which install its CLI, or its self-hosted runner, where its CLI and its login are —, which starts the job, gives the agent its prompt with the agent's key alone, pushes the agent's commits with the person's token after asking whether it may still write — on a branch new to the server, the job's first commit alone before the head, so that CI runs on the commit that holds only the tests —, and looks at the pull request and its checks until the job's next step is decided; where the job belongs to a run, its last step dispatches the engine workflow. The agent's step holds no token, Agent M's steps no key; the workflow's own token reads only.",
  "params": [
    { "name": "agents", "type": "CiAgent[]" },
    { "name": "product", "type": "Product" },
    { "name": "setup", "type": "CiSetup" }
  ],
  "result": "FileText",
  "async": false,
  "refusals": [
    { "code": "not-on-github", "when": "the product is on GitLab" },
    { "code": "not-an-instance", "when": "the instance is no https://github.com/<owner>/<repository>" },
    { "code": "no-version", "when": "the version is no 40-hex commit" },
    { "code": "no-ci-agent", "when": "the instance has no CI agent" }
  ],
  "examples": [
    {
      "name": "Claude Code on GitHub's machines and Codex on a self-hosted runner",
      "input": {
        "agents": [
          { "name": "ci-dev", "cli": "claude", "model": "claude-opus-5-5", "runner": "", "secret": "AGENT_M_AGENT_KEY_CI_DEV", "keyVariable": "ANTHROPIC_API_KEY" },
          { "name": "gpu-dev", "cli": "codex", "model": "codex-model", "runner": "gpu-1", "secret": "AGENT_M_AGENT_KEY_GPU_DEV", "keyVariable": "CODEX_API_KEY" }
        ],
        "product": { "kind": "github", "address": "https://github.com/alice/thesis", "host": "github.com", "server": "https://github.com", "repo": "alice/thesis" },
        "setup": {
          "instance": "https://github.com/alice/agent-m",
          "version": "a100000000000000000000000000000000000000",
          "paidSecrets": []
        }
      },
      "result": { "path": ".github/workflows/agent-m-job.yml", "text": "# Generated by Agent M from the CI agents of the instance; change the participants, not this file.\nname: agent-m job\nrun-name: agent-m job ${{ inputs.AGENT_M_JOB }}\non:\n  workflow_dispatch:\n    inputs:\n      AGENT_M_JOB:\n        description: the job's identifier\n        type: string\n        required: true\n      AGENT_M_PARTICIPANT:\n        description: the CI agent that carries it out\n        type: string\n        required: true\npermissions:\n  contents: read\nconcurrency:\n  group: agent-m-job-${{ inputs.AGENT_M_JOB }}\njobs:\n  ci-dev:\n    if: inputs.AGENT_M_PARTICIPANT == 'ci-dev'\n    runs-on: ubuntu-latest\n    timeout-minutes: 300\n    env:\n      AGENT_M_HOME: ${{ github.workspace }}/agent-m\n      AGENT_M_OUT: ${{ github.workspace }}/agent-m-out\n      AGENT_M_JOB: ${{ inputs.AGENT_M_JOB }}\n      AGENT_M_INSTANCE: https://github.com/alice/agent-m\n      AGENT_M_WAIT_MINUTES: \"240\"\n    steps:\n      - run: rm -rf \"$AGENT_M_OUT\" && mkdir -p \"$AGENT_M_OUT\"\n      - uses: actions/checkout@v4\n        with:\n          path: product\n          fetch-depth: 0\n          persist-credentials: false\n      - uses: actions/checkout@v4\n        with:\n          repository: alice/agent-m\n          ref: a100000000000000000000000000000000000000\n          path: agent-m\n      - uses: actions/setup-node@v4\n        with:\n          node-version: \"22\"\n      - run: npm install --global @anthropic-ai/claude-code\n      - id: start\n        working-directory: product\n        env:\n          AGENT_M_TOKEN: ${{ secrets.AGENT_M_TOKEN }}\n        run: node \"$AGENT_M_HOME/src/ci-entry/main.mjs\" job-start\n      - if: steps.start.outputs.next == 'agent'\n        working-directory: product\n        env:\n          BRANCH: ${{ steps.start.outputs.branch }}\n          BASE: ${{ steps.start.outputs.base }}\n        run: |\n          git config user.name \"ci-dev\"\n          git config user.email \"ci-dev@agent-m.invalid\"\n          git checkout \"$BRANCH\" 2>/dev/null || git checkout -b \"$BRANCH\" \"origin/$BASE\"\n      - if: steps.start.outputs.next == 'agent'\n        working-directory: product\n        env:\n          ANTHROPIC_API_KEY: ${{ secrets.AGENT_M_AGENT_KEY_CI_DEV }}\n        run: claude --bare -p \"Carry out the task the input describes.\" --model 'claude-opus-5-5' --permission-mode acceptEdits --allowedTools Bash --permission-prompts none --output-format json < \"$AGENT_M_OUT/prompt.md\" > \"$AGENT_M_OUT/report.json\"\n      - id: push\n        if: always() && steps.start.outputs.next == 'agent'\n        working-directory: product\n        env:\n          AGENT_M_TOKEN: ${{ secrets.AGENT_M_TOKEN }}\n          BRANCH: ${{ steps.start.outputs.branch }}\n          BASE: ${{ steps.start.outputs.base }}\n        run: |\n          node \"$AGENT_M_HOME/src/ci-entry/main.mjs\" may-write\n          base=\"$(git rev-parse --verify --quiet \"origin/$BRANCH\" || git rev-parse \"origin/$BASE\")\"\n          if [ -n \"$(git rev-list \"$base..HEAD\")\" ]; then\n            auth=\"AUTHORIZATION: basic $(printf 'x-access-token:%s' \"$AGENT_M_TOKEN\" | base64 -w0)\"\n            if ! git rev-parse --verify --quiet \"origin/$BRANCH\" >/dev/null; then\n              git -c \"http.https://github.com/.extraheader=$auth\" push origin \"$(git rev-list --reverse \"$base..HEAD\" | head -n 1):refs/heads/$BRANCH\"\n            fi\n            git -c \"http.https://github.com/.extraheader=$auth\" push origin \"HEAD:refs/heads/$BRANCH\"\n            echo \"pushed=true\" >> \"$GITHUB_OUTPUT\"\n          fi\n      - if: always() && steps.start.outputs.next == 'agent'\n        working-directory: product\n        env:\n          AGENT_M_TOKEN: ${{ secrets.AGENT_M_TOKEN }}\n          AGENT_M_PUSHED: ${{ steps.push.outputs.pushed }}\n        run: |\n          while :; do node \"$AGENT_M_HOME/src/ci-entry/main.mjs\" job-observe && break; [ $? -eq 75 ] || exit 1; sleep 60; done\n      - if: always() && steps.start.outputs.run != ''\n        working-directory: product\n        env:\n          AGENT_M_TOKEN: ${{ secrets.AGENT_M_TOKEN }}\n        run: node \"$AGENT_M_HOME/src/ci-entry/main.mjs\" engine-dispatch\n  gpu-dev:\n    if: inputs.AGENT_M_PARTICIPANT == 'gpu-dev'\n    runs-on: [self-hosted, gpu-1]\n    timeout-minutes: 300\n    env:\n      AGENT_M_HOME: ${{ github.workspace }}/agent-m\n      AGENT_M_OUT: ${{ github.workspace }}/agent-m-out\n      AGENT_M_JOB: ${{ inputs.AGENT_M_JOB }}\n      AGENT_M_INSTANCE: https://github.com/alice/agent-m\n      AGENT_M_WAIT_MINUTES: \"240\"\n    steps:\n      - run: rm -rf \"$AGENT_M_OUT\" && mkdir -p \"$AGENT_M_OUT\"\n      - uses: actions/checkout@v4\n        with:\n          path: product\n          fetch-depth: 0\n          persist-credentials: false\n      - uses: actions/checkout@v4\n        with:\n          repository: alice/agent-m\n          ref: a100000000000000000000000000000000000000\n          path: agent-m\n      - uses: actions/setup-node@v4\n        with:\n          node-version: \"22\"\n      - id: start\n        working-directory: product\n        env:\n          AGENT_M_TOKEN: ${{ secrets.AGENT_M_TOKEN }}\n        run: node \"$AGENT_M_HOME/src/ci-entry/main.mjs\" job-start\n      - if: steps.start.outputs.next == 'agent'\n        working-directory: product\n        env:\n          BRANCH: ${{ steps.start.outputs.branch }}\n          BASE: ${{ steps.start.outputs.base }}\n        run: |\n          git config user.name \"gpu-dev\"\n          git config user.email \"gpu-dev@agent-m.invalid\"\n          git checkout \"$BRANCH\" 2>/dev/null || git checkout -b \"$BRANCH\" \"origin/$BASE\"\n      - if: steps.start.outputs.next == 'agent'\n        working-directory: product\n        run: codex exec --model 'codex-model' --sandbox workspace-write --json - < \"$AGENT_M_OUT/prompt.md\" > \"$AGENT_M_OUT/report.json\"\n      - id: push\n        if: always() && steps.start.outputs.next == 'agent'\n        working-directory: product\n        env:\n          AGENT_M_TOKEN: ${{ secrets.AGENT_M_TOKEN }}\n          BRANCH: ${{ steps.start.outputs.branch }}\n          BASE: ${{ steps.start.outputs.base }}\n        run: |\n          node \"$AGENT_M_HOME/src/ci-entry/main.mjs\" may-write\n          base=\"$(git rev-parse --verify --quiet \"origin/$BRANCH\" || git rev-parse \"origin/$BASE\")\"\n          if [ -n \"$(git rev-list \"$base..HEAD\")\" ]; then\n            auth=\"AUTHORIZATION: basic $(printf 'x-access-token:%s' \"$AGENT_M_TOKEN\" | base64 -w0)\"\n            if ! git rev-parse --verify --quiet \"origin/$BRANCH\" >/dev/null; then\n              git -c \"http.https://github.com/.extraheader=$auth\" push origin \"$(git rev-list --reverse \"$base..HEAD\" | head -n 1):refs/heads/$BRANCH\"\n            fi\n            git -c \"http.https://github.com/.extraheader=$auth\" push origin \"HEAD:refs/heads/$BRANCH\"\n            echo \"pushed=true\" >> \"$GITHUB_OUTPUT\"\n          fi\n      - if: always() && steps.start.outputs.next == 'agent'\n        working-directory: product\n        env:\n          AGENT_M_TOKEN: ${{ secrets.AGENT_M_TOKEN }}\n          AGENT_M_PUSHED: ${{ steps.push.outputs.pushed }}\n        run: |\n          while :; do node \"$AGENT_M_HOME/src/ci-entry/main.mjs\" job-observe && break; [ $? -eq 75 ] || exit 1; sleep 60; done\n      - if: always() && steps.start.outputs.run != ''\n        working-directory: product\n        env:\n          AGENT_M_TOKEN: ${{ secrets.AGENT_M_TOKEN }}\n        run: node \"$AGENT_M_HOME/src/ci-entry/main.mjs\" engine-dispatch\n" }
    },
    {
      "name": "a GitLab product",
      "input": {
        "agents": [
          { "name": "ci-dev", "cli": "claude", "model": "claude-opus-5-5", "runner": "", "secret": "AGENT_M_AGENT_KEY_CI_DEV", "keyVariable": "ANTHROPIC_API_KEY" },
          { "name": "gpu-dev", "cli": "codex", "model": "codex-model", "runner": "gpu-1", "secret": "AGENT_M_AGENT_KEY_GPU_DEV", "keyVariable": "CODEX_API_KEY" }
        ],
        "product": { "kind": "gitlab", "address": "https://gitlab.example.org/group/tools/thesis", "host": "gitlab.example.org", "server": "https://gitlab.example.org", "repo": "group/tools/thesis" },
        "setup": {
          "instance": "https://github.com/alice/agent-m",
          "version": "a100000000000000000000000000000000000000",
          "paidSecrets": []
        }
      },
      "refused": "not-on-github"
    },
    {
      "name": "no CI agent",
      "input": {
        "agents": [],
        "product": { "kind": "github", "address": "https://github.com/alice/thesis", "host": "github.com", "server": "https://github.com", "repo": "alice/thesis" },
        "setup": {
          "instance": "https://github.com/alice/agent-m",
          "version": "a100000000000000000000000000000000000000",
          "paidSecrets": []
        }
      },
      "refused": "no-ci-agent"
    }
  ]
}
```

```json interface
{
  "id": "MOD-ci-generator.doneWorkflow",
  "summary": "The check \"agent-m done\", .github/workflows/agent-m-done.yml: on a pull request from a job's branch — item/<item> or job/<job> —, it waits for CI on the head and fails where the product's Definition of Done does not hold, naming each condition; a branch protection may require it, so that a person's merge meets it too.",
  "params": [{ "name": "product", "type": "Product" }, { "name": "setup", "type": "CiSetup" }],
  "result": "FileText",
  "async": false,
  "refusals": [
    { "code": "not-on-github", "when": "the product is on GitLab" },
    { "code": "not-an-instance", "when": "the instance is no https://github.com/<owner>/<repository>" },
    { "code": "no-version", "when": "the version is no 40-hex commit" }
  ],
  "examples": [
    {
      "name": "the thesis",
      "input": {
        "product": { "kind": "github", "address": "https://github.com/alice/thesis", "host": "github.com", "server": "https://github.com", "repo": "alice/thesis" },
        "setup": {
          "instance": "https://github.com/alice/agent-m",
          "version": "a100000000000000000000000000000000000000",
          "paidSecrets": []
        }
      },
      "result": { "path": ".github/workflows/agent-m-done.yml", "text": "# Generated by Agent M; the conditions are the Definition of Done of docs/process.md.\nname: agent-m done\non:\n  pull_request:\npermissions:\n  contents: read\njobs:\n  done:\n    if: startsWith(github.head_ref, 'item/') || startsWith(github.head_ref, 'job/')\n    runs-on: ubuntu-latest\n    timeout-minutes: 120\n    env:\n      AGENT_M_HOME: ${{ github.workspace }}/agent-m\n      AGENT_M_BRANCH: ${{ github.head_ref }}\n      AGENT_M_INSTANCE: https://github.com/alice/agent-m\n    steps:\n      - uses: actions/checkout@v4\n        with:\n          ref: ${{ github.event.repository.default_branch }}\n          path: product\n          persist-credentials: false\n      - uses: actions/checkout@v4\n        with:\n          repository: alice/agent-m\n          ref: a100000000000000000000000000000000000000\n          path: agent-m\n      - uses: actions/setup-node@v4\n        with:\n          node-version: \"22\"\n      - working-directory: product\n        env:\n          AGENT_M_TOKEN: ${{ secrets.AGENT_M_TOKEN }}\n        run: |\n          while :; do node \"$AGENT_M_HOME/src/ci-entry/main.mjs\" done-check && break; [ $? -eq 75 ] || exit 1; sleep 60; done\n" }
    },
    {
      "name": "a GitLab product",
      "input": {
        "product": { "kind": "gitlab", "address": "https://gitlab.example.org/group/tools/thesis", "host": "gitlab.example.org", "server": "https://gitlab.example.org", "repo": "group/tools/thesis" },
        "setup": {
          "instance": "https://github.com/alice/agent-m",
          "version": "a100000000000000000000000000000000000000",
          "paidSecrets": []
        }
      },
      "refused": "not-on-github"
    }
  ]
}
```

```json interface
{
  "id": "MOD-ci-generator.jobSecrets",
  "summary": "The CI secrets the job workflow reads, by name only: the person's Agent M token, read by Agent M's steps of every CI agent's job, and the key of each CI agent on GitHub's machines, read only by that agent's step; an agent on a self-hosted runner uses the login its CLI has there and reads no key.",
  "params": [{ "name": "agents", "type": "CiAgent[]" }],
  "result": "JobSecret[]",
  "async": false,
  "refusals": [],
  "examples": [
    {
      "name": "two CI agents",
      "input": {
        "agents": [
          { "name": "ci-dev", "cli": "claude", "model": "claude-opus-5-5", "runner": "", "secret": "AGENT_M_AGENT_KEY_CI_DEV", "keyVariable": "ANTHROPIC_API_KEY" },
          { "name": "gpu-dev", "cli": "codex", "model": "codex-model", "runner": "gpu-1", "secret": "AGENT_M_AGENT_KEY_GPU_DEV", "keyVariable": "CODEX_API_KEY" }
        ]
      },
      "result": [
        { "name": "AGENT_M_TOKEN", "holds": "the person's Agent M token", "readBy": ["ci-dev", "gpu-dev"] },
        {
          "name": "AGENT_M_AGENT_KEY_CI_DEV",
          "holds": "the key ci-dev's CLI calls its model with, as ANTHROPIC_API_KEY",
          "readBy": ["ci-dev"]
        }
      ]
    }
  ]
}
```

```json interface
{
  "id": "MOD-ci-generator.engineWorkflow",
  "summary": "The engine workflow on GitHub, .github/workflows/agent-m-engine.yml: dispatched only — by the last step of a job of a run, by a click a run waits for, by the engine itself when the default branch moved on —, never by a push, so that a commit of job records starts no run of it; one run at a time and one waiting, a later dispatch taking the waiting one's place. It takes the next step of every open run of the product with the person's token; the workflow's own token reads only.",
  "params": [{ "name": "product", "type": "Product" }, { "name": "setup", "type": "CiSetup" }],
  "result": "FileText",
  "async": false,
  "refusals": [
    { "code": "not-on-github", "when": "the product is on GitLab" },
    { "code": "not-an-instance", "when": "the instance is no https://github.com/<owner>/<repository>" },
    { "code": "no-version", "when": "the version is no 40-hex commit" }
  ],
  "examples": [
    {
      "name": "a GitHub product",
      "input": {
        "product": { "kind": "github", "address": "https://github.com/alice/thesis", "host": "github.com", "server": "https://github.com", "repo": "alice/thesis" },
        "setup": {
          "instance": "https://github.com/alice/agent-m",
          "version": "a100000000000000000000000000000000000000",
          "paidSecrets": []
        }
      },
      "result": { "path": ".github/workflows/agent-m-engine.yml", "text": "# Generated by Agent M; it takes the next step of every open run of the product.\nname: agent-m engine\nrun-name: agent-m engine\non:\n  workflow_dispatch:\npermissions:\n  contents: read\nconcurrency:\n  group: agent-m-engine\njobs:\n  engine:\n    runs-on: ubuntu-latest\n    timeout-minutes: 30\n    env:\n      AGENT_M_HOME: ${{ github.workspace }}/agent-m\n      AGENT_M_INSTANCE: https://github.com/alice/agent-m\n      AGENT_M_VERSION: a100000000000000000000000000000000000000\n    steps:\n      - uses: actions/checkout@v4\n        with:\n          path: product\n          persist-credentials: false\n      - uses: actions/checkout@v4\n        with:\n          repository: alice/agent-m\n          ref: a100000000000000000000000000000000000000\n          path: agent-m\n      - uses: actions/setup-node@v4\n        with:\n          node-version: \"22\"\n      - working-directory: product\n        env:\n          AGENT_M_TOKEN: ${{ secrets.AGENT_M_TOKEN }}\n        run: node \"$AGENT_M_HOME/src/ci-entry/main.mjs\" engine\n" }
    },
    {
      "name": "a GitLab product",
      "input": {
        "product": { "kind": "gitlab", "address": "https://gitlab.example.org/group/tools/thesis", "host": "gitlab.example.org", "server": "https://gitlab.example.org", "repo": "group/tools/thesis" },
        "setup": {
          "instance": "https://github.com/alice/agent-m",
          "version": "a100000000000000000000000000000000000000",
          "paidSecrets": []
        }
      },
      "refused": "not-on-github"
    }
  ]
}
```

### MOD-ci-entry

```json module
{
  "id": "MOD-ci-entry",
  "folder": "src/ci-entry/",
  "layer": "shell",
  "responsibility": "Runs the steps of the generated CI jobs that run Agent M's code — the command of node's test runner for a job's kind of tests, the records of a pipeline's runs on the branch test-results, written by the one job that holds the person's token, the start of an agent's job, the check for a cancel before its writes, the look at its pull request, and the check of the Definition of Done — with the process's environment, its working tree, the network and the clock as ports; src/ci-entry/main.mjs maps a step's name to these.",
  "realises": [],
  "owns": ["CiEnv", "RunOutcome", "RecordsWritten", "RunNoteLines", "RunStep", "EngineStep", "RunNoteFile"],
  "uses": ["MOD-contracts", "MOD-test-records", "MOD-git-host", "MOD-run-engine", "MOD-job-runner", "MOD-job-steps", "MOD-process-views", "MOD-main-page", "MOD-settings-store"]
}
```

```json interface
{
  "id": "MOD-ci-entry.testCommand",
  "summary": "The command of node's test runner for a job's kind: the files of its level and, of them, every case but those that call a paid service or a model — or, for the job of those tests, the files that declare them and only those cases —, the JUnit report written to AGENT_M_JUNIT, the spec report to the log; nothing to run where no file is of the kind.",
  "params": [{ "name": "env", "type": "CiEnv" }, { "name": "files", "type": "TestFile[]" }],
  "result": "string[]",
  "async": false,
  "refusals": [
    { "code": "unknown-kind", "when": "AGENT_M_KIND is none of unit, component, system, paid and release" },
    { "code": "no-report-path", "when": "AGENT_M_JUNIT names no file" }
  ],
  "examples": [
    {
      "name": "the system tests of a commit",
      "input": {
        "env": { "AGENT_M_KIND": "system", "AGENT_M_JUNIT": "/home/runner/work/thesis/agent-m-out/system/junit.xml" },
        "files": [
          {
            "path": "tests/export.test.mjs",
            "module": "MOD-export",
            "guards": ["A CHAPTER IS EXPORTED", "UC-003"],
            "level": "system",
            "levels": ["system"],
            "cases": [
              {
                "id": "TST-014",
                "title": "the PDF keeps the figures",
                "given": "a chapter with two figures",
                "when": "the author exports it as PDF",
                "then": "the PDF holds both figures",
                "extends": "",
                "runs": null,
                "paid": [],
                "awaiting": false,
                "line": 8
              },
              {
                "id": "TST-015",
                "title": "the PDF names the chapter",
                "given": "a chapter titled Methods",
                "when": "the author exports it as PDF",
                "then": "the PDF's title is Methods",
                "extends": "",
                "runs": null,
                "paid": [],
                "awaiting": false,
                "line": 14
              },
              {
                "id": "TST-016",
                "title": "the summary of an export reads as the chapter",
                "given": "a chapter of four pages",
                "when": "the model summarises the exported PDF",
                "then": "the summary names the chapter's three findings",
                "extends": "",
                "runs": 20,
                "paid": ["hub"],
                "awaiting": false,
                "line": 20
              }
            ]
          },
          {
            "path": "tests/release-export.test.mjs",
            "module": "MOD-export",
            "guards": ["A CHAPTER IS EXPORTED"],
            "level": "release",
            "levels": ["release"],
            "cases": [
              {
                "id": "TST-021",
                "title": "an accepted chapter can be exported",
                "given": "an accepted chapter",
                "when": "the release candidate exports it",
                "then": "a PDF arrives",
                "extends": "",
                "runs": null,
                "paid": [],
                "awaiting": false,
                "line": 5
              }
            ]
          }
        ]
      },
      "result": ["node", "--test", "--test-reporter=spec", "--test-reporter-destination=stdout", "--test-reporter=junit", "--test-reporter-destination=/home/runner/work/thesis/agent-m-out/system/junit.xml", "--test-skip-pattern=^(TST-016)\\b", "tests/export.test.mjs"]
    },
    {
      "name": "the tests that call a paid service or a model",
      "input": {
        "env": { "AGENT_M_KIND": "paid", "AGENT_M_JUNIT": "/home/runner/work/thesis/agent-m-out/paid/junit.xml" },
        "files": [
          {
            "path": "tests/export.test.mjs",
            "module": "MOD-export",
            "guards": ["A CHAPTER IS EXPORTED", "UC-003"],
            "level": "system",
            "levels": ["system"],
            "cases": [
              {
                "id": "TST-014",
                "title": "the PDF keeps the figures",
                "given": "a chapter with two figures",
                "when": "the author exports it as PDF",
                "then": "the PDF holds both figures",
                "extends": "",
                "runs": null,
                "paid": [],
                "awaiting": false,
                "line": 8
              },
              {
                "id": "TST-015",
                "title": "the PDF names the chapter",
                "given": "a chapter titled Methods",
                "when": "the author exports it as PDF",
                "then": "the PDF's title is Methods",
                "extends": "",
                "runs": null,
                "paid": [],
                "awaiting": false,
                "line": 14
              },
              {
                "id": "TST-016",
                "title": "the summary of an export reads as the chapter",
                "given": "a chapter of four pages",
                "when": "the model summarises the exported PDF",
                "then": "the summary names the chapter's three findings",
                "extends": "",
                "runs": 20,
                "paid": ["hub"],
                "awaiting": false,
                "line": 20
              }
            ]
          },
          {
            "path": "tests/release-export.test.mjs",
            "module": "MOD-export",
            "guards": ["A CHAPTER IS EXPORTED"],
            "level": "release",
            "levels": ["release"],
            "cases": [
              {
                "id": "TST-021",
                "title": "an accepted chapter can be exported",
                "given": "an accepted chapter",
                "when": "the release candidate exports it",
                "then": "a PDF arrives",
                "extends": "",
                "runs": null,
                "paid": [],
                "awaiting": false,
                "line": 5
              }
            ]
          }
        ]
      },
      "result": ["node", "--test", "--test-reporter=spec", "--test-reporter-destination=stdout", "--test-reporter=junit", "--test-reporter-destination=/home/runner/work/thesis/agent-m-out/paid/junit.xml", "--test-name-pattern=^(TST-016)\\b", "tests/export.test.mjs"]
    },
    {
      "name": "no unit test",
      "input": {
        "env": { "AGENT_M_KIND": "unit", "AGENT_M_JUNIT": "/home/runner/work/thesis/agent-m-out/unit/junit.xml" },
        "files": [
          {
            "path": "tests/export.test.mjs",
            "module": "MOD-export",
            "guards": ["A CHAPTER IS EXPORTED", "UC-003"],
            "level": "system",
            "levels": ["system"],
            "cases": [
              {
                "id": "TST-014",
                "title": "the PDF keeps the figures",
                "given": "a chapter with two figures",
                "when": "the author exports it as PDF",
                "then": "the PDF holds both figures",
                "extends": "",
                "runs": null,
                "paid": [],
                "awaiting": false,
                "line": 8
              },
              {
                "id": "TST-015",
                "title": "the PDF names the chapter",
                "given": "a chapter titled Methods",
                "when": "the author exports it as PDF",
                "then": "the PDF's title is Methods",
                "extends": "",
                "runs": null,
                "paid": [],
                "awaiting": false,
                "line": 14
              },
              {
                "id": "TST-016",
                "title": "the summary of an export reads as the chapter",
                "given": "a chapter of four pages",
                "when": "the model summarises the exported PDF",
                "then": "the summary names the chapter's three findings",
                "extends": "",
                "runs": 20,
                "paid": ["hub"],
                "awaiting": false,
                "line": 20
              }
            ]
          },
          {
            "path": "tests/release-export.test.mjs",
            "module": "MOD-export",
            "guards": ["A CHAPTER IS EXPORTED"],
            "level": "release",
            "levels": ["release"],
            "cases": [
              {
                "id": "TST-021",
                "title": "an accepted chapter can be exported",
                "given": "an accepted chapter",
                "when": "the release candidate exports it",
                "then": "a PDF arrives",
                "extends": "",
                "runs": null,
                "paid": [],
                "awaiting": false,
                "line": 5
              }
            ]
          }
        ]
      },
      "result": []
    },
    {
      "name": "a kind of none of the five",
      "input": {
        "env": { "AGENT_M_KIND": "integration", "AGENT_M_JUNIT": "/home/runner/work/thesis/agent-m-out/integration/junit.xml" },
        "files": [
          {
            "path": "tests/export.test.mjs",
            "module": "MOD-export",
            "guards": ["A CHAPTER IS EXPORTED", "UC-003"],
            "level": "system",
            "levels": ["system"],
            "cases": [
              {
                "id": "TST-014",
                "title": "the PDF keeps the figures",
                "given": "a chapter with two figures",
                "when": "the author exports it as PDF",
                "then": "the PDF holds both figures",
                "extends": "",
                "runs": null,
                "paid": [],
                "awaiting": false,
                "line": 8
              },
              {
                "id": "TST-015",
                "title": "the PDF names the chapter",
                "given": "a chapter titled Methods",
                "when": "the author exports it as PDF",
                "then": "the PDF's title is Methods",
                "extends": "",
                "runs": null,
                "paid": [],
                "awaiting": false,
                "line": 14
              },
              {
                "id": "TST-016",
                "title": "the summary of an export reads as the chapter",
                "given": "a chapter of four pages",
                "when": "the model summarises the exported PDF",
                "then": "the summary names the chapter's three findings",
                "extends": "",
                "runs": 20,
                "paid": ["hub"],
                "awaiting": false,
                "line": 20
              }
            ]
          }
        ]
      },
      "refused": "unknown-kind"
    }
  ]
}
```

```json interface
{
  "id": "MOD-ci-entry.recordRuns",
  "summary": "The records of a pipeline's runs, written in one commit as new files on the branch test-results on the CI secret's authority, by the one job that holds the person's token: per note directory AGENT_M_NOTES names under AGENT_M_OUT, the run its note describes — the kind, the job's outcome, the secrets it missed, the run's name, the page of its log, the runner — with the levels of its kind, the occasion, when, and the outcomes of its JUnit report; not run where secrets were missing or no test is of its kind. test-results is started on the tested commit where the repository has none, a record whose path is taken is never written over, and a branch that moved on is read again, up to three times.",
  "params": [
    { "name": "env", "type": "CiEnv" },
    { "name": "paths", "type": "string[]" },
    { "name": "files", "type": "ReadPort" },
    { "name": "fetch", "type": "FetchPort" },
    { "name": "clock", "type": "ClockPort" }
  ],
  "result": "RecordsWritten",
  "async": true,
  "refusals": [
    { "code": "no-token", "when": "the job's environment holds no AGENT_M_TOKEN" },
    { "code": "not-an-address", "when": "the platform's variables name no product" },
    { "code": "no-commit", "when": "AGENT_M_COMMIT names no 40-hex commit" },
    { "code": "not-a-note", "when": "a note names no kind of test or no run" },
    { "code": "no-run", "when": "no job left a note of its run" },
    { "code": "record-exists", "when": "a record of one of the paths is on test-results" },
    { "code": "moved", "when": "test-results moved on three times while the records were written" },
    { "code": "token-refused", "when": "the server refuses the token" },
    { "code": "no-access", "when": "the token lacks the permission" },
    { "code": "server-error", "when": "the server answers with another error" },
    { "code": "unreachable", "when": "no answer arrives" }
  ],
  "examples": [
    {
      "name": "a push's runs, the first records of a product on GitHub",
      "input": {
        "env": { "GITHUB_ACTIONS": "true", "GITHUB_SERVER_URL": "https://github.com", "GITHUB_REPOSITORY": "alice/thesis", "AGENT_M_HOME": "/home/runner/work/thesis/agent-m", "AGENT_M_OUT": "/home/runner/work/thesis/agent-m-out", "AGENT_M_NOTES": "agent-m-system agent-m-unit", "AGENT_M_TOKEN": "github_pat_example", "AGENT_M_OCCASION": "every commit", "AGENT_M_COMMIT": "c100000000000000000000000000000000000000" },
        "paths": ["tests/export.test.mjs", "tests/release-export.test.mjs"],
        "files": { "tests/export.test.mjs": "// The export of a chapter.\n//\n// Module: MOD-export\n// Guards: A CHAPTER IS EXPORTED; UC-003\n// Level: system\nimport { test } from \"node:test\";\n\n// TST-014 the PDF keeps the figures\n// Given: a chapter with two figures\n// When: the author exports it as PDF\n// Then: the PDF holds both figures\ntest(\"TST-014 the PDF keeps the figures\", () => {});\n\n// TST-015 the PDF names the chapter\n// Given: a chapter titled Methods\n// When: the author exports it as PDF\n// Then: the PDF's title is Methods\ntest(\"TST-015 the PDF names the chapter\", () => {});\n\n// TST-016 the summary of an export reads as the chapter\n// Given: a chapter of four pages\n// When: the model summarises the exported PDF\n// Then: the summary names the chapter's three findings\n// Runs: 20\n// Paid: hub\ntest(\"TST-016 the summary of an export reads as the chapter\", () => {});\n", "tests/release-export.test.mjs": "// Module: MOD-export\n// Guards: A CHAPTER IS EXPORTED\n// Level: release\n\n// TST-021 an accepted chapter can be exported\n// Given: an accepted chapter\n// When: the release candidate exports it\n// Then: a PDF arrives\ntest(\"TST-021 an accepted chapter can be exported\", () => {});\n", "/home/runner/work/thesis/agent-m-out/agent-m-system/run.txt": "kind: system\noutcome: failure\nmissing: \nrun: gh-4711-1-system\nlog: https://github.com/alice/thesis/actions/runs/4711\nparticipant: GitHub Actions, runner GitHub Actions 7\n", "/home/runner/work/thesis/agent-m-out/agent-m-system/junit.xml": "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<testsuites>\n  <testsuite name=\"tests/export.test.mjs\" tests=\"23\" failures=\"4\">\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-014 the PDF keeps the figures\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-015 the PDF names the chapter\" time=\"0.01\"><failure message=\"expected &quot;Methods&quot;, got &quot;chapter-2&quot;\" type=\"AssertionError\">AssertionError: expected &quot;Methods&quot;, got &quot;chapter-2&quot;\n    at tests/export.test.mjs:18:3</failure></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #1\" time=\"0.01\"><failure message=\"the summary names two findings\"/></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #2\" time=\"0.01\"><failure message=\"the summary names two findings\"/></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #3\" time=\"0.01\"><failure message=\"the summary names two findings\"/></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #4\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #5\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #6\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #7\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #8\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #9\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #10\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #11\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #12\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #13\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #14\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #15\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #16\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #17\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #18\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #19\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #20\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/helpers.test.mjs\" name=\"a helper without an identifier\"/>\n  </testsuite>\n</testsuites>\n", "/home/runner/work/thesis/agent-m-out/agent-m-unit/run.txt": "kind: unit\noutcome: success\nmissing: \nrun: gh-4711-1-unit\nlog: https://github.com/alice/thesis/actions/runs/4711\nparticipant: GitHub Actions, runner GitHub Actions 3\n" },
        "fetch": [
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/git/ref/heads/test-results" },
            "response": { "status": 404, "body": { "message": "Not Found" } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/git/commits/c100000000000000000000000000000000000000" },
            "response": {
              "status": 200,
              "body": {
                "sha": "c100000000000000000000000000000000000000",
                "tree": { "sha": "d300000000000000000000000000000000000000" }
              }
            }
          },
          {
            "request": {
              "method": "POST",
              "url": "https://api.github.com/repos/alice/thesis/git/refs",
              "body": { "ref": "refs/heads/test-results", "sha": "c100000000000000000000000000000000000000" }
            },
            "response": {
              "status": 201,
              "body": {
                "ref": "refs/heads/test-results",
                "object": { "sha": "c100000000000000000000000000000000000000" }
              }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/contents/results/c100000000000000000000000000000000000000/gh-4711-1-system.md?ref=c100000000000000000000000000000000000000" },
            "response": { "status": 404, "body": { "message": "Not Found" } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/contents/results/c100000000000000000000000000000000000000/gh-4711-1-unit.md?ref=c100000000000000000000000000000000000000" },
            "response": { "status": 404, "body": { "message": "Not Found" } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis" },
            "response": { "status": 200, "body": { "visibility": "private", "default_branch": "main" } }
          },
          {
            "request": {
              "method": "POST",
              "url": "https://api.github.com/repos/alice/thesis/git/trees",
              "body": {
                "base_tree": "d300000000000000000000000000000000000000",
                "tree": [
                  { "path": "results/c100000000000000000000000000000000000000/gh-4711-1-system.md", "mode": "100644", "type": "blob", "content": "---\ncommit: c100000000000000000000000000000000000000\nlevels:\n  - system\noccasion: every commit\nparticipant: GitHub Actions, runner GitHub Actions 7\nlog: https://github.com/alice/thesis/actions/runs/4711\nat: 2026-10-09T08:04:00Z\nuncommitted: no\noutcome: failed\nnote: 1 testcase carries no TST- identifier\n---\n\n# Run gh-4711-1-system\n\n| Test | Level | Outcome | Runs | Passed | Note |\n|---|---|---|---|---|---|\n| TST-014 | system | passed | 1 | 1 |  |\n| TST-015 | system | failed | 1 | 0 | expected \"Methods\", got \"chapter-2\" |\n| TST-016 | system | rate | 20 | 17 | the summary names two findings |\n\n## TST-015\n\n~~~text\nAssertionError: expected \"Methods\", got \"chapter-2\"\n    at tests/export.test.mjs:18:3\n~~~\n" },
                  { "path": "results/c100000000000000000000000000000000000000/gh-4711-1-unit.md", "mode": "100644", "type": "blob", "content": "---\ncommit: c100000000000000000000000000000000000000\nlevels:\n  - unit\noccasion: every commit\nparticipant: GitHub Actions, runner GitHub Actions 3\nlog: https://github.com/alice/thesis/actions/runs/4711\nat: 2026-10-09T08:04:00Z\nuncommitted: no\noutcome: not-run\nnote: no test declares the level unit\n---\n\n# Run gh-4711-1-unit\n\n| Test | Level | Outcome | Runs | Passed | Note |\n|---|---|---|---|---|---|\n" }
                ]
              }
            },
            "response": { "status": 201, "body": { "sha": "e400000000000000000000000000000000000000" } }
          },
          {
            "request": {
              "method": "POST",
              "url": "https://api.github.com/repos/alice/thesis/git/commits",
              "body": {
                "message": "results: gh-4711-1-system, gh-4711-1-unit on c10000000000",
                "tree": "e400000000000000000000000000000000000000",
                "parents": ["c100000000000000000000000000000000000000"]
              }
            },
            "response": {
              "status": 201,
              "body": { "sha": "b200000000000000000000000000000000000000", "html_url": "https://github.com/alice/thesis/commit/b200000000000000000000000000000000000000" }
            }
          },
          {
            "request": {
              "method": "PATCH",
              "url": "https://api.github.com/repos/alice/thesis/git/refs/heads/test-results",
              "body": { "sha": "b200000000000000000000000000000000000000", "force": false }
            },
            "response": { "status": 200, "body": { "object": { "sha": "b200000000000000000000000000000000000000" } } }
          }
        ],
        "clock": "2026-10-09T08:04:00Z"
      },
      "result": {
        "paths": ["results/c100000000000000000000000000000000000000/gh-4711-1-system.md", "results/c100000000000000000000000000000000000000/gh-4711-1-unit.md"],
        "commit": "b200000000000000000000000000000000000000",
        "outcomes": [
          { "run": "gh-4711-1-system", "outcome": "failed" },
          { "run": "gh-4711-1-unit", "outcome": "not-run" }
        ]
      }
    },
    {
      "name": "a nightly pipeline on GitLab, one job without its key",
      "input": {
        "env": { "GITLAB_CI": "true", "CI_PROJECT_URL": "https://gitlab.example.org/group/tools/thesis", "AGENT_M_HOME": "/tmp/agent-m-5503", "AGENT_M_OUT": "/builds/group/tools/thesis/agent-m-out", "AGENT_M_NOTES": "paid system", "AGENT_M_TOKEN": "glpat-example", "AGENT_M_OCCASION": "nightly", "AGENT_M_COMMIT": "c100000000000000000000000000000000000000" },
        "paths": ["tests/export.test.mjs", "tests/release-export.test.mjs"],
        "files": { "tests/export.test.mjs": "// The export of a chapter.\n//\n// Module: MOD-export\n// Guards: A CHAPTER IS EXPORTED; UC-003\n// Level: system\nimport { test } from \"node:test\";\n\n// TST-014 the PDF keeps the figures\n// Given: a chapter with two figures\n// When: the author exports it as PDF\n// Then: the PDF holds both figures\ntest(\"TST-014 the PDF keeps the figures\", () => {});\n\n// TST-015 the PDF names the chapter\n// Given: a chapter titled Methods\n// When: the author exports it as PDF\n// Then: the PDF's title is Methods\ntest(\"TST-015 the PDF names the chapter\", () => {});\n\n// TST-016 the summary of an export reads as the chapter\n// Given: a chapter of four pages\n// When: the model summarises the exported PDF\n// Then: the summary names the chapter's three findings\n// Runs: 20\n// Paid: hub\ntest(\"TST-016 the summary of an export reads as the chapter\", () => {});\n", "tests/release-export.test.mjs": "// Module: MOD-export\n// Guards: A CHAPTER IS EXPORTED\n// Level: release\n\n// TST-021 an accepted chapter can be exported\n// Given: an accepted chapter\n// When: the release candidate exports it\n// Then: a PDF arrives\ntest(\"TST-021 an accepted chapter can be exported\", () => {});\n", "/builds/group/tools/thesis/agent-m-out/paid/run.txt": "kind: paid\noutcome: failed\nmissing: HUB_KEY\nrun: gl-901-5501\nlog: https://gitlab.example.org/group/tools/thesis/-/jobs/5501\nparticipant: GitLab CI, runner cli-dev on lab-pc-3\n", "/builds/group/tools/thesis/agent-m-out/system/run.txt": "kind: system\noutcome: success\nmissing: \nrun: gl-901-5502\nlog: https://gitlab.example.org/group/tools/thesis/-/jobs/5502\nparticipant: GitLab CI, runner gitlab-runner-12\n", "/builds/group/tools/thesis/agent-m-out/system/junit.xml": "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<testsuites>\n  <testsuite name=\"tests/export.test.mjs\" tests=\"23\" failures=\"4\">\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-014 the PDF keeps the figures\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-015 the PDF names the chapter\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #1\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #2\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #3\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #4\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #5\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #6\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #7\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #8\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #9\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #10\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #11\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #12\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #13\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #14\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #15\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #16\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #17\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #18\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #19\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #20\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/helpers.test.mjs\" name=\"a helper without an identifier\"/>\n  </testsuite>\n</testsuites>\n" },
        "fetch": [
          {
            "request": { "method": "GET", "url": "https://gitlab.example.org/api/v4/projects/group%2Ftools%2Fthesis/repository/branches/test-results" },
            "response": { "status": 200, "body": { "commit": { "id": "a700000000000000000000000000000000000000" } } }
          },
          {
            "request": { "method": "GET", "url": "https://gitlab.example.org/api/v4/projects/group%2Ftools%2Fthesis/repository/files/results%2Fc100000000000000000000000000000000000000%2Fgl-901-5501.md/raw?ref=a700000000000000000000000000000000000000" },
            "response": { "status": 404, "body": { "message": "404 File Not Found" } }
          },
          {
            "request": { "method": "GET", "url": "https://gitlab.example.org/api/v4/projects/group%2Ftools%2Fthesis/repository/files/results%2Fc100000000000000000000000000000000000000%2Fgl-901-5502.md/raw?ref=a700000000000000000000000000000000000000" },
            "response": { "status": 404, "body": { "message": "404 File Not Found" } }
          },
          {
            "request": { "method": "GET", "url": "https://gitlab.example.org/api/v4/projects/group%2Ftools%2Fthesis" },
            "response": {
              "status": 200,
              "body": {
                "visibility": "private",
                "default_branch": "main",
                "permissions": { "project_access": { "access_level": 40 } }
              }
            }
          },
          {
            "request": { "method": "GET", "url": "https://gitlab.example.org/api/v4/projects/group%2Ftools%2Fthesis/repository/files/results%2Fc100000000000000000000000000000000000000%2Fgl-901-5501.md?ref=a700000000000000000000000000000000000000" },
            "response": { "status": 404, "body": { "message": "404 File Not Found" } }
          },
          {
            "request": { "method": "GET", "url": "https://gitlab.example.org/api/v4/projects/group%2Ftools%2Fthesis/repository/files/results%2Fc100000000000000000000000000000000000000%2Fgl-901-5502.md?ref=a700000000000000000000000000000000000000" },
            "response": { "status": 404, "body": { "message": "404 File Not Found" } }
          },
          {
            "request": {
              "method": "POST",
              "url": "https://gitlab.example.org/api/v4/projects/group%2Ftools%2Fthesis/repository/commits",
              "body": {
                "branch": "test-results",
                "commit_message": "results: gl-901-5501, gl-901-5502 on c10000000000",
                "actions": [
                  { "action": "create", "file_path": "results/c100000000000000000000000000000000000000/gl-901-5501.md", "content": "---\ncommit: c100000000000000000000000000000000000000\nlevels:\n  - system\noccasion: nightly\nparticipant: GitLab CI, runner cli-dev on lab-pc-3\nlog: https://gitlab.example.org/group/tools/thesis/-/jobs/5501\nat: 2026-10-09T08:04:00Z\nuncommitted: no\noutcome: not-run\nnote: the secret HUB_KEY is missing\n---\n\n# Run gl-901-5501\n\n| Test | Level | Outcome | Runs | Passed | Note |\n|---|---|---|---|---|---|\n", "encoding": "text" },
                  { "action": "create", "file_path": "results/c100000000000000000000000000000000000000/gl-901-5502.md", "content": "---\ncommit: c100000000000000000000000000000000000000\nlevels:\n  - system\noccasion: nightly\nparticipant: GitLab CI, runner gitlab-runner-12\nlog: https://gitlab.example.org/group/tools/thesis/-/jobs/5502\nat: 2026-10-09T08:04:00Z\nuncommitted: no\noutcome: passed\nnote: 1 testcase carries no TST- identifier\n---\n\n# Run gl-901-5502\n\n| Test | Level | Outcome | Runs | Passed | Note |\n|---|---|---|---|---|---|\n| TST-014 | system | passed | 1 | 1 |  |\n| TST-015 | system | passed | 1 | 1 |  |\n| TST-016 | system | rate | 20 | 20 |  |\n", "encoding": "text" }
                ]
              }
            },
            "response": {
              "status": 201,
              "body": { "id": "b200000000000000000000000000000000000000", "web_url": "https://gitlab.example.org/group/tools/thesis/-/commit/b200000000000000000000000000000000000000" }
            }
          }
        ],
        "clock": "2026-10-09T08:04:00Z"
      },
      "result": {
        "paths": ["results/c100000000000000000000000000000000000000/gl-901-5501.md", "results/c100000000000000000000000000000000000000/gl-901-5502.md"],
        "commit": "b200000000000000000000000000000000000000",
        "outcomes": [{ "run": "gl-901-5501", "outcome": "not-run" }, { "run": "gl-901-5502", "outcome": "passed" }]
      }
    },
    {
      "name": "a record already written",
      "input": {
        "env": { "GITHUB_ACTIONS": "true", "GITHUB_SERVER_URL": "https://github.com", "GITHUB_REPOSITORY": "alice/thesis", "AGENT_M_HOME": "/home/runner/work/thesis/agent-m", "AGENT_M_OUT": "/home/runner/work/thesis/agent-m-out", "AGENT_M_NOTES": "agent-m-system agent-m-unit", "AGENT_M_TOKEN": "github_pat_example", "AGENT_M_OCCASION": "every commit", "AGENT_M_COMMIT": "c100000000000000000000000000000000000000" },
        "paths": ["tests/export.test.mjs", "tests/release-export.test.mjs"],
        "files": { "tests/export.test.mjs": "// The export of a chapter.\n//\n// Module: MOD-export\n// Guards: A CHAPTER IS EXPORTED; UC-003\n// Level: system\nimport { test } from \"node:test\";\n\n// TST-014 the PDF keeps the figures\n// Given: a chapter with two figures\n// When: the author exports it as PDF\n// Then: the PDF holds both figures\ntest(\"TST-014 the PDF keeps the figures\", () => {});\n\n// TST-015 the PDF names the chapter\n// Given: a chapter titled Methods\n// When: the author exports it as PDF\n// Then: the PDF's title is Methods\ntest(\"TST-015 the PDF names the chapter\", () => {});\n\n// TST-016 the summary of an export reads as the chapter\n// Given: a chapter of four pages\n// When: the model summarises the exported PDF\n// Then: the summary names the chapter's three findings\n// Runs: 20\n// Paid: hub\ntest(\"TST-016 the summary of an export reads as the chapter\", () => {});\n", "tests/release-export.test.mjs": "// Module: MOD-export\n// Guards: A CHAPTER IS EXPORTED\n// Level: release\n\n// TST-021 an accepted chapter can be exported\n// Given: an accepted chapter\n// When: the release candidate exports it\n// Then: a PDF arrives\ntest(\"TST-021 an accepted chapter can be exported\", () => {});\n", "/home/runner/work/thesis/agent-m-out/agent-m-system/run.txt": "kind: system\noutcome: failure\nmissing: \nrun: gh-4711-1-system\nlog: https://github.com/alice/thesis/actions/runs/4711\nparticipant: GitHub Actions, runner GitHub Actions 7\n", "/home/runner/work/thesis/agent-m-out/agent-m-system/junit.xml": "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<testsuites>\n  <testsuite name=\"tests/export.test.mjs\" tests=\"23\" failures=\"4\">\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-014 the PDF keeps the figures\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-015 the PDF names the chapter\" time=\"0.01\"><failure message=\"expected &quot;Methods&quot;, got &quot;chapter-2&quot;\" type=\"AssertionError\">AssertionError: expected &quot;Methods&quot;, got &quot;chapter-2&quot;\n    at tests/export.test.mjs:18:3</failure></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #1\" time=\"0.01\"><failure message=\"the summary names two findings\"/></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #2\" time=\"0.01\"><failure message=\"the summary names two findings\"/></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #3\" time=\"0.01\"><failure message=\"the summary names two findings\"/></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #4\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #5\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #6\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #7\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #8\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #9\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #10\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #11\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #12\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #13\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #14\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #15\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #16\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #17\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #18\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #19\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #20\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/helpers.test.mjs\" name=\"a helper without an identifier\"/>\n  </testsuite>\n</testsuites>\n", "/home/runner/work/thesis/agent-m-out/agent-m-unit/run.txt": "kind: unit\noutcome: success\nmissing: \nrun: gh-4711-1-unit\nlog: https://github.com/alice/thesis/actions/runs/4711\nparticipant: GitHub Actions, runner GitHub Actions 3\n" },
        "fetch": [
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/git/ref/heads/test-results" },
            "response": { "status": 200, "body": { "object": { "sha": "a700000000000000000000000000000000000000" } } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/contents/results/c100000000000000000000000000000000000000/gh-4711-1-system.md?ref=a700000000000000000000000000000000000000" },
            "response": { "status": 200, "body": "---\ncommit: c100000000000000000000000000000000000000\nlevels:\n  - system\noccasion: every commit\nparticipant: GitHub Actions, runner GitHub Actions 7\nlog: https://github.com/alice/thesis/actions/runs/4711\nat: 2026-10-09T08:04:00Z\nuncommitted: no\noutcome: failed\nnote: 1 testcase carries no TST- identifier\n---\n\n# Run gh-4711-1-system\n\n| Test | Level | Outcome | Runs | Passed | Note |\n|---|---|---|---|---|---|\n| TST-014 | system | passed | 1 | 1 |  |\n| TST-015 | system | failed | 1 | 0 | expected \"Methods\", got \"chapter-2\" |\n| TST-016 | system | rate | 20 | 17 | the summary names two findings |\n\n## TST-015\n\n~~~text\nAssertionError: expected \"Methods\", got \"chapter-2\"\n    at tests/export.test.mjs:18:3\n~~~\n" }
          }
        ],
        "clock": "2026-10-09T08:04:00Z"
      },
      "refused": "record-exists"
    },
    {
      "name": "no job left a note",
      "input": {
        "env": { "GITHUB_ACTIONS": "true", "GITHUB_SERVER_URL": "https://github.com", "GITHUB_REPOSITORY": "alice/thesis", "AGENT_M_HOME": "/home/runner/work/thesis/agent-m", "AGENT_M_OUT": "/home/runner/work/thesis/agent-m-out", "AGENT_M_NOTES": "", "AGENT_M_TOKEN": "github_pat_example", "AGENT_M_OCCASION": "every commit", "AGENT_M_COMMIT": "c100000000000000000000000000000000000000" },
        "paths": ["tests/export.test.mjs", "tests/release-export.test.mjs"],
        "files": { "tests/export.test.mjs": "// The export of a chapter.\n//\n// Module: MOD-export\n// Guards: A CHAPTER IS EXPORTED; UC-003\n// Level: system\nimport { test } from \"node:test\";\n\n// TST-014 the PDF keeps the figures\n// Given: a chapter with two figures\n// When: the author exports it as PDF\n// Then: the PDF holds both figures\ntest(\"TST-014 the PDF keeps the figures\", () => {});\n\n// TST-015 the PDF names the chapter\n// Given: a chapter titled Methods\n// When: the author exports it as PDF\n// Then: the PDF's title is Methods\ntest(\"TST-015 the PDF names the chapter\", () => {});\n\n// TST-016 the summary of an export reads as the chapter\n// Given: a chapter of four pages\n// When: the model summarises the exported PDF\n// Then: the summary names the chapter's three findings\n// Runs: 20\n// Paid: hub\ntest(\"TST-016 the summary of an export reads as the chapter\", () => {});\n", "tests/release-export.test.mjs": "// Module: MOD-export\n// Guards: A CHAPTER IS EXPORTED\n// Level: release\n\n// TST-021 an accepted chapter can be exported\n// Given: an accepted chapter\n// When: the release candidate exports it\n// Then: a PDF arrives\ntest(\"TST-021 an accepted chapter can be exported\", () => {});\n" },
        "fetch": [],
        "clock": "2026-10-09T08:04:00Z"
      },
      "refused": "no-run"
    },
    {
      "name": "no token",
      "input": {
        "env": { "GITHUB_ACTIONS": "true", "GITHUB_SERVER_URL": "https://github.com", "GITHUB_REPOSITORY": "alice/thesis", "AGENT_M_HOME": "/home/runner/work/thesis/agent-m", "AGENT_M_OUT": "/home/runner/work/thesis/agent-m-out", "AGENT_M_NOTES": "agent-m-system agent-m-unit", "AGENT_M_TOKEN": "", "AGENT_M_OCCASION": "every commit", "AGENT_M_COMMIT": "c100000000000000000000000000000000000000" },
        "paths": ["tests/export.test.mjs", "tests/release-export.test.mjs"],
        "files": { "tests/export.test.mjs": "// The export of a chapter.\n//\n// Module: MOD-export\n// Guards: A CHAPTER IS EXPORTED; UC-003\n// Level: system\nimport { test } from \"node:test\";\n\n// TST-014 the PDF keeps the figures\n// Given: a chapter with two figures\n// When: the author exports it as PDF\n// Then: the PDF holds both figures\ntest(\"TST-014 the PDF keeps the figures\", () => {});\n\n// TST-015 the PDF names the chapter\n// Given: a chapter titled Methods\n// When: the author exports it as PDF\n// Then: the PDF's title is Methods\ntest(\"TST-015 the PDF names the chapter\", () => {});\n\n// TST-016 the summary of an export reads as the chapter\n// Given: a chapter of four pages\n// When: the model summarises the exported PDF\n// Then: the summary names the chapter's three findings\n// Runs: 20\n// Paid: hub\ntest(\"TST-016 the summary of an export reads as the chapter\", () => {});\n", "tests/release-export.test.mjs": "// Module: MOD-export\n// Guards: A CHAPTER IS EXPORTED\n// Level: release\n\n// TST-021 an accepted chapter can be exported\n// Given: an accepted chapter\n// When: the release candidate exports it\n// Then: a PDF arrives\ntest(\"TST-021 an accepted chapter can be exported\", () => {});\n", "/home/runner/work/thesis/agent-m-out/agent-m-system/run.txt": "kind: system\noutcome: failure\nmissing: \nrun: gh-4711-1-system\nlog: https://github.com/alice/thesis/actions/runs/4711\nparticipant: GitHub Actions, runner GitHub Actions 7\n", "/home/runner/work/thesis/agent-m-out/agent-m-system/junit.xml": "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<testsuites>\n  <testsuite name=\"tests/export.test.mjs\" tests=\"23\" failures=\"4\">\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-014 the PDF keeps the figures\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-015 the PDF names the chapter\" time=\"0.01\"><failure message=\"expected &quot;Methods&quot;, got &quot;chapter-2&quot;\" type=\"AssertionError\">AssertionError: expected &quot;Methods&quot;, got &quot;chapter-2&quot;\n    at tests/export.test.mjs:18:3</failure></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #1\" time=\"0.01\"><failure message=\"the summary names two findings\"/></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #2\" time=\"0.01\"><failure message=\"the summary names two findings\"/></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #3\" time=\"0.01\"><failure message=\"the summary names two findings\"/></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #4\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #5\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #6\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #7\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #8\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #9\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #10\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #11\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #12\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #13\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #14\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #15\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #16\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #17\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #18\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #19\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/export.test.mjs\" name=\"TST-016 the summary of an export reads as the chapter #20\" time=\"0.01\"></testcase>\n    <testcase classname=\"tests/helpers.test.mjs\" name=\"a helper without an identifier\"/>\n  </testsuite>\n</testsuites>\n", "/home/runner/work/thesis/agent-m-out/agent-m-unit/run.txt": "kind: unit\noutcome: success\nmissing: \nrun: gh-4711-1-unit\nlog: https://github.com/alice/thesis/actions/runs/4711\nparticipant: GitHub Actions, runner GitHub Actions 3\n" },
        "fetch": [],
        "clock": "2026-10-09T08:04:00Z"
      },
      "refused": "no-token"
    }
  ]
}
```

```json interface
{
  "id": "MOD-ci-entry.jobStart",
  "summary": "The start of a job's run (UC-034 4, 5), naming the run the job belongs to: a job that ended, or was cancelled before its run, does nothing more; otherwise its record gains the attempt it starts, and the agent is given the job's prompt — from the item, what it realises, the tests that guard it and the product's process requirements, or on a later attempt with the tests that failed on its branch's head — and the branch it works on with the branch its work goes into. The working tree is the product's default branch, paths its files; Agent M's files are read under AGENT_M_HOME.",
  "params": [
    { "name": "env", "type": "CiEnv" },
    { "name": "paths", "type": "string[]" },
    { "name": "files", "type": "ReadPort" },
    { "name": "fetch", "type": "FetchPort" },
    { "name": "clock", "type": "ClockPort" }
  ],
  "result": "JobStarted",
  "async": true,
  "refusals": [
    { "code": "no-token", "when": "the job's environment holds no AGENT_M_TOKEN" },
    { "code": "no-job", "when": "AGENT_M_JOB names no job, or no record of it is on the default branch" },
    { "code": "no-participant", "when": "the job's participant is not in the instance's participants" },
    { "code": "not-a-ci-agent", "when": "it is no CI agent" },
    { "code": "not-a-definition", "when": "the job's definition cannot be read" },
    { "code": "no-item", "when": "the job's item is not in docs/backlog/" },
    { "code": "missing-text", "when": "a name the item realises has no text" },
    { "code": "context-too-small", "when": "the prompt does not fit the participant's context" },
    { "code": "nothing-failed", "when": "a later attempt finds no test failed on the branch's head" },
    { "code": "moved", "when": "the default branch moved on while the record was written" },
    { "code": "token-refused", "when": "the server refuses the token" },
    { "code": "no-access", "when": "the token lacks the permission" },
    { "code": "server-error", "when": "the server answers with another error" },
    { "code": "unreachable", "when": "no answer arrives" }
  ],
  "examples": [
    {
      "name": "the first attempt of ITM-014",
      "input": {
        "env": { "GITHUB_ACTIONS": "true", "GITHUB_SERVER_URL": "https://github.com", "GITHUB_REPOSITORY": "alice/thesis", "AGENT_M_HOME": "/home/runner/work/thesis/thesis/agent-m", "AGENT_M_OUT": "/home/runner/work/thesis/thesis/agent-m-out", "AGENT_M_JOB": "JOB-20261012-0800-9a9a", "AGENT_M_TOKEN": "github_pat_example", "AGENT_M_INSTANCE": "https://github.com/alice/agent-m", "AGENT_M_WAIT_MINUTES": "240" },
        "paths": ["SPEC.md", "docs/architecture/ARC-002-export.md", "docs/backlog/ITM-014-export-a-chapter-as-pdf.md", "docs/process.md", "docs/use-cases/UC-003-export-a-chapter.md", "tests/export.test.mjs"],
        "files": { "SPEC.md": "# Thesis — Specification\n\n## 1. Writing\n\n**ONE CLICK** *(PO A. Maier)*\nA decision takes one click.\n*Check:* no automatic check; at review.\n\n**NO SERVER** *(PO A. Maier)*\nThe product runs no server of its own.\n*Check:* `tests/test_no_server.py`\n\n## 2. Review\n\n**EVERY TEXT IS REVIEWED** *(PO A. Maier)*\nA document binds only once it is accepted.\n*Check:* `tests/pages.test.mjs`\n\n## 3. Export\n\n**A CHAPTER IS EXPORTED** *(PO A. Maier)*\nA chapter is exported as a PDF with its figures.\n*Check:* `tests/export.test.mjs`\n", "docs/process.md": "---\nmodel: kanban\nmodel_file: docs/process-models/kanban.md\nmodel_version: 5a00000000000000000000000000000000000000\n---\n# How the thesis tool is developed\n\n## Roles\n\n| Role | Participants |\n|---|---|\n| Product Owner | alice |\n| Developers | ci-dev, gpu-dev |\n| Reviewer | alice |\n\n## Practices\n\n- none\n", "docs/backlog/ITM-014-export-a-chapter-as-pdf.md": "---\nid: ITM-014\ntitle: Export a chapter as PDF\nkind: implementation\nrealises:\n  - A CHAPTER IS EXPORTED\n  - UC-003\nmodules:\n  - MOD-export\norigin:\n  - ISS-007\n---\n\n# ITM-014 Export a chapter as PDF\n\n**REGISTER**\n\n## Outcome\n\nAn accepted chapter is exported as a PDF with its figures.\n\n## Acceptance criteria\n\n- the PDF holds every figure of the chapter\n- the PDF is named after the chapter\n", "docs/use-cases/UC-003-export-a-chapter.md": "---\nid: UC-003\ntitle: Export a chapter\narea: writing\nactors:\n  - Author\nrealises:\n  - A CHAPTER IS EXPORTED\n---\n# UC-003 Export a chapter\n\n## Actors\n\n- **Author** — writes.\n\n## Precondition\n\n- The repository exists.\n\n## Main flow\n\n1. The author presses **Export**.\n\n## Alternative flows\n\n- **1a. No token.** GitHub's page opens.\n\n## Postcondition\n\n- The chapter is saved.\n", "docs/architecture/ARC-002-export.md": "---\nid: ARC-002\ntitle: Export\nforced_by:\n  - EVERY TEXT IS REVIEWED\n  - UC-003\n---\n# ARC-002 Export\n\n## Context\n\nThe thesis is reviewed in the browser.\n\n## Decision\n\n1. Export.\n\n## Alternatives\n\n- None.\n\n## Consequences\n\n- None.\n\n## Modules\n\n```json module\n{\"id\":\"MOD-export\",\"folder\":\"src/export/\",\"layer\":\"feature\",\"responsibility\":\"Exports chapters.\",\"realises\":[\"EVERY TEXT IS REVIEWED\"],\"owns\":[],\"uses\":[\"MOD-pages\"]}\n```\n\n```json interface\n{\"id\":\"MOD-export.run\",\"summary\":\"Exports a chapter.\",\"params\":[{\"name\":\"path\",\"type\":\"string\"}],\"result\":\"string\",\"async\":false,\"refusals\":[],\"examples\":[{\"name\":\"one\",\"input\":{\"path\":\"a.md\"},\"result\":\"a.pdf\"}]}\n```\n", "tests/export.test.mjs": "// The export of a chapter.\n//\n// Module: MOD-export\n// Guards: A CHAPTER IS EXPORTED; UC-003\n// Level: system\nimport { test } from \"node:test\";\n\n// TST-014 the PDF keeps the figures\n// Given: a chapter with two figures\n// When: the author exports it as PDF\n// Then: the PDF holds both figures\ntest(\"TST-014 the PDF keeps the figures\", () => {});\n\n// TST-015 the PDF names the chapter\n// Given: a chapter titled Methods\n// When: the author exports it as PDF\n// Then: the PDF's title is Methods\ntest(\"TST-015 the PDF names the chapter\", () => {});\n\n// TST-016 the summary of an export reads as the chapter\n// Given: a chapter of four pages\n// When: the model summarises the exported PDF\n// Then: the summary names the chapter's three findings\n// Runs: 20\n// Paid: hub\ntest(\"TST-016 the summary of an export reads as the chapter\", () => {});\n", "/home/runner/work/thesis/thesis/agent-m/docs/participants.md": "# Participants of this instance\n\n| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |\n|---|---|---|---|---|---|---|---|\n| alice | person | — | — | — | draft text, read the repository, write to the repository | — | the GitHub account `alice` |\n| ci-dev | CI agent | claude-opus-5-5 | 200000 | — | read the repository, write to the repository, run code and tests | GitHub's machines, a provider in the USA | the workflow agent-m-job: claude on GitHub's machines |\n| gpu-dev | CI agent | codex-model | — | — | read the repository, write to the repository, run code and tests | the lab's GPU server, Erlangen | the workflow agent-m-job: codex on the runner gpu-1 |\n| cli-dev | CLI agent | claude-opus-5-5 | — | — | read the repository, write to the repository, run code and tests | this machine | the bridge on the Mac of `alice` |\n", "/home/runner/work/thesis/thesis/agent-m/src/job-harness/jobs/implement/job.json": "{\n  \"kind\": \"implement\",\n  \"mode\": \"agent\",\n  \"produces\": [\n    \"MOD\",\n    \"TST\"\n  ],\n  \"capabilities\": [\n    \"read the repository\",\n    \"write to the repository\",\n    \"run code and tests\"\n  ],\n  \"inputs\": [\n    {\n      \"name\": \"item\",\n      \"of\": \"ITM\"\n    },\n    {\n      \"name\": \"realises\",\n      \"of\": \"requirement\"\n    },\n    {\n      \"name\": \"tests\",\n      \"of\": \"TST\"\n    },\n    {\n      \"name\": \"process\",\n      \"of\": \"requirement\"\n    },\n    {\n      \"name\": \"instruction\",\n      \"of\": \"text\"\n    }\n  ],\n  \"output\": {},\n  \"checks\": [],\n  \"rounds\": 3,\n  \"result\": \"pull-request\"\n}\n", "/home/runner/work/thesis/thesis/agent-m/src/job-harness/jobs/implement/prompt.md": "Implement the backlog item below in this repository, test first: commit the tests for its acceptance criteria alone, each\nnaming the requirement it guards, then the implementation until they pass. If the item contradicts the specification or\nleaves a case open, change nothing and answer with one line that begins with QUESTION: and asks it.\n\n{{instruction}}\n\nThe item:\n\n{{item}}\n\nWhat it realises:\n\n{{realises}}\n\nThe tests that guard it now:\n\n{{tests}}\n\nThe process requirements of this product:\n\n{{process}}\n" },
        "fetch": [
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis" },
            "response": { "status": 200, "body": { "visibility": "private", "default_branch": "main" } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/git/ref/heads/main" },
            "response": { "status": 200, "body": { "object": { "sha": "c100000000000000000000000000000000000000" } } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/contents/docs/jobs/JOB-20261012-0800-9a9a.md?ref=c100000000000000000000000000000000000000" },
            "response": { "status": 200, "body": "---\nid: JOB-20261012-0800-9a9a\nkind: implement\nphase: Doing\nrole: Developers\nparticipant: ci-dev\nruntime: ci\nrun:\nslot:\nitem: ITM-014\nmodules:\n  - MOD-export\ninputs: []\nretry_of:\nagent_m: 2026.10.1\nmodel: claude-opus-5-5\nlog:\n---\n\n# JOB-20261012-0800-9a9a\n\n**REGISTER**\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-12T08:00:00Z | queued | — |\n" }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/contents/docs/jobs/cancels/JOB-20261012-0800-9a9a.md?ref=c100000000000000000000000000000000000000" },
            "response": { "status": 404, "body": { "message": "Not Found" } }
          },
          {
            "request": { "method": "GET", "url": "https://raw.githubusercontent.com/alice/agent-m/5a00000000000000000000000000000000000000/docs/process-models/kanban.md" },
            "response": { "status": 200, "body": "---\nname: kanban\nkind: pulled\nmeasure: items per state over time\nmanages: work that arrives unpredictably and must flow without long waits\naccepts: no fixed delivery date for a set of items\nsuits: maintaining a product that receives issues every week\nchapter: Vibe Coding, ch. 7 §4\n---\n# Kanban\n\nWork is pulled from the backlog as capacity frees up.\n\n## Phases\n\n| Name | Role | Produces |\n|---|---|---|\n| Backlog | Product Owner | ITM |\n| Doing | Developers | MOD, TST |\n| Done | Product Owner | the merged item |\n\n## Transitions\n\n| From | To | Kind |\n|---|---|---|\n| Backlog | Doing | sequence |\n| Doing | Done | sequence |\n\n## Verification pairs\n\n| Phase | Checked by |\n|---|---|\n\n## Gates\n\n| Between | Artifacts | Condition | Decider |\n|---|---|---|---|\n| Doing → Done | MOD | a person has read the change | Reviewer |\n\n## Roles\n\n| Name | Filled by | Capabilities |\n|---|---|---|\n| Product Owner | person | read the repository, write to the repository |\n| Developers | agent | read the repository, write to the repository, run code and tests |\n| Reviewer | person | read the repository |\n\n## Flow control\n\n| Kind | Value |\n|---|---|\n| WIP limit | 3 |\n| Time box | none |\n| Sprints | no |\n" }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/git/commits/c100000000000000000000000000000000000000" },
            "response": {
              "status": 200,
              "body": {
                "sha": "c100000000000000000000000000000000000000",
                "tree": { "sha": "b100000000000000000000000000000000000000" }
              }
            }
          },
          {
            "request": {
              "method": "POST",
              "url": "https://api.github.com/repos/alice/thesis/git/trees",
              "body": {
                "base_tree": "b100000000000000000000000000000000000000",
                "tree": [
                  { "path": "docs/jobs/JOB-20261012-0800-9a9a.md", "mode": "100644", "type": "blob", "content": "---\nid: JOB-20261012-0800-9a9a\nkind: implement\nphase: Doing\nrole: Developers\nparticipant: ci-dev\nruntime: ci\nrun:\nslot:\nitem: ITM-014\nmodules:\n  - MOD-export\ninputs: []\nretry_of:\nagent_m: 2026.10.1\nmodel: claude-opus-5-5\nlog:\n---\n\n# JOB-20261012-0800-9a9a\n\n**REGISTER**\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-12T08:00:00Z | queued | — |\n| 2026-10-12T09:50:00Z | running | attempt 1 on ci-dev |\n" }
                ]
              }
            },
            "response": { "status": 201, "body": { "sha": "c100000000000000000000000000000000000000" } }
          },
          {
            "request": {
              "method": "POST",
              "url": "https://api.github.com/repos/alice/thesis/git/commits",
              "body": {
                "message": "JOB-20261012-0800-9a9a: attempt 1",
                "tree": "c100000000000000000000000000000000000000",
                "parents": ["c100000000000000000000000000000000000000"]
              }
            },
            "response": {
              "status": 201,
              "body": { "sha": "e100000000000000000000000000000000000000", "html_url": "https://github.com/alice/thesis/commit/e100000000000000000000000000000000000000" }
            }
          },
          {
            "request": {
              "method": "PATCH",
              "url": "https://api.github.com/repos/alice/thesis/git/refs/heads/main",
              "body": { "sha": "e100000000000000000000000000000000000000", "force": false }
            },
            "response": { "status": 200, "body": { "object": { "sha": "e100000000000000000000000000000000000000" } } }
          }
        ],
        "clock": "2026-10-12T09:50:00Z"
      },
      "result": { "next": "agent", "branch": "item/ITM-014", "base": "main", "prompt": "Implement the backlog item below in this repository, test first: commit the tests for its acceptance criteria alone, each\nnaming the requirement it guards, then the implementation until they pass. If the item contradicts the specification or\nleaves a case open, change nothing and answer with one line that begins with QUESTION: and asks it.\n\n\n\nThe item:\n\n### ITM-014\n\n---\nid: ITM-014\ntitle: Export a chapter as PDF\nkind: implementation\nrealises:\n  - A CHAPTER IS EXPORTED\n  - UC-003\nmodules:\n  - MOD-export\norigin:\n  - ISS-007\n---\n\n# ITM-014 Export a chapter as PDF\n\n**REGISTER**\n\n## Outcome\n\nAn accepted chapter is exported as a PDF with its figures.\n\n## Acceptance criteria\n\n- the PDF holds every figure of the chapter\n- the PDF is named after the chapter\n\n\nWhat it realises:\n\n### A CHAPTER IS EXPORTED\n\n**A CHAPTER IS EXPORTED** *(PO A. Maier)*\nA chapter is exported as a PDF with its figures.\n*Check:* `tests/export.test.mjs`\n\n### UC-003\n\n---\nid: UC-003\ntitle: Export a chapter\narea: writing\nactors:\n  - Author\nrealises:\n  - A CHAPTER IS EXPORTED\n---\n# UC-003 Export a chapter\n\n## Actors\n\n- **Author** — writes.\n\n## Precondition\n\n- The repository exists.\n\n## Main flow\n\n1. The author presses **Export**.\n\n## Alternative flows\n\n- **1a. No token.** GitHub's page opens.\n\n## Postcondition\n\n- The chapter is saved.\n\n\nThe tests that guard it now:\n\n### tests/export.test.mjs\n\n// The export of a chapter.\n//\n// Module: MOD-export\n// Guards: A CHAPTER IS EXPORTED; UC-003\n// Level: system\nimport { test } from \"node:test\";\n\n// TST-014 the PDF keeps the figures\n// Given: a chapter with two figures\n// When: the author exports it as PDF\n// Then: the PDF holds both figures\ntest(\"TST-014 the PDF keeps the figures\", () => {});\n\n// TST-015 the PDF names the chapter\n// Given: a chapter titled Methods\n// When: the author exports it as PDF\n// Then: the PDF's title is Methods\ntest(\"TST-015 the PDF names the chapter\", () => {});\n\n// TST-016 the summary of an export reads as the chapter\n// Given: a chapter of four pages\n// When: the model summarises the exported PDF\n// Then: the summary names the chapter's three findings\n// Runs: 20\n// Paid: hub\ntest(\"TST-016 the summary of an export reads as the chapter\", () => {});\n\n\nThe process requirements of this product:\n\n(none)\n\n", "attempt": 1, "note": "", "run": "" }
    },
    {
      "name": "the second attempt, after TST-015 failed",
      "input": {
        "env": { "GITHUB_ACTIONS": "true", "GITHUB_SERVER_URL": "https://github.com", "GITHUB_REPOSITORY": "alice/thesis", "AGENT_M_HOME": "/home/runner/work/thesis/thesis/agent-m", "AGENT_M_OUT": "/home/runner/work/thesis/thesis/agent-m-out", "AGENT_M_JOB": "JOB-20261012-0800-9a9a", "AGENT_M_TOKEN": "github_pat_example", "AGENT_M_INSTANCE": "https://github.com/alice/agent-m", "AGENT_M_WAIT_MINUTES": "240" },
        "paths": ["SPEC.md", "docs/architecture/ARC-002-export.md", "docs/backlog/ITM-014-export-a-chapter-as-pdf.md", "docs/process.md", "docs/use-cases/UC-003-export-a-chapter.md", "tests/export.test.mjs"],
        "files": { "SPEC.md": "# Thesis — Specification\n\n## 1. Writing\n\n**ONE CLICK** *(PO A. Maier)*\nA decision takes one click.\n*Check:* no automatic check; at review.\n\n**NO SERVER** *(PO A. Maier)*\nThe product runs no server of its own.\n*Check:* `tests/test_no_server.py`\n\n## 2. Review\n\n**EVERY TEXT IS REVIEWED** *(PO A. Maier)*\nA document binds only once it is accepted.\n*Check:* `tests/pages.test.mjs`\n\n## 3. Export\n\n**A CHAPTER IS EXPORTED** *(PO A. Maier)*\nA chapter is exported as a PDF with its figures.\n*Check:* `tests/export.test.mjs`\n", "docs/process.md": "---\nmodel: kanban\nmodel_file: docs/process-models/kanban.md\nmodel_version: 5a00000000000000000000000000000000000000\n---\n# How the thesis tool is developed\n\n## Roles\n\n| Role | Participants |\n|---|---|\n| Product Owner | alice |\n| Developers | ci-dev, gpu-dev |\n| Reviewer | alice |\n\n## Practices\n\n- none\n", "docs/backlog/ITM-014-export-a-chapter-as-pdf.md": "---\nid: ITM-014\ntitle: Export a chapter as PDF\nkind: implementation\nrealises:\n  - A CHAPTER IS EXPORTED\n  - UC-003\nmodules:\n  - MOD-export\norigin:\n  - ISS-007\n---\n\n# ITM-014 Export a chapter as PDF\n\n**REGISTER**\n\n## Outcome\n\nAn accepted chapter is exported as a PDF with its figures.\n\n## Acceptance criteria\n\n- the PDF holds every figure of the chapter\n- the PDF is named after the chapter\n", "docs/use-cases/UC-003-export-a-chapter.md": "---\nid: UC-003\ntitle: Export a chapter\narea: writing\nactors:\n  - Author\nrealises:\n  - A CHAPTER IS EXPORTED\n---\n# UC-003 Export a chapter\n\n## Actors\n\n- **Author** — writes.\n\n## Precondition\n\n- The repository exists.\n\n## Main flow\n\n1. The author presses **Export**.\n\n## Alternative flows\n\n- **1a. No token.** GitHub's page opens.\n\n## Postcondition\n\n- The chapter is saved.\n", "docs/architecture/ARC-002-export.md": "---\nid: ARC-002\ntitle: Export\nforced_by:\n  - EVERY TEXT IS REVIEWED\n  - UC-003\n---\n# ARC-002 Export\n\n## Context\n\nThe thesis is reviewed in the browser.\n\n## Decision\n\n1. Export.\n\n## Alternatives\n\n- None.\n\n## Consequences\n\n- None.\n\n## Modules\n\n```json module\n{\"id\":\"MOD-export\",\"folder\":\"src/export/\",\"layer\":\"feature\",\"responsibility\":\"Exports chapters.\",\"realises\":[\"EVERY TEXT IS REVIEWED\"],\"owns\":[],\"uses\":[\"MOD-pages\"]}\n```\n\n```json interface\n{\"id\":\"MOD-export.run\",\"summary\":\"Exports a chapter.\",\"params\":[{\"name\":\"path\",\"type\":\"string\"}],\"result\":\"string\",\"async\":false,\"refusals\":[],\"examples\":[{\"name\":\"one\",\"input\":{\"path\":\"a.md\"},\"result\":\"a.pdf\"}]}\n```\n", "tests/export.test.mjs": "// The export of a chapter.\n//\n// Module: MOD-export\n// Guards: A CHAPTER IS EXPORTED; UC-003\n// Level: system\nimport { test } from \"node:test\";\n\n// TST-014 the PDF keeps the figures\n// Given: a chapter with two figures\n// When: the author exports it as PDF\n// Then: the PDF holds both figures\ntest(\"TST-014 the PDF keeps the figures\", () => {});\n\n// TST-015 the PDF names the chapter\n// Given: a chapter titled Methods\n// When: the author exports it as PDF\n// Then: the PDF's title is Methods\ntest(\"TST-015 the PDF names the chapter\", () => {});\n\n// TST-016 the summary of an export reads as the chapter\n// Given: a chapter of four pages\n// When: the model summarises the exported PDF\n// Then: the summary names the chapter's three findings\n// Runs: 20\n// Paid: hub\ntest(\"TST-016 the summary of an export reads as the chapter\", () => {});\n", "/home/runner/work/thesis/thesis/agent-m/docs/participants.md": "# Participants of this instance\n\n| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |\n|---|---|---|---|---|---|---|---|\n| alice | person | — | — | — | draft text, read the repository, write to the repository | — | the GitHub account `alice` |\n| ci-dev | CI agent | claude-opus-5-5 | 200000 | — | read the repository, write to the repository, run code and tests | GitHub's machines, a provider in the USA | the workflow agent-m-job: claude on GitHub's machines |\n| gpu-dev | CI agent | codex-model | — | — | read the repository, write to the repository, run code and tests | the lab's GPU server, Erlangen | the workflow agent-m-job: codex on the runner gpu-1 |\n| cli-dev | CLI agent | claude-opus-5-5 | — | — | read the repository, write to the repository, run code and tests | this machine | the bridge on the Mac of `alice` |\n", "/home/runner/work/thesis/thesis/agent-m/src/job-harness/jobs/implement/job.json": "{\n  \"kind\": \"implement\",\n  \"mode\": \"agent\",\n  \"produces\": [\n    \"MOD\",\n    \"TST\"\n  ],\n  \"capabilities\": [\n    \"read the repository\",\n    \"write to the repository\",\n    \"run code and tests\"\n  ],\n  \"inputs\": [\n    {\n      \"name\": \"item\",\n      \"of\": \"ITM\"\n    },\n    {\n      \"name\": \"realises\",\n      \"of\": \"requirement\"\n    },\n    {\n      \"name\": \"tests\",\n      \"of\": \"TST\"\n    },\n    {\n      \"name\": \"process\",\n      \"of\": \"requirement\"\n    },\n    {\n      \"name\": \"instruction\",\n      \"of\": \"text\"\n    }\n  ],\n  \"output\": {},\n  \"checks\": [],\n  \"rounds\": 3,\n  \"result\": \"pull-request\"\n}\n", "/home/runner/work/thesis/thesis/agent-m/src/job-harness/jobs/implement/prompt.md": "Implement the backlog item below in this repository, test first: commit the tests for its acceptance criteria alone, each\nnaming the requirement it guards, then the implementation until they pass. If the item contradicts the specification or\nleaves a case open, change nothing and answer with one line that begins with QUESTION: and asks it.\n\n{{instruction}}\n\nThe item:\n\n{{item}}\n\nWhat it realises:\n\n{{realises}}\n\nThe tests that guard it now:\n\n{{tests}}\n\nThe process requirements of this product:\n\n{{process}}\n" },
        "fetch": [
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis" },
            "response": { "status": 200, "body": { "visibility": "private", "default_branch": "main" } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/git/ref/heads/main" },
            "response": { "status": 200, "body": { "object": { "sha": "c100000000000000000000000000000000000000" } } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/contents/docs/jobs/JOB-20261012-0800-9a9a.md?ref=c100000000000000000000000000000000000000" },
            "response": { "status": 200, "body": "---\nid: JOB-20261012-0800-9a9a\nkind: implement\nphase: Doing\nrole: Developers\nparticipant: ci-dev\nruntime: ci\nrun:\nslot:\nitem: ITM-014\nmodules:\n  - MOD-export\ninputs: []\nretry_of:\nagent_m: 2026.10.1\nmodel: claude-opus-5-5\nlog:\n---\n\n# JOB-20261012-0800-9a9a\n\n**REGISTER**\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-12T08:00:00Z | queued | — |\n| 2026-10-12T08:03:00Z | running | attempt 1 on ci-dev |\n| 2026-10-12T09:52:00Z | running | attempt 1 used 182344 input and 12850 output tokens, 1.84 USD as the CLI reported; CI is red, attempt 2 follows |\n" }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/contents/docs/jobs/cancels/JOB-20261012-0800-9a9a.md?ref=c100000000000000000000000000000000000000" },
            "response": { "status": 404, "body": { "message": "Not Found" } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/commits/item%2FITM-014" },
            "response": { "status": 200, "body": { "sha": "d200000000000000000000000000000000000000" } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/git/trees/d200000000000000000000000000000000000000?recursive=1" },
            "response": {
              "status": 200,
              "body": {
                "tree": [
                  { "path": "tests/export.test.mjs", "type": "blob", "sha": "6100000000000000000000000000000000000000" },
                  { "path": "src/export/index.mjs", "type": "blob", "sha": "6200000000000000000000000000000000000000" }
                ]
              }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/contents/tests/export.test.mjs?ref=d200000000000000000000000000000000000000" },
            "response": { "status": 200, "body": "// The export of a chapter.\n//\n// Module: MOD-export\n// Guards: A CHAPTER IS EXPORTED; UC-003\n// Level: system\nimport { test } from \"node:test\";\n\n// TST-014 the PDF keeps the figures\n// Given: a chapter with two figures\n// When: the author exports it as PDF\n// Then: the PDF holds both figures\ntest(\"TST-014 the PDF keeps the figures\", () => {});\n\n// TST-015 the PDF names the chapter\n// Given: a chapter titled Methods\n// When: the author exports it as PDF\n// Then: the PDF's title is Methods\ntest(\"TST-015 the PDF names the chapter\", () => {});\n\n// TST-016 the summary of an export reads as the chapter\n// Given: a chapter of four pages\n// When: the model summarises the exported PDF\n// Then: the summary names the chapter's three findings\n// Runs: 20\n// Paid: hub\ntest(\"TST-016 the summary of an export reads as the chapter\", () => {});\n" }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/git/ref/heads/test-results" },
            "response": { "status": 200, "body": { "object": { "sha": "a700000000000000000000000000000000000000" } } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/commits/a700000000000000000000000000000000000000" },
            "response": { "status": 200, "body": { "sha": "a700000000000000000000000000000000000000" } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/git/trees/a700000000000000000000000000000000000000?recursive=1" },
            "response": {
              "status": 200,
              "body": {
                "tree": [
                  { "path": "results/d200000000000000000000000000000000000000/gh-4801-1-system.md", "type": "blob", "sha": "6300000000000000000000000000000000000000" }
                ]
              }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/contents/results/d200000000000000000000000000000000000000/gh-4801-1-system.md?ref=a700000000000000000000000000000000000000" },
            "response": { "status": 200, "body": "---\ncommit: d200000000000000000000000000000000000000\nlevels:\n  - system\noccasion: pull request\nparticipant: GitHub Actions, runner GitHub Actions 7\nlog: https://github.com/alice/thesis/actions/runs/4801\nat: 2026-10-12T09:50:00Z\nuncommitted: no\noutcome: failed\n---\n\n# Run gh-4801-1-system\n\n| Test | Level | Outcome | Runs | Passed | Note |\n|---|---|---|---|---|---|\n| TST-014 | system | passed | 1 | 1 |  |\n| TST-015 | system | failed | 1 | 0 | expected \"Methods\", got \"chapter-2\" |\n\n## TST-015\n\n~~~text\nAssertionError: expected \"Methods\", got \"chapter-2\"\n    at tests/export.test.mjs:18:3\n~~~\n" }
          },
          {
            "request": { "method": "GET", "url": "https://raw.githubusercontent.com/alice/agent-m/5a00000000000000000000000000000000000000/docs/process-models/kanban.md" },
            "response": { "status": 200, "body": "---\nname: kanban\nkind: pulled\nmeasure: items per state over time\nmanages: work that arrives unpredictably and must flow without long waits\naccepts: no fixed delivery date for a set of items\nsuits: maintaining a product that receives issues every week\nchapter: Vibe Coding, ch. 7 §4\n---\n# Kanban\n\nWork is pulled from the backlog as capacity frees up.\n\n## Phases\n\n| Name | Role | Produces |\n|---|---|---|\n| Backlog | Product Owner | ITM |\n| Doing | Developers | MOD, TST |\n| Done | Product Owner | the merged item |\n\n## Transitions\n\n| From | To | Kind |\n|---|---|---|\n| Backlog | Doing | sequence |\n| Doing | Done | sequence |\n\n## Verification pairs\n\n| Phase | Checked by |\n|---|---|\n\n## Gates\n\n| Between | Artifacts | Condition | Decider |\n|---|---|---|---|\n| Doing → Done | MOD | a person has read the change | Reviewer |\n\n## Roles\n\n| Name | Filled by | Capabilities |\n|---|---|---|\n| Product Owner | person | read the repository, write to the repository |\n| Developers | agent | read the repository, write to the repository, run code and tests |\n| Reviewer | person | read the repository |\n\n## Flow control\n\n| Kind | Value |\n|---|---|\n| WIP limit | 3 |\n| Time box | none |\n| Sprints | no |\n" }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/git/commits/c100000000000000000000000000000000000000" },
            "response": {
              "status": 200,
              "body": {
                "sha": "c100000000000000000000000000000000000000",
                "tree": { "sha": "b300000000000000000000000000000000000000" }
              }
            }
          },
          {
            "request": {
              "method": "POST",
              "url": "https://api.github.com/repos/alice/thesis/git/trees",
              "body": {
                "base_tree": "b300000000000000000000000000000000000000",
                "tree": [
                  { "path": "docs/jobs/JOB-20261012-0800-9a9a.md", "mode": "100644", "type": "blob", "content": "---\nid: JOB-20261012-0800-9a9a\nkind: implement\nphase: Doing\nrole: Developers\nparticipant: ci-dev\nruntime: ci\nrun:\nslot:\nitem: ITM-014\nmodules:\n  - MOD-export\ninputs: []\nretry_of:\nagent_m: 2026.10.1\nmodel: claude-opus-5-5\nlog:\n---\n\n# JOB-20261012-0800-9a9a\n\n**REGISTER**\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-12T08:00:00Z | queued | — |\n| 2026-10-12T08:03:00Z | running | attempt 1 on ci-dev |\n| 2026-10-12T09:52:00Z | running | attempt 1 used 182344 input and 12850 output tokens, 1.84 USD as the CLI reported; CI is red, attempt 2 follows |\n| 2026-10-12T09:50:00Z | running | attempt 2 on ci-dev |\n" }
                ]
              }
            },
            "response": { "status": 201, "body": { "sha": "c300000000000000000000000000000000000000" } }
          },
          {
            "request": {
              "method": "POST",
              "url": "https://api.github.com/repos/alice/thesis/git/commits",
              "body": {
                "message": "JOB-20261012-0800-9a9a: attempt 2",
                "tree": "c300000000000000000000000000000000000000",
                "parents": ["c100000000000000000000000000000000000000"]
              }
            },
            "response": {
              "status": 201,
              "body": { "sha": "e300000000000000000000000000000000000000", "html_url": "https://github.com/alice/thesis/commit/e300000000000000000000000000000000000000" }
            }
          },
          {
            "request": {
              "method": "PATCH",
              "url": "https://api.github.com/repos/alice/thesis/git/refs/heads/main",
              "body": { "sha": "e300000000000000000000000000000000000000", "force": false }
            },
            "response": { "status": 200, "body": { "object": { "sha": "e300000000000000000000000000000000000000" } } }
          }
        ],
        "clock": "2026-10-12T09:50:00Z"
      },
      "result": { "next": "agent", "branch": "item/ITM-014", "base": "main", "prompt": "Implement the backlog item below in this repository, test first: commit the tests for its acceptance criteria alone, each\nnaming the requirement it guards, then the implementation until they pass. If the item contradicts the specification or\nleaves a case open, change nothing and answer with one line that begins with QUESTION: and asks it.\n\n\n\nThe item:\n\n### ITM-014\n\n---\nid: ITM-014\ntitle: Export a chapter as PDF\nkind: implementation\nrealises:\n  - A CHAPTER IS EXPORTED\n  - UC-003\nmodules:\n  - MOD-export\norigin:\n  - ISS-007\n---\n\n# ITM-014 Export a chapter as PDF\n\n**REGISTER**\n\n## Outcome\n\nAn accepted chapter is exported as a PDF with its figures.\n\n## Acceptance criteria\n\n- the PDF holds every figure of the chapter\n- the PDF is named after the chapter\n\n\nWhat it realises:\n\n### A CHAPTER IS EXPORTED\n\n**A CHAPTER IS EXPORTED** *(PO A. Maier)*\nA chapter is exported as a PDF with its figures.\n*Check:* `tests/export.test.mjs`\n\n### UC-003\n\n---\nid: UC-003\ntitle: Export a chapter\narea: writing\nactors:\n  - Author\nrealises:\n  - A CHAPTER IS EXPORTED\n---\n# UC-003 Export a chapter\n\n## Actors\n\n- **Author** — writes.\n\n## Precondition\n\n- The repository exists.\n\n## Main flow\n\n1. The author presses **Export**.\n\n## Alternative flows\n\n- **1a. No token.** GitHub's page opens.\n\n## Postcondition\n\n- The chapter is saved.\n\n\nThe tests that guard it now:\n\n### tests/export.test.mjs\n\n// The export of a chapter.\n//\n// Module: MOD-export\n// Guards: A CHAPTER IS EXPORTED; UC-003\n// Level: system\nimport { test } from \"node:test\";\n\n// TST-014 the PDF keeps the figures\n// Given: a chapter with two figures\n// When: the author exports it as PDF\n// Then: the PDF holds both figures\ntest(\"TST-014 the PDF keeps the figures\", () => {});\n\n// TST-015 the PDF names the chapter\n// Given: a chapter titled Methods\n// When: the author exports it as PDF\n// Then: the PDF's title is Methods\ntest(\"TST-015 the PDF names the chapter\", () => {});\n\n// TST-016 the summary of an export reads as the chapter\n// Given: a chapter of four pages\n// When: the model summarises the exported PDF\n// Then: the summary names the chapter's three findings\n// Runs: 20\n// Paid: hub\ntest(\"TST-016 the summary of an export reads as the chapter\", () => {});\n\n\nThe process requirements of this product:\n\n(none)\n\n## CI failed on your pull request\n\nThese tests failed on d20000000000; make them pass without changing what they expect:\n\n- TST-015 (system): expected the PDF's title is Methods\n  AssertionError: expected \"Methods\", got \"chapter-2\"\n      at tests/export.test.mjs:18:3\n", "attempt": 2, "note": "", "run": "" }
    },
    {
      "name": "cancelled before its run",
      "input": {
        "env": { "GITHUB_ACTIONS": "true", "GITHUB_SERVER_URL": "https://github.com", "GITHUB_REPOSITORY": "alice/thesis", "AGENT_M_HOME": "/home/runner/work/thesis/thesis/agent-m", "AGENT_M_OUT": "/home/runner/work/thesis/thesis/agent-m-out", "AGENT_M_JOB": "JOB-20261012-0800-9a9a", "AGENT_M_TOKEN": "github_pat_example", "AGENT_M_INSTANCE": "https://github.com/alice/agent-m", "AGENT_M_WAIT_MINUTES": "240" },
        "paths": ["SPEC.md", "docs/architecture/ARC-002-export.md", "docs/backlog/ITM-014-export-a-chapter-as-pdf.md", "docs/process.md", "docs/use-cases/UC-003-export-a-chapter.md", "tests/export.test.mjs"],
        "files": { "SPEC.md": "# Thesis — Specification\n\n## 1. Writing\n\n**ONE CLICK** *(PO A. Maier)*\nA decision takes one click.\n*Check:* no automatic check; at review.\n\n**NO SERVER** *(PO A. Maier)*\nThe product runs no server of its own.\n*Check:* `tests/test_no_server.py`\n\n## 2. Review\n\n**EVERY TEXT IS REVIEWED** *(PO A. Maier)*\nA document binds only once it is accepted.\n*Check:* `tests/pages.test.mjs`\n\n## 3. Export\n\n**A CHAPTER IS EXPORTED** *(PO A. Maier)*\nA chapter is exported as a PDF with its figures.\n*Check:* `tests/export.test.mjs`\n", "docs/process.md": "---\nmodel: kanban\nmodel_file: docs/process-models/kanban.md\nmodel_version: 5a00000000000000000000000000000000000000\n---\n# How the thesis tool is developed\n\n## Roles\n\n| Role | Participants |\n|---|---|\n| Product Owner | alice |\n| Developers | ci-dev, gpu-dev |\n| Reviewer | alice |\n\n## Practices\n\n- none\n", "docs/backlog/ITM-014-export-a-chapter-as-pdf.md": "---\nid: ITM-014\ntitle: Export a chapter as PDF\nkind: implementation\nrealises:\n  - A CHAPTER IS EXPORTED\n  - UC-003\nmodules:\n  - MOD-export\norigin:\n  - ISS-007\n---\n\n# ITM-014 Export a chapter as PDF\n\n**REGISTER**\n\n## Outcome\n\nAn accepted chapter is exported as a PDF with its figures.\n\n## Acceptance criteria\n\n- the PDF holds every figure of the chapter\n- the PDF is named after the chapter\n", "docs/use-cases/UC-003-export-a-chapter.md": "---\nid: UC-003\ntitle: Export a chapter\narea: writing\nactors:\n  - Author\nrealises:\n  - A CHAPTER IS EXPORTED\n---\n# UC-003 Export a chapter\n\n## Actors\n\n- **Author** — writes.\n\n## Precondition\n\n- The repository exists.\n\n## Main flow\n\n1. The author presses **Export**.\n\n## Alternative flows\n\n- **1a. No token.** GitHub's page opens.\n\n## Postcondition\n\n- The chapter is saved.\n", "docs/architecture/ARC-002-export.md": "---\nid: ARC-002\ntitle: Export\nforced_by:\n  - EVERY TEXT IS REVIEWED\n  - UC-003\n---\n# ARC-002 Export\n\n## Context\n\nThe thesis is reviewed in the browser.\n\n## Decision\n\n1. Export.\n\n## Alternatives\n\n- None.\n\n## Consequences\n\n- None.\n\n## Modules\n\n```json module\n{\"id\":\"MOD-export\",\"folder\":\"src/export/\",\"layer\":\"feature\",\"responsibility\":\"Exports chapters.\",\"realises\":[\"EVERY TEXT IS REVIEWED\"],\"owns\":[],\"uses\":[\"MOD-pages\"]}\n```\n\n```json interface\n{\"id\":\"MOD-export.run\",\"summary\":\"Exports a chapter.\",\"params\":[{\"name\":\"path\",\"type\":\"string\"}],\"result\":\"string\",\"async\":false,\"refusals\":[],\"examples\":[{\"name\":\"one\",\"input\":{\"path\":\"a.md\"},\"result\":\"a.pdf\"}]}\n```\n", "tests/export.test.mjs": "// The export of a chapter.\n//\n// Module: MOD-export\n// Guards: A CHAPTER IS EXPORTED; UC-003\n// Level: system\nimport { test } from \"node:test\";\n\n// TST-014 the PDF keeps the figures\n// Given: a chapter with two figures\n// When: the author exports it as PDF\n// Then: the PDF holds both figures\ntest(\"TST-014 the PDF keeps the figures\", () => {});\n\n// TST-015 the PDF names the chapter\n// Given: a chapter titled Methods\n// When: the author exports it as PDF\n// Then: the PDF's title is Methods\ntest(\"TST-015 the PDF names the chapter\", () => {});\n\n// TST-016 the summary of an export reads as the chapter\n// Given: a chapter of four pages\n// When: the model summarises the exported PDF\n// Then: the summary names the chapter's three findings\n// Runs: 20\n// Paid: hub\ntest(\"TST-016 the summary of an export reads as the chapter\", () => {});\n", "/home/runner/work/thesis/thesis/agent-m/docs/participants.md": "# Participants of this instance\n\n| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |\n|---|---|---|---|---|---|---|---|\n| alice | person | — | — | — | draft text, read the repository, write to the repository | — | the GitHub account `alice` |\n| ci-dev | CI agent | claude-opus-5-5 | 200000 | — | read the repository, write to the repository, run code and tests | GitHub's machines, a provider in the USA | the workflow agent-m-job: claude on GitHub's machines |\n| gpu-dev | CI agent | codex-model | — | — | read the repository, write to the repository, run code and tests | the lab's GPU server, Erlangen | the workflow agent-m-job: codex on the runner gpu-1 |\n| cli-dev | CLI agent | claude-opus-5-5 | — | — | read the repository, write to the repository, run code and tests | this machine | the bridge on the Mac of `alice` |\n", "/home/runner/work/thesis/thesis/agent-m/src/job-harness/jobs/implement/job.json": "{\n  \"kind\": \"implement\",\n  \"mode\": \"agent\",\n  \"produces\": [\n    \"MOD\",\n    \"TST\"\n  ],\n  \"capabilities\": [\n    \"read the repository\",\n    \"write to the repository\",\n    \"run code and tests\"\n  ],\n  \"inputs\": [\n    {\n      \"name\": \"item\",\n      \"of\": \"ITM\"\n    },\n    {\n      \"name\": \"realises\",\n      \"of\": \"requirement\"\n    },\n    {\n      \"name\": \"tests\",\n      \"of\": \"TST\"\n    },\n    {\n      \"name\": \"process\",\n      \"of\": \"requirement\"\n    },\n    {\n      \"name\": \"instruction\",\n      \"of\": \"text\"\n    }\n  ],\n  \"output\": {},\n  \"checks\": [],\n  \"rounds\": 3,\n  \"result\": \"pull-request\"\n}\n", "/home/runner/work/thesis/thesis/agent-m/src/job-harness/jobs/implement/prompt.md": "Implement the backlog item below in this repository, test first: commit the tests for its acceptance criteria alone, each\nnaming the requirement it guards, then the implementation until they pass. If the item contradicts the specification or\nleaves a case open, change nothing and answer with one line that begins with QUESTION: and asks it.\n\n{{instruction}}\n\nThe item:\n\n{{item}}\n\nWhat it realises:\n\n{{realises}}\n\nThe tests that guard it now:\n\n{{tests}}\n\nThe process requirements of this product:\n\n{{process}}\n" },
        "fetch": [
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis" },
            "response": { "status": 200, "body": { "visibility": "private", "default_branch": "main" } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/git/ref/heads/main" },
            "response": { "status": 200, "body": { "object": { "sha": "c100000000000000000000000000000000000000" } } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/contents/docs/jobs/JOB-20261012-0800-9a9a.md?ref=c100000000000000000000000000000000000000" },
            "response": { "status": 200, "body": "---\nid: JOB-20261012-0800-9a9a\nkind: implement\nphase: Doing\nrole: Developers\nparticipant: ci-dev\nruntime: ci\nrun:\nslot:\nitem: ITM-014\nmodules:\n  - MOD-export\ninputs: []\nretry_of:\nagent_m: 2026.10.1\nmodel: claude-opus-5-5\nlog:\n---\n\n# JOB-20261012-0800-9a9a\n\n**REGISTER**\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-12T08:00:00Z | queued | — |\n" }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/contents/docs/jobs/cancels/JOB-20261012-0800-9a9a.md?ref=c100000000000000000000000000000000000000" },
            "response": { "status": 200, "body": "job: JOB-20261012-0800-9a9a\nby: alice\nat: 2026-10-12T08:01:00Z\n" }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/git/commits/c100000000000000000000000000000000000000" },
            "response": {
              "status": 200,
              "body": {
                "sha": "c100000000000000000000000000000000000000",
                "tree": { "sha": "b200000000000000000000000000000000000000" }
              }
            }
          },
          {
            "request": {
              "method": "POST",
              "url": "https://api.github.com/repos/alice/thesis/git/trees",
              "body": {
                "base_tree": "b200000000000000000000000000000000000000",
                "tree": [
                  { "path": "docs/jobs/JOB-20261012-0800-9a9a.md", "mode": "100644", "type": "blob", "content": "---\nid: JOB-20261012-0800-9a9a\nkind: implement\nphase: Doing\nrole: Developers\nparticipant: ci-dev\nruntime: ci\nrun:\nslot:\nitem: ITM-014\nmodules:\n  - MOD-export\ninputs: []\nretry_of:\nagent_m: 2026.10.1\nmodel: claude-opus-5-5\nlog:\n---\n\n# JOB-20261012-0800-9a9a\n\n**REGISTER**\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-12T08:00:00Z | queued | — |\n| 2026-10-12T09:50:00Z | cancelled | cancelled by alice |\n\n## Cost\n\n| Rounds | Cost | Input tokens | Output tokens | Minutes |\n|---|---|---|---|---|\n| 0 | — | — | — | — |\n" }
                ]
              }
            },
            "response": { "status": 201, "body": { "sha": "c200000000000000000000000000000000000000" } }
          },
          {
            "request": {
              "method": "POST",
              "url": "https://api.github.com/repos/alice/thesis/git/commits",
              "body": {
                "message": "JOB-20261012-0800-9a9a: cancelled before its run",
                "tree": "c200000000000000000000000000000000000000",
                "parents": ["c100000000000000000000000000000000000000"]
              }
            },
            "response": {
              "status": 201,
              "body": { "sha": "e200000000000000000000000000000000000000", "html_url": "https://github.com/alice/thesis/commit/e200000000000000000000000000000000000000" }
            }
          },
          {
            "request": {
              "method": "PATCH",
              "url": "https://api.github.com/repos/alice/thesis/git/refs/heads/main",
              "body": { "sha": "e200000000000000000000000000000000000000", "force": false }
            },
            "response": { "status": 200, "body": { "object": { "sha": "e200000000000000000000000000000000000000" } } }
          }
        ],
        "clock": "2026-10-12T09:50:00Z"
      },
      "result": { "next": "stop", "branch": "item/ITM-014", "base": "", "prompt": "", "attempt": 0, "note": "cancelled by alice", "run": "" }
    },
    {
      "name": "no token",
      "input": {
        "env": { "GITHUB_ACTIONS": "true", "GITHUB_SERVER_URL": "https://github.com", "GITHUB_REPOSITORY": "alice/thesis", "AGENT_M_HOME": "/home/runner/work/thesis/thesis/agent-m", "AGENT_M_OUT": "/home/runner/work/thesis/thesis/agent-m-out", "AGENT_M_JOB": "JOB-20261012-0800-9a9a", "AGENT_M_TOKEN": "", "AGENT_M_INSTANCE": "https://github.com/alice/agent-m", "AGENT_M_WAIT_MINUTES": "240" },
        "paths": ["SPEC.md", "docs/architecture/ARC-002-export.md", "docs/backlog/ITM-014-export-a-chapter-as-pdf.md", "docs/process.md", "docs/use-cases/UC-003-export-a-chapter.md", "tests/export.test.mjs"],
        "files": { "SPEC.md": "# Thesis — Specification\n\n## 1. Writing\n\n**ONE CLICK** *(PO A. Maier)*\nA decision takes one click.\n*Check:* no automatic check; at review.\n\n**NO SERVER** *(PO A. Maier)*\nThe product runs no server of its own.\n*Check:* `tests/test_no_server.py`\n\n## 2. Review\n\n**EVERY TEXT IS REVIEWED** *(PO A. Maier)*\nA document binds only once it is accepted.\n*Check:* `tests/pages.test.mjs`\n\n## 3. Export\n\n**A CHAPTER IS EXPORTED** *(PO A. Maier)*\nA chapter is exported as a PDF with its figures.\n*Check:* `tests/export.test.mjs`\n", "docs/process.md": "---\nmodel: kanban\nmodel_file: docs/process-models/kanban.md\nmodel_version: 5a00000000000000000000000000000000000000\n---\n# How the thesis tool is developed\n\n## Roles\n\n| Role | Participants |\n|---|---|\n| Product Owner | alice |\n| Developers | ci-dev, gpu-dev |\n| Reviewer | alice |\n\n## Practices\n\n- none\n", "docs/backlog/ITM-014-export-a-chapter-as-pdf.md": "---\nid: ITM-014\ntitle: Export a chapter as PDF\nkind: implementation\nrealises:\n  - A CHAPTER IS EXPORTED\n  - UC-003\nmodules:\n  - MOD-export\norigin:\n  - ISS-007\n---\n\n# ITM-014 Export a chapter as PDF\n\n**REGISTER**\n\n## Outcome\n\nAn accepted chapter is exported as a PDF with its figures.\n\n## Acceptance criteria\n\n- the PDF holds every figure of the chapter\n- the PDF is named after the chapter\n", "docs/use-cases/UC-003-export-a-chapter.md": "---\nid: UC-003\ntitle: Export a chapter\narea: writing\nactors:\n  - Author\nrealises:\n  - A CHAPTER IS EXPORTED\n---\n# UC-003 Export a chapter\n\n## Actors\n\n- **Author** — writes.\n\n## Precondition\n\n- The repository exists.\n\n## Main flow\n\n1. The author presses **Export**.\n\n## Alternative flows\n\n- **1a. No token.** GitHub's page opens.\n\n## Postcondition\n\n- The chapter is saved.\n", "docs/architecture/ARC-002-export.md": "---\nid: ARC-002\ntitle: Export\nforced_by:\n  - EVERY TEXT IS REVIEWED\n  - UC-003\n---\n# ARC-002 Export\n\n## Context\n\nThe thesis is reviewed in the browser.\n\n## Decision\n\n1. Export.\n\n## Alternatives\n\n- None.\n\n## Consequences\n\n- None.\n\n## Modules\n\n```json module\n{\"id\":\"MOD-export\",\"folder\":\"src/export/\",\"layer\":\"feature\",\"responsibility\":\"Exports chapters.\",\"realises\":[\"EVERY TEXT IS REVIEWED\"],\"owns\":[],\"uses\":[\"MOD-pages\"]}\n```\n\n```json interface\n{\"id\":\"MOD-export.run\",\"summary\":\"Exports a chapter.\",\"params\":[{\"name\":\"path\",\"type\":\"string\"}],\"result\":\"string\",\"async\":false,\"refusals\":[],\"examples\":[{\"name\":\"one\",\"input\":{\"path\":\"a.md\"},\"result\":\"a.pdf\"}]}\n```\n", "tests/export.test.mjs": "// The export of a chapter.\n//\n// Module: MOD-export\n// Guards: A CHAPTER IS EXPORTED; UC-003\n// Level: system\nimport { test } from \"node:test\";\n\n// TST-014 the PDF keeps the figures\n// Given: a chapter with two figures\n// When: the author exports it as PDF\n// Then: the PDF holds both figures\ntest(\"TST-014 the PDF keeps the figures\", () => {});\n\n// TST-015 the PDF names the chapter\n// Given: a chapter titled Methods\n// When: the author exports it as PDF\n// Then: the PDF's title is Methods\ntest(\"TST-015 the PDF names the chapter\", () => {});\n\n// TST-016 the summary of an export reads as the chapter\n// Given: a chapter of four pages\n// When: the model summarises the exported PDF\n// Then: the summary names the chapter's three findings\n// Runs: 20\n// Paid: hub\ntest(\"TST-016 the summary of an export reads as the chapter\", () => {});\n", "/home/runner/work/thesis/thesis/agent-m/docs/participants.md": "# Participants of this instance\n\n| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |\n|---|---|---|---|---|---|---|---|\n| alice | person | — | — | — | draft text, read the repository, write to the repository | — | the GitHub account `alice` |\n| ci-dev | CI agent | claude-opus-5-5 | 200000 | — | read the repository, write to the repository, run code and tests | GitHub's machines, a provider in the USA | the workflow agent-m-job: claude on GitHub's machines |\n| gpu-dev | CI agent | codex-model | — | — | read the repository, write to the repository, run code and tests | the lab's GPU server, Erlangen | the workflow agent-m-job: codex on the runner gpu-1 |\n| cli-dev | CLI agent | claude-opus-5-5 | — | — | read the repository, write to the repository, run code and tests | this machine | the bridge on the Mac of `alice` |\n", "/home/runner/work/thesis/thesis/agent-m/src/job-harness/jobs/implement/job.json": "{\n  \"kind\": \"implement\",\n  \"mode\": \"agent\",\n  \"produces\": [\n    \"MOD\",\n    \"TST\"\n  ],\n  \"capabilities\": [\n    \"read the repository\",\n    \"write to the repository\",\n    \"run code and tests\"\n  ],\n  \"inputs\": [\n    {\n      \"name\": \"item\",\n      \"of\": \"ITM\"\n    },\n    {\n      \"name\": \"realises\",\n      \"of\": \"requirement\"\n    },\n    {\n      \"name\": \"tests\",\n      \"of\": \"TST\"\n    },\n    {\n      \"name\": \"process\",\n      \"of\": \"requirement\"\n    },\n    {\n      \"name\": \"instruction\",\n      \"of\": \"text\"\n    }\n  ],\n  \"output\": {},\n  \"checks\": [],\n  \"rounds\": 3,\n  \"result\": \"pull-request\"\n}\n", "/home/runner/work/thesis/thesis/agent-m/src/job-harness/jobs/implement/prompt.md": "Implement the backlog item below in this repository, test first: commit the tests for its acceptance criteria alone, each\nnaming the requirement it guards, then the implementation until they pass. If the item contradicts the specification or\nleaves a case open, change nothing and answer with one line that begins with QUESTION: and asks it.\n\n{{instruction}}\n\nThe item:\n\n{{item}}\n\nWhat it realises:\n\n{{realises}}\n\nThe tests that guard it now:\n\n{{tests}}\n\nThe process requirements of this product:\n\n{{process}}\n" },
        "fetch": [],
        "clock": "2026-10-12T09:50:00Z"
      },
      "refused": "no-token"
    }
  ]
}
```

```json interface
{
  "id": "MOD-ci-entry.mayWrite",
  "summary": "Whether the job may still write: refused once a person cancelled it (A CANCELLED JOB WRITES NOTHING MORE); the step that pushes the agent's commits asks first.",
  "params": [{ "name": "env", "type": "CiEnv" }, { "name": "fetch", "type": "FetchPort" }],
  "result": "MayWrite",
  "async": true,
  "refusals": [
    { "code": "cancelled", "when": "a cancel record of the job is on the default branch" },
    { "code": "no-job", "when": "no record of the job is on the default branch" },
    { "code": "token-refused", "when": "the server refuses the token" },
    { "code": "no-access", "when": "the token lacks the permission" },
    { "code": "server-error", "when": "the server answers with another error" },
    { "code": "unreachable", "when": "no answer arrives" }
  ],
  "examples": [
    {
      "name": "not cancelled",
      "input": {
        "env": { "GITHUB_ACTIONS": "true", "GITHUB_SERVER_URL": "https://github.com", "GITHUB_REPOSITORY": "alice/thesis", "AGENT_M_HOME": "/home/runner/work/thesis/thesis/agent-m", "AGENT_M_OUT": "/home/runner/work/thesis/thesis/agent-m-out", "AGENT_M_JOB": "JOB-20261012-0800-9a9a", "AGENT_M_TOKEN": "github_pat_example", "AGENT_M_INSTANCE": "https://github.com/alice/agent-m", "AGENT_M_WAIT_MINUTES": "240" },
        "fetch": [
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis" },
            "response": { "status": 200, "body": { "visibility": "private", "default_branch": "main" } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/git/ref/heads/main" },
            "response": { "status": 200, "body": { "object": { "sha": "c100000000000000000000000000000000000000" } } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/contents/docs/jobs/JOB-20261012-0800-9a9a.md?ref=c100000000000000000000000000000000000000" },
            "response": { "status": 200, "body": "---\nid: JOB-20261012-0800-9a9a\nkind: implement\nphase: Doing\nrole: Developers\nparticipant: ci-dev\nruntime: ci\nrun:\nslot:\nitem: ITM-014\nmodules:\n  - MOD-export\ninputs: []\nretry_of:\nagent_m: 2026.10.1\nmodel: claude-opus-5-5\nlog:\n---\n\n# JOB-20261012-0800-9a9a\n\n**REGISTER**\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-12T08:00:00Z | queued | — |\n| 2026-10-12T08:03:00Z | running | attempt 1 on ci-dev |\n" }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/contents/docs/jobs/cancels/JOB-20261012-0800-9a9a.md?ref=c100000000000000000000000000000000000000" },
            "response": { "status": 404, "body": { "message": "Not Found" } }
          }
        ]
      },
      "result": { "job": "JOB-20261012-0800-9a9a", "may": true }
    },
    {
      "name": "cancelled",
      "input": {
        "env": { "GITHUB_ACTIONS": "true", "GITHUB_SERVER_URL": "https://github.com", "GITHUB_REPOSITORY": "alice/thesis", "AGENT_M_HOME": "/home/runner/work/thesis/thesis/agent-m", "AGENT_M_OUT": "/home/runner/work/thesis/thesis/agent-m-out", "AGENT_M_JOB": "JOB-20261012-0800-9a9a", "AGENT_M_TOKEN": "github_pat_example", "AGENT_M_INSTANCE": "https://github.com/alice/agent-m", "AGENT_M_WAIT_MINUTES": "240" },
        "fetch": [
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis" },
            "response": { "status": 200, "body": { "visibility": "private", "default_branch": "main" } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/git/ref/heads/main" },
            "response": { "status": 200, "body": { "object": { "sha": "c100000000000000000000000000000000000000" } } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/contents/docs/jobs/JOB-20261012-0800-9a9a.md?ref=c100000000000000000000000000000000000000" },
            "response": { "status": 200, "body": "---\nid: JOB-20261012-0800-9a9a\nkind: implement\nphase: Doing\nrole: Developers\nparticipant: ci-dev\nruntime: ci\nrun:\nslot:\nitem: ITM-014\nmodules:\n  - MOD-export\ninputs: []\nretry_of:\nagent_m: 2026.10.1\nmodel: claude-opus-5-5\nlog:\n---\n\n# JOB-20261012-0800-9a9a\n\n**REGISTER**\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-12T08:00:00Z | queued | — |\n| 2026-10-12T08:03:00Z | running | attempt 1 on ci-dev |\n" }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/contents/docs/jobs/cancels/JOB-20261012-0800-9a9a.md?ref=c100000000000000000000000000000000000000" },
            "response": { "status": 200, "body": "job: JOB-20261012-0800-9a9a\nby: alice\nat: 2026-10-12T08:01:00Z\n" }
          }
        ]
      },
      "refused": "cancelled"
    }
  ]
}
```

```json interface
{
  "id": "MOD-ci-entry.jobObserve",
  "summary": "One look at a job's pull request and what decides its next step (UC-034 5–8): the cancel, the agent's question, the pull request with CI on its first commit and its head and the attempts, the Definition of Done checked from its commits, their files and CI (MOD-job-steps.observeStep), and the gates leaving the job's phase on its head; then what MOD-job-runner.nextStep decides is done — the pull request opened, the run waits and looks again, the next attempt dispatched, the pull request merged into the branch its work goes into, or the job's state recorded with what the CLI reported it used, and the run ended.",
  "params": [
    { "name": "env", "type": "CiEnv" },
    { "name": "paths", "type": "string[]" },
    { "name": "files", "type": "ReadPort" },
    { "name": "fetch", "type": "FetchPort" },
    { "name": "clock", "type": "ClockPort" }
  ],
  "result": "JobObserved",
  "async": true,
  "refusals": [
    { "code": "no-token", "when": "the job's environment holds no AGENT_M_TOKEN" },
    { "code": "no-job", "when": "no record of the job is on the default branch" },
    { "code": "no-workflow", "when": "the product declares no process model whose workflow can be derived" },
    { "code": "not-green", "when": "a check turned red between the look and the merge" },
    { "code": "moved", "when": "a branch moved on while it was written" },
    { "code": "token-refused", "when": "the server refuses the token" },
    { "code": "no-access", "when": "the token lacks the permission" },
    { "code": "server-error", "when": "the server answers with another error" },
    { "code": "unreachable", "when": "no answer arrives" }
  ],
  "examples": [
    {
      "name": "the agent's commits pushed, the pull request opened",
      "input": {
        "env": { "GITHUB_ACTIONS": "true", "GITHUB_SERVER_URL": "https://github.com", "GITHUB_REPOSITORY": "alice/thesis", "AGENT_M_HOME": "/home/runner/work/thesis/thesis/agent-m", "AGENT_M_OUT": "/home/runner/work/thesis/thesis/agent-m-out", "AGENT_M_JOB": "JOB-20261012-0800-9a9a", "AGENT_M_TOKEN": "github_pat_example", "AGENT_M_INSTANCE": "https://github.com/alice/agent-m", "AGENT_M_WAIT_MINUTES": "240", "AGENT_M_PUSHED": "true" },
        "paths": ["SPEC.md", "docs/architecture/ARC-002-export.md", "docs/backlog/ITM-014-export-a-chapter-as-pdf.md", "docs/process.md", "docs/use-cases/UC-003-export-a-chapter.md", "tests/export.test.mjs"],
        "files": { "SPEC.md": "# Thesis — Specification\n\n## 1. Writing\n\n**ONE CLICK** *(PO A. Maier)*\nA decision takes one click.\n*Check:* no automatic check; at review.\n\n**NO SERVER** *(PO A. Maier)*\nThe product runs no server of its own.\n*Check:* `tests/test_no_server.py`\n\n## 2. Review\n\n**EVERY TEXT IS REVIEWED** *(PO A. Maier)*\nA document binds only once it is accepted.\n*Check:* `tests/pages.test.mjs`\n\n## 3. Export\n\n**A CHAPTER IS EXPORTED** *(PO A. Maier)*\nA chapter is exported as a PDF with its figures.\n*Check:* `tests/export.test.mjs`\n", "docs/process.md": "---\nmodel: kanban\nmodel_file: docs/process-models/kanban.md\nmodel_version: 5a00000000000000000000000000000000000000\n---\n# How the thesis tool is developed\n\n## Roles\n\n| Role | Participants |\n|---|---|\n| Product Owner | alice |\n| Developers | ci-dev, gpu-dev |\n| Reviewer | alice |\n\n## Practices\n\n- none\n", "docs/backlog/ITM-014-export-a-chapter-as-pdf.md": "---\nid: ITM-014\ntitle: Export a chapter as PDF\nkind: implementation\nrealises:\n  - A CHAPTER IS EXPORTED\n  - UC-003\nmodules:\n  - MOD-export\norigin:\n  - ISS-007\n---\n\n# ITM-014 Export a chapter as PDF\n\n**REGISTER**\n\n## Outcome\n\nAn accepted chapter is exported as a PDF with its figures.\n\n## Acceptance criteria\n\n- the PDF holds every figure of the chapter\n- the PDF is named after the chapter\n", "docs/use-cases/UC-003-export-a-chapter.md": "---\nid: UC-003\ntitle: Export a chapter\narea: writing\nactors:\n  - Author\nrealises:\n  - A CHAPTER IS EXPORTED\n---\n# UC-003 Export a chapter\n\n## Actors\n\n- **Author** — writes.\n\n## Precondition\n\n- The repository exists.\n\n## Main flow\n\n1. The author presses **Export**.\n\n## Alternative flows\n\n- **1a. No token.** GitHub's page opens.\n\n## Postcondition\n\n- The chapter is saved.\n", "docs/architecture/ARC-002-export.md": "---\nid: ARC-002\ntitle: Export\nforced_by:\n  - EVERY TEXT IS REVIEWED\n  - UC-003\n---\n# ARC-002 Export\n\n## Context\n\nThe thesis is reviewed in the browser.\n\n## Decision\n\n1. Export.\n\n## Alternatives\n\n- None.\n\n## Consequences\n\n- None.\n\n## Modules\n\n```json module\n{\"id\":\"MOD-export\",\"folder\":\"src/export/\",\"layer\":\"feature\",\"responsibility\":\"Exports chapters.\",\"realises\":[\"EVERY TEXT IS REVIEWED\"],\"owns\":[],\"uses\":[\"MOD-pages\"]}\n```\n\n```json interface\n{\"id\":\"MOD-export.run\",\"summary\":\"Exports a chapter.\",\"params\":[{\"name\":\"path\",\"type\":\"string\"}],\"result\":\"string\",\"async\":false,\"refusals\":[],\"examples\":[{\"name\":\"one\",\"input\":{\"path\":\"a.md\"},\"result\":\"a.pdf\"}]}\n```\n", "tests/export.test.mjs": "// The export of a chapter.\n//\n// Module: MOD-export\n// Guards: A CHAPTER IS EXPORTED; UC-003\n// Level: system\nimport { test } from \"node:test\";\n\n// TST-014 the PDF keeps the figures\n// Given: a chapter with two figures\n// When: the author exports it as PDF\n// Then: the PDF holds both figures\ntest(\"TST-014 the PDF keeps the figures\", () => {});\n\n// TST-015 the PDF names the chapter\n// Given: a chapter titled Methods\n// When: the author exports it as PDF\n// Then: the PDF's title is Methods\ntest(\"TST-015 the PDF names the chapter\", () => {});\n\n// TST-016 the summary of an export reads as the chapter\n// Given: a chapter of four pages\n// When: the model summarises the exported PDF\n// Then: the summary names the chapter's three findings\n// Runs: 20\n// Paid: hub\ntest(\"TST-016 the summary of an export reads as the chapter\", () => {});\n", "/home/runner/work/thesis/thesis/agent-m/docs/participants.md": "# Participants of this instance\n\n| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |\n|---|---|---|---|---|---|---|---|\n| alice | person | — | — | — | draft text, read the repository, write to the repository | — | the GitHub account `alice` |\n| ci-dev | CI agent | claude-opus-5-5 | 200000 | — | read the repository, write to the repository, run code and tests | GitHub's machines, a provider in the USA | the workflow agent-m-job: claude on GitHub's machines |\n| gpu-dev | CI agent | codex-model | — | — | read the repository, write to the repository, run code and tests | the lab's GPU server, Erlangen | the workflow agent-m-job: codex on the runner gpu-1 |\n| cli-dev | CLI agent | claude-opus-5-5 | — | — | read the repository, write to the repository, run code and tests | this machine | the bridge on the Mac of `alice` |\n", "/home/runner/work/thesis/thesis/agent-m/src/job-harness/jobs/implement/job.json": "{\n  \"kind\": \"implement\",\n  \"mode\": \"agent\",\n  \"produces\": [\n    \"MOD\",\n    \"TST\"\n  ],\n  \"capabilities\": [\n    \"read the repository\",\n    \"write to the repository\",\n    \"run code and tests\"\n  ],\n  \"inputs\": [\n    {\n      \"name\": \"item\",\n      \"of\": \"ITM\"\n    },\n    {\n      \"name\": \"realises\",\n      \"of\": \"requirement\"\n    },\n    {\n      \"name\": \"tests\",\n      \"of\": \"TST\"\n    },\n    {\n      \"name\": \"process\",\n      \"of\": \"requirement\"\n    },\n    {\n      \"name\": \"instruction\",\n      \"of\": \"text\"\n    }\n  ],\n  \"output\": {},\n  \"checks\": [],\n  \"rounds\": 3,\n  \"result\": \"pull-request\"\n}\n", "/home/runner/work/thesis/thesis/agent-m/src/job-harness/jobs/implement/prompt.md": "Implement the backlog item below in this repository, test first: commit the tests for its acceptance criteria alone, each\nnaming the requirement it guards, then the implementation until they pass. If the item contradicts the specification or\nleaves a case open, change nothing and answer with one line that begins with QUESTION: and asks it.\n\n{{instruction}}\n\nThe item:\n\n{{item}}\n\nWhat it realises:\n\n{{realises}}\n\nThe tests that guard it now:\n\n{{tests}}\n\nThe process requirements of this product:\n\n{{process}}\n", "/home/runner/work/thesis/thesis/agent-m-out/report.json": "{\"type\":\"result\",\"subtype\":\"success\",\"is_error\":false,\"num_turns\":38,\"result\":\"The tests of ITM-014 and the export of the figures are committed.\",\"total_cost_usd\":1.8432,\"usage\":{\"input_tokens\":182344,\"output_tokens\":12850}}" },
        "fetch": [
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis" },
            "response": { "status": 200, "body": { "visibility": "private", "default_branch": "main" } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/git/ref/heads/main" },
            "response": { "status": 200, "body": { "object": { "sha": "c100000000000000000000000000000000000000" } } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/contents/docs/jobs/JOB-20261012-0800-9a9a.md?ref=c100000000000000000000000000000000000000" },
            "response": { "status": 200, "body": "---\nid: JOB-20261012-0800-9a9a\nkind: implement\nphase: Doing\nrole: Developers\nparticipant: ci-dev\nruntime: ci\nrun:\nslot:\nitem: ITM-014\nmodules:\n  - MOD-export\ninputs: []\nretry_of:\nagent_m: 2026.10.1\nmodel: claude-opus-5-5\nlog:\n---\n\n# JOB-20261012-0800-9a9a\n\n**REGISTER**\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-12T08:00:00Z | queued | — |\n| 2026-10-12T08:03:00Z | running | attempt 1 on ci-dev |\n" }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/contents/docs/jobs/cancels/JOB-20261012-0800-9a9a.md?ref=c100000000000000000000000000000000000000" },
            "response": { "status": 404, "body": { "message": "Not Found" } }
          },
          {
            "request": { "method": "GET", "url": "https://raw.githubusercontent.com/alice/agent-m/5a00000000000000000000000000000000000000/docs/process-models/kanban.md" },
            "response": { "status": 200, "body": "---\nname: kanban\nkind: pulled\nmeasure: items per state over time\nmanages: work that arrives unpredictably and must flow without long waits\naccepts: no fixed delivery date for a set of items\nsuits: maintaining a product that receives issues every week\nchapter: Vibe Coding, ch. 7 §4\n---\n# Kanban\n\nWork is pulled from the backlog as capacity frees up.\n\n## Phases\n\n| Name | Role | Produces |\n|---|---|---|\n| Backlog | Product Owner | ITM |\n| Doing | Developers | MOD, TST |\n| Done | Product Owner | the merged item |\n\n## Transitions\n\n| From | To | Kind |\n|---|---|---|\n| Backlog | Doing | sequence |\n| Doing | Done | sequence |\n\n## Verification pairs\n\n| Phase | Checked by |\n|---|---|\n\n## Gates\n\n| Between | Artifacts | Condition | Decider |\n|---|---|---|---|\n| Doing → Done | MOD | a person has read the change | Reviewer |\n\n## Roles\n\n| Name | Filled by | Capabilities |\n|---|---|---|\n| Product Owner | person | read the repository, write to the repository |\n| Developers | agent | read the repository, write to the repository, run code and tests |\n| Reviewer | person | read the repository |\n\n## Flow control\n\n| Kind | Value |\n|---|---|\n| WIP limit | 3 |\n| Time box | none |\n| Sprints | no |\n" }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/commits/c100000000000000000000000000000000000000" },
            "response": { "status": 200, "body": { "sha": "c100000000000000000000000000000000000000" } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/git/trees/c100000000000000000000000000000000000000?recursive=1" },
            "response": {
              "status": 200,
              "body": {
                "tree": [{ "path": "SPEC.md", "type": "blob", "sha": "5100000000000000000000000000000000000000" }]
              }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/pulls?state=all&per_page=100&page=1&base=main" },
            "response": { "status": 200, "body": [] }
          },
          {
            "request": {
              "method": "POST",
              "url": "https://api.github.com/repos/alice/thesis/pulls",
              "body": { "title": "ITM-014: Export a chapter as PDF", "head": "item/ITM-014", "base": "main", "body": "Realises: A CHAPTER IS EXPORTED, UC-003\nCloses the issue ISS-007\nStarted: 2026-10-12T09:50:00Z\n\nJob: JOB-20261012-0800-9a9a\nParticipant: ci-dev\nModel: claude-opus-5-5\nAgent-M: 2026.10.1\nRounds: 0\n" }
            },
            "response": {
              "status": 201,
              "body": {
                "number": 72,
                "title": "ITM-014: Export a chapter as PDF",
                "state": "open",
                "draft": false,
                "head": { "ref": "item/ITM-014", "sha": "d200000000000000000000000000000000000000" },
                "base": { "ref": "main" },
                "created_at": "2026-10-12T09:41:00Z",
                "merged_at": null,
                "closed_at": null,
                "html_url": "https://github.com/alice/thesis/pull/72"
              }
            }
          }
        ],
        "clock": "2026-10-12T09:50:00Z"
      },
      "result": { "action": "wait", "state": "running", "note": "pull request #72 opened", "pullRequest": 72 }
    },
    {
      "name": "CI red, the second attempt dispatched",
      "input": {
        "env": { "GITHUB_ACTIONS": "true", "GITHUB_SERVER_URL": "https://github.com", "GITHUB_REPOSITORY": "alice/thesis", "AGENT_M_HOME": "/home/runner/work/thesis/thesis/agent-m", "AGENT_M_OUT": "/home/runner/work/thesis/thesis/agent-m-out", "AGENT_M_JOB": "JOB-20261012-0800-9a9a", "AGENT_M_TOKEN": "github_pat_example", "AGENT_M_INSTANCE": "https://github.com/alice/agent-m", "AGENT_M_WAIT_MINUTES": "240" },
        "paths": ["SPEC.md", "docs/architecture/ARC-002-export.md", "docs/backlog/ITM-014-export-a-chapter-as-pdf.md", "docs/process.md", "docs/use-cases/UC-003-export-a-chapter.md", "tests/export.test.mjs"],
        "files": { "SPEC.md": "# Thesis — Specification\n\n## 1. Writing\n\n**ONE CLICK** *(PO A. Maier)*\nA decision takes one click.\n*Check:* no automatic check; at review.\n\n**NO SERVER** *(PO A. Maier)*\nThe product runs no server of its own.\n*Check:* `tests/test_no_server.py`\n\n## 2. Review\n\n**EVERY TEXT IS REVIEWED** *(PO A. Maier)*\nA document binds only once it is accepted.\n*Check:* `tests/pages.test.mjs`\n\n## 3. Export\n\n**A CHAPTER IS EXPORTED** *(PO A. Maier)*\nA chapter is exported as a PDF with its figures.\n*Check:* `tests/export.test.mjs`\n", "docs/process.md": "---\nmodel: kanban\nmodel_file: docs/process-models/kanban.md\nmodel_version: 5a00000000000000000000000000000000000000\n---\n# How the thesis tool is developed\n\n## Roles\n\n| Role | Participants |\n|---|---|\n| Product Owner | alice |\n| Developers | ci-dev, gpu-dev |\n| Reviewer | alice |\n\n## Practices\n\n- none\n", "docs/backlog/ITM-014-export-a-chapter-as-pdf.md": "---\nid: ITM-014\ntitle: Export a chapter as PDF\nkind: implementation\nrealises:\n  - A CHAPTER IS EXPORTED\n  - UC-003\nmodules:\n  - MOD-export\norigin:\n  - ISS-007\n---\n\n# ITM-014 Export a chapter as PDF\n\n**REGISTER**\n\n## Outcome\n\nAn accepted chapter is exported as a PDF with its figures.\n\n## Acceptance criteria\n\n- the PDF holds every figure of the chapter\n- the PDF is named after the chapter\n", "docs/use-cases/UC-003-export-a-chapter.md": "---\nid: UC-003\ntitle: Export a chapter\narea: writing\nactors:\n  - Author\nrealises:\n  - A CHAPTER IS EXPORTED\n---\n# UC-003 Export a chapter\n\n## Actors\n\n- **Author** — writes.\n\n## Precondition\n\n- The repository exists.\n\n## Main flow\n\n1. The author presses **Export**.\n\n## Alternative flows\n\n- **1a. No token.** GitHub's page opens.\n\n## Postcondition\n\n- The chapter is saved.\n", "docs/architecture/ARC-002-export.md": "---\nid: ARC-002\ntitle: Export\nforced_by:\n  - EVERY TEXT IS REVIEWED\n  - UC-003\n---\n# ARC-002 Export\n\n## Context\n\nThe thesis is reviewed in the browser.\n\n## Decision\n\n1. Export.\n\n## Alternatives\n\n- None.\n\n## Consequences\n\n- None.\n\n## Modules\n\n```json module\n{\"id\":\"MOD-export\",\"folder\":\"src/export/\",\"layer\":\"feature\",\"responsibility\":\"Exports chapters.\",\"realises\":[\"EVERY TEXT IS REVIEWED\"],\"owns\":[],\"uses\":[\"MOD-pages\"]}\n```\n\n```json interface\n{\"id\":\"MOD-export.run\",\"summary\":\"Exports a chapter.\",\"params\":[{\"name\":\"path\",\"type\":\"string\"}],\"result\":\"string\",\"async\":false,\"refusals\":[],\"examples\":[{\"name\":\"one\",\"input\":{\"path\":\"a.md\"},\"result\":\"a.pdf\"}]}\n```\n", "tests/export.test.mjs": "// The export of a chapter.\n//\n// Module: MOD-export\n// Guards: A CHAPTER IS EXPORTED; UC-003\n// Level: system\nimport { test } from \"node:test\";\n\n// TST-014 the PDF keeps the figures\n// Given: a chapter with two figures\n// When: the author exports it as PDF\n// Then: the PDF holds both figures\ntest(\"TST-014 the PDF keeps the figures\", () => {});\n\n// TST-015 the PDF names the chapter\n// Given: a chapter titled Methods\n// When: the author exports it as PDF\n// Then: the PDF's title is Methods\ntest(\"TST-015 the PDF names the chapter\", () => {});\n\n// TST-016 the summary of an export reads as the chapter\n// Given: a chapter of four pages\n// When: the model summarises the exported PDF\n// Then: the summary names the chapter's three findings\n// Runs: 20\n// Paid: hub\ntest(\"TST-016 the summary of an export reads as the chapter\", () => {});\n", "/home/runner/work/thesis/thesis/agent-m/docs/participants.md": "# Participants of this instance\n\n| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |\n|---|---|---|---|---|---|---|---|\n| alice | person | — | — | — | draft text, read the repository, write to the repository | — | the GitHub account `alice` |\n| ci-dev | CI agent | claude-opus-5-5 | 200000 | — | read the repository, write to the repository, run code and tests | GitHub's machines, a provider in the USA | the workflow agent-m-job: claude on GitHub's machines |\n| gpu-dev | CI agent | codex-model | — | — | read the repository, write to the repository, run code and tests | the lab's GPU server, Erlangen | the workflow agent-m-job: codex on the runner gpu-1 |\n| cli-dev | CLI agent | claude-opus-5-5 | — | — | read the repository, write to the repository, run code and tests | this machine | the bridge on the Mac of `alice` |\n", "/home/runner/work/thesis/thesis/agent-m/src/job-harness/jobs/implement/job.json": "{\n  \"kind\": \"implement\",\n  \"mode\": \"agent\",\n  \"produces\": [\n    \"MOD\",\n    \"TST\"\n  ],\n  \"capabilities\": [\n    \"read the repository\",\n    \"write to the repository\",\n    \"run code and tests\"\n  ],\n  \"inputs\": [\n    {\n      \"name\": \"item\",\n      \"of\": \"ITM\"\n    },\n    {\n      \"name\": \"realises\",\n      \"of\": \"requirement\"\n    },\n    {\n      \"name\": \"tests\",\n      \"of\": \"TST\"\n    },\n    {\n      \"name\": \"process\",\n      \"of\": \"requirement\"\n    },\n    {\n      \"name\": \"instruction\",\n      \"of\": \"text\"\n    }\n  ],\n  \"output\": {},\n  \"checks\": [],\n  \"rounds\": 3,\n  \"result\": \"pull-request\"\n}\n", "/home/runner/work/thesis/thesis/agent-m/src/job-harness/jobs/implement/prompt.md": "Implement the backlog item below in this repository, test first: commit the tests for its acceptance criteria alone, each\nnaming the requirement it guards, then the implementation until they pass. If the item contradicts the specification or\nleaves a case open, change nothing and answer with one line that begins with QUESTION: and asks it.\n\n{{instruction}}\n\nThe item:\n\n{{item}}\n\nWhat it realises:\n\n{{realises}}\n\nThe tests that guard it now:\n\n{{tests}}\n\nThe process requirements of this product:\n\n{{process}}\n", "/home/runner/work/thesis/thesis/agent-m-out/report.json": "{\"type\":\"result\",\"subtype\":\"success\",\"is_error\":false,\"num_turns\":38,\"result\":\"The tests of ITM-014 and the export of the figures are committed.\",\"total_cost_usd\":1.8432,\"usage\":{\"input_tokens\":182344,\"output_tokens\":12850}}" },
        "fetch": [
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis" },
            "response": { "status": 200, "body": { "visibility": "private", "default_branch": "main" } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/git/ref/heads/main" },
            "response": { "status": 200, "body": { "object": { "sha": "c100000000000000000000000000000000000000" } } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/contents/docs/jobs/JOB-20261012-0800-9a9a.md?ref=c100000000000000000000000000000000000000" },
            "response": { "status": 200, "body": "---\nid: JOB-20261012-0800-9a9a\nkind: implement\nphase: Doing\nrole: Developers\nparticipant: ci-dev\nruntime: ci\nrun:\nslot:\nitem: ITM-014\nmodules:\n  - MOD-export\ninputs: []\nretry_of:\nagent_m: 2026.10.1\nmodel: claude-opus-5-5\nlog:\n---\n\n# JOB-20261012-0800-9a9a\n\n**REGISTER**\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-12T08:00:00Z | queued | — |\n| 2026-10-12T08:03:00Z | running | attempt 1 on ci-dev |\n" }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/contents/docs/jobs/cancels/JOB-20261012-0800-9a9a.md?ref=c100000000000000000000000000000000000000" },
            "response": { "status": 404, "body": { "message": "Not Found" } }
          },
          {
            "request": { "method": "GET", "url": "https://raw.githubusercontent.com/alice/agent-m/5a00000000000000000000000000000000000000/docs/process-models/kanban.md" },
            "response": { "status": 200, "body": "---\nname: kanban\nkind: pulled\nmeasure: items per state over time\nmanages: work that arrives unpredictably and must flow without long waits\naccepts: no fixed delivery date for a set of items\nsuits: maintaining a product that receives issues every week\nchapter: Vibe Coding, ch. 7 §4\n---\n# Kanban\n\nWork is pulled from the backlog as capacity frees up.\n\n## Phases\n\n| Name | Role | Produces |\n|---|---|---|\n| Backlog | Product Owner | ITM |\n| Doing | Developers | MOD, TST |\n| Done | Product Owner | the merged item |\n\n## Transitions\n\n| From | To | Kind |\n|---|---|---|\n| Backlog | Doing | sequence |\n| Doing | Done | sequence |\n\n## Verification pairs\n\n| Phase | Checked by |\n|---|---|\n\n## Gates\n\n| Between | Artifacts | Condition | Decider |\n|---|---|---|---|\n| Doing → Done | MOD | a person has read the change | Reviewer |\n\n## Roles\n\n| Name | Filled by | Capabilities |\n|---|---|---|\n| Product Owner | person | read the repository, write to the repository |\n| Developers | agent | read the repository, write to the repository, run code and tests |\n| Reviewer | person | read the repository |\n\n## Flow control\n\n| Kind | Value |\n|---|---|\n| WIP limit | 3 |\n| Time box | none |\n| Sprints | no |\n" }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/commits/c100000000000000000000000000000000000000" },
            "response": { "status": 200, "body": { "sha": "c100000000000000000000000000000000000000" } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/git/trees/c100000000000000000000000000000000000000?recursive=1" },
            "response": {
              "status": 200,
              "body": {
                "tree": [{ "path": "SPEC.md", "type": "blob", "sha": "5100000000000000000000000000000000000000" }]
              }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/pulls?state=all&per_page=100&page=1&base=main" },
            "response": {
              "status": 200,
              "body": [
                {
                  "number": 72,
                  "title": "ITM-014: Export a chapter as PDF",
                  "state": "open",
                  "draft": false,
                  "head": { "ref": "item/ITM-014", "sha": "d200000000000000000000000000000000000000" },
                  "base": { "ref": "main" },
                  "created_at": "2026-10-12T09:41:00Z",
                  "merged_at": null,
                  "closed_at": null,
                  "html_url": "https://github.com/alice/thesis/pull/72"
                }
              ]
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/pulls/72/commits?per_page=100&page=1" },
            "response": {
              "status": 200,
              "body": [
                {
                  "sha": "d200000000000000000000000000000000000000",
                  "commit": {
                    "message": "ITM-014: the export",
                    "committer": { "date": "2026-10-12T09:40:00Z" },
                    "author": { "name": "ci-dev" }
                  },
                  "author": null,
                  "parents": [{ "sha": "d100000000000000000000000000000000000000" }]
                },
                {
                  "sha": "d100000000000000000000000000000000000000",
                  "commit": {
                    "message": "ITM-014: tests for the export",
                    "committer": { "date": "2026-10-12T09:10:00Z" },
                    "author": { "name": "ci-dev" }
                  },
                  "author": null,
                  "parents": [{ "sha": "c100000000000000000000000000000000000000" }]
                }
              ]
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/commits/d100000000000000000000000000000000000000?per_page=100&page=1" },
            "response": {
              "status": 200,
              "body": {
                "sha": "d100000000000000000000000000000000000000",
                "files": [{ "filename": "tests/export.test.mjs", "status": "modified" }]
              }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/commits/d200000000000000000000000000000000000000?per_page=100&page=1" },
            "response": {
              "status": 200,
              "body": {
                "sha": "d200000000000000000000000000000000000000",
                "files": [
                  { "filename": "src/export/index.mjs", "status": "modified" },
                  { "filename": "src/export/figures.mjs", "status": "added" }
                ]
              }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/actions/runs?head_sha=d100000000000000000000000000000000000000&per_page=100" },
            "response": {
              "status": 200,
              "body": {
                "workflow_runs": [
                  { "name": "agent-m tests", "status": "completed", "conclusion": "failure", "display_title": "agent-m tests", "html_url": "https://github.com/alice/thesis/actions/runs/1" }
                ]
              }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/actions/runs?head_sha=d200000000000000000000000000000000000000&per_page=100" },
            "response": {
              "status": 200,
              "body": {
                "workflow_runs": [
                  { "name": "agent-m tests", "status": "completed", "conclusion": "failure", "display_title": "agent-m tests", "html_url": "https://github.com/alice/thesis/actions/runs/1" }
                ]
              }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/git/commits/c100000000000000000000000000000000000000" },
            "response": {
              "status": 200,
              "body": {
                "sha": "c100000000000000000000000000000000000000",
                "tree": { "sha": "b600000000000000000000000000000000000000" }
              }
            }
          },
          {
            "request": {
              "method": "POST",
              "url": "https://api.github.com/repos/alice/thesis/git/trees",
              "body": {
                "base_tree": "b600000000000000000000000000000000000000",
                "tree": [
                  { "path": "docs/jobs/JOB-20261012-0800-9a9a.md", "mode": "100644", "type": "blob", "content": "---\nid: JOB-20261012-0800-9a9a\nkind: implement\nphase: Doing\nrole: Developers\nparticipant: ci-dev\nruntime: ci\nrun:\nslot:\nitem: ITM-014\nmodules:\n  - MOD-export\ninputs: []\nretry_of:\nagent_m: 2026.10.1\nmodel: claude-opus-5-5\nlog:\n---\n\n# JOB-20261012-0800-9a9a\n\n**REGISTER**\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-12T08:00:00Z | queued | — |\n| 2026-10-12T08:03:00Z | running | attempt 1 on ci-dev |\n| 2026-10-12T09:50:00Z | running | attempt 1 used 182344 input and 12850 output tokens, 1.84 USD as the CLI reported; CI is red, attempt 2 follows |\n" }
                ]
              }
            },
            "response": { "status": 201, "body": { "sha": "c600000000000000000000000000000000000000" } }
          },
          {
            "request": {
              "method": "POST",
              "url": "https://api.github.com/repos/alice/thesis/git/commits",
              "body": {
                "message": "JOB-20261012-0800-9a9a: attempt 1 ends red",
                "tree": "c600000000000000000000000000000000000000",
                "parents": ["c100000000000000000000000000000000000000"]
              }
            },
            "response": {
              "status": 201,
              "body": { "sha": "e600000000000000000000000000000000000000", "html_url": "https://github.com/alice/thesis/commit/e600000000000000000000000000000000000000" }
            }
          },
          {
            "request": {
              "method": "PATCH",
              "url": "https://api.github.com/repos/alice/thesis/git/refs/heads/main",
              "body": { "sha": "e600000000000000000000000000000000000000", "force": false }
            },
            "response": { "status": 200, "body": { "object": { "sha": "e600000000000000000000000000000000000000" } } }
          },
          {
            "request": {
              "method": "POST",
              "url": "https://api.github.com/repos/alice/thesis/actions/workflows/agent-m-job.yml/dispatches",
              "body": {
                "ref": "main",
                "inputs": { "AGENT_M_JOB": "JOB-20261012-0800-9a9a", "AGENT_M_PARTICIPANT": "ci-dev" }
              }
            },
            "response": { "status": 204, "body": null }
          }
        ],
        "clock": "2026-10-12T09:50:00Z"
      },
      "result": { "action": "repair", "state": "running", "note": "attempt 2 dispatched", "pullRequest": 72 }
    },
    {
      "name": "green, the gate waiting for alice",
      "input": {
        "env": { "GITHUB_ACTIONS": "true", "GITHUB_SERVER_URL": "https://github.com", "GITHUB_REPOSITORY": "alice/thesis", "AGENT_M_HOME": "/home/runner/work/thesis/thesis/agent-m", "AGENT_M_OUT": "/home/runner/work/thesis/thesis/agent-m-out", "AGENT_M_JOB": "JOB-20261012-0800-9a9a", "AGENT_M_TOKEN": "github_pat_example", "AGENT_M_INSTANCE": "https://github.com/alice/agent-m", "AGENT_M_WAIT_MINUTES": "240" },
        "paths": ["SPEC.md", "docs/architecture/ARC-002-export.md", "docs/backlog/ITM-014-export-a-chapter-as-pdf.md", "docs/process.md", "docs/use-cases/UC-003-export-a-chapter.md", "tests/export.test.mjs"],
        "files": { "SPEC.md": "# Thesis — Specification\n\n## 1. Writing\n\n**ONE CLICK** *(PO A. Maier)*\nA decision takes one click.\n*Check:* no automatic check; at review.\n\n**NO SERVER** *(PO A. Maier)*\nThe product runs no server of its own.\n*Check:* `tests/test_no_server.py`\n\n## 2. Review\n\n**EVERY TEXT IS REVIEWED** *(PO A. Maier)*\nA document binds only once it is accepted.\n*Check:* `tests/pages.test.mjs`\n\n## 3. Export\n\n**A CHAPTER IS EXPORTED** *(PO A. Maier)*\nA chapter is exported as a PDF with its figures.\n*Check:* `tests/export.test.mjs`\n", "docs/process.md": "---\nmodel: kanban\nmodel_file: docs/process-models/kanban.md\nmodel_version: 5a00000000000000000000000000000000000000\n---\n# How the thesis tool is developed\n\n## Roles\n\n| Role | Participants |\n|---|---|\n| Product Owner | alice |\n| Developers | ci-dev, gpu-dev |\n| Reviewer | alice |\n\n## Practices\n\n- none\n", "docs/backlog/ITM-014-export-a-chapter-as-pdf.md": "---\nid: ITM-014\ntitle: Export a chapter as PDF\nkind: implementation\nrealises:\n  - A CHAPTER IS EXPORTED\n  - UC-003\nmodules:\n  - MOD-export\norigin:\n  - ISS-007\n---\n\n# ITM-014 Export a chapter as PDF\n\n**REGISTER**\n\n## Outcome\n\nAn accepted chapter is exported as a PDF with its figures.\n\n## Acceptance criteria\n\n- the PDF holds every figure of the chapter\n- the PDF is named after the chapter\n", "docs/use-cases/UC-003-export-a-chapter.md": "---\nid: UC-003\ntitle: Export a chapter\narea: writing\nactors:\n  - Author\nrealises:\n  - A CHAPTER IS EXPORTED\n---\n# UC-003 Export a chapter\n\n## Actors\n\n- **Author** — writes.\n\n## Precondition\n\n- The repository exists.\n\n## Main flow\n\n1. The author presses **Export**.\n\n## Alternative flows\n\n- **1a. No token.** GitHub's page opens.\n\n## Postcondition\n\n- The chapter is saved.\n", "docs/architecture/ARC-002-export.md": "---\nid: ARC-002\ntitle: Export\nforced_by:\n  - EVERY TEXT IS REVIEWED\n  - UC-003\n---\n# ARC-002 Export\n\n## Context\n\nThe thesis is reviewed in the browser.\n\n## Decision\n\n1. Export.\n\n## Alternatives\n\n- None.\n\n## Consequences\n\n- None.\n\n## Modules\n\n```json module\n{\"id\":\"MOD-export\",\"folder\":\"src/export/\",\"layer\":\"feature\",\"responsibility\":\"Exports chapters.\",\"realises\":[\"EVERY TEXT IS REVIEWED\"],\"owns\":[],\"uses\":[\"MOD-pages\"]}\n```\n\n```json interface\n{\"id\":\"MOD-export.run\",\"summary\":\"Exports a chapter.\",\"params\":[{\"name\":\"path\",\"type\":\"string\"}],\"result\":\"string\",\"async\":false,\"refusals\":[],\"examples\":[{\"name\":\"one\",\"input\":{\"path\":\"a.md\"},\"result\":\"a.pdf\"}]}\n```\n", "tests/export.test.mjs": "// The export of a chapter.\n//\n// Module: MOD-export\n// Guards: A CHAPTER IS EXPORTED; UC-003\n// Level: system\nimport { test } from \"node:test\";\n\n// TST-014 the PDF keeps the figures\n// Given: a chapter with two figures\n// When: the author exports it as PDF\n// Then: the PDF holds both figures\ntest(\"TST-014 the PDF keeps the figures\", () => {});\n\n// TST-015 the PDF names the chapter\n// Given: a chapter titled Methods\n// When: the author exports it as PDF\n// Then: the PDF's title is Methods\ntest(\"TST-015 the PDF names the chapter\", () => {});\n\n// TST-016 the summary of an export reads as the chapter\n// Given: a chapter of four pages\n// When: the model summarises the exported PDF\n// Then: the summary names the chapter's three findings\n// Runs: 20\n// Paid: hub\ntest(\"TST-016 the summary of an export reads as the chapter\", () => {});\n", "/home/runner/work/thesis/thesis/agent-m/docs/participants.md": "# Participants of this instance\n\n| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |\n|---|---|---|---|---|---|---|---|\n| alice | person | — | — | — | draft text, read the repository, write to the repository | — | the GitHub account `alice` |\n| ci-dev | CI agent | claude-opus-5-5 | 200000 | — | read the repository, write to the repository, run code and tests | GitHub's machines, a provider in the USA | the workflow agent-m-job: claude on GitHub's machines |\n| gpu-dev | CI agent | codex-model | — | — | read the repository, write to the repository, run code and tests | the lab's GPU server, Erlangen | the workflow agent-m-job: codex on the runner gpu-1 |\n| cli-dev | CLI agent | claude-opus-5-5 | — | — | read the repository, write to the repository, run code and tests | this machine | the bridge on the Mac of `alice` |\n", "/home/runner/work/thesis/thesis/agent-m/src/job-harness/jobs/implement/job.json": "{\n  \"kind\": \"implement\",\n  \"mode\": \"agent\",\n  \"produces\": [\n    \"MOD\",\n    \"TST\"\n  ],\n  \"capabilities\": [\n    \"read the repository\",\n    \"write to the repository\",\n    \"run code and tests\"\n  ],\n  \"inputs\": [\n    {\n      \"name\": \"item\",\n      \"of\": \"ITM\"\n    },\n    {\n      \"name\": \"realises\",\n      \"of\": \"requirement\"\n    },\n    {\n      \"name\": \"tests\",\n      \"of\": \"TST\"\n    },\n    {\n      \"name\": \"process\",\n      \"of\": \"requirement\"\n    },\n    {\n      \"name\": \"instruction\",\n      \"of\": \"text\"\n    }\n  ],\n  \"output\": {},\n  \"checks\": [],\n  \"rounds\": 3,\n  \"result\": \"pull-request\"\n}\n", "/home/runner/work/thesis/thesis/agent-m/src/job-harness/jobs/implement/prompt.md": "Implement the backlog item below in this repository, test first: commit the tests for its acceptance criteria alone, each\nnaming the requirement it guards, then the implementation until they pass. If the item contradicts the specification or\nleaves a case open, change nothing and answer with one line that begins with QUESTION: and asks it.\n\n{{instruction}}\n\nThe item:\n\n{{item}}\n\nWhat it realises:\n\n{{realises}}\n\nThe tests that guard it now:\n\n{{tests}}\n\nThe process requirements of this product:\n\n{{process}}\n", "/home/runner/work/thesis/thesis/agent-m-out/report.json": "{\"type\":\"result\",\"subtype\":\"success\",\"is_error\":false,\"num_turns\":38,\"result\":\"The tests of ITM-014 and the export of the figures are committed.\",\"total_cost_usd\":1.8432,\"usage\":{\"input_tokens\":182344,\"output_tokens\":12850}}" },
        "fetch": [
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis" },
            "response": { "status": 200, "body": { "visibility": "private", "default_branch": "main" } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/git/ref/heads/main" },
            "response": { "status": 200, "body": { "object": { "sha": "c100000000000000000000000000000000000000" } } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/contents/docs/jobs/JOB-20261012-0800-9a9a.md?ref=c100000000000000000000000000000000000000" },
            "response": { "status": 200, "body": "---\nid: JOB-20261012-0800-9a9a\nkind: implement\nphase: Doing\nrole: Developers\nparticipant: ci-dev\nruntime: ci\nrun:\nslot:\nitem: ITM-014\nmodules:\n  - MOD-export\ninputs: []\nretry_of:\nagent_m: 2026.10.1\nmodel: claude-opus-5-5\nlog:\n---\n\n# JOB-20261012-0800-9a9a\n\n**REGISTER**\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-12T08:00:00Z | queued | — |\n| 2026-10-12T08:03:00Z | running | attempt 1 on ci-dev |\n" }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/contents/docs/jobs/cancels/JOB-20261012-0800-9a9a.md?ref=c100000000000000000000000000000000000000" },
            "response": { "status": 404, "body": { "message": "Not Found" } }
          },
          {
            "request": { "method": "GET", "url": "https://raw.githubusercontent.com/alice/agent-m/5a00000000000000000000000000000000000000/docs/process-models/kanban.md" },
            "response": { "status": 200, "body": "---\nname: kanban\nkind: pulled\nmeasure: items per state over time\nmanages: work that arrives unpredictably and must flow without long waits\naccepts: no fixed delivery date for a set of items\nsuits: maintaining a product that receives issues every week\nchapter: Vibe Coding, ch. 7 §4\n---\n# Kanban\n\nWork is pulled from the backlog as capacity frees up.\n\n## Phases\n\n| Name | Role | Produces |\n|---|---|---|\n| Backlog | Product Owner | ITM |\n| Doing | Developers | MOD, TST |\n| Done | Product Owner | the merged item |\n\n## Transitions\n\n| From | To | Kind |\n|---|---|---|\n| Backlog | Doing | sequence |\n| Doing | Done | sequence |\n\n## Verification pairs\n\n| Phase | Checked by |\n|---|---|\n\n## Gates\n\n| Between | Artifacts | Condition | Decider |\n|---|---|---|---|\n| Doing → Done | MOD | a person has read the change | Reviewer |\n\n## Roles\n\n| Name | Filled by | Capabilities |\n|---|---|---|\n| Product Owner | person | read the repository, write to the repository |\n| Developers | agent | read the repository, write to the repository, run code and tests |\n| Reviewer | person | read the repository |\n\n## Flow control\n\n| Kind | Value |\n|---|---|\n| WIP limit | 3 |\n| Time box | none |\n| Sprints | no |\n" }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/commits/c100000000000000000000000000000000000000" },
            "response": { "status": 200, "body": { "sha": "c100000000000000000000000000000000000000" } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/git/trees/c100000000000000000000000000000000000000?recursive=1" },
            "response": {
              "status": 200,
              "body": {
                "tree": [{ "path": "SPEC.md", "type": "blob", "sha": "5100000000000000000000000000000000000000" }]
              }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/pulls?state=all&per_page=100&page=1&base=main" },
            "response": {
              "status": 200,
              "body": [
                {
                  "number": 72,
                  "title": "ITM-014: Export a chapter as PDF",
                  "state": "open",
                  "draft": false,
                  "head": { "ref": "item/ITM-014", "sha": "d200000000000000000000000000000000000000" },
                  "base": { "ref": "main" },
                  "created_at": "2026-10-12T09:41:00Z",
                  "merged_at": null,
                  "closed_at": null,
                  "html_url": "https://github.com/alice/thesis/pull/72"
                }
              ]
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/pulls/72/commits?per_page=100&page=1" },
            "response": {
              "status": 200,
              "body": [
                {
                  "sha": "d200000000000000000000000000000000000000",
                  "commit": {
                    "message": "ITM-014: the export",
                    "committer": { "date": "2026-10-12T09:40:00Z" },
                    "author": { "name": "ci-dev" }
                  },
                  "author": null,
                  "parents": [{ "sha": "d100000000000000000000000000000000000000" }]
                },
                {
                  "sha": "d100000000000000000000000000000000000000",
                  "commit": {
                    "message": "ITM-014: tests for the export",
                    "committer": { "date": "2026-10-12T09:10:00Z" },
                    "author": { "name": "ci-dev" }
                  },
                  "author": null,
                  "parents": [{ "sha": "c100000000000000000000000000000000000000" }]
                }
              ]
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/commits/d100000000000000000000000000000000000000?per_page=100&page=1" },
            "response": {
              "status": 200,
              "body": {
                "sha": "d100000000000000000000000000000000000000",
                "files": [{ "filename": "tests/export.test.mjs", "status": "modified" }]
              }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/commits/d200000000000000000000000000000000000000?per_page=100&page=1" },
            "response": {
              "status": 200,
              "body": {
                "sha": "d200000000000000000000000000000000000000",
                "files": [
                  { "filename": "src/export/index.mjs", "status": "modified" },
                  { "filename": "src/export/figures.mjs", "status": "added" }
                ]
              }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/actions/runs?head_sha=d100000000000000000000000000000000000000&per_page=100" },
            "response": {
              "status": 200,
              "body": {
                "workflow_runs": [
                  { "name": "agent-m tests", "status": "completed", "conclusion": "failure", "display_title": "agent-m tests", "html_url": "https://github.com/alice/thesis/actions/runs/1" }
                ]
              }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/actions/runs?head_sha=d200000000000000000000000000000000000000&per_page=100" },
            "response": {
              "status": 200,
              "body": {
                "workflow_runs": [
                  { "name": "agent-m tests", "status": "completed", "conclusion": "success", "display_title": "agent-m tests", "html_url": "https://github.com/alice/thesis/actions/runs/1" }
                ]
              }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/git/commits/c100000000000000000000000000000000000000" },
            "response": {
              "status": 200,
              "body": {
                "sha": "c100000000000000000000000000000000000000",
                "tree": { "sha": "b500000000000000000000000000000000000000" }
              }
            }
          },
          {
            "request": {
              "method": "POST",
              "url": "https://api.github.com/repos/alice/thesis/git/trees",
              "body": {
                "base_tree": "b500000000000000000000000000000000000000",
                "tree": [
                  { "path": "docs/jobs/JOB-20261012-0800-9a9a.md", "mode": "100644", "type": "blob", "content": "---\nid: JOB-20261012-0800-9a9a\nkind: implement\nphase: Doing\nrole: Developers\nparticipant: ci-dev\nruntime: ci\nrun:\nslot:\nitem: ITM-014\nmodules:\n  - MOD-export\ninputs: []\nretry_of:\nagent_m: 2026.10.1\nmodel: claude-opus-5-5\nlog:\n---\n\n# JOB-20261012-0800-9a9a\n\n**REGISTER**\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-12T08:00:00Z | queued | — |\n| 2026-10-12T08:03:00Z | running | attempt 1 on ci-dev |\n| 2026-10-12T09:50:00Z | waiting-at-gate | Doing → Done waits for alice; attempt 1 used 182344 input and 12850 output tokens, 1.84 USD as the CLI reported |\n" }
                ]
              }
            },
            "response": { "status": 201, "body": { "sha": "c500000000000000000000000000000000000000" } }
          },
          {
            "request": {
              "method": "POST",
              "url": "https://api.github.com/repos/alice/thesis/git/commits",
              "body": {
                "message": "JOB-20261012-0800-9a9a: waiting-at-gate",
                "tree": "c500000000000000000000000000000000000000",
                "parents": ["c100000000000000000000000000000000000000"]
              }
            },
            "response": {
              "status": 201,
              "body": { "sha": "e500000000000000000000000000000000000000", "html_url": "https://github.com/alice/thesis/commit/e500000000000000000000000000000000000000" }
            }
          },
          {
            "request": {
              "method": "PATCH",
              "url": "https://api.github.com/repos/alice/thesis/git/refs/heads/main",
              "body": { "sha": "e500000000000000000000000000000000000000", "force": false }
            },
            "response": { "status": 200, "body": { "object": { "sha": "e500000000000000000000000000000000000000" } } }
          }
        ],
        "clock": "2026-10-12T09:50:00Z"
      },
      "result": { "action": "end", "state": "waiting-at-gate", "note": "Doing → Done waits for alice", "pullRequest": 72 }
    },
    {
      "name": "green, the gate passed, merged",
      "input": {
        "env": { "GITHUB_ACTIONS": "true", "GITHUB_SERVER_URL": "https://github.com", "GITHUB_REPOSITORY": "alice/thesis", "AGENT_M_HOME": "/home/runner/work/thesis/thesis/agent-m", "AGENT_M_OUT": "/home/runner/work/thesis/thesis/agent-m-out", "AGENT_M_JOB": "JOB-20261012-0800-9a9a", "AGENT_M_TOKEN": "github_pat_example", "AGENT_M_INSTANCE": "https://github.com/alice/agent-m", "AGENT_M_WAIT_MINUTES": "240" },
        "paths": ["SPEC.md", "docs/architecture/ARC-002-export.md", "docs/backlog/ITM-014-export-a-chapter-as-pdf.md", "docs/process.md", "docs/use-cases/UC-003-export-a-chapter.md", "tests/export.test.mjs"],
        "files": { "SPEC.md": "# Thesis — Specification\n\n## 1. Writing\n\n**ONE CLICK** *(PO A. Maier)*\nA decision takes one click.\n*Check:* no automatic check; at review.\n\n**NO SERVER** *(PO A. Maier)*\nThe product runs no server of its own.\n*Check:* `tests/test_no_server.py`\n\n## 2. Review\n\n**EVERY TEXT IS REVIEWED** *(PO A. Maier)*\nA document binds only once it is accepted.\n*Check:* `tests/pages.test.mjs`\n\n## 3. Export\n\n**A CHAPTER IS EXPORTED** *(PO A. Maier)*\nA chapter is exported as a PDF with its figures.\n*Check:* `tests/export.test.mjs`\n", "docs/process.md": "---\nmodel: kanban\nmodel_file: docs/process-models/kanban.md\nmodel_version: 5a00000000000000000000000000000000000000\n---\n# How the thesis tool is developed\n\n## Roles\n\n| Role | Participants |\n|---|---|\n| Product Owner | alice |\n| Developers | ci-dev, gpu-dev |\n| Reviewer | alice |\n\n## Practices\n\n- none\n", "docs/backlog/ITM-014-export-a-chapter-as-pdf.md": "---\nid: ITM-014\ntitle: Export a chapter as PDF\nkind: implementation\nrealises:\n  - A CHAPTER IS EXPORTED\n  - UC-003\nmodules:\n  - MOD-export\norigin:\n  - ISS-007\n---\n\n# ITM-014 Export a chapter as PDF\n\n**REGISTER**\n\n## Outcome\n\nAn accepted chapter is exported as a PDF with its figures.\n\n## Acceptance criteria\n\n- the PDF holds every figure of the chapter\n- the PDF is named after the chapter\n", "docs/use-cases/UC-003-export-a-chapter.md": "---\nid: UC-003\ntitle: Export a chapter\narea: writing\nactors:\n  - Author\nrealises:\n  - A CHAPTER IS EXPORTED\n---\n# UC-003 Export a chapter\n\n## Actors\n\n- **Author** — writes.\n\n## Precondition\n\n- The repository exists.\n\n## Main flow\n\n1. The author presses **Export**.\n\n## Alternative flows\n\n- **1a. No token.** GitHub's page opens.\n\n## Postcondition\n\n- The chapter is saved.\n", "docs/architecture/ARC-002-export.md": "---\nid: ARC-002\ntitle: Export\nforced_by:\n  - EVERY TEXT IS REVIEWED\n  - UC-003\n---\n# ARC-002 Export\n\n## Context\n\nThe thesis is reviewed in the browser.\n\n## Decision\n\n1. Export.\n\n## Alternatives\n\n- None.\n\n## Consequences\n\n- None.\n\n## Modules\n\n```json module\n{\"id\":\"MOD-export\",\"folder\":\"src/export/\",\"layer\":\"feature\",\"responsibility\":\"Exports chapters.\",\"realises\":[\"EVERY TEXT IS REVIEWED\"],\"owns\":[],\"uses\":[\"MOD-pages\"]}\n```\n\n```json interface\n{\"id\":\"MOD-export.run\",\"summary\":\"Exports a chapter.\",\"params\":[{\"name\":\"path\",\"type\":\"string\"}],\"result\":\"string\",\"async\":false,\"refusals\":[],\"examples\":[{\"name\":\"one\",\"input\":{\"path\":\"a.md\"},\"result\":\"a.pdf\"}]}\n```\n", "tests/export.test.mjs": "// The export of a chapter.\n//\n// Module: MOD-export\n// Guards: A CHAPTER IS EXPORTED; UC-003\n// Level: system\nimport { test } from \"node:test\";\n\n// TST-014 the PDF keeps the figures\n// Given: a chapter with two figures\n// When: the author exports it as PDF\n// Then: the PDF holds both figures\ntest(\"TST-014 the PDF keeps the figures\", () => {});\n\n// TST-015 the PDF names the chapter\n// Given: a chapter titled Methods\n// When: the author exports it as PDF\n// Then: the PDF's title is Methods\ntest(\"TST-015 the PDF names the chapter\", () => {});\n\n// TST-016 the summary of an export reads as the chapter\n// Given: a chapter of four pages\n// When: the model summarises the exported PDF\n// Then: the summary names the chapter's three findings\n// Runs: 20\n// Paid: hub\ntest(\"TST-016 the summary of an export reads as the chapter\", () => {});\n", "/home/runner/work/thesis/thesis/agent-m/docs/participants.md": "# Participants of this instance\n\n| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |\n|---|---|---|---|---|---|---|---|\n| alice | person | — | — | — | draft text, read the repository, write to the repository | — | the GitHub account `alice` |\n| ci-dev | CI agent | claude-opus-5-5 | 200000 | — | read the repository, write to the repository, run code and tests | GitHub's machines, a provider in the USA | the workflow agent-m-job: claude on GitHub's machines |\n| gpu-dev | CI agent | codex-model | — | — | read the repository, write to the repository, run code and tests | the lab's GPU server, Erlangen | the workflow agent-m-job: codex on the runner gpu-1 |\n| cli-dev | CLI agent | claude-opus-5-5 | — | — | read the repository, write to the repository, run code and tests | this machine | the bridge on the Mac of `alice` |\n", "/home/runner/work/thesis/thesis/agent-m/src/job-harness/jobs/implement/job.json": "{\n  \"kind\": \"implement\",\n  \"mode\": \"agent\",\n  \"produces\": [\n    \"MOD\",\n    \"TST\"\n  ],\n  \"capabilities\": [\n    \"read the repository\",\n    \"write to the repository\",\n    \"run code and tests\"\n  ],\n  \"inputs\": [\n    {\n      \"name\": \"item\",\n      \"of\": \"ITM\"\n    },\n    {\n      \"name\": \"realises\",\n      \"of\": \"requirement\"\n    },\n    {\n      \"name\": \"tests\",\n      \"of\": \"TST\"\n    },\n    {\n      \"name\": \"process\",\n      \"of\": \"requirement\"\n    },\n    {\n      \"name\": \"instruction\",\n      \"of\": \"text\"\n    }\n  ],\n  \"output\": {},\n  \"checks\": [],\n  \"rounds\": 3,\n  \"result\": \"pull-request\"\n}\n", "/home/runner/work/thesis/thesis/agent-m/src/job-harness/jobs/implement/prompt.md": "Implement the backlog item below in this repository, test first: commit the tests for its acceptance criteria alone, each\nnaming the requirement it guards, then the implementation until they pass. If the item contradicts the specification or\nleaves a case open, change nothing and answer with one line that begins with QUESTION: and asks it.\n\n{{instruction}}\n\nThe item:\n\n{{item}}\n\nWhat it realises:\n\n{{realises}}\n\nThe tests that guard it now:\n\n{{tests}}\n\nThe process requirements of this product:\n\n{{process}}\n", "/home/runner/work/thesis/thesis/agent-m-out/report.json": "{\"type\":\"result\",\"subtype\":\"success\",\"is_error\":false,\"num_turns\":38,\"result\":\"The tests of ITM-014 and the export of the figures are committed.\",\"total_cost_usd\":1.8432,\"usage\":{\"input_tokens\":182344,\"output_tokens\":12850}}" },
        "fetch": [
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis" },
            "response": { "status": 200, "body": { "visibility": "private", "default_branch": "main" } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/git/ref/heads/main" },
            "response": { "status": 200, "body": { "object": { "sha": "c100000000000000000000000000000000000000" } } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/contents/docs/jobs/JOB-20261012-0800-9a9a.md?ref=c100000000000000000000000000000000000000" },
            "response": { "status": 200, "body": "---\nid: JOB-20261012-0800-9a9a\nkind: implement\nphase: Doing\nrole: Developers\nparticipant: ci-dev\nruntime: ci\nrun:\nslot:\nitem: ITM-014\nmodules:\n  - MOD-export\ninputs: []\nretry_of:\nagent_m: 2026.10.1\nmodel: claude-opus-5-5\nlog:\n---\n\n# JOB-20261012-0800-9a9a\n\n**REGISTER**\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-12T08:00:00Z | queued | — |\n| 2026-10-12T08:03:00Z | running | attempt 1 on ci-dev |\n" }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/contents/docs/jobs/cancels/JOB-20261012-0800-9a9a.md?ref=c100000000000000000000000000000000000000" },
            "response": { "status": 404, "body": { "message": "Not Found" } }
          },
          {
            "request": { "method": "GET", "url": "https://raw.githubusercontent.com/alice/agent-m/5a00000000000000000000000000000000000000/docs/process-models/kanban.md" },
            "response": { "status": 200, "body": "---\nname: kanban\nkind: pulled\nmeasure: items per state over time\nmanages: work that arrives unpredictably and must flow without long waits\naccepts: no fixed delivery date for a set of items\nsuits: maintaining a product that receives issues every week\nchapter: Vibe Coding, ch. 7 §4\n---\n# Kanban\n\nWork is pulled from the backlog as capacity frees up.\n\n## Phases\n\n| Name | Role | Produces |\n|---|---|---|\n| Backlog | Product Owner | ITM |\n| Doing | Developers | MOD, TST |\n| Done | Product Owner | the merged item |\n\n## Transitions\n\n| From | To | Kind |\n|---|---|---|\n| Backlog | Doing | sequence |\n| Doing | Done | sequence |\n\n## Verification pairs\n\n| Phase | Checked by |\n|---|---|\n\n## Gates\n\n| Between | Artifacts | Condition | Decider |\n|---|---|---|---|\n| Doing → Done | MOD | a person has read the change | Reviewer |\n\n## Roles\n\n| Name | Filled by | Capabilities |\n|---|---|---|\n| Product Owner | person | read the repository, write to the repository |\n| Developers | agent | read the repository, write to the repository, run code and tests |\n| Reviewer | person | read the repository |\n\n## Flow control\n\n| Kind | Value |\n|---|---|\n| WIP limit | 3 |\n| Time box | none |\n| Sprints | no |\n" }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/commits/c100000000000000000000000000000000000000" },
            "response": { "status": 200, "body": { "sha": "c100000000000000000000000000000000000000" } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/git/trees/c100000000000000000000000000000000000000?recursive=1" },
            "response": {
              "status": 200,
              "body": {
                "tree": [
                  { "path": "SPEC.md", "type": "blob", "sha": "5100000000000000000000000000000000000000" },
                  { "path": "docs/jobs/gates/ITM-014-doing-done-d20000000000.md", "type": "blob", "sha": "5200000000000000000000000000000000000000" }
                ]
              }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/contents/docs/jobs/gates/ITM-014-doing-done-d20000000000.md?ref=c100000000000000000000000000000000000000" },
            "response": { "status": 200, "body": "gate: Doing → Done\nsubject: ITM-014\non: d200000000000000000000000000000000000000\ndecider: alice\ndecision: passed\nreason: read the export and its tests\n" }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/pulls?state=all&per_page=100&page=1&base=main" },
            "response": {
              "status": 200,
              "body": [
                {
                  "number": 72,
                  "title": "ITM-014: Export a chapter as PDF",
                  "state": "open",
                  "draft": false,
                  "head": { "ref": "item/ITM-014", "sha": "d200000000000000000000000000000000000000" },
                  "base": { "ref": "main" },
                  "created_at": "2026-10-12T09:41:00Z",
                  "merged_at": null,
                  "closed_at": null,
                  "html_url": "https://github.com/alice/thesis/pull/72"
                }
              ]
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/pulls/72/commits?per_page=100&page=1" },
            "response": {
              "status": 200,
              "body": [
                {
                  "sha": "d200000000000000000000000000000000000000",
                  "commit": {
                    "message": "ITM-014: the export",
                    "committer": { "date": "2026-10-12T09:40:00Z" },
                    "author": { "name": "ci-dev" }
                  },
                  "author": null,
                  "parents": [{ "sha": "d100000000000000000000000000000000000000" }]
                },
                {
                  "sha": "d100000000000000000000000000000000000000",
                  "commit": {
                    "message": "ITM-014: tests for the export",
                    "committer": { "date": "2026-10-12T09:10:00Z" },
                    "author": { "name": "ci-dev" }
                  },
                  "author": null,
                  "parents": [{ "sha": "c100000000000000000000000000000000000000" }]
                }
              ]
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/commits/d100000000000000000000000000000000000000?per_page=100&page=1" },
            "response": {
              "status": 200,
              "body": {
                "sha": "d100000000000000000000000000000000000000",
                "files": [{ "filename": "tests/export.test.mjs", "status": "modified" }]
              }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/commits/d200000000000000000000000000000000000000?per_page=100&page=1" },
            "response": {
              "status": 200,
              "body": {
                "sha": "d200000000000000000000000000000000000000",
                "files": [
                  { "filename": "src/export/index.mjs", "status": "modified" },
                  { "filename": "src/export/figures.mjs", "status": "added" }
                ]
              }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/actions/runs?head_sha=d100000000000000000000000000000000000000&per_page=100" },
            "response": {
              "status": 200,
              "body": {
                "workflow_runs": [
                  { "name": "agent-m tests", "status": "completed", "conclusion": "failure", "display_title": "agent-m tests", "html_url": "https://github.com/alice/thesis/actions/runs/1" }
                ]
              }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/actions/runs?head_sha=d200000000000000000000000000000000000000&per_page=100" },
            "response": {
              "status": 200,
              "body": {
                "workflow_runs": [
                  { "name": "agent-m tests", "status": "completed", "conclusion": "success", "display_title": "agent-m tests", "html_url": "https://github.com/alice/thesis/actions/runs/1" }
                ]
              }
            }
          },
          {
            "request": {
              "method": "PUT",
              "url": "https://api.github.com/repos/alice/thesis/pulls/72/merge",
              "body": { "sha": "d200000000000000000000000000000000000000", "merge_method": "merge" }
            },
            "response": {
              "status": 200,
              "body": { "sha": "f100000000000000000000000000000000000000", "merged": true }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/git/commits/f100000000000000000000000000000000000000" },
            "response": {
              "status": 200,
              "body": {
                "sha": "f100000000000000000000000000000000000000",
                "tree": { "sha": "b400000000000000000000000000000000000000" }
              }
            }
          },
          {
            "request": {
              "method": "POST",
              "url": "https://api.github.com/repos/alice/thesis/git/trees",
              "body": {
                "base_tree": "b400000000000000000000000000000000000000",
                "tree": [
                  { "path": "docs/jobs/JOB-20261012-0800-9a9a.md", "mode": "100644", "type": "blob", "content": "---\nid: JOB-20261012-0800-9a9a\nkind: implement\nphase: Doing\nrole: Developers\nparticipant: ci-dev\nruntime: ci\nrun:\nslot:\nitem: ITM-014\nmodules:\n  - MOD-export\ninputs: []\nretry_of:\nagent_m: 2026.10.1\nmodel: claude-opus-5-5\nlog:\n---\n\n# JOB-20261012-0800-9a9a\n\n**REGISTER**\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-12T08:00:00Z | queued | — |\n| 2026-10-12T08:03:00Z | running | attempt 1 on ci-dev |\n| 2026-10-12T09:50:00Z | done | pull request #72 merged into main; attempt 1 used 182344 input and 12850 output tokens, 1.84 USD as the CLI reported |\n\n## Results\n\n- https://github.com/alice/thesis/pull/72\n- merged as f100000000000000000000000000000000000000\n\n## Cost\n\n| Rounds | Cost | Input tokens | Output tokens | Minutes |\n|---|---|---|---|---|\n| 1 | 1.84 USD | 182344 | 12850 | — |\n" }
                ]
              }
            },
            "response": { "status": 201, "body": { "sha": "c400000000000000000000000000000000000000" } }
          },
          {
            "request": {
              "method": "POST",
              "url": "https://api.github.com/repos/alice/thesis/git/commits",
              "body": {
                "message": "JOB-20261012-0800-9a9a: done",
                "tree": "c400000000000000000000000000000000000000",
                "parents": ["f100000000000000000000000000000000000000"]
              }
            },
            "response": {
              "status": 201,
              "body": { "sha": "e400000000000000000000000000000000000000", "html_url": "https://github.com/alice/thesis/commit/e400000000000000000000000000000000000000" }
            }
          },
          {
            "request": {
              "method": "PATCH",
              "url": "https://api.github.com/repos/alice/thesis/git/refs/heads/main",
              "body": { "sha": "e400000000000000000000000000000000000000", "force": false }
            },
            "response": { "status": 200, "body": { "object": { "sha": "e400000000000000000000000000000000000000" } } }
          }
        ],
        "clock": "2026-10-12T09:50:00Z"
      },
      "result": { "action": "end", "state": "done", "note": "pull request #72 merged into main", "pullRequest": 72 }
    }
  ]
}
```

```json interface
{
  "id": "MOD-ci-entry.doneCheck",
  "summary": "The check \"agent-m done\" of a pull request from a job's branch — item/<item> or job/<job> —, run by its own workflow: the Definition of Done as the job's run checks it, so that a branch protection may require it of every merge, a person's too; pending while CI on the head is.",
  "params": [
    { "name": "env", "type": "CiEnv" },
    { "name": "paths", "type": "string[]" },
    { "name": "files", "type": "ReadPort" },
    { "name": "fetch", "type": "FetchPort" }
  ],
  "result": "DoneChecked",
  "async": true,
  "refusals": [
    { "code": "no-pull-request", "when": "no pull request from the branch is open" },
    { "code": "not-a-job-branch", "when": "the branch is neither item/<item> nor job/<job>" },
    { "code": "no-job", "when": "no job record names the branch's job or item" },
    { "code": "token-refused", "when": "the server refuses the token" },
    { "code": "no-access", "when": "the token lacks the permission" },
    { "code": "server-error", "when": "the server answers with another error" },
    { "code": "unreachable", "when": "no answer arrives" }
  ],
  "examples": [
    {
      "name": "ITM-014's pull request, CI green and the gate passed",
      "input": {
        "env": { "GITHUB_ACTIONS": "true", "GITHUB_SERVER_URL": "https://github.com", "GITHUB_REPOSITORY": "alice/thesis", "AGENT_M_HOME": "/home/runner/work/thesis/thesis/agent-m", "AGENT_M_OUT": "/home/runner/work/thesis/thesis/agent-m-out", "AGENT_M_JOB": "JOB-20261012-0800-9a9a", "AGENT_M_TOKEN": "github_pat_example", "AGENT_M_INSTANCE": "https://github.com/alice/agent-m", "AGENT_M_WAIT_MINUTES": "240", "AGENT_M_BRANCH": "item/ITM-014" },
        "paths": ["SPEC.md", "docs/architecture/ARC-002-export.md", "docs/backlog/ITM-014-export-a-chapter-as-pdf.md", "docs/jobs/JOB-20261012-0800-9a9a.md", "docs/process.md", "docs/use-cases/UC-003-export-a-chapter.md", "tests/export.test.mjs"],
        "files": { "SPEC.md": "# Thesis — Specification\n\n## 1. Writing\n\n**ONE CLICK** *(PO A. Maier)*\nA decision takes one click.\n*Check:* no automatic check; at review.\n\n**NO SERVER** *(PO A. Maier)*\nThe product runs no server of its own.\n*Check:* `tests/test_no_server.py`\n\n## 2. Review\n\n**EVERY TEXT IS REVIEWED** *(PO A. Maier)*\nA document binds only once it is accepted.\n*Check:* `tests/pages.test.mjs`\n\n## 3. Export\n\n**A CHAPTER IS EXPORTED** *(PO A. Maier)*\nA chapter is exported as a PDF with its figures.\n*Check:* `tests/export.test.mjs`\n", "docs/process.md": "---\nmodel: kanban\nmodel_file: docs/process-models/kanban.md\nmodel_version: 5a00000000000000000000000000000000000000\n---\n# How the thesis tool is developed\n\n## Roles\n\n| Role | Participants |\n|---|---|\n| Product Owner | alice |\n| Developers | ci-dev, gpu-dev |\n| Reviewer | alice |\n\n## Practices\n\n- none\n", "docs/backlog/ITM-014-export-a-chapter-as-pdf.md": "---\nid: ITM-014\ntitle: Export a chapter as PDF\nkind: implementation\nrealises:\n  - A CHAPTER IS EXPORTED\n  - UC-003\nmodules:\n  - MOD-export\norigin:\n  - ISS-007\n---\n\n# ITM-014 Export a chapter as PDF\n\n**REGISTER**\n\n## Outcome\n\nAn accepted chapter is exported as a PDF with its figures.\n\n## Acceptance criteria\n\n- the PDF holds every figure of the chapter\n- the PDF is named after the chapter\n", "docs/use-cases/UC-003-export-a-chapter.md": "---\nid: UC-003\ntitle: Export a chapter\narea: writing\nactors:\n  - Author\nrealises:\n  - A CHAPTER IS EXPORTED\n---\n# UC-003 Export a chapter\n\n## Actors\n\n- **Author** — writes.\n\n## Precondition\n\n- The repository exists.\n\n## Main flow\n\n1. The author presses **Export**.\n\n## Alternative flows\n\n- **1a. No token.** GitHub's page opens.\n\n## Postcondition\n\n- The chapter is saved.\n", "docs/architecture/ARC-002-export.md": "---\nid: ARC-002\ntitle: Export\nforced_by:\n  - EVERY TEXT IS REVIEWED\n  - UC-003\n---\n# ARC-002 Export\n\n## Context\n\nThe thesis is reviewed in the browser.\n\n## Decision\n\n1. Export.\n\n## Alternatives\n\n- None.\n\n## Consequences\n\n- None.\n\n## Modules\n\n```json module\n{\"id\":\"MOD-export\",\"folder\":\"src/export/\",\"layer\":\"feature\",\"responsibility\":\"Exports chapters.\",\"realises\":[\"EVERY TEXT IS REVIEWED\"],\"owns\":[],\"uses\":[\"MOD-pages\"]}\n```\n\n```json interface\n{\"id\":\"MOD-export.run\",\"summary\":\"Exports a chapter.\",\"params\":[{\"name\":\"path\",\"type\":\"string\"}],\"result\":\"string\",\"async\":false,\"refusals\":[],\"examples\":[{\"name\":\"one\",\"input\":{\"path\":\"a.md\"},\"result\":\"a.pdf\"}]}\n```\n", "tests/export.test.mjs": "// The export of a chapter.\n//\n// Module: MOD-export\n// Guards: A CHAPTER IS EXPORTED; UC-003\n// Level: system\nimport { test } from \"node:test\";\n\n// TST-014 the PDF keeps the figures\n// Given: a chapter with two figures\n// When: the author exports it as PDF\n// Then: the PDF holds both figures\ntest(\"TST-014 the PDF keeps the figures\", () => {});\n\n// TST-015 the PDF names the chapter\n// Given: a chapter titled Methods\n// When: the author exports it as PDF\n// Then: the PDF's title is Methods\ntest(\"TST-015 the PDF names the chapter\", () => {});\n\n// TST-016 the summary of an export reads as the chapter\n// Given: a chapter of four pages\n// When: the model summarises the exported PDF\n// Then: the summary names the chapter's three findings\n// Runs: 20\n// Paid: hub\ntest(\"TST-016 the summary of an export reads as the chapter\", () => {});\n", "/home/runner/work/thesis/thesis/agent-m/docs/participants.md": "# Participants of this instance\n\n| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |\n|---|---|---|---|---|---|---|---|\n| alice | person | — | — | — | draft text, read the repository, write to the repository | — | the GitHub account `alice` |\n| ci-dev | CI agent | claude-opus-5-5 | 200000 | — | read the repository, write to the repository, run code and tests | GitHub's machines, a provider in the USA | the workflow agent-m-job: claude on GitHub's machines |\n| gpu-dev | CI agent | codex-model | — | — | read the repository, write to the repository, run code and tests | the lab's GPU server, Erlangen | the workflow agent-m-job: codex on the runner gpu-1 |\n| cli-dev | CLI agent | claude-opus-5-5 | — | — | read the repository, write to the repository, run code and tests | this machine | the bridge on the Mac of `alice` |\n", "/home/runner/work/thesis/thesis/agent-m/src/job-harness/jobs/implement/job.json": "{\n  \"kind\": \"implement\",\n  \"mode\": \"agent\",\n  \"produces\": [\n    \"MOD\",\n    \"TST\"\n  ],\n  \"capabilities\": [\n    \"read the repository\",\n    \"write to the repository\",\n    \"run code and tests\"\n  ],\n  \"inputs\": [\n    {\n      \"name\": \"item\",\n      \"of\": \"ITM\"\n    },\n    {\n      \"name\": \"realises\",\n      \"of\": \"requirement\"\n    },\n    {\n      \"name\": \"tests\",\n      \"of\": \"TST\"\n    },\n    {\n      \"name\": \"process\",\n      \"of\": \"requirement\"\n    },\n    {\n      \"name\": \"instruction\",\n      \"of\": \"text\"\n    }\n  ],\n  \"output\": {},\n  \"checks\": [],\n  \"rounds\": 3,\n  \"result\": \"pull-request\"\n}\n", "/home/runner/work/thesis/thesis/agent-m/src/job-harness/jobs/implement/prompt.md": "Implement the backlog item below in this repository, test first: commit the tests for its acceptance criteria alone, each\nnaming the requirement it guards, then the implementation until they pass. If the item contradicts the specification or\nleaves a case open, change nothing and answer with one line that begins with QUESTION: and asks it.\n\n{{instruction}}\n\nThe item:\n\n{{item}}\n\nWhat it realises:\n\n{{realises}}\n\nThe tests that guard it now:\n\n{{tests}}\n\nThe process requirements of this product:\n\n{{process}}\n", "docs/jobs/JOB-20261012-0800-9a9a.md": "---\nid: JOB-20261012-0800-9a9a\nkind: implement\nphase: Doing\nrole: Developers\nparticipant: ci-dev\nruntime: ci\nrun:\nslot:\nitem: ITM-014\nmodules:\n  - MOD-export\ninputs: []\nretry_of:\nagent_m: 2026.10.1\nmodel: claude-opus-5-5\nlog:\n---\n\n# JOB-20261012-0800-9a9a\n\n**REGISTER**\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-12T08:00:00Z | queued | — |\n| 2026-10-12T08:03:00Z | running | attempt 1 on ci-dev |\n" },
        "fetch": [
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis" },
            "response": { "status": 200, "body": { "visibility": "private", "default_branch": "main" } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/pulls?state=all&per_page=100&page=1" },
            "response": {
              "status": 200,
              "body": [
                {
                  "number": 72,
                  "title": "ITM-014: Export a chapter as PDF",
                  "state": "open",
                  "draft": false,
                  "head": { "ref": "item/ITM-014", "sha": "d200000000000000000000000000000000000000" },
                  "base": { "ref": "main" },
                  "created_at": "2026-10-12T09:41:00Z",
                  "merged_at": null,
                  "closed_at": null,
                  "html_url": "https://github.com/alice/thesis/pull/72"
                }
              ]
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/git/ref/heads/main" },
            "response": { "status": 200, "body": { "object": { "sha": "c100000000000000000000000000000000000000" } } }
          },
          {
            "request": { "method": "GET", "url": "https://raw.githubusercontent.com/alice/agent-m/5a00000000000000000000000000000000000000/docs/process-models/kanban.md" },
            "response": { "status": 200, "body": "---\nname: kanban\nkind: pulled\nmeasure: items per state over time\nmanages: work that arrives unpredictably and must flow without long waits\naccepts: no fixed delivery date for a set of items\nsuits: maintaining a product that receives issues every week\nchapter: Vibe Coding, ch. 7 §4\n---\n# Kanban\n\nWork is pulled from the backlog as capacity frees up.\n\n## Phases\n\n| Name | Role | Produces |\n|---|---|---|\n| Backlog | Product Owner | ITM |\n| Doing | Developers | MOD, TST |\n| Done | Product Owner | the merged item |\n\n## Transitions\n\n| From | To | Kind |\n|---|---|---|\n| Backlog | Doing | sequence |\n| Doing | Done | sequence |\n\n## Verification pairs\n\n| Phase | Checked by |\n|---|---|\n\n## Gates\n\n| Between | Artifacts | Condition | Decider |\n|---|---|---|---|\n| Doing → Done | MOD | a person has read the change | Reviewer |\n\n## Roles\n\n| Name | Filled by | Capabilities |\n|---|---|---|\n| Product Owner | person | read the repository, write to the repository |\n| Developers | agent | read the repository, write to the repository, run code and tests |\n| Reviewer | person | read the repository |\n\n## Flow control\n\n| Kind | Value |\n|---|---|\n| WIP limit | 3 |\n| Time box | none |\n| Sprints | no |\n" }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/commits/c100000000000000000000000000000000000000" },
            "response": { "status": 200, "body": { "sha": "c100000000000000000000000000000000000000" } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/git/trees/c100000000000000000000000000000000000000?recursive=1" },
            "response": {
              "status": 200,
              "body": {
                "tree": [
                  { "path": "SPEC.md", "type": "blob", "sha": "5100000000000000000000000000000000000000" },
                  { "path": "docs/jobs/gates/ITM-014-doing-done-d20000000000.md", "type": "blob", "sha": "5200000000000000000000000000000000000000" }
                ]
              }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/contents/docs/jobs/gates/ITM-014-doing-done-d20000000000.md?ref=c100000000000000000000000000000000000000" },
            "response": { "status": 200, "body": "gate: Doing → Done\nsubject: ITM-014\non: d200000000000000000000000000000000000000\ndecider: alice\ndecision: passed\nreason: read the export and its tests\n" }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/pulls/72/commits?per_page=100&page=1" },
            "response": {
              "status": 200,
              "body": [
                {
                  "sha": "d200000000000000000000000000000000000000",
                  "commit": {
                    "message": "ITM-014: the export",
                    "committer": { "date": "2026-10-12T09:40:00Z" },
                    "author": { "name": "ci-dev" }
                  },
                  "author": null,
                  "parents": [{ "sha": "d100000000000000000000000000000000000000" }]
                },
                {
                  "sha": "d100000000000000000000000000000000000000",
                  "commit": {
                    "message": "ITM-014: tests for the export",
                    "committer": { "date": "2026-10-12T09:10:00Z" },
                    "author": { "name": "ci-dev" }
                  },
                  "author": null,
                  "parents": [{ "sha": "c100000000000000000000000000000000000000" }]
                }
              ]
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/commits/d100000000000000000000000000000000000000?per_page=100&page=1" },
            "response": {
              "status": 200,
              "body": {
                "sha": "d100000000000000000000000000000000000000",
                "files": [{ "filename": "tests/export.test.mjs", "status": "modified" }]
              }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/commits/d200000000000000000000000000000000000000?per_page=100&page=1" },
            "response": {
              "status": 200,
              "body": {
                "sha": "d200000000000000000000000000000000000000",
                "files": [
                  { "filename": "src/export/index.mjs", "status": "modified" },
                  { "filename": "src/export/figures.mjs", "status": "added" }
                ]
              }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/actions/runs?head_sha=d100000000000000000000000000000000000000&per_page=100" },
            "response": {
              "status": 200,
              "body": {
                "workflow_runs": [
                  { "name": "agent-m tests", "status": "completed", "conclusion": "failure", "display_title": "agent-m tests", "html_url": "https://github.com/alice/thesis/actions/runs/1" }
                ]
              }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/actions/runs?head_sha=d200000000000000000000000000000000000000&per_page=100" },
            "response": {
              "status": 200,
              "body": {
                "workflow_runs": [
                  { "name": "agent-m tests", "status": "completed", "conclusion": "success", "display_title": "agent-m tests", "html_url": "https://github.com/alice/thesis/actions/runs/1" }
                ]
              }
            }
          }
        ]
      },
      "result": { "pending": false, "ok": true, "failed": [] }
    },
    {
      "name": "CI still running",
      "input": {
        "env": { "GITHUB_ACTIONS": "true", "GITHUB_SERVER_URL": "https://github.com", "GITHUB_REPOSITORY": "alice/thesis", "AGENT_M_HOME": "/home/runner/work/thesis/thesis/agent-m", "AGENT_M_OUT": "/home/runner/work/thesis/thesis/agent-m-out", "AGENT_M_JOB": "JOB-20261012-0800-9a9a", "AGENT_M_TOKEN": "github_pat_example", "AGENT_M_INSTANCE": "https://github.com/alice/agent-m", "AGENT_M_WAIT_MINUTES": "240", "AGENT_M_BRANCH": "item/ITM-014" },
        "paths": ["SPEC.md", "docs/architecture/ARC-002-export.md", "docs/backlog/ITM-014-export-a-chapter-as-pdf.md", "docs/jobs/JOB-20261012-0800-9a9a.md", "docs/process.md", "docs/use-cases/UC-003-export-a-chapter.md", "tests/export.test.mjs"],
        "files": { "SPEC.md": "# Thesis — Specification\n\n## 1. Writing\n\n**ONE CLICK** *(PO A. Maier)*\nA decision takes one click.\n*Check:* no automatic check; at review.\n\n**NO SERVER** *(PO A. Maier)*\nThe product runs no server of its own.\n*Check:* `tests/test_no_server.py`\n\n## 2. Review\n\n**EVERY TEXT IS REVIEWED** *(PO A. Maier)*\nA document binds only once it is accepted.\n*Check:* `tests/pages.test.mjs`\n\n## 3. Export\n\n**A CHAPTER IS EXPORTED** *(PO A. Maier)*\nA chapter is exported as a PDF with its figures.\n*Check:* `tests/export.test.mjs`\n", "docs/process.md": "---\nmodel: kanban\nmodel_file: docs/process-models/kanban.md\nmodel_version: 5a00000000000000000000000000000000000000\n---\n# How the thesis tool is developed\n\n## Roles\n\n| Role | Participants |\n|---|---|\n| Product Owner | alice |\n| Developers | ci-dev, gpu-dev |\n| Reviewer | alice |\n\n## Practices\n\n- none\n", "docs/backlog/ITM-014-export-a-chapter-as-pdf.md": "---\nid: ITM-014\ntitle: Export a chapter as PDF\nkind: implementation\nrealises:\n  - A CHAPTER IS EXPORTED\n  - UC-003\nmodules:\n  - MOD-export\norigin:\n  - ISS-007\n---\n\n# ITM-014 Export a chapter as PDF\n\n**REGISTER**\n\n## Outcome\n\nAn accepted chapter is exported as a PDF with its figures.\n\n## Acceptance criteria\n\n- the PDF holds every figure of the chapter\n- the PDF is named after the chapter\n", "docs/use-cases/UC-003-export-a-chapter.md": "---\nid: UC-003\ntitle: Export a chapter\narea: writing\nactors:\n  - Author\nrealises:\n  - A CHAPTER IS EXPORTED\n---\n# UC-003 Export a chapter\n\n## Actors\n\n- **Author** — writes.\n\n## Precondition\n\n- The repository exists.\n\n## Main flow\n\n1. The author presses **Export**.\n\n## Alternative flows\n\n- **1a. No token.** GitHub's page opens.\n\n## Postcondition\n\n- The chapter is saved.\n", "docs/architecture/ARC-002-export.md": "---\nid: ARC-002\ntitle: Export\nforced_by:\n  - EVERY TEXT IS REVIEWED\n  - UC-003\n---\n# ARC-002 Export\n\n## Context\n\nThe thesis is reviewed in the browser.\n\n## Decision\n\n1. Export.\n\n## Alternatives\n\n- None.\n\n## Consequences\n\n- None.\n\n## Modules\n\n```json module\n{\"id\":\"MOD-export\",\"folder\":\"src/export/\",\"layer\":\"feature\",\"responsibility\":\"Exports chapters.\",\"realises\":[\"EVERY TEXT IS REVIEWED\"],\"owns\":[],\"uses\":[\"MOD-pages\"]}\n```\n\n```json interface\n{\"id\":\"MOD-export.run\",\"summary\":\"Exports a chapter.\",\"params\":[{\"name\":\"path\",\"type\":\"string\"}],\"result\":\"string\",\"async\":false,\"refusals\":[],\"examples\":[{\"name\":\"one\",\"input\":{\"path\":\"a.md\"},\"result\":\"a.pdf\"}]}\n```\n", "tests/export.test.mjs": "// The export of a chapter.\n//\n// Module: MOD-export\n// Guards: A CHAPTER IS EXPORTED; UC-003\n// Level: system\nimport { test } from \"node:test\";\n\n// TST-014 the PDF keeps the figures\n// Given: a chapter with two figures\n// When: the author exports it as PDF\n// Then: the PDF holds both figures\ntest(\"TST-014 the PDF keeps the figures\", () => {});\n\n// TST-015 the PDF names the chapter\n// Given: a chapter titled Methods\n// When: the author exports it as PDF\n// Then: the PDF's title is Methods\ntest(\"TST-015 the PDF names the chapter\", () => {});\n\n// TST-016 the summary of an export reads as the chapter\n// Given: a chapter of four pages\n// When: the model summarises the exported PDF\n// Then: the summary names the chapter's three findings\n// Runs: 20\n// Paid: hub\ntest(\"TST-016 the summary of an export reads as the chapter\", () => {});\n", "/home/runner/work/thesis/thesis/agent-m/docs/participants.md": "# Participants of this instance\n\n| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |\n|---|---|---|---|---|---|---|---|\n| alice | person | — | — | — | draft text, read the repository, write to the repository | — | the GitHub account `alice` |\n| ci-dev | CI agent | claude-opus-5-5 | 200000 | — | read the repository, write to the repository, run code and tests | GitHub's machines, a provider in the USA | the workflow agent-m-job: claude on GitHub's machines |\n| gpu-dev | CI agent | codex-model | — | — | read the repository, write to the repository, run code and tests | the lab's GPU server, Erlangen | the workflow agent-m-job: codex on the runner gpu-1 |\n| cli-dev | CLI agent | claude-opus-5-5 | — | — | read the repository, write to the repository, run code and tests | this machine | the bridge on the Mac of `alice` |\n", "/home/runner/work/thesis/thesis/agent-m/src/job-harness/jobs/implement/job.json": "{\n  \"kind\": \"implement\",\n  \"mode\": \"agent\",\n  \"produces\": [\n    \"MOD\",\n    \"TST\"\n  ],\n  \"capabilities\": [\n    \"read the repository\",\n    \"write to the repository\",\n    \"run code and tests\"\n  ],\n  \"inputs\": [\n    {\n      \"name\": \"item\",\n      \"of\": \"ITM\"\n    },\n    {\n      \"name\": \"realises\",\n      \"of\": \"requirement\"\n    },\n    {\n      \"name\": \"tests\",\n      \"of\": \"TST\"\n    },\n    {\n      \"name\": \"process\",\n      \"of\": \"requirement\"\n    },\n    {\n      \"name\": \"instruction\",\n      \"of\": \"text\"\n    }\n  ],\n  \"output\": {},\n  \"checks\": [],\n  \"rounds\": 3,\n  \"result\": \"pull-request\"\n}\n", "/home/runner/work/thesis/thesis/agent-m/src/job-harness/jobs/implement/prompt.md": "Implement the backlog item below in this repository, test first: commit the tests for its acceptance criteria alone, each\nnaming the requirement it guards, then the implementation until they pass. If the item contradicts the specification or\nleaves a case open, change nothing and answer with one line that begins with QUESTION: and asks it.\n\n{{instruction}}\n\nThe item:\n\n{{item}}\n\nWhat it realises:\n\n{{realises}}\n\nThe tests that guard it now:\n\n{{tests}}\n\nThe process requirements of this product:\n\n{{process}}\n", "docs/jobs/JOB-20261012-0800-9a9a.md": "---\nid: JOB-20261012-0800-9a9a\nkind: implement\nphase: Doing\nrole: Developers\nparticipant: ci-dev\nruntime: ci\nrun:\nslot:\nitem: ITM-014\nmodules:\n  - MOD-export\ninputs: []\nretry_of:\nagent_m: 2026.10.1\nmodel: claude-opus-5-5\nlog:\n---\n\n# JOB-20261012-0800-9a9a\n\n**REGISTER**\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-12T08:00:00Z | queued | — |\n| 2026-10-12T08:03:00Z | running | attempt 1 on ci-dev |\n" },
        "fetch": [
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis" },
            "response": { "status": 200, "body": { "visibility": "private", "default_branch": "main" } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/pulls?state=all&per_page=100&page=1" },
            "response": {
              "status": 200,
              "body": [
                {
                  "number": 72,
                  "title": "ITM-014: Export a chapter as PDF",
                  "state": "open",
                  "draft": false,
                  "head": { "ref": "item/ITM-014", "sha": "d200000000000000000000000000000000000000" },
                  "base": { "ref": "main" },
                  "created_at": "2026-10-12T09:41:00Z",
                  "merged_at": null,
                  "closed_at": null,
                  "html_url": "https://github.com/alice/thesis/pull/72"
                }
              ]
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/git/ref/heads/main" },
            "response": { "status": 200, "body": { "object": { "sha": "c100000000000000000000000000000000000000" } } }
          },
          {
            "request": { "method": "GET", "url": "https://raw.githubusercontent.com/alice/agent-m/5a00000000000000000000000000000000000000/docs/process-models/kanban.md" },
            "response": { "status": 200, "body": "---\nname: kanban\nkind: pulled\nmeasure: items per state over time\nmanages: work that arrives unpredictably and must flow without long waits\naccepts: no fixed delivery date for a set of items\nsuits: maintaining a product that receives issues every week\nchapter: Vibe Coding, ch. 7 §4\n---\n# Kanban\n\nWork is pulled from the backlog as capacity frees up.\n\n## Phases\n\n| Name | Role | Produces |\n|---|---|---|\n| Backlog | Product Owner | ITM |\n| Doing | Developers | MOD, TST |\n| Done | Product Owner | the merged item |\n\n## Transitions\n\n| From | To | Kind |\n|---|---|---|\n| Backlog | Doing | sequence |\n| Doing | Done | sequence |\n\n## Verification pairs\n\n| Phase | Checked by |\n|---|---|\n\n## Gates\n\n| Between | Artifacts | Condition | Decider |\n|---|---|---|---|\n| Doing → Done | MOD | a person has read the change | Reviewer |\n\n## Roles\n\n| Name | Filled by | Capabilities |\n|---|---|---|\n| Product Owner | person | read the repository, write to the repository |\n| Developers | agent | read the repository, write to the repository, run code and tests |\n| Reviewer | person | read the repository |\n\n## Flow control\n\n| Kind | Value |\n|---|---|\n| WIP limit | 3 |\n| Time box | none |\n| Sprints | no |\n" }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/commits/c100000000000000000000000000000000000000" },
            "response": { "status": 200, "body": { "sha": "c100000000000000000000000000000000000000" } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/git/trees/c100000000000000000000000000000000000000?recursive=1" },
            "response": {
              "status": 200,
              "body": {
                "tree": [
                  { "path": "SPEC.md", "type": "blob", "sha": "5100000000000000000000000000000000000000" },
                  { "path": "docs/jobs/gates/ITM-014-doing-done-d20000000000.md", "type": "blob", "sha": "5200000000000000000000000000000000000000" }
                ]
              }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/contents/docs/jobs/gates/ITM-014-doing-done-d20000000000.md?ref=c100000000000000000000000000000000000000" },
            "response": { "status": 200, "body": "gate: Doing → Done\nsubject: ITM-014\non: d200000000000000000000000000000000000000\ndecider: alice\ndecision: passed\nreason: read the export and its tests\n" }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/pulls/72/commits?per_page=100&page=1" },
            "response": {
              "status": 200,
              "body": [
                {
                  "sha": "d200000000000000000000000000000000000000",
                  "commit": {
                    "message": "ITM-014: the export",
                    "committer": { "date": "2026-10-12T09:40:00Z" },
                    "author": { "name": "ci-dev" }
                  },
                  "author": null,
                  "parents": [{ "sha": "d100000000000000000000000000000000000000" }]
                },
                {
                  "sha": "d100000000000000000000000000000000000000",
                  "commit": {
                    "message": "ITM-014: tests for the export",
                    "committer": { "date": "2026-10-12T09:10:00Z" },
                    "author": { "name": "ci-dev" }
                  },
                  "author": null,
                  "parents": [{ "sha": "c100000000000000000000000000000000000000" }]
                }
              ]
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/commits/d100000000000000000000000000000000000000?per_page=100&page=1" },
            "response": {
              "status": 200,
              "body": {
                "sha": "d100000000000000000000000000000000000000",
                "files": [{ "filename": "tests/export.test.mjs", "status": "modified" }]
              }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/commits/d200000000000000000000000000000000000000?per_page=100&page=1" },
            "response": {
              "status": 200,
              "body": {
                "sha": "d200000000000000000000000000000000000000",
                "files": [
                  { "filename": "src/export/index.mjs", "status": "modified" },
                  { "filename": "src/export/figures.mjs", "status": "added" }
                ]
              }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/actions/runs?head_sha=d100000000000000000000000000000000000000&per_page=100" },
            "response": {
              "status": 200,
              "body": {
                "workflow_runs": [
                  { "name": "agent-m tests", "status": "completed", "conclusion": "failure", "display_title": "agent-m tests", "html_url": "https://github.com/alice/thesis/actions/runs/1" }
                ]
              }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/actions/runs?head_sha=d200000000000000000000000000000000000000&per_page=100" },
            "response": {
              "status": 200,
              "body": {
                "workflow_runs": [
                  { "name": "agent-m tests", "status": "in_progress", "conclusion": null, "display_title": "agent-m tests", "html_url": "https://github.com/alice/thesis/actions/runs/1" }
                ]
              }
            }
          }
        ]
      },
      "result": { "pending": true, "ok": false, "failed": [] }
    },
    {
      "name": "a branch of no job",
      "input": {
        "env": { "GITHUB_ACTIONS": "true", "GITHUB_SERVER_URL": "https://github.com", "GITHUB_REPOSITORY": "alice/thesis", "AGENT_M_HOME": "/home/runner/work/thesis/thesis/agent-m", "AGENT_M_OUT": "/home/runner/work/thesis/thesis/agent-m-out", "AGENT_M_JOB": "JOB-20261012-0800-9a9a", "AGENT_M_TOKEN": "github_pat_example", "AGENT_M_INSTANCE": "https://github.com/alice/agent-m", "AGENT_M_WAIT_MINUTES": "240", "AGENT_M_BRANCH": "feature/pdf" },
        "paths": ["SPEC.md", "docs/architecture/ARC-002-export.md", "docs/backlog/ITM-014-export-a-chapter-as-pdf.md", "docs/jobs/JOB-20261012-0800-9a9a.md", "docs/process.md", "docs/use-cases/UC-003-export-a-chapter.md", "tests/export.test.mjs"],
        "files": { "SPEC.md": "# Thesis — Specification\n\n## 1. Writing\n\n**ONE CLICK** *(PO A. Maier)*\nA decision takes one click.\n*Check:* no automatic check; at review.\n\n**NO SERVER** *(PO A. Maier)*\nThe product runs no server of its own.\n*Check:* `tests/test_no_server.py`\n\n## 2. Review\n\n**EVERY TEXT IS REVIEWED** *(PO A. Maier)*\nA document binds only once it is accepted.\n*Check:* `tests/pages.test.mjs`\n\n## 3. Export\n\n**A CHAPTER IS EXPORTED** *(PO A. Maier)*\nA chapter is exported as a PDF with its figures.\n*Check:* `tests/export.test.mjs`\n", "docs/process.md": "---\nmodel: kanban\nmodel_file: docs/process-models/kanban.md\nmodel_version: 5a00000000000000000000000000000000000000\n---\n# How the thesis tool is developed\n\n## Roles\n\n| Role | Participants |\n|---|---|\n| Product Owner | alice |\n| Developers | ci-dev, gpu-dev |\n| Reviewer | alice |\n\n## Practices\n\n- none\n", "docs/backlog/ITM-014-export-a-chapter-as-pdf.md": "---\nid: ITM-014\ntitle: Export a chapter as PDF\nkind: implementation\nrealises:\n  - A CHAPTER IS EXPORTED\n  - UC-003\nmodules:\n  - MOD-export\norigin:\n  - ISS-007\n---\n\n# ITM-014 Export a chapter as PDF\n\n**REGISTER**\n\n## Outcome\n\nAn accepted chapter is exported as a PDF with its figures.\n\n## Acceptance criteria\n\n- the PDF holds every figure of the chapter\n- the PDF is named after the chapter\n", "docs/use-cases/UC-003-export-a-chapter.md": "---\nid: UC-003\ntitle: Export a chapter\narea: writing\nactors:\n  - Author\nrealises:\n  - A CHAPTER IS EXPORTED\n---\n# UC-003 Export a chapter\n\n## Actors\n\n- **Author** — writes.\n\n## Precondition\n\n- The repository exists.\n\n## Main flow\n\n1. The author presses **Export**.\n\n## Alternative flows\n\n- **1a. No token.** GitHub's page opens.\n\n## Postcondition\n\n- The chapter is saved.\n", "docs/architecture/ARC-002-export.md": "---\nid: ARC-002\ntitle: Export\nforced_by:\n  - EVERY TEXT IS REVIEWED\n  - UC-003\n---\n# ARC-002 Export\n\n## Context\n\nThe thesis is reviewed in the browser.\n\n## Decision\n\n1. Export.\n\n## Alternatives\n\n- None.\n\n## Consequences\n\n- None.\n\n## Modules\n\n```json module\n{\"id\":\"MOD-export\",\"folder\":\"src/export/\",\"layer\":\"feature\",\"responsibility\":\"Exports chapters.\",\"realises\":[\"EVERY TEXT IS REVIEWED\"],\"owns\":[],\"uses\":[\"MOD-pages\"]}\n```\n\n```json interface\n{\"id\":\"MOD-export.run\",\"summary\":\"Exports a chapter.\",\"params\":[{\"name\":\"path\",\"type\":\"string\"}],\"result\":\"string\",\"async\":false,\"refusals\":[],\"examples\":[{\"name\":\"one\",\"input\":{\"path\":\"a.md\"},\"result\":\"a.pdf\"}]}\n```\n", "tests/export.test.mjs": "// The export of a chapter.\n//\n// Module: MOD-export\n// Guards: A CHAPTER IS EXPORTED; UC-003\n// Level: system\nimport { test } from \"node:test\";\n\n// TST-014 the PDF keeps the figures\n// Given: a chapter with two figures\n// When: the author exports it as PDF\n// Then: the PDF holds both figures\ntest(\"TST-014 the PDF keeps the figures\", () => {});\n\n// TST-015 the PDF names the chapter\n// Given: a chapter titled Methods\n// When: the author exports it as PDF\n// Then: the PDF's title is Methods\ntest(\"TST-015 the PDF names the chapter\", () => {});\n\n// TST-016 the summary of an export reads as the chapter\n// Given: a chapter of four pages\n// When: the model summarises the exported PDF\n// Then: the summary names the chapter's three findings\n// Runs: 20\n// Paid: hub\ntest(\"TST-016 the summary of an export reads as the chapter\", () => {});\n", "/home/runner/work/thesis/thesis/agent-m/docs/participants.md": "# Participants of this instance\n\n| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |\n|---|---|---|---|---|---|---|---|\n| alice | person | — | — | — | draft text, read the repository, write to the repository | — | the GitHub account `alice` |\n| ci-dev | CI agent | claude-opus-5-5 | 200000 | — | read the repository, write to the repository, run code and tests | GitHub's machines, a provider in the USA | the workflow agent-m-job: claude on GitHub's machines |\n| gpu-dev | CI agent | codex-model | — | — | read the repository, write to the repository, run code and tests | the lab's GPU server, Erlangen | the workflow agent-m-job: codex on the runner gpu-1 |\n| cli-dev | CLI agent | claude-opus-5-5 | — | — | read the repository, write to the repository, run code and tests | this machine | the bridge on the Mac of `alice` |\n", "/home/runner/work/thesis/thesis/agent-m/src/job-harness/jobs/implement/job.json": "{\n  \"kind\": \"implement\",\n  \"mode\": \"agent\",\n  \"produces\": [\n    \"MOD\",\n    \"TST\"\n  ],\n  \"capabilities\": [\n    \"read the repository\",\n    \"write to the repository\",\n    \"run code and tests\"\n  ],\n  \"inputs\": [\n    {\n      \"name\": \"item\",\n      \"of\": \"ITM\"\n    },\n    {\n      \"name\": \"realises\",\n      \"of\": \"requirement\"\n    },\n    {\n      \"name\": \"tests\",\n      \"of\": \"TST\"\n    },\n    {\n      \"name\": \"process\",\n      \"of\": \"requirement\"\n    },\n    {\n      \"name\": \"instruction\",\n      \"of\": \"text\"\n    }\n  ],\n  \"output\": {},\n  \"checks\": [],\n  \"rounds\": 3,\n  \"result\": \"pull-request\"\n}\n", "/home/runner/work/thesis/thesis/agent-m/src/job-harness/jobs/implement/prompt.md": "Implement the backlog item below in this repository, test first: commit the tests for its acceptance criteria alone, each\nnaming the requirement it guards, then the implementation until they pass. If the item contradicts the specification or\nleaves a case open, change nothing and answer with one line that begins with QUESTION: and asks it.\n\n{{instruction}}\n\nThe item:\n\n{{item}}\n\nWhat it realises:\n\n{{realises}}\n\nThe tests that guard it now:\n\n{{tests}}\n\nThe process requirements of this product:\n\n{{process}}\n", "docs/jobs/JOB-20261012-0800-9a9a.md": "---\nid: JOB-20261012-0800-9a9a\nkind: implement\nphase: Doing\nrole: Developers\nparticipant: ci-dev\nruntime: ci\nrun:\nslot:\nitem: ITM-014\nmodules:\n  - MOD-export\ninputs: []\nretry_of:\nagent_m: 2026.10.1\nmodel: claude-opus-5-5\nlog:\n---\n\n# JOB-20261012-0800-9a9a\n\n**REGISTER**\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-12T08:00:00Z | queued | — |\n| 2026-10-12T08:03:00Z | running | attempt 1 on ci-dev |\n" },
        "fetch": [
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis" },
            "response": { "status": 200, "body": { "visibility": "private", "default_branch": "main" } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/thesis/pulls?state=all&per_page=100&page=1" },
            "response": {
              "status": 200,
              "body": [
                {
                  "number": 72,
                  "title": "ITM-014: Export a chapter as PDF",
                  "state": "open",
                  "draft": false,
                  "head": { "ref": "feature/pdf", "sha": "d200000000000000000000000000000000000000" },
                  "base": { "ref": "main" },
                  "created_at": "2026-10-12T09:41:00Z",
                  "merged_at": null,
                  "closed_at": null,
                  "html_url": "https://github.com/alice/thesis/pull/72"
                }
              ]
            }
          }
        ]
      },
      "refused": "not-a-job-branch"
    }
  ]
}
```

```json interface
{
  "id": "MOD-ci-entry.engineDispatch",
  "summary": "The product's engine workflow dispatched on its default branch, on the CI secret's authority: by the last step of a job's run that belongs to a run, and by the engine itself when the default branch moved on under its commit.",
  "params": [{ "name": "env", "type": "CiEnv" }, { "name": "fetch", "type": "FetchPort" }],
  "result": "EngineDispatched",
  "async": true,
  "refusals": [
    { "code": "no-token", "when": "the job's environment holds no AGENT_M_TOKEN" },
    { "code": "not-an-address", "when": "the environment names no product" },
    { "code": "token-refused", "when": "the server refuses the token" },
    { "code": "no-access", "when": "the token lacks the permission or the repository" },
    { "code": "server-error", "when": "the server answers with another error" },
    { "code": "unreachable", "when": "no answer arrives" }
  ],
  "examples": [
    {
      "name": "after a job of a run",
      "input": {
        "env": { "GITHUB_ACTIONS": "true", "GITHUB_SERVER_URL": "https://github.com", "GITHUB_REPOSITORY": "alice/notes", "AGENT_M_TOKEN": "github_pat_example", "AGENT_M_INSTANCE": "https://github.com/alice/agent-m", "AGENT_M_VERSION": "a900000000000000000000000000000000000000" },
        "fetch": [
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes" },
            "response": {
              "status": 200,
              "body": { "visibility": "private", "private": true, "default_branch": "main" }
            }
          },
          {
            "request": {
              "method": "POST",
              "url": "https://api.github.com/repos/alice/notes/actions/workflows/agent-m-engine.yml/dispatches",
              "body": { "ref": "main", "inputs": {} }
            },
            "response": { "status": 204, "body": null }
          }
        ]
      },
      "result": { "workflow": "agent-m-engine.yml", "url": "https://github.com/alice/notes/actions/workflows/agent-m-engine.yml" }
    },
    {
      "name": "no CI secret",
      "input": {
        "env": { "GITHUB_ACTIONS": "true", "GITHUB_SERVER_URL": "https://github.com", "GITHUB_REPOSITORY": "alice/notes", "AGENT_M_TOKEN": "", "AGENT_M_INSTANCE": "https://github.com/alice/agent-m", "AGENT_M_VERSION": "a900000000000000000000000000000000000000" },
        "fetch": []
      },
      "refused": "no-token"
    }
  ]
}
```

```json interface
{
  "id": "MOD-ci-entry.engine",
  "summary": "One step of every open run of the product (ARC-010 decision 5) — a stopped one's too, which starts nothing and ends as cancelled once no job of it is going —: the product read as the main page reads it (MOD-main-page.readProduct), with the CI secret's token and the texts of the checked-out tree by their blob; per run, its snapshot (MOD-process-views.runSnapshot), its next jobs (MOD-run-engine.nextJobs), each started job's runtime and model from its participant (MOD-job-runner.runtimeOf) — a slot whose participant no runtime serves waits, named —, and the files of the step (MOD-run-engine.advance); all in one commit on the head read, on the CI secret's authority; then the jobs of CI agents dispatched (MOD-main-page.runOnCi). A head that moved on dispatches the engine again, which reads the new one.",
  "params": [
    { "name": "env", "type": "CiEnv" },
    { "name": "fetch", "type": "FetchPort" },
    { "name": "clock", "type": "ClockPort" },
    { "name": "random", "type": "RandomPort" },
    { "name": "texts", "type": "StoragePort" }
  ],
  "result": "EngineStep",
  "async": true,
  "refusals": [
    { "code": "no-token", "when": "the job's environment holds no AGENT_M_TOKEN" },
    { "code": "not-an-address", "when": "the environment names no product" },
    { "code": "no-identifier", "when": "the draws give no free identifier for every job to start" },
    { "code": "token-refused", "when": "the server refuses the token" },
    { "code": "no-access", "when": "the token lacks the permission or the repository" },
    { "code": "server-error", "when": "the server answers with another error" },
    { "code": "unreachable", "when": "no answer arrives" }
  ],
  "examples": [
    {
      "name": "ITM-002 after ITM-001",
      "input": {
        "env": { "GITHUB_ACTIONS": "true", "GITHUB_SERVER_URL": "https://github.com", "GITHUB_REPOSITORY": "alice/notes", "AGENT_M_TOKEN": "github_pat_example", "AGENT_M_INSTANCE": "https://github.com/alice/agent-m", "AGENT_M_VERSION": "a900000000000000000000000000000000000000" },
        "fetch": [
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes" },
            "response": {
              "status": 200,
              "body": { "visibility": "private", "private": true, "default_branch": "main" }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/commits/main" },
            "response": { "status": 200, "body": { "sha": "e100000000000000000000000000000000000000" } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/git/trees/e100000000000000000000000000000000000000?recursive=1" },
            "response": {
              "status": 200,
              "body": {
                "tree": [
                  { "path": ".github/workflows/agent-m-tests.yml", "type": "blob", "sha": "b3afcd3b37eb3e3ba21bec807c7d033a4de257bf" },
                  { "path": "SPEC.md", "type": "blob", "sha": "fff94463cd4955ed56f1e4700570c7dbbab3b739" },
                  { "path": "docs/backlog/ITM-001-write-a-note.md", "type": "blob", "sha": "7c7715641ec5f7af328286a92582701674b52df0" },
                  { "path": "docs/backlog/ITM-002-share-a-note.md", "type": "blob", "sha": "44679da1a7befc4aa09109a97954b0c1641f7293" },
                  { "path": "docs/backlog/order.md", "type": "blob", "sha": "240d6aae125c3bf7903b6a2d4392fcc39891b4bb" },
                  { "path": "docs/backlog/sprints/sprint-01.md", "type": "blob", "sha": "64adefc3356c77cee49efde5c0fb48c1f31cef2b" },
                  { "path": "docs/jobs/JOB-20261012-0900-0a0a.md", "type": "blob", "sha": "c633da099e40b064d93bd492aac675232a710772" },
                  { "path": "docs/jobs/JOB-20261012-0901-1b1b.md", "type": "blob", "sha": "7c1848f6fa984cae04785e0ebdcafcd528e61c1b" },
                  { "path": "docs/jobs/gates/notes-sprint-planning-development-e50000000000.md", "type": "blob", "sha": "fc90f495d3412d80c8480246b6e1b47494497179" },
                  { "path": "docs/process.md", "type": "blob", "sha": "1f23b5829774f9d58652b9ae33e9bcf83c517d39" }
                ]
              }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/user" },
            "response": { "status": 200, "body": { "login": "alice" } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/agent-m" },
            "response": {
              "status": 200,
              "body": { "visibility": "public", "private": false, "default_branch": "main" }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/agent-m/contents/docs/process-models/scrum.md?ref=a900000000000000000000000000000000000000" },
            "response": { "status": 200, "body": "---\nname: scrum\nkind: pulled\nmeasure: remaining items per time box\n---\n# Scrum\n\n## Phases\n\n| Name | Role | Produces |\n|---|---|---|\n| Sprint planning | Product Owner | ITM |\n| Development | Developers | MOD, TST |\n| Sprint review | Product Owner | the review of the increment |\n\n## Transitions\n\n| From | To | Kind |\n|---|---|---|\n| Sprint planning | Development | sequence |\n| Development | Sprint review | sequence |\n| Sprint review | Sprint planning | sequence |\n\n## Gates\n\n| Between | Artifacts | Condition | Decider |\n|---|---|---|---|\n| Sprint planning → Development | ITM | the sprint's items are ready | Product Owner |\n| Development → Sprint review | MOD | CI is green | Product Owner |\n\n## Roles\n\n| Name | Filled by | Capabilities |\n|---|---|---|\n| Product Owner | person | read the repository, write to the repository |\n| Developers | agent | read the repository, write to the repository, run code and tests |\n\n## Flow control\n\n| Kind | Value |\n|---|---|\n| WIP limit | none |\n| Time box | 2 weeks |\n| Sprints | yes |\n" }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/agent-m/contents/docs/participants.md?ref=main" },
            "response": { "status": 200, "body": "# Participants of this instance\n\n| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |\n|---|---|---|---|---|---|---|---|\n| alice | person | — | — | — | draft text, read the repository, write to the repository | — | the GitHub account `alice` |\n| ci-dev | CI agent | claude-opus-5-5 | 200000 | — | read the repository, write to the repository, run code and tests | GitHub's machines, a provider in the USA | the workflow agent-m-job: claude on GitHub's machines |\n| gpu-dev | CI agent | codex-model | — | — | read the repository, write to the repository, run code and tests | the lab's GPU server, Erlangen | the workflow agent-m-job: codex on the runner gpu-1 |\n| cli-dev | CLI agent | claude-opus-5-5 | — | — | read the repository, write to the repository, run code and tests | this machine | the bridge on the Mac of `alice` |\n" }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/commits?path=docs%2Fbacklog&sha=e100000000000000000000000000000000000000&per_page=100&page=1" },
            "response": {
              "status": 200,
              "body": [
                {
                  "sha": "e500000000000000000000000000000000000000",
                  "commit": { "committer": { "date": "2026-10-04T09:00:00Z" }, "author": { "name": "alice" } },
                  "author": { "login": "alice" }
                }
              ]
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/commits/e500000000000000000000000000000000000000" },
            "response": {
              "status": 200,
              "body": {
                "sha": "e500000000000000000000000000000000000000",
                "files": [
                  { "filename": "docs/backlog/ITM-001-write-a-note.md", "status": "added" },
                  { "filename": "docs/backlog/ITM-002-share-a-note.md", "status": "added" },
                  { "filename": "docs/backlog/order.md", "status": "added" },
                  { "filename": "docs/backlog/sprints/sprint-01.md", "status": "added" }
                ]
              }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/commits?path=docs%2Fjobs%2Fgates%2Fnotes-sprint-planning-development-e50000000000.md&sha=e100000000000000000000000000000000000000&per_page=100" },
            "response": {
              "status": 200,
              "body": [
                {
                  "sha": "e800000000000000000000000000000000000000",
                  "commit": { "committer": { "date": "2026-10-04T10:00:00Z" }, "author": { "name": "alice" } },
                  "author": { "login": "alice" }
                }
              ]
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/commits?path=SPEC.md&sha=e100000000000000000000000000000000000000&per_page=100" },
            "response": {
              "status": 200,
              "body": [
                {
                  "sha": "e700000000000000000000000000000000000000",
                  "commit": { "committer": { "date": "2026-09-20T08:00:00Z" }, "author": { "name": "alice" } },
                  "author": { "login": "alice" }
                }
              ]
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/commits?path=docs%2Fprocess.md&sha=e100000000000000000000000000000000000000&per_page=100" },
            "response": {
              "status": 200,
              "body": [
                {
                  "sha": "e600000000000000000000000000000000000000",
                  "commit": { "committer": { "date": "2026-09-20T08:00:00Z" }, "author": { "name": "alice" } },
                  "author": { "login": "alice" }
                }
              ]
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/contents/docs/process.md?ref=e600000000000000000000000000000000000000" },
            "response": { "status": 200, "body": "---\nmodel: scrum\nmodel_file: docs/process-models/scrum.md\nmodel_version: a900000000000000000000000000000000000000\nsprint_close: alice\n---\n# How the thesis tool is developed\n\n## Roles\n\n| Role | Participants |\n|---|---|\n| Product Owner | alice |\n| Developers | cli-dev, ci-dev |\n\n## Branches\n\n| Phase or time box | Branch |\n|---|---|\n| Sprint | `sprint/<nn>` |\n" }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/commits?path=docs%2Fbacklog&sha=e100000000000000000000000000000000000000&per_page=1" },
            "response": {
              "status": 200,
              "body": [
                {
                  "sha": "e500000000000000000000000000000000000000",
                  "commit": { "committer": { "date": "2026-10-04T09:00:00Z" }, "author": { "name": "alice" } },
                  "author": { "login": "alice" }
                }
              ]
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/pulls?state=all&per_page=100&page=1" },
            "response": {
              "status": 200,
              "body": [
                {
                  "number": 7,
                  "title": "ITM-001: Write a note",
                  "state": "closed",
                  "draft": false,
                  "head": { "ref": "item/ITM-001", "sha": "f700000000000000000000000000000000000000" },
                  "base": { "ref": "sprint/01" },
                  "created_at": "2026-10-12T09:20:00Z",
                  "merged_at": "2026-10-12T09:40:00Z",
                  "closed_at": "2026-10-12T09:40:00Z",
                  "html_url": "https://github.com/alice/notes/pull/7"
                }
              ]
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/actions/runs?head_sha=e500000000000000000000000000000000000000&per_page=100" },
            "response": { "status": 200, "body": { "workflow_runs": [] } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/git/commits/e100000000000000000000000000000000000000" },
            "response": {
              "status": 200,
              "body": {
                "sha": "e100000000000000000000000000000000000000",
                "tree": { "sha": "e400000000000000000000000000000000000000" }
              }
            }
          },
          {
            "request": {
              "method": "POST",
              "url": "https://api.github.com/repos/alice/notes/git/trees",
              "body": {
                "base_tree": "e400000000000000000000000000000000000000",
                "tree": [
                  { "path": "docs/jobs/JOB-20261012-1000-1999.md", "mode": "100644", "type": "blob", "content": "---\nid: JOB-20261012-1000-1999\nkind: implement\nphase: Development\nrole: Developers\nparticipant: ci-dev\nruntime: ci\nrun: JOB-20261012-0900-0a0a\nslot: Development/ITM-002\nitem: ITM-002\nmodules: []\ninputs: []\nretry_of:\nagent_m: a900000000000000000000000000000000000000\nmodel: claude-opus-5-5\nlog:\n---\n\n# JOB-20261012-1000-1999\n\n**REGISTER**\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-12T10:00:00Z | queued | — |\n" },
                  { "path": "docs/jobs/JOB-20261012-0900-0a0a.md", "mode": "100644", "type": "blob", "content": "---\nid: JOB-20261012-0900-0a0a\nkind: run\nphase:\nrole:\nparticipant: alice\nruntime: browser\nrun:\nslot:\nitem:\nmodules: []\ninputs: []\nretry_of:\nagent_m: a900000000000000000000000000000000000000\nmodel:\nlog:\n---\n\n# JOB-20261012-0900-0a0a\n\n**REGISTER**\n\n## Selection\n\n- ITM-001\n- ITM-002\n\n## Limits\n\n| Jobs at once | Cost | Rounds |\n|---|---|---|\n| 2 | — | 5 |\n\n## Assignments\n\n| Role | Participant |\n|---|---|\n| Developers | ci-dev |\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-12T09:00:00Z | running | — |\n\n## Jobs\n\n- JOB-20261012-0901-1b1b\n- JOB-20261012-1000-1999\n" }
                ]
              }
            },
            "response": { "status": 201, "body": { "sha": "e300000000000000000000000000000000000000" } }
          },
          {
            "request": {
              "method": "POST",
              "url": "https://api.github.com/repos/alice/notes/git/commits",
              "body": {
                "message": "run JOB-20261012-0900-0a0a starts JOB-20261012-1000-1999",
                "tree": "e300000000000000000000000000000000000000",
                "parents": ["e100000000000000000000000000000000000000"]
              }
            },
            "response": {
              "status": 201,
              "body": { "sha": "e200000000000000000000000000000000000000", "html_url": "https://github.com/alice/notes/commit/e200000000000000000000000000000000000000" }
            }
          },
          {
            "request": {
              "method": "PATCH",
              "url": "https://api.github.com/repos/alice/notes/git/refs/heads/main",
              "body": { "sha": "e200000000000000000000000000000000000000", "force": false }
            },
            "response": { "status": 200, "body": { "object": { "sha": "e200000000000000000000000000000000000000" } } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/git/ref/heads/main" },
            "response": { "status": 200, "body": { "object": { "sha": "e200000000000000000000000000000000000000" } } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/commits/e200000000000000000000000000000000000000" },
            "response": { "status": 200, "body": { "sha": "e200000000000000000000000000000000000000" } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/git/trees/e200000000000000000000000000000000000000?recursive=1" },
            "response": {
              "status": 200,
              "body": {
                "tree": [
                  { "path": ".github/workflows/agent-m-tests.yml", "type": "blob", "sha": "b3afcd3b37eb3e3ba21bec807c7d033a4de257bf" },
                  { "path": "SPEC.md", "type": "blob", "sha": "fff94463cd4955ed56f1e4700570c7dbbab3b739" },
                  { "path": "docs/backlog/ITM-001-write-a-note.md", "type": "blob", "sha": "7c7715641ec5f7af328286a92582701674b52df0" },
                  { "path": "docs/backlog/ITM-002-share-a-note.md", "type": "blob", "sha": "44679da1a7befc4aa09109a97954b0c1641f7293" },
                  { "path": "docs/backlog/order.md", "type": "blob", "sha": "240d6aae125c3bf7903b6a2d4392fcc39891b4bb" },
                  { "path": "docs/backlog/sprints/sprint-01.md", "type": "blob", "sha": "64adefc3356c77cee49efde5c0fb48c1f31cef2b" },
                  { "path": "docs/jobs/JOB-20261012-0900-0a0a.md", "type": "blob", "sha": "c2953189a25e334a40d12724d3c69ee76c6d7def" },
                  { "path": "docs/jobs/JOB-20261012-0901-1b1b.md", "type": "blob", "sha": "7c1848f6fa984cae04785e0ebdcafcd528e61c1b" },
                  { "path": "docs/jobs/JOB-20261012-1000-1999.md", "type": "blob", "sha": "e910baddbc056ccf9c87ad1ed3e69dfbc6ac51bc" },
                  { "path": "docs/jobs/gates/notes-sprint-planning-development-e50000000000.md", "type": "blob", "sha": "fc90f495d3412d80c8480246b6e1b47494497179" },
                  { "path": "docs/process.md", "type": "blob", "sha": "1f23b5829774f9d58652b9ae33e9bcf83c517d39" }
                ]
              }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/git/blobs/c2953189a25e334a40d12724d3c69ee76c6d7def" },
            "response": {
              "status": 200,
              "body": { "encoding": "base64", "content": "LS0tCmlkOiBKT0ItMjAyNjEwMTItMDkwMC0wYTBhCmtpbmQ6IHJ1bgpwaGFzZToKcm9sZToKcGFydGljaXBhbnQ6IGFsaWNlCnJ1bnRpbWU6IGJyb3dzZXIKcnVuOgpzbG90OgppdGVtOgptb2R1bGVzOiBbXQppbnB1dHM6IFtdCnJldHJ5X29mOgphZ2VudF9tOiBhOTAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwCm1vZGVsOgpsb2c6Ci0tLQoKIyBKT0ItMjAyNjEwMTItMDkwMC0wYTBhCgoqKlJFR0lTVEVSKioKCiMjIFNlbGVjdGlvbgoKLSBJVE0tMDAxCi0gSVRNLTAwMgoKIyMgTGltaXRzCgp8IEpvYnMgYXQgb25jZSB8IENvc3QgfCBSb3VuZHMgfAp8LS0tfC0tLXwtLS18CnwgMiB8IOKAlCB8IDUgfAoKIyMgQXNzaWdubWVudHMKCnwgUm9sZSB8IFBhcnRpY2lwYW50IHwKfC0tLXwtLS18CnwgRGV2ZWxvcGVycyB8IGNpLWRldiB8CgojIyBTdGF0ZXMKCnwgQXQgfCBTdGF0ZSB8IE5vdGUgfAp8LS0tfC0tLXwtLS18CnwgMjAyNi0xMC0xMlQwOTowMDowMFogfCBydW5uaW5nIHwg4oCUIHwKCiMjIEpvYnMKCi0gSk9CLTIwMjYxMDEyLTA5MDEtMWIxYgotIEpPQi0yMDI2MTAxMi0xMDAwLTE5OTkK" }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/git/blobs/e910baddbc056ccf9c87ad1ed3e69dfbc6ac51bc" },
            "response": {
              "status": 200,
              "body": { "encoding": "base64", "content": "LS0tCmlkOiBKT0ItMjAyNjEwMTItMTAwMC0xOTk5CmtpbmQ6IGltcGxlbWVudApwaGFzZTogRGV2ZWxvcG1lbnQKcm9sZTogRGV2ZWxvcGVycwpwYXJ0aWNpcGFudDogY2ktZGV2CnJ1bnRpbWU6IGNpCnJ1bjogSk9CLTIwMjYxMDEyLTA5MDAtMGEwYQpzbG90OiBEZXZlbG9wbWVudC9JVE0tMDAyCml0ZW06IElUTS0wMDIKbW9kdWxlczogW10KaW5wdXRzOiBbXQpyZXRyeV9vZjoKYWdlbnRfbTogYTkwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMAptb2RlbDogY2xhdWRlLW9wdXMtNS01CmxvZzoKLS0tCgojIEpPQi0yMDI2MTAxMi0xMDAwLTE5OTkKCioqUkVHSVNURVIqKgoKIyMgU3RhdGVzCgp8IEF0IHwgU3RhdGUgfCBOb3RlIHwKfC0tLXwtLS18LS0tfAp8IDIwMjYtMTAtMTJUMTA6MDA6MDBaIHwgcXVldWVkIHwg4oCUIHwK" }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/actions/workflows/agent-m-job.yml/runs?per_page=100" },
            "response": { "status": 200, "body": { "workflow_runs": [] } }
          },
          {
            "request": {
              "method": "POST",
              "url": "https://api.github.com/repos/alice/notes/actions/workflows/agent-m-job.yml/dispatches",
              "body": {
                "ref": "main",
                "inputs": { "AGENT_M_JOB": "JOB-20261012-1000-1999", "AGENT_M_PARTICIPANT": "ci-dev" }
              }
            },
            "response": { "status": 204, "body": null }
          }
        ],
        "clock": "2026-10-12T10:00:00Z",
        "random": [0.1, 0.2, 0.3, 0.4, 0.5],
        "texts": { "fff94463cd4955ed56f1e4700570c7dbbab3b739": "# Notes — Specification\n\n## 1. Writing\n\n**ONE CLICK** *(PO A. Maier)*\nA decision takes one click.\n*Check:* no automatic check; at review.\n\n**NO SERVER** *(PO A. Maier)*\nThe product runs no server of its own.\n*Check:* `tests/test_no_server.py`\n", "1f23b5829774f9d58652b9ae33e9bcf83c517d39": "---\nmodel: scrum\nmodel_file: docs/process-models/scrum.md\nmodel_version: a900000000000000000000000000000000000000\nsprint_close: alice\n---\n# How the thesis tool is developed\n\n## Roles\n\n| Role | Participants |\n|---|---|\n| Product Owner | alice |\n| Developers | cli-dev, ci-dev |\n\n## Branches\n\n| Phase or time box | Branch |\n|---|---|\n| Sprint | `sprint/<nn>` |\n", "7c7715641ec5f7af328286a92582701674b52df0": "---\nid: ITM-001\ntitle: Write a note\nkind: implementation\nrealises:\n  - NO SERVER\norigin:\n  - https://github.com/alice/notes/issues/1\n---\n\n# ITM-001 Write a note\n\n**REGISTER**\n\n## Outcome\n\nThe author writes a note.\n", "44679da1a7befc4aa09109a97954b0c1641f7293": "---\nid: ITM-002\ntitle: Share a note\nkind: implementation\nrealises:\n  - NO SERVER\ndepends_on:\n  - ITM-001\norigin:\n  - https://github.com/alice/notes/issues/2\n---\n\n# ITM-002 Share a note\n\n**REGISTER**\n\n## Outcome\n\nThe author shares a note.\n", "240d6aae125c3bf7903b6a2d4392fcc39891b4bb": "# Backlog order\n\n## Order\n\n1. ITM-001\n2. ITM-002\n", "64adefc3356c77cee49efde5c0fb48c1f31cef2b": "---\nid: sprint-01\ngoal: The author writes notes\nstart: 2026-10-05\nend:\ntime_box_end: 2026-10-18\nselection:\n  - ITM-001\n  - ITM-002\ncloser: alice\nbranch: sprint/01\n---\n\n# sprint-01\n\n**REGISTER**\n\nThe author writes notes\n", "c633da099e40b064d93bd492aac675232a710772": "---\nid: JOB-20261012-0900-0a0a\nkind: run\nphase:\nrole:\nparticipant: alice\nruntime: browser\nrun:\nslot:\nitem:\nmodules: []\ninputs: []\nretry_of:\nagent_m: a900000000000000000000000000000000000000\nmodel:\nlog:\n---\n\n# JOB-20261012-0900-0a0a\n\n**REGISTER**\n\n## Selection\n\n- ITM-001\n- ITM-002\n\n## Limits\n\n| Jobs at once | Cost | Rounds |\n|---|---|---|\n| 2 | — | 5 |\n\n## Assignments\n\n| Role | Participant |\n|---|---|\n| Developers | ci-dev |\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-12T09:00:00Z | running | — |\n\n## Jobs\n\n- JOB-20261012-0901-1b1b\n", "7c1848f6fa984cae04785e0ebdcafcd528e61c1b": "---\nid: JOB-20261012-0901-1b1b\nkind: implement\nphase: Development\nrole: Developers\nparticipant: ci-dev\nruntime: ci\nrun: JOB-20261012-0900-0a0a\nslot: Development/ITM-001\nitem: ITM-001\nmodules: []\ninputs: []\nretry_of:\nagent_m: a900000000000000000000000000000000000000\nmodel: claude-opus-5-5\nlog:\n---\n\n# JOB-20261012-0901-1b1b\n\n**REGISTER**\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-12T09:01:00Z | queued | — |\n| 2026-10-12T09:02:00Z | running | attempt 1 on ci-dev |\n| 2026-10-12T09:40:00Z | done | pull request #7 merged into sprint/01 |\n\n## Results\n\n- https://github.com/alice/notes/pull/7\n\n## Cost\n\n| Rounds | Cost | Input tokens | Output tokens | Minutes |\n|---|---|---|---|---|\n| 1 | — | — | — | — |\n", "fc90f495d3412d80c8480246b6e1b47494497179": "gate: Sprint planning → Development\nsubject: notes\non: e500000000000000000000000000000000000000\ndecider: alice\ndecision: passed\nreason: the sprint's items are ready\n", "b3afcd3b37eb3e3ba21bec807c7d033a4de257bf": "# Generated by Agent M from docs/tests/schedule.md.\nname: agent-m tests\n" }
      },
      "result": {
        "commit": "e200000000000000000000000000000000000000",
        "runs": [{ "run": "JOB-20261012-0900-0a0a", "started": ["JOB-20261012-1000-1999"], "state": "", "note": "" }],
        "dispatched": ["JOB-20261012-1000-1999"],
        "refused": [],
        "moved": false
      }
    },
    {
      "name": "a product without its tests workflow: the run's CI job first",
      "input": {
        "env": { "GITHUB_ACTIONS": "true", "GITHUB_SERVER_URL": "https://github.com", "GITHUB_REPOSITORY": "alice/notes", "AGENT_M_TOKEN": "github_pat_example", "AGENT_M_INSTANCE": "https://github.com/alice/agent-m", "AGENT_M_VERSION": "a900000000000000000000000000000000000000" },
        "fetch": [
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes" },
            "response": {
              "status": 200,
              "body": { "visibility": "private", "private": true, "default_branch": "main" }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/commits/main" },
            "response": { "status": 200, "body": { "sha": "e100000000000000000000000000000000000000" } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/git/trees/e100000000000000000000000000000000000000?recursive=1" },
            "response": {
              "status": 200,
              "body": {
                "tree": [
                  { "path": ".github/workflows/agent-m-job.yml", "type": "blob", "sha": "f4d2611bb735d404cff4a6f1ec2d53195aeb3b57" },
                  { "path": "SPEC.md", "type": "blob", "sha": "fff94463cd4955ed56f1e4700570c7dbbab3b739" },
                  { "path": "docs/backlog/ITM-001-write-a-note.md", "type": "blob", "sha": "7c7715641ec5f7af328286a92582701674b52df0" },
                  { "path": "docs/backlog/ITM-002-share-a-note.md", "type": "blob", "sha": "44679da1a7befc4aa09109a97954b0c1641f7293" },
                  { "path": "docs/backlog/order.md", "type": "blob", "sha": "240d6aae125c3bf7903b6a2d4392fcc39891b4bb" },
                  { "path": "docs/backlog/sprints/sprint-01.md", "type": "blob", "sha": "64adefc3356c77cee49efde5c0fb48c1f31cef2b" },
                  { "path": "docs/jobs/JOB-20261012-0900-0a0a.md", "type": "blob", "sha": "c633da099e40b064d93bd492aac675232a710772" },
                  { "path": "docs/jobs/JOB-20261012-0901-1b1b.md", "type": "blob", "sha": "7c1848f6fa984cae04785e0ebdcafcd528e61c1b" },
                  { "path": "docs/jobs/gates/notes-sprint-planning-development-e50000000000.md", "type": "blob", "sha": "fc90f495d3412d80c8480246b6e1b47494497179" },
                  { "path": "docs/process.md", "type": "blob", "sha": "1f23b5829774f9d58652b9ae33e9bcf83c517d39" }
                ]
              }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/user" },
            "response": { "status": 200, "body": { "login": "alice" } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/agent-m" },
            "response": {
              "status": 200,
              "body": { "visibility": "public", "private": false, "default_branch": "main" }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/agent-m/contents/docs/process-models/scrum.md?ref=a900000000000000000000000000000000000000" },
            "response": { "status": 200, "body": "---\nname: scrum\nkind: pulled\nmeasure: remaining items per time box\n---\n# Scrum\n\n## Phases\n\n| Name | Role | Produces |\n|---|---|---|\n| Sprint planning | Product Owner | ITM |\n| Development | Developers | MOD, TST |\n| Sprint review | Product Owner | the review of the increment |\n\n## Transitions\n\n| From | To | Kind |\n|---|---|---|\n| Sprint planning | Development | sequence |\n| Development | Sprint review | sequence |\n| Sprint review | Sprint planning | sequence |\n\n## Gates\n\n| Between | Artifacts | Condition | Decider |\n|---|---|---|---|\n| Sprint planning → Development | ITM | the sprint's items are ready | Product Owner |\n| Development → Sprint review | MOD | CI is green | Product Owner |\n\n## Roles\n\n| Name | Filled by | Capabilities |\n|---|---|---|\n| Product Owner | person | read the repository, write to the repository |\n| Developers | agent | read the repository, write to the repository, run code and tests |\n\n## Flow control\n\n| Kind | Value |\n|---|---|\n| WIP limit | none |\n| Time box | 2 weeks |\n| Sprints | yes |\n" }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/agent-m/contents/docs/participants.md?ref=main" },
            "response": { "status": 200, "body": "# Participants of this instance\n\n| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |\n|---|---|---|---|---|---|---|---|\n| alice | person | — | — | — | draft text, read the repository, write to the repository | — | the GitHub account `alice` |\n| ci-dev | CI agent | claude-opus-5-5 | 200000 | — | read the repository, write to the repository, run code and tests | GitHub's machines, a provider in the USA | the workflow agent-m-job: claude on GitHub's machines |\n| gpu-dev | CI agent | codex-model | — | — | read the repository, write to the repository, run code and tests | the lab's GPU server, Erlangen | the workflow agent-m-job: codex on the runner gpu-1 |\n| cli-dev | CLI agent | claude-opus-5-5 | — | — | read the repository, write to the repository, run code and tests | this machine | the bridge on the Mac of `alice` |\n" }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/commits?path=docs%2Fbacklog&sha=e100000000000000000000000000000000000000&per_page=100&page=1" },
            "response": {
              "status": 200,
              "body": [
                {
                  "sha": "e500000000000000000000000000000000000000",
                  "commit": { "committer": { "date": "2026-10-04T09:00:00Z" }, "author": { "name": "alice" } },
                  "author": { "login": "alice" }
                }
              ]
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/commits/e500000000000000000000000000000000000000" },
            "response": {
              "status": 200,
              "body": {
                "sha": "e500000000000000000000000000000000000000",
                "files": [
                  { "filename": "docs/backlog/ITM-001-write-a-note.md", "status": "added" },
                  { "filename": "docs/backlog/ITM-002-share-a-note.md", "status": "added" },
                  { "filename": "docs/backlog/order.md", "status": "added" },
                  { "filename": "docs/backlog/sprints/sprint-01.md", "status": "added" }
                ]
              }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/commits?path=docs%2Fjobs%2Fgates%2Fnotes-sprint-planning-development-e50000000000.md&sha=e100000000000000000000000000000000000000&per_page=100" },
            "response": {
              "status": 200,
              "body": [
                {
                  "sha": "e800000000000000000000000000000000000000",
                  "commit": { "committer": { "date": "2026-10-04T10:00:00Z" }, "author": { "name": "alice" } },
                  "author": { "login": "alice" }
                }
              ]
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/commits?path=SPEC.md&sha=e100000000000000000000000000000000000000&per_page=100" },
            "response": {
              "status": 200,
              "body": [
                {
                  "sha": "e700000000000000000000000000000000000000",
                  "commit": { "committer": { "date": "2026-09-20T08:00:00Z" }, "author": { "name": "alice" } },
                  "author": { "login": "alice" }
                }
              ]
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/commits?path=docs%2Fprocess.md&sha=e100000000000000000000000000000000000000&per_page=100" },
            "response": {
              "status": 200,
              "body": [
                {
                  "sha": "e600000000000000000000000000000000000000",
                  "commit": { "committer": { "date": "2026-09-20T08:00:00Z" }, "author": { "name": "alice" } },
                  "author": { "login": "alice" }
                }
              ]
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/contents/docs/process.md?ref=e600000000000000000000000000000000000000" },
            "response": { "status": 200, "body": "---\nmodel: scrum\nmodel_file: docs/process-models/scrum.md\nmodel_version: a900000000000000000000000000000000000000\nsprint_close: alice\n---\n# How the thesis tool is developed\n\n## Roles\n\n| Role | Participants |\n|---|---|\n| Product Owner | alice |\n| Developers | cli-dev, ci-dev |\n\n## Branches\n\n| Phase or time box | Branch |\n|---|---|\n| Sprint | `sprint/<nn>` |\n" }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/commits?path=docs%2Fbacklog&sha=e100000000000000000000000000000000000000&per_page=1" },
            "response": {
              "status": 200,
              "body": [
                {
                  "sha": "e500000000000000000000000000000000000000",
                  "commit": { "committer": { "date": "2026-10-04T09:00:00Z" }, "author": { "name": "alice" } },
                  "author": { "login": "alice" }
                }
              ]
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/pulls?state=all&per_page=100&page=1" },
            "response": {
              "status": 200,
              "body": [
                {
                  "number": 7,
                  "title": "ITM-001: Write a note",
                  "state": "closed",
                  "draft": false,
                  "head": { "ref": "item/ITM-001", "sha": "f700000000000000000000000000000000000000" },
                  "base": { "ref": "sprint/01" },
                  "created_at": "2026-10-12T09:20:00Z",
                  "merged_at": "2026-10-12T09:40:00Z",
                  "closed_at": "2026-10-12T09:40:00Z",
                  "html_url": "https://github.com/alice/notes/pull/7"
                }
              ]
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/actions/runs?head_sha=e500000000000000000000000000000000000000&per_page=100" },
            "response": { "status": 200, "body": { "workflow_runs": [] } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/git/commits/e100000000000000000000000000000000000000" },
            "response": {
              "status": 200,
              "body": {
                "sha": "e100000000000000000000000000000000000000",
                "tree": { "sha": "e400000000000000000000000000000000000000" }
              }
            }
          },
          {
            "request": {
              "method": "POST",
              "url": "https://api.github.com/repos/alice/notes/git/trees",
              "body": {
                "base_tree": "e400000000000000000000000000000000000000",
                "tree": [
                  { "path": "docs/jobs/JOB-20261012-1000-1999.md", "mode": "100644", "type": "blob", "content": "---\nid: JOB-20261012-1000-1999\nkind: configure-ci\nphase: Development\nrole: Developers\nparticipant: ci-dev\nruntime: ci\nrun: JOB-20261012-0900-0a0a\nslot: configure-ci\nitem:\nmodules: []\ninputs: []\nretry_of:\nagent_m: a900000000000000000000000000000000000000\nmodel: claude-opus-5-5\nlog:\n---\n\n# JOB-20261012-1000-1999\n\n**REGISTER**\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-12T10:00:00Z | queued | — |\n" },
                  { "path": "docs/jobs/JOB-20261012-0900-0a0a.md", "mode": "100644", "type": "blob", "content": "---\nid: JOB-20261012-0900-0a0a\nkind: run\nphase:\nrole:\nparticipant: alice\nruntime: browser\nrun:\nslot:\nitem:\nmodules: []\ninputs: []\nretry_of:\nagent_m: a900000000000000000000000000000000000000\nmodel:\nlog:\n---\n\n# JOB-20261012-0900-0a0a\n\n**REGISTER**\n\n## Selection\n\n- ITM-001\n- ITM-002\n\n## Limits\n\n| Jobs at once | Cost | Rounds |\n|---|---|---|\n| 2 | — | 5 |\n\n## Assignments\n\n| Role | Participant |\n|---|---|\n| Developers | ci-dev |\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-12T09:00:00Z | running | — |\n\n## Jobs\n\n- JOB-20261012-0901-1b1b\n- JOB-20261012-1000-1999\n" }
                ]
              }
            },
            "response": { "status": 201, "body": { "sha": "e300000000000000000000000000000000000000" } }
          },
          {
            "request": {
              "method": "POST",
              "url": "https://api.github.com/repos/alice/notes/git/commits",
              "body": {
                "message": "run JOB-20261012-0900-0a0a starts JOB-20261012-1000-1999",
                "tree": "e300000000000000000000000000000000000000",
                "parents": ["e100000000000000000000000000000000000000"]
              }
            },
            "response": {
              "status": 201,
              "body": { "sha": "e200000000000000000000000000000000000000", "html_url": "https://github.com/alice/notes/commit/e200000000000000000000000000000000000000" }
            }
          },
          {
            "request": {
              "method": "PATCH",
              "url": "https://api.github.com/repos/alice/notes/git/refs/heads/main",
              "body": { "sha": "e200000000000000000000000000000000000000", "force": false }
            },
            "response": { "status": 200, "body": { "object": { "sha": "e200000000000000000000000000000000000000" } } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/git/ref/heads/main" },
            "response": { "status": 200, "body": { "object": { "sha": "e200000000000000000000000000000000000000" } } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/commits/e200000000000000000000000000000000000000" },
            "response": { "status": 200, "body": { "sha": "e200000000000000000000000000000000000000" } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/git/trees/e200000000000000000000000000000000000000?recursive=1" },
            "response": {
              "status": 200,
              "body": {
                "tree": [
                  { "path": ".github/workflows/agent-m-job.yml", "type": "blob", "sha": "f4d2611bb735d404cff4a6f1ec2d53195aeb3b57" },
                  { "path": "SPEC.md", "type": "blob", "sha": "fff94463cd4955ed56f1e4700570c7dbbab3b739" },
                  { "path": "docs/backlog/ITM-001-write-a-note.md", "type": "blob", "sha": "7c7715641ec5f7af328286a92582701674b52df0" },
                  { "path": "docs/backlog/ITM-002-share-a-note.md", "type": "blob", "sha": "44679da1a7befc4aa09109a97954b0c1641f7293" },
                  { "path": "docs/backlog/order.md", "type": "blob", "sha": "240d6aae125c3bf7903b6a2d4392fcc39891b4bb" },
                  { "path": "docs/backlog/sprints/sprint-01.md", "type": "blob", "sha": "64adefc3356c77cee49efde5c0fb48c1f31cef2b" },
                  { "path": "docs/jobs/JOB-20261012-0900-0a0a.md", "type": "blob", "sha": "c2953189a25e334a40d12724d3c69ee76c6d7def" },
                  { "path": "docs/jobs/JOB-20261012-0901-1b1b.md", "type": "blob", "sha": "7c1848f6fa984cae04785e0ebdcafcd528e61c1b" },
                  { "path": "docs/jobs/JOB-20261012-1000-1999.md", "type": "blob", "sha": "d19fc1aa169e2a341567828dd5384032858f3d94" },
                  { "path": "docs/jobs/gates/notes-sprint-planning-development-e50000000000.md", "type": "blob", "sha": "fc90f495d3412d80c8480246b6e1b47494497179" },
                  { "path": "docs/process.md", "type": "blob", "sha": "1f23b5829774f9d58652b9ae33e9bcf83c517d39" }
                ]
              }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/git/blobs/c2953189a25e334a40d12724d3c69ee76c6d7def" },
            "response": {
              "status": 200,
              "body": { "encoding": "base64", "content": "LS0tCmlkOiBKT0ItMjAyNjEwMTItMDkwMC0wYTBhCmtpbmQ6IHJ1bgpwaGFzZToKcm9sZToKcGFydGljaXBhbnQ6IGFsaWNlCnJ1bnRpbWU6IGJyb3dzZXIKcnVuOgpzbG90OgppdGVtOgptb2R1bGVzOiBbXQppbnB1dHM6IFtdCnJldHJ5X29mOgphZ2VudF9tOiBhOTAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwCm1vZGVsOgpsb2c6Ci0tLQoKIyBKT0ItMjAyNjEwMTItMDkwMC0wYTBhCgoqKlJFR0lTVEVSKioKCiMjIFNlbGVjdGlvbgoKLSBJVE0tMDAxCi0gSVRNLTAwMgoKIyMgTGltaXRzCgp8IEpvYnMgYXQgb25jZSB8IENvc3QgfCBSb3VuZHMgfAp8LS0tfC0tLXwtLS18CnwgMiB8IOKAlCB8IDUgfAoKIyMgQXNzaWdubWVudHMKCnwgUm9sZSB8IFBhcnRpY2lwYW50IHwKfC0tLXwtLS18CnwgRGV2ZWxvcGVycyB8IGNpLWRldiB8CgojIyBTdGF0ZXMKCnwgQXQgfCBTdGF0ZSB8IE5vdGUgfAp8LS0tfC0tLXwtLS18CnwgMjAyNi0xMC0xMlQwOTowMDowMFogfCBydW5uaW5nIHwg4oCUIHwKCiMjIEpvYnMKCi0gSk9CLTIwMjYxMDEyLTA5MDEtMWIxYgotIEpPQi0yMDI2MTAxMi0xMDAwLTE5OTkK" }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/git/blobs/d19fc1aa169e2a341567828dd5384032858f3d94" },
            "response": {
              "status": 200,
              "body": { "encoding": "base64", "content": "LS0tCmlkOiBKT0ItMjAyNjEwMTItMTAwMC0xOTk5CmtpbmQ6IGNvbmZpZ3VyZS1jaQpwaGFzZTogRGV2ZWxvcG1lbnQKcm9sZTogRGV2ZWxvcGVycwpwYXJ0aWNpcGFudDogY2ktZGV2CnJ1bnRpbWU6IGNpCnJ1bjogSk9CLTIwMjYxMDEyLTA5MDAtMGEwYQpzbG90OiBjb25maWd1cmUtY2kKaXRlbToKbW9kdWxlczogW10KaW5wdXRzOiBbXQpyZXRyeV9vZjoKYWdlbnRfbTogYTkwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMAptb2RlbDogY2xhdWRlLW9wdXMtNS01CmxvZzoKLS0tCgojIEpPQi0yMDI2MTAxMi0xMDAwLTE5OTkKCioqUkVHSVNURVIqKgoKIyMgU3RhdGVzCgp8IEF0IHwgU3RhdGUgfCBOb3RlIHwKfC0tLXwtLS18LS0tfAp8IDIwMjYtMTAtMTJUMTA6MDA6MDBaIHwgcXVldWVkIHwg4oCUIHwK" }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/actions/workflows/agent-m-job.yml/runs?per_page=100" },
            "response": { "status": 200, "body": { "workflow_runs": [] } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/git/commits/e200000000000000000000000000000000000000" },
            "response": {
              "status": 200,
              "body": {
                "sha": "e200000000000000000000000000000000000000",
                "tree": { "sha": "e300000000000000000000000000000000000000" }
              }
            }
          },
          {
            "request": {
              "method": "POST",
              "url": "https://api.github.com/repos/alice/notes/git/trees",
              "body": {
                "base_tree": "e300000000000000000000000000000000000000",
                "tree": [
                  { "path": "docs/jobs/JOB-20261012-1000-1999.md", "mode": "100644", "type": "blob", "content": "---\nid: JOB-20261012-1000-1999\nkind: configure-ci\nphase: Development\nrole: Developers\nparticipant: ci-dev\nruntime: ci\nrun: JOB-20261012-0900-0a0a\nslot: configure-ci\nitem:\nmodules: []\ninputs: []\nretry_of:\nagent_m: a900000000000000000000000000000000000000\nmodel: claude-opus-5-5\nlog:\n---\n\n# JOB-20261012-1000-1999\n\n**REGISTER**\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-12T10:00:00Z | queued | — |\n| 2026-10-12T10:00:00Z | failed | JOB-20261012-1000-1999 is a configure-ci job; the job workflow carries out implementation and refactoring jobs |\n\n## Cost\n\n| Rounds | Cost | Input tokens | Output tokens | Minutes |\n|---|---|---|---|---|\n| 0 | — | — | — | — |\n" }
                ]
              }
            },
            "response": { "status": 201, "body": { "sha": "eb00000000000000000000000000000000000000" } }
          },
          {
            "request": {
              "method": "POST",
              "url": "https://api.github.com/repos/alice/notes/git/commits",
              "body": {
                "message": "jobs refused: JOB-20261012-1000-1999",
                "tree": "eb00000000000000000000000000000000000000",
                "parents": ["e200000000000000000000000000000000000000"]
              }
            },
            "response": {
              "status": 201,
              "body": { "sha": "e900000000000000000000000000000000000000", "html_url": "https://github.com/alice/notes/commit/e900000000000000000000000000000000000000" }
            }
          },
          {
            "request": {
              "method": "PATCH",
              "url": "https://api.github.com/repos/alice/notes/git/refs/heads/main",
              "body": { "sha": "e900000000000000000000000000000000000000", "force": false }
            },
            "response": { "status": 200, "body": { "object": { "sha": "e900000000000000000000000000000000000000" } } }
          }
        ],
        "clock": "2026-10-12T10:00:00Z",
        "random": [0.1, 0.2, 0.3, 0.4, 0.5],
        "texts": { "fff94463cd4955ed56f1e4700570c7dbbab3b739": "# Notes — Specification\n\n## 1. Writing\n\n**ONE CLICK** *(PO A. Maier)*\nA decision takes one click.\n*Check:* no automatic check; at review.\n\n**NO SERVER** *(PO A. Maier)*\nThe product runs no server of its own.\n*Check:* `tests/test_no_server.py`\n", "1f23b5829774f9d58652b9ae33e9bcf83c517d39": "---\nmodel: scrum\nmodel_file: docs/process-models/scrum.md\nmodel_version: a900000000000000000000000000000000000000\nsprint_close: alice\n---\n# How the thesis tool is developed\n\n## Roles\n\n| Role | Participants |\n|---|---|\n| Product Owner | alice |\n| Developers | cli-dev, ci-dev |\n\n## Branches\n\n| Phase or time box | Branch |\n|---|---|\n| Sprint | `sprint/<nn>` |\n", "7c7715641ec5f7af328286a92582701674b52df0": "---\nid: ITM-001\ntitle: Write a note\nkind: implementation\nrealises:\n  - NO SERVER\norigin:\n  - https://github.com/alice/notes/issues/1\n---\n\n# ITM-001 Write a note\n\n**REGISTER**\n\n## Outcome\n\nThe author writes a note.\n", "44679da1a7befc4aa09109a97954b0c1641f7293": "---\nid: ITM-002\ntitle: Share a note\nkind: implementation\nrealises:\n  - NO SERVER\ndepends_on:\n  - ITM-001\norigin:\n  - https://github.com/alice/notes/issues/2\n---\n\n# ITM-002 Share a note\n\n**REGISTER**\n\n## Outcome\n\nThe author shares a note.\n", "240d6aae125c3bf7903b6a2d4392fcc39891b4bb": "# Backlog order\n\n## Order\n\n1. ITM-001\n2. ITM-002\n", "64adefc3356c77cee49efde5c0fb48c1f31cef2b": "---\nid: sprint-01\ngoal: The author writes notes\nstart: 2026-10-05\nend:\ntime_box_end: 2026-10-18\nselection:\n  - ITM-001\n  - ITM-002\ncloser: alice\nbranch: sprint/01\n---\n\n# sprint-01\n\n**REGISTER**\n\nThe author writes notes\n", "c633da099e40b064d93bd492aac675232a710772": "---\nid: JOB-20261012-0900-0a0a\nkind: run\nphase:\nrole:\nparticipant: alice\nruntime: browser\nrun:\nslot:\nitem:\nmodules: []\ninputs: []\nretry_of:\nagent_m: a900000000000000000000000000000000000000\nmodel:\nlog:\n---\n\n# JOB-20261012-0900-0a0a\n\n**REGISTER**\n\n## Selection\n\n- ITM-001\n- ITM-002\n\n## Limits\n\n| Jobs at once | Cost | Rounds |\n|---|---|---|\n| 2 | — | 5 |\n\n## Assignments\n\n| Role | Participant |\n|---|---|\n| Developers | ci-dev |\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-12T09:00:00Z | running | — |\n\n## Jobs\n\n- JOB-20261012-0901-1b1b\n", "7c1848f6fa984cae04785e0ebdcafcd528e61c1b": "---\nid: JOB-20261012-0901-1b1b\nkind: implement\nphase: Development\nrole: Developers\nparticipant: ci-dev\nruntime: ci\nrun: JOB-20261012-0900-0a0a\nslot: Development/ITM-001\nitem: ITM-001\nmodules: []\ninputs: []\nretry_of:\nagent_m: a900000000000000000000000000000000000000\nmodel: claude-opus-5-5\nlog:\n---\n\n# JOB-20261012-0901-1b1b\n\n**REGISTER**\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-12T09:01:00Z | queued | — |\n| 2026-10-12T09:02:00Z | running | attempt 1 on ci-dev |\n| 2026-10-12T09:40:00Z | done | pull request #7 merged into sprint/01 |\n\n## Results\n\n- https://github.com/alice/notes/pull/7\n\n## Cost\n\n| Rounds | Cost | Input tokens | Output tokens | Minutes |\n|---|---|---|---|---|\n| 1 | — | — | — | — |\n", "fc90f495d3412d80c8480246b6e1b47494497179": "gate: Sprint planning → Development\nsubject: notes\non: e500000000000000000000000000000000000000\ndecider: alice\ndecision: passed\nreason: the sprint's items are ready\n", "f4d2611bb735d404cff4a6f1ec2d53195aeb3b57": "# Generated by Agent M from the CI agents of the instance.\nname: agent-m job\n" }
      },
      "result": {
        "commit": "e200000000000000000000000000000000000000",
        "runs": [{ "run": "JOB-20261012-0900-0a0a", "started": ["JOB-20261012-1000-1999"], "state": "", "note": "" }],
        "dispatched": [],
        "refused": [
          { "job": "JOB-20261012-1000-1999", "reason": "JOB-20261012-1000-1999 is a configure-ci job; the job workflow carries out implementation and refactoring jobs" }
        ],
        "moved": false
      }
    },
    {
      "name": "the default branch moved on",
      "input": {
        "env": { "GITHUB_ACTIONS": "true", "GITHUB_SERVER_URL": "https://github.com", "GITHUB_REPOSITORY": "alice/notes", "AGENT_M_TOKEN": "github_pat_example", "AGENT_M_INSTANCE": "https://github.com/alice/agent-m", "AGENT_M_VERSION": "a900000000000000000000000000000000000000" },
        "fetch": [
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes" },
            "response": {
              "status": 200,
              "body": { "visibility": "private", "private": true, "default_branch": "main" }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/commits/main" },
            "response": { "status": 200, "body": { "sha": "e100000000000000000000000000000000000000" } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/git/trees/e100000000000000000000000000000000000000?recursive=1" },
            "response": {
              "status": 200,
              "body": {
                "tree": [
                  { "path": ".github/workflows/agent-m-tests.yml", "type": "blob", "sha": "b3afcd3b37eb3e3ba21bec807c7d033a4de257bf" },
                  { "path": "SPEC.md", "type": "blob", "sha": "fff94463cd4955ed56f1e4700570c7dbbab3b739" },
                  { "path": "docs/backlog/ITM-001-write-a-note.md", "type": "blob", "sha": "7c7715641ec5f7af328286a92582701674b52df0" },
                  { "path": "docs/backlog/ITM-002-share-a-note.md", "type": "blob", "sha": "44679da1a7befc4aa09109a97954b0c1641f7293" },
                  { "path": "docs/backlog/order.md", "type": "blob", "sha": "240d6aae125c3bf7903b6a2d4392fcc39891b4bb" },
                  { "path": "docs/backlog/sprints/sprint-01.md", "type": "blob", "sha": "64adefc3356c77cee49efde5c0fb48c1f31cef2b" },
                  { "path": "docs/jobs/JOB-20261012-0900-0a0a.md", "type": "blob", "sha": "c633da099e40b064d93bd492aac675232a710772" },
                  { "path": "docs/jobs/JOB-20261012-0901-1b1b.md", "type": "blob", "sha": "7c1848f6fa984cae04785e0ebdcafcd528e61c1b" },
                  { "path": "docs/jobs/gates/notes-sprint-planning-development-e50000000000.md", "type": "blob", "sha": "fc90f495d3412d80c8480246b6e1b47494497179" },
                  { "path": "docs/process.md", "type": "blob", "sha": "1f23b5829774f9d58652b9ae33e9bcf83c517d39" }
                ]
              }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/user" },
            "response": { "status": 200, "body": { "login": "alice" } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/agent-m" },
            "response": {
              "status": 200,
              "body": { "visibility": "public", "private": false, "default_branch": "main" }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/agent-m/contents/docs/process-models/scrum.md?ref=a900000000000000000000000000000000000000" },
            "response": { "status": 200, "body": "---\nname: scrum\nkind: pulled\nmeasure: remaining items per time box\n---\n# Scrum\n\n## Phases\n\n| Name | Role | Produces |\n|---|---|---|\n| Sprint planning | Product Owner | ITM |\n| Development | Developers | MOD, TST |\n| Sprint review | Product Owner | the review of the increment |\n\n## Transitions\n\n| From | To | Kind |\n|---|---|---|\n| Sprint planning | Development | sequence |\n| Development | Sprint review | sequence |\n| Sprint review | Sprint planning | sequence |\n\n## Gates\n\n| Between | Artifacts | Condition | Decider |\n|---|---|---|---|\n| Sprint planning → Development | ITM | the sprint's items are ready | Product Owner |\n| Development → Sprint review | MOD | CI is green | Product Owner |\n\n## Roles\n\n| Name | Filled by | Capabilities |\n|---|---|---|\n| Product Owner | person | read the repository, write to the repository |\n| Developers | agent | read the repository, write to the repository, run code and tests |\n\n## Flow control\n\n| Kind | Value |\n|---|---|\n| WIP limit | none |\n| Time box | 2 weeks |\n| Sprints | yes |\n" }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/agent-m/contents/docs/participants.md?ref=main" },
            "response": { "status": 200, "body": "# Participants of this instance\n\n| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |\n|---|---|---|---|---|---|---|---|\n| alice | person | — | — | — | draft text, read the repository, write to the repository | — | the GitHub account `alice` |\n| ci-dev | CI agent | claude-opus-5-5 | 200000 | — | read the repository, write to the repository, run code and tests | GitHub's machines, a provider in the USA | the workflow agent-m-job: claude on GitHub's machines |\n| gpu-dev | CI agent | codex-model | — | — | read the repository, write to the repository, run code and tests | the lab's GPU server, Erlangen | the workflow agent-m-job: codex on the runner gpu-1 |\n| cli-dev | CLI agent | claude-opus-5-5 | — | — | read the repository, write to the repository, run code and tests | this machine | the bridge on the Mac of `alice` |\n" }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/commits?path=docs%2Fbacklog&sha=e100000000000000000000000000000000000000&per_page=100&page=1" },
            "response": {
              "status": 200,
              "body": [
                {
                  "sha": "e500000000000000000000000000000000000000",
                  "commit": { "committer": { "date": "2026-10-04T09:00:00Z" }, "author": { "name": "alice" } },
                  "author": { "login": "alice" }
                }
              ]
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/commits/e500000000000000000000000000000000000000" },
            "response": {
              "status": 200,
              "body": {
                "sha": "e500000000000000000000000000000000000000",
                "files": [
                  { "filename": "docs/backlog/ITM-001-write-a-note.md", "status": "added" },
                  { "filename": "docs/backlog/ITM-002-share-a-note.md", "status": "added" },
                  { "filename": "docs/backlog/order.md", "status": "added" },
                  { "filename": "docs/backlog/sprints/sprint-01.md", "status": "added" }
                ]
              }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/commits?path=docs%2Fjobs%2Fgates%2Fnotes-sprint-planning-development-e50000000000.md&sha=e100000000000000000000000000000000000000&per_page=100" },
            "response": {
              "status": 200,
              "body": [
                {
                  "sha": "e800000000000000000000000000000000000000",
                  "commit": { "committer": { "date": "2026-10-04T10:00:00Z" }, "author": { "name": "alice" } },
                  "author": { "login": "alice" }
                }
              ]
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/commits?path=SPEC.md&sha=e100000000000000000000000000000000000000&per_page=100" },
            "response": {
              "status": 200,
              "body": [
                {
                  "sha": "e700000000000000000000000000000000000000",
                  "commit": { "committer": { "date": "2026-09-20T08:00:00Z" }, "author": { "name": "alice" } },
                  "author": { "login": "alice" }
                }
              ]
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/commits?path=docs%2Fprocess.md&sha=e100000000000000000000000000000000000000&per_page=100" },
            "response": {
              "status": 200,
              "body": [
                {
                  "sha": "e600000000000000000000000000000000000000",
                  "commit": { "committer": { "date": "2026-09-20T08:00:00Z" }, "author": { "name": "alice" } },
                  "author": { "login": "alice" }
                }
              ]
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/contents/docs/process.md?ref=e600000000000000000000000000000000000000" },
            "response": { "status": 200, "body": "---\nmodel: scrum\nmodel_file: docs/process-models/scrum.md\nmodel_version: a900000000000000000000000000000000000000\nsprint_close: alice\n---\n# How the thesis tool is developed\n\n## Roles\n\n| Role | Participants |\n|---|---|\n| Product Owner | alice |\n| Developers | cli-dev, ci-dev |\n\n## Branches\n\n| Phase or time box | Branch |\n|---|---|\n| Sprint | `sprint/<nn>` |\n" }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/commits?path=docs%2Fbacklog&sha=e100000000000000000000000000000000000000&per_page=1" },
            "response": {
              "status": 200,
              "body": [
                {
                  "sha": "e500000000000000000000000000000000000000",
                  "commit": { "committer": { "date": "2026-10-04T09:00:00Z" }, "author": { "name": "alice" } },
                  "author": { "login": "alice" }
                }
              ]
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/pulls?state=all&per_page=100&page=1" },
            "response": {
              "status": 200,
              "body": [
                {
                  "number": 7,
                  "title": "ITM-001: Write a note",
                  "state": "closed",
                  "draft": false,
                  "head": { "ref": "item/ITM-001", "sha": "f700000000000000000000000000000000000000" },
                  "base": { "ref": "sprint/01" },
                  "created_at": "2026-10-12T09:20:00Z",
                  "merged_at": "2026-10-12T09:40:00Z",
                  "closed_at": "2026-10-12T09:40:00Z",
                  "html_url": "https://github.com/alice/notes/pull/7"
                }
              ]
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/actions/runs?head_sha=e500000000000000000000000000000000000000&per_page=100" },
            "response": { "status": 200, "body": { "workflow_runs": [] } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/git/commits/e100000000000000000000000000000000000000" },
            "response": {
              "status": 200,
              "body": {
                "sha": "e100000000000000000000000000000000000000",
                "tree": { "sha": "e400000000000000000000000000000000000000" }
              }
            }
          },
          {
            "request": {
              "method": "POST",
              "url": "https://api.github.com/repos/alice/notes/git/trees",
              "body": {
                "base_tree": "e400000000000000000000000000000000000000",
                "tree": [
                  { "path": "docs/jobs/JOB-20261012-1000-1999.md", "mode": "100644", "type": "blob", "content": "---\nid: JOB-20261012-1000-1999\nkind: implement\nphase: Development\nrole: Developers\nparticipant: ci-dev\nruntime: ci\nrun: JOB-20261012-0900-0a0a\nslot: Development/ITM-002\nitem: ITM-002\nmodules: []\ninputs: []\nretry_of:\nagent_m: a900000000000000000000000000000000000000\nmodel: claude-opus-5-5\nlog:\n---\n\n# JOB-20261012-1000-1999\n\n**REGISTER**\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-12T10:00:00Z | queued | — |\n" },
                  { "path": "docs/jobs/JOB-20261012-0900-0a0a.md", "mode": "100644", "type": "blob", "content": "---\nid: JOB-20261012-0900-0a0a\nkind: run\nphase:\nrole:\nparticipant: alice\nruntime: browser\nrun:\nslot:\nitem:\nmodules: []\ninputs: []\nretry_of:\nagent_m: a900000000000000000000000000000000000000\nmodel:\nlog:\n---\n\n# JOB-20261012-0900-0a0a\n\n**REGISTER**\n\n## Selection\n\n- ITM-001\n- ITM-002\n\n## Limits\n\n| Jobs at once | Cost | Rounds |\n|---|---|---|\n| 2 | — | 5 |\n\n## Assignments\n\n| Role | Participant |\n|---|---|\n| Developers | ci-dev |\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-12T09:00:00Z | running | — |\n\n## Jobs\n\n- JOB-20261012-0901-1b1b\n- JOB-20261012-1000-1999\n" }
                ]
              }
            },
            "response": { "status": 201, "body": { "sha": "e300000000000000000000000000000000000000" } }
          },
          {
            "request": {
              "method": "POST",
              "url": "https://api.github.com/repos/alice/notes/git/commits",
              "body": {
                "message": "run JOB-20261012-0900-0a0a starts JOB-20261012-1000-1999",
                "tree": "e300000000000000000000000000000000000000",
                "parents": ["e100000000000000000000000000000000000000"]
              }
            },
            "response": {
              "status": 201,
              "body": { "sha": "e200000000000000000000000000000000000000", "html_url": "https://github.com/alice/notes/commit/e200000000000000000000000000000000000000" }
            }
          },
          {
            "request": {
              "method": "PATCH",
              "url": "https://api.github.com/repos/alice/notes/git/refs/heads/main",
              "body": { "sha": "e200000000000000000000000000000000000000", "force": false }
            },
            "response": { "status": 422, "body": { "message": "Update is not a fast forward" } }
          },
          {
            "request": {
              "method": "POST",
              "url": "https://api.github.com/repos/alice/notes/actions/workflows/agent-m-engine.yml/dispatches",
              "body": { "ref": "main", "inputs": {} }
            },
            "response": { "status": 204, "body": null }
          }
        ],
        "clock": "2026-10-12T10:00:00Z",
        "random": [0.1, 0.2, 0.3, 0.4, 0.5],
        "texts": { "fff94463cd4955ed56f1e4700570c7dbbab3b739": "# Notes — Specification\n\n## 1. Writing\n\n**ONE CLICK** *(PO A. Maier)*\nA decision takes one click.\n*Check:* no automatic check; at review.\n\n**NO SERVER** *(PO A. Maier)*\nThe product runs no server of its own.\n*Check:* `tests/test_no_server.py`\n", "1f23b5829774f9d58652b9ae33e9bcf83c517d39": "---\nmodel: scrum\nmodel_file: docs/process-models/scrum.md\nmodel_version: a900000000000000000000000000000000000000\nsprint_close: alice\n---\n# How the thesis tool is developed\n\n## Roles\n\n| Role | Participants |\n|---|---|\n| Product Owner | alice |\n| Developers | cli-dev, ci-dev |\n\n## Branches\n\n| Phase or time box | Branch |\n|---|---|\n| Sprint | `sprint/<nn>` |\n", "7c7715641ec5f7af328286a92582701674b52df0": "---\nid: ITM-001\ntitle: Write a note\nkind: implementation\nrealises:\n  - NO SERVER\norigin:\n  - https://github.com/alice/notes/issues/1\n---\n\n# ITM-001 Write a note\n\n**REGISTER**\n\n## Outcome\n\nThe author writes a note.\n", "44679da1a7befc4aa09109a97954b0c1641f7293": "---\nid: ITM-002\ntitle: Share a note\nkind: implementation\nrealises:\n  - NO SERVER\ndepends_on:\n  - ITM-001\norigin:\n  - https://github.com/alice/notes/issues/2\n---\n\n# ITM-002 Share a note\n\n**REGISTER**\n\n## Outcome\n\nThe author shares a note.\n", "240d6aae125c3bf7903b6a2d4392fcc39891b4bb": "# Backlog order\n\n## Order\n\n1. ITM-001\n2. ITM-002\n", "64adefc3356c77cee49efde5c0fb48c1f31cef2b": "---\nid: sprint-01\ngoal: The author writes notes\nstart: 2026-10-05\nend:\ntime_box_end: 2026-10-18\nselection:\n  - ITM-001\n  - ITM-002\ncloser: alice\nbranch: sprint/01\n---\n\n# sprint-01\n\n**REGISTER**\n\nThe author writes notes\n", "c633da099e40b064d93bd492aac675232a710772": "---\nid: JOB-20261012-0900-0a0a\nkind: run\nphase:\nrole:\nparticipant: alice\nruntime: browser\nrun:\nslot:\nitem:\nmodules: []\ninputs: []\nretry_of:\nagent_m: a900000000000000000000000000000000000000\nmodel:\nlog:\n---\n\n# JOB-20261012-0900-0a0a\n\n**REGISTER**\n\n## Selection\n\n- ITM-001\n- ITM-002\n\n## Limits\n\n| Jobs at once | Cost | Rounds |\n|---|---|---|\n| 2 | — | 5 |\n\n## Assignments\n\n| Role | Participant |\n|---|---|\n| Developers | ci-dev |\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-12T09:00:00Z | running | — |\n\n## Jobs\n\n- JOB-20261012-0901-1b1b\n", "7c1848f6fa984cae04785e0ebdcafcd528e61c1b": "---\nid: JOB-20261012-0901-1b1b\nkind: implement\nphase: Development\nrole: Developers\nparticipant: ci-dev\nruntime: ci\nrun: JOB-20261012-0900-0a0a\nslot: Development/ITM-001\nitem: ITM-001\nmodules: []\ninputs: []\nretry_of:\nagent_m: a900000000000000000000000000000000000000\nmodel: claude-opus-5-5\nlog:\n---\n\n# JOB-20261012-0901-1b1b\n\n**REGISTER**\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-12T09:01:00Z | queued | — |\n| 2026-10-12T09:02:00Z | running | attempt 1 on ci-dev |\n| 2026-10-12T09:40:00Z | done | pull request #7 merged into sprint/01 |\n\n## Results\n\n- https://github.com/alice/notes/pull/7\n\n## Cost\n\n| Rounds | Cost | Input tokens | Output tokens | Minutes |\n|---|---|---|---|---|\n| 1 | — | — | — | — |\n", "fc90f495d3412d80c8480246b6e1b47494497179": "gate: Sprint planning → Development\nsubject: notes\non: e500000000000000000000000000000000000000\ndecider: alice\ndecision: passed\nreason: the sprint's items are ready\n", "b3afcd3b37eb3e3ba21bec807c7d033a4de257bf": "# Generated by Agent M from docs/tests/schedule.md.\nname: agent-m tests\n" }
      },
      "result": { "commit": "", "runs": [], "dispatched": [], "refused": [], "moved": true }
    },
    {
      "name": "a stopped run whose jobs ended",
      "input": {
        "env": { "GITHUB_ACTIONS": "true", "GITHUB_SERVER_URL": "https://github.com", "GITHUB_REPOSITORY": "alice/notes", "AGENT_M_TOKEN": "github_pat_example", "AGENT_M_INSTANCE": "https://github.com/alice/agent-m", "AGENT_M_VERSION": "a900000000000000000000000000000000000000" },
        "fetch": [
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes" },
            "response": {
              "status": 200,
              "body": { "visibility": "private", "private": true, "default_branch": "main" }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/commits/main" },
            "response": { "status": 200, "body": { "sha": "e100000000000000000000000000000000000000" } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/git/trees/e100000000000000000000000000000000000000?recursive=1" },
            "response": {
              "status": 200,
              "body": {
                "tree": [
                  { "path": ".github/workflows/agent-m-tests.yml", "type": "blob", "sha": "b3afcd3b37eb3e3ba21bec807c7d033a4de257bf" },
                  { "path": "SPEC.md", "type": "blob", "sha": "fff94463cd4955ed56f1e4700570c7dbbab3b739" },
                  { "path": "docs/backlog/ITM-001-write-a-note.md", "type": "blob", "sha": "7c7715641ec5f7af328286a92582701674b52df0" },
                  { "path": "docs/backlog/ITM-002-share-a-note.md", "type": "blob", "sha": "44679da1a7befc4aa09109a97954b0c1641f7293" },
                  { "path": "docs/backlog/order.md", "type": "blob", "sha": "240d6aae125c3bf7903b6a2d4392fcc39891b4bb" },
                  { "path": "docs/backlog/sprints/sprint-01.md", "type": "blob", "sha": "64adefc3356c77cee49efde5c0fb48c1f31cef2b" },
                  { "path": "docs/jobs/JOB-20261012-0900-0a0a.md", "type": "blob", "sha": "c633da099e40b064d93bd492aac675232a710772" },
                  { "path": "docs/jobs/JOB-20261012-0901-1b1b.md", "type": "blob", "sha": "7c1848f6fa984cae04785e0ebdcafcd528e61c1b" },
                  { "path": "docs/jobs/cancels/JOB-20261012-0900-0a0a.md", "type": "blob", "sha": "2b12000f158c31bcad0589925a6d23b2034953e7" },
                  { "path": "docs/jobs/gates/notes-sprint-planning-development-e50000000000.md", "type": "blob", "sha": "fc90f495d3412d80c8480246b6e1b47494497179" },
                  { "path": "docs/process.md", "type": "blob", "sha": "1f23b5829774f9d58652b9ae33e9bcf83c517d39" }
                ]
              }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/user" },
            "response": { "status": 200, "body": { "login": "alice" } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/agent-m" },
            "response": {
              "status": 200,
              "body": { "visibility": "public", "private": false, "default_branch": "main" }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/agent-m/contents/docs/process-models/scrum.md?ref=a900000000000000000000000000000000000000" },
            "response": { "status": 200, "body": "---\nname: scrum\nkind: pulled\nmeasure: remaining items per time box\n---\n# Scrum\n\n## Phases\n\n| Name | Role | Produces |\n|---|---|---|\n| Sprint planning | Product Owner | ITM |\n| Development | Developers | MOD, TST |\n| Sprint review | Product Owner | the review of the increment |\n\n## Transitions\n\n| From | To | Kind |\n|---|---|---|\n| Sprint planning | Development | sequence |\n| Development | Sprint review | sequence |\n| Sprint review | Sprint planning | sequence |\n\n## Gates\n\n| Between | Artifacts | Condition | Decider |\n|---|---|---|---|\n| Sprint planning → Development | ITM | the sprint's items are ready | Product Owner |\n| Development → Sprint review | MOD | CI is green | Product Owner |\n\n## Roles\n\n| Name | Filled by | Capabilities |\n|---|---|---|\n| Product Owner | person | read the repository, write to the repository |\n| Developers | agent | read the repository, write to the repository, run code and tests |\n\n## Flow control\n\n| Kind | Value |\n|---|---|\n| WIP limit | none |\n| Time box | 2 weeks |\n| Sprints | yes |\n" }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/agent-m/contents/docs/participants.md?ref=main" },
            "response": { "status": 200, "body": "# Participants of this instance\n\n| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |\n|---|---|---|---|---|---|---|---|\n| alice | person | — | — | — | draft text, read the repository, write to the repository | — | the GitHub account `alice` |\n| ci-dev | CI agent | claude-opus-5-5 | 200000 | — | read the repository, write to the repository, run code and tests | GitHub's machines, a provider in the USA | the workflow agent-m-job: claude on GitHub's machines |\n| gpu-dev | CI agent | codex-model | — | — | read the repository, write to the repository, run code and tests | the lab's GPU server, Erlangen | the workflow agent-m-job: codex on the runner gpu-1 |\n| cli-dev | CLI agent | claude-opus-5-5 | — | — | read the repository, write to the repository, run code and tests | this machine | the bridge on the Mac of `alice` |\n" }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/commits?path=docs%2Fbacklog&sha=e100000000000000000000000000000000000000&per_page=100&page=1" },
            "response": {
              "status": 200,
              "body": [
                {
                  "sha": "e500000000000000000000000000000000000000",
                  "commit": { "committer": { "date": "2026-10-04T09:00:00Z" }, "author": { "name": "alice" } },
                  "author": { "login": "alice" }
                }
              ]
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/commits/e500000000000000000000000000000000000000" },
            "response": {
              "status": 200,
              "body": {
                "sha": "e500000000000000000000000000000000000000",
                "files": [
                  { "filename": "docs/backlog/ITM-001-write-a-note.md", "status": "added" },
                  { "filename": "docs/backlog/ITM-002-share-a-note.md", "status": "added" },
                  { "filename": "docs/backlog/order.md", "status": "added" },
                  { "filename": "docs/backlog/sprints/sprint-01.md", "status": "added" }
                ]
              }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/commits?path=docs%2Fjobs%2Fgates%2Fnotes-sprint-planning-development-e50000000000.md&sha=e100000000000000000000000000000000000000&per_page=100" },
            "response": {
              "status": 200,
              "body": [
                {
                  "sha": "e800000000000000000000000000000000000000",
                  "commit": { "committer": { "date": "2026-10-04T10:00:00Z" }, "author": { "name": "alice" } },
                  "author": { "login": "alice" }
                }
              ]
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/commits?path=SPEC.md&sha=e100000000000000000000000000000000000000&per_page=100" },
            "response": {
              "status": 200,
              "body": [
                {
                  "sha": "e700000000000000000000000000000000000000",
                  "commit": { "committer": { "date": "2026-09-20T08:00:00Z" }, "author": { "name": "alice" } },
                  "author": { "login": "alice" }
                }
              ]
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/commits?path=docs%2Fprocess.md&sha=e100000000000000000000000000000000000000&per_page=100" },
            "response": {
              "status": 200,
              "body": [
                {
                  "sha": "e600000000000000000000000000000000000000",
                  "commit": { "committer": { "date": "2026-09-20T08:00:00Z" }, "author": { "name": "alice" } },
                  "author": { "login": "alice" }
                }
              ]
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/contents/docs/process.md?ref=e600000000000000000000000000000000000000" },
            "response": { "status": 200, "body": "---\nmodel: scrum\nmodel_file: docs/process-models/scrum.md\nmodel_version: a900000000000000000000000000000000000000\nsprint_close: alice\n---\n# How the thesis tool is developed\n\n## Roles\n\n| Role | Participants |\n|---|---|\n| Product Owner | alice |\n| Developers | cli-dev, ci-dev |\n\n## Branches\n\n| Phase or time box | Branch |\n|---|---|\n| Sprint | `sprint/<nn>` |\n" }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/commits?path=docs%2Fbacklog&sha=e100000000000000000000000000000000000000&per_page=1" },
            "response": {
              "status": 200,
              "body": [
                {
                  "sha": "e500000000000000000000000000000000000000",
                  "commit": { "committer": { "date": "2026-10-04T09:00:00Z" }, "author": { "name": "alice" } },
                  "author": { "login": "alice" }
                }
              ]
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/pulls?state=all&per_page=100&page=1" },
            "response": {
              "status": 200,
              "body": [
                {
                  "number": 7,
                  "title": "ITM-001: Write a note",
                  "state": "closed",
                  "draft": false,
                  "head": { "ref": "item/ITM-001", "sha": "f700000000000000000000000000000000000000" },
                  "base": { "ref": "sprint/01" },
                  "created_at": "2026-10-12T09:20:00Z",
                  "merged_at": "2026-10-12T09:40:00Z",
                  "closed_at": "2026-10-12T09:40:00Z",
                  "html_url": "https://github.com/alice/notes/pull/7"
                }
              ]
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/actions/runs?head_sha=e500000000000000000000000000000000000000&per_page=100" },
            "response": { "status": 200, "body": { "workflow_runs": [] } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/git/commits/e100000000000000000000000000000000000000" },
            "response": {
              "status": 200,
              "body": {
                "sha": "e100000000000000000000000000000000000000",
                "tree": { "sha": "e400000000000000000000000000000000000000" }
              }
            }
          },
          {
            "request": {
              "method": "POST",
              "url": "https://api.github.com/repos/alice/notes/git/trees",
              "body": {
                "base_tree": "e400000000000000000000000000000000000000",
                "tree": [
                  { "path": "docs/jobs/JOB-20261012-0900-0a0a.md", "mode": "100644", "type": "blob", "content": "---\nid: JOB-20261012-0900-0a0a\nkind: run\nphase:\nrole:\nparticipant: alice\nruntime: browser\nrun:\nslot:\nitem:\nmodules: []\ninputs: []\nretry_of:\nagent_m: a900000000000000000000000000000000000000\nmodel:\nlog:\n---\n\n# JOB-20261012-0900-0a0a\n\n**REGISTER**\n\n## Selection\n\n- ITM-001\n- ITM-002\n\n## Limits\n\n| Jobs at once | Cost | Rounds |\n|---|---|---|\n| 2 | — | 5 |\n\n## Assignments\n\n| Role | Participant |\n|---|---|\n| Developers | ci-dev |\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-12T09:00:00Z | running | — |\n| 2026-10-12T10:00:00Z | cancelled | stopped by alice |\n\n## Cost\n\n| Rounds | Cost | Input tokens | Output tokens | Minutes |\n|---|---|---|---|---|\n| 0 | — | — | — | — |\n\n## Jobs\n\n- JOB-20261012-0901-1b1b\n" }
                ]
              }
            },
            "response": { "status": 201, "body": { "sha": "e300000000000000000000000000000000000000" } }
          },
          {
            "request": {
              "method": "POST",
              "url": "https://api.github.com/repos/alice/notes/git/commits",
              "body": {
                "message": "run JOB-20261012-0900-0a0a is cancelled",
                "tree": "e300000000000000000000000000000000000000",
                "parents": ["e100000000000000000000000000000000000000"]
              }
            },
            "response": {
              "status": 201,
              "body": { "sha": "e200000000000000000000000000000000000000", "html_url": "https://github.com/alice/notes/commit/e200000000000000000000000000000000000000" }
            }
          },
          {
            "request": {
              "method": "PATCH",
              "url": "https://api.github.com/repos/alice/notes/git/refs/heads/main",
              "body": { "sha": "e200000000000000000000000000000000000000", "force": false }
            },
            "response": { "status": 200, "body": { "object": { "sha": "e200000000000000000000000000000000000000" } } }
          }
        ],
        "clock": "2026-10-12T10:00:00Z",
        "random": [0.1, 0.2, 0.3, 0.4, 0.5],
        "texts": { "fff94463cd4955ed56f1e4700570c7dbbab3b739": "# Notes — Specification\n\n## 1. Writing\n\n**ONE CLICK** *(PO A. Maier)*\nA decision takes one click.\n*Check:* no automatic check; at review.\n\n**NO SERVER** *(PO A. Maier)*\nThe product runs no server of its own.\n*Check:* `tests/test_no_server.py`\n", "1f23b5829774f9d58652b9ae33e9bcf83c517d39": "---\nmodel: scrum\nmodel_file: docs/process-models/scrum.md\nmodel_version: a900000000000000000000000000000000000000\nsprint_close: alice\n---\n# How the thesis tool is developed\n\n## Roles\n\n| Role | Participants |\n|---|---|\n| Product Owner | alice |\n| Developers | cli-dev, ci-dev |\n\n## Branches\n\n| Phase or time box | Branch |\n|---|---|\n| Sprint | `sprint/<nn>` |\n", "7c7715641ec5f7af328286a92582701674b52df0": "---\nid: ITM-001\ntitle: Write a note\nkind: implementation\nrealises:\n  - NO SERVER\norigin:\n  - https://github.com/alice/notes/issues/1\n---\n\n# ITM-001 Write a note\n\n**REGISTER**\n\n## Outcome\n\nThe author writes a note.\n", "44679da1a7befc4aa09109a97954b0c1641f7293": "---\nid: ITM-002\ntitle: Share a note\nkind: implementation\nrealises:\n  - NO SERVER\ndepends_on:\n  - ITM-001\norigin:\n  - https://github.com/alice/notes/issues/2\n---\n\n# ITM-002 Share a note\n\n**REGISTER**\n\n## Outcome\n\nThe author shares a note.\n", "240d6aae125c3bf7903b6a2d4392fcc39891b4bb": "# Backlog order\n\n## Order\n\n1. ITM-001\n2. ITM-002\n", "64adefc3356c77cee49efde5c0fb48c1f31cef2b": "---\nid: sprint-01\ngoal: The author writes notes\nstart: 2026-10-05\nend:\ntime_box_end: 2026-10-18\nselection:\n  - ITM-001\n  - ITM-002\ncloser: alice\nbranch: sprint/01\n---\n\n# sprint-01\n\n**REGISTER**\n\nThe author writes notes\n", "c633da099e40b064d93bd492aac675232a710772": "---\nid: JOB-20261012-0900-0a0a\nkind: run\nphase:\nrole:\nparticipant: alice\nruntime: browser\nrun:\nslot:\nitem:\nmodules: []\ninputs: []\nretry_of:\nagent_m: a900000000000000000000000000000000000000\nmodel:\nlog:\n---\n\n# JOB-20261012-0900-0a0a\n\n**REGISTER**\n\n## Selection\n\n- ITM-001\n- ITM-002\n\n## Limits\n\n| Jobs at once | Cost | Rounds |\n|---|---|---|\n| 2 | — | 5 |\n\n## Assignments\n\n| Role | Participant |\n|---|---|\n| Developers | ci-dev |\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-12T09:00:00Z | running | — |\n\n## Jobs\n\n- JOB-20261012-0901-1b1b\n", "7c1848f6fa984cae04785e0ebdcafcd528e61c1b": "---\nid: JOB-20261012-0901-1b1b\nkind: implement\nphase: Development\nrole: Developers\nparticipant: ci-dev\nruntime: ci\nrun: JOB-20261012-0900-0a0a\nslot: Development/ITM-001\nitem: ITM-001\nmodules: []\ninputs: []\nretry_of:\nagent_m: a900000000000000000000000000000000000000\nmodel: claude-opus-5-5\nlog:\n---\n\n# JOB-20261012-0901-1b1b\n\n**REGISTER**\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-12T09:01:00Z | queued | — |\n| 2026-10-12T09:02:00Z | running | attempt 1 on ci-dev |\n| 2026-10-12T09:40:00Z | done | pull request #7 merged into sprint/01 |\n\n## Results\n\n- https://github.com/alice/notes/pull/7\n\n## Cost\n\n| Rounds | Cost | Input tokens | Output tokens | Minutes |\n|---|---|---|---|---|\n| 1 | — | — | — | — |\n", "fc90f495d3412d80c8480246b6e1b47494497179": "gate: Sprint planning → Development\nsubject: notes\non: e500000000000000000000000000000000000000\ndecider: alice\ndecision: passed\nreason: the sprint's items are ready\n", "b3afcd3b37eb3e3ba21bec807c7d033a4de257bf": "# Generated by Agent M from docs/tests/schedule.md.\nname: agent-m tests\n", "2b12000f158c31bcad0589925a6d23b2034953e7": "job: JOB-20261012-0900-0a0a\nby: alice\nat: 2026-10-12T09:45:00Z\n" }
      },
      "result": {
        "commit": "e200000000000000000000000000000000000000",
        "runs": [{ "run": "JOB-20261012-0900-0a0a", "started": [], "state": "cancelled", "note": "stopped by alice" }],
        "dispatched": [],
        "refused": [],
        "moved": false
      }
    },
    {
      "name": "no open run",
      "input": {
        "env": { "GITHUB_ACTIONS": "true", "GITHUB_SERVER_URL": "https://github.com", "GITHUB_REPOSITORY": "alice/notes", "AGENT_M_TOKEN": "github_pat_example", "AGENT_M_INSTANCE": "https://github.com/alice/agent-m", "AGENT_M_VERSION": "a900000000000000000000000000000000000000" },
        "fetch": [
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes" },
            "response": {
              "status": 200,
              "body": { "visibility": "private", "private": true, "default_branch": "main" }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/commits/main" },
            "response": { "status": 200, "body": { "sha": "e100000000000000000000000000000000000000" } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/git/trees/e100000000000000000000000000000000000000?recursive=1" },
            "response": {
              "status": 200,
              "body": {
                "tree": [
                  { "path": ".github/workflows/agent-m-tests.yml", "type": "blob", "sha": "b3afcd3b37eb3e3ba21bec807c7d033a4de257bf" },
                  { "path": "SPEC.md", "type": "blob", "sha": "fff94463cd4955ed56f1e4700570c7dbbab3b739" },
                  { "path": "docs/backlog/ITM-001-write-a-note.md", "type": "blob", "sha": "7c7715641ec5f7af328286a92582701674b52df0" },
                  { "path": "docs/backlog/ITM-002-share-a-note.md", "type": "blob", "sha": "44679da1a7befc4aa09109a97954b0c1641f7293" },
                  { "path": "docs/backlog/order.md", "type": "blob", "sha": "240d6aae125c3bf7903b6a2d4392fcc39891b4bb" },
                  { "path": "docs/backlog/sprints/sprint-01.md", "type": "blob", "sha": "64adefc3356c77cee49efde5c0fb48c1f31cef2b" },
                  { "path": "docs/jobs/JOB-20261012-0900-0a0a.md", "type": "blob", "sha": "820a8e33d183bb97d331dbe90fc54fff34741120" },
                  { "path": "docs/jobs/JOB-20261012-0901-1b1b.md", "type": "blob", "sha": "7c1848f6fa984cae04785e0ebdcafcd528e61c1b" },
                  { "path": "docs/jobs/gates/notes-sprint-planning-development-e50000000000.md", "type": "blob", "sha": "fc90f495d3412d80c8480246b6e1b47494497179" },
                  { "path": "docs/process.md", "type": "blob", "sha": "1f23b5829774f9d58652b9ae33e9bcf83c517d39" }
                ]
              }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/user" },
            "response": { "status": 200, "body": { "login": "alice" } }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/agent-m" },
            "response": {
              "status": 200,
              "body": { "visibility": "public", "private": false, "default_branch": "main" }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/agent-m/contents/docs/process-models/scrum.md?ref=a900000000000000000000000000000000000000" },
            "response": { "status": 200, "body": "---\nname: scrum\nkind: pulled\nmeasure: remaining items per time box\n---\n# Scrum\n\n## Phases\n\n| Name | Role | Produces |\n|---|---|---|\n| Sprint planning | Product Owner | ITM |\n| Development | Developers | MOD, TST |\n| Sprint review | Product Owner | the review of the increment |\n\n## Transitions\n\n| From | To | Kind |\n|---|---|---|\n| Sprint planning | Development | sequence |\n| Development | Sprint review | sequence |\n| Sprint review | Sprint planning | sequence |\n\n## Gates\n\n| Between | Artifacts | Condition | Decider |\n|---|---|---|---|\n| Sprint planning → Development | ITM | the sprint's items are ready | Product Owner |\n| Development → Sprint review | MOD | CI is green | Product Owner |\n\n## Roles\n\n| Name | Filled by | Capabilities |\n|---|---|---|\n| Product Owner | person | read the repository, write to the repository |\n| Developers | agent | read the repository, write to the repository, run code and tests |\n\n## Flow control\n\n| Kind | Value |\n|---|---|\n| WIP limit | none |\n| Time box | 2 weeks |\n| Sprints | yes |\n" }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/agent-m/contents/docs/participants.md?ref=main" },
            "response": { "status": 200, "body": "# Participants of this instance\n\n| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |\n|---|---|---|---|---|---|---|---|\n| alice | person | — | — | — | draft text, read the repository, write to the repository | — | the GitHub account `alice` |\n| ci-dev | CI agent | claude-opus-5-5 | 200000 | — | read the repository, write to the repository, run code and tests | GitHub's machines, a provider in the USA | the workflow agent-m-job: claude on GitHub's machines |\n| gpu-dev | CI agent | codex-model | — | — | read the repository, write to the repository, run code and tests | the lab's GPU server, Erlangen | the workflow agent-m-job: codex on the runner gpu-1 |\n| cli-dev | CLI agent | claude-opus-5-5 | — | — | read the repository, write to the repository, run code and tests | this machine | the bridge on the Mac of `alice` |\n" }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/commits?path=docs%2Fbacklog&sha=e100000000000000000000000000000000000000&per_page=100&page=1" },
            "response": {
              "status": 200,
              "body": [
                {
                  "sha": "e500000000000000000000000000000000000000",
                  "commit": { "committer": { "date": "2026-10-04T09:00:00Z" }, "author": { "name": "alice" } },
                  "author": { "login": "alice" }
                }
              ]
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/commits/e500000000000000000000000000000000000000" },
            "response": {
              "status": 200,
              "body": {
                "sha": "e500000000000000000000000000000000000000",
                "files": [
                  { "filename": "docs/backlog/ITM-001-write-a-note.md", "status": "added" },
                  { "filename": "docs/backlog/ITM-002-share-a-note.md", "status": "added" },
                  { "filename": "docs/backlog/order.md", "status": "added" },
                  { "filename": "docs/backlog/sprints/sprint-01.md", "status": "added" }
                ]
              }
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/commits?path=docs%2Fjobs%2Fgates%2Fnotes-sprint-planning-development-e50000000000.md&sha=e100000000000000000000000000000000000000&per_page=100" },
            "response": {
              "status": 200,
              "body": [
                {
                  "sha": "e800000000000000000000000000000000000000",
                  "commit": { "committer": { "date": "2026-10-04T10:00:00Z" }, "author": { "name": "alice" } },
                  "author": { "login": "alice" }
                }
              ]
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/commits?path=SPEC.md&sha=e100000000000000000000000000000000000000&per_page=100" },
            "response": {
              "status": 200,
              "body": [
                {
                  "sha": "e700000000000000000000000000000000000000",
                  "commit": { "committer": { "date": "2026-09-20T08:00:00Z" }, "author": { "name": "alice" } },
                  "author": { "login": "alice" }
                }
              ]
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/commits?path=docs%2Fprocess.md&sha=e100000000000000000000000000000000000000&per_page=100" },
            "response": {
              "status": 200,
              "body": [
                {
                  "sha": "e600000000000000000000000000000000000000",
                  "commit": { "committer": { "date": "2026-09-20T08:00:00Z" }, "author": { "name": "alice" } },
                  "author": { "login": "alice" }
                }
              ]
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/contents/docs/process.md?ref=e600000000000000000000000000000000000000" },
            "response": { "status": 200, "body": "---\nmodel: scrum\nmodel_file: docs/process-models/scrum.md\nmodel_version: a900000000000000000000000000000000000000\nsprint_close: alice\n---\n# How the thesis tool is developed\n\n## Roles\n\n| Role | Participants |\n|---|---|\n| Product Owner | alice |\n| Developers | cli-dev, ci-dev |\n\n## Branches\n\n| Phase or time box | Branch |\n|---|---|\n| Sprint | `sprint/<nn>` |\n" }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/commits?path=docs%2Fbacklog&sha=e100000000000000000000000000000000000000&per_page=1" },
            "response": {
              "status": 200,
              "body": [
                {
                  "sha": "e500000000000000000000000000000000000000",
                  "commit": { "committer": { "date": "2026-10-04T09:00:00Z" }, "author": { "name": "alice" } },
                  "author": { "login": "alice" }
                }
              ]
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/pulls?state=all&per_page=100&page=1" },
            "response": {
              "status": 200,
              "body": [
                {
                  "number": 7,
                  "title": "ITM-001: Write a note",
                  "state": "closed",
                  "draft": false,
                  "head": { "ref": "item/ITM-001", "sha": "f700000000000000000000000000000000000000" },
                  "base": { "ref": "sprint/01" },
                  "created_at": "2026-10-12T09:20:00Z",
                  "merged_at": "2026-10-12T09:40:00Z",
                  "closed_at": "2026-10-12T09:40:00Z",
                  "html_url": "https://github.com/alice/notes/pull/7"
                }
              ]
            }
          },
          {
            "request": { "method": "GET", "url": "https://api.github.com/repos/alice/notes/actions/runs?head_sha=e500000000000000000000000000000000000000&per_page=100" },
            "response": { "status": 200, "body": { "workflow_runs": [] } }
          }
        ],
        "clock": "2026-10-12T10:00:00Z",
        "random": [0.1, 0.2, 0.3, 0.4, 0.5],
        "texts": { "fff94463cd4955ed56f1e4700570c7dbbab3b739": "# Notes — Specification\n\n## 1. Writing\n\n**ONE CLICK** *(PO A. Maier)*\nA decision takes one click.\n*Check:* no automatic check; at review.\n\n**NO SERVER** *(PO A. Maier)*\nThe product runs no server of its own.\n*Check:* `tests/test_no_server.py`\n", "1f23b5829774f9d58652b9ae33e9bcf83c517d39": "---\nmodel: scrum\nmodel_file: docs/process-models/scrum.md\nmodel_version: a900000000000000000000000000000000000000\nsprint_close: alice\n---\n# How the thesis tool is developed\n\n## Roles\n\n| Role | Participants |\n|---|---|\n| Product Owner | alice |\n| Developers | cli-dev, ci-dev |\n\n## Branches\n\n| Phase or time box | Branch |\n|---|---|\n| Sprint | `sprint/<nn>` |\n", "7c7715641ec5f7af328286a92582701674b52df0": "---\nid: ITM-001\ntitle: Write a note\nkind: implementation\nrealises:\n  - NO SERVER\norigin:\n  - https://github.com/alice/notes/issues/1\n---\n\n# ITM-001 Write a note\n\n**REGISTER**\n\n## Outcome\n\nThe author writes a note.\n", "44679da1a7befc4aa09109a97954b0c1641f7293": "---\nid: ITM-002\ntitle: Share a note\nkind: implementation\nrealises:\n  - NO SERVER\ndepends_on:\n  - ITM-001\norigin:\n  - https://github.com/alice/notes/issues/2\n---\n\n# ITM-002 Share a note\n\n**REGISTER**\n\n## Outcome\n\nThe author shares a note.\n", "240d6aae125c3bf7903b6a2d4392fcc39891b4bb": "# Backlog order\n\n## Order\n\n1. ITM-001\n2. ITM-002\n", "64adefc3356c77cee49efde5c0fb48c1f31cef2b": "---\nid: sprint-01\ngoal: The author writes notes\nstart: 2026-10-05\nend:\ntime_box_end: 2026-10-18\nselection:\n  - ITM-001\n  - ITM-002\ncloser: alice\nbranch: sprint/01\n---\n\n# sprint-01\n\n**REGISTER**\n\nThe author writes notes\n", "820a8e33d183bb97d331dbe90fc54fff34741120": "---\nid: JOB-20261012-0900-0a0a\nkind: run\nphase:\nrole:\nparticipant: alice\nruntime: browser\nrun:\nslot:\nitem:\nmodules: []\ninputs: []\nretry_of:\nagent_m: a900000000000000000000000000000000000000\nmodel:\nlog:\n---\n\n# JOB-20261012-0900-0a0a\n\n**REGISTER**\n\n## Selection\n\n- ITM-001\n- ITM-002\n\n## Limits\n\n| Jobs at once | Cost | Rounds |\n|---|---|---|\n| 2 | — | 5 |\n\n## Assignments\n\n| Role | Participant |\n|---|---|\n| Developers | ci-dev |\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-12T09:00:00Z | running | — |\n| 2026-10-12T11:00:00Z | done | every slot of its plan is done |\n\n## Cost\n\n| Rounds | Cost | Input tokens | Output tokens | Minutes |\n|---|---|---|---|---|\n| 0 | — | — | — | — |\n\n## Jobs\n\n- JOB-20261012-0901-1b1b\n", "7c1848f6fa984cae04785e0ebdcafcd528e61c1b": "---\nid: JOB-20261012-0901-1b1b\nkind: implement\nphase: Development\nrole: Developers\nparticipant: ci-dev\nruntime: ci\nrun: JOB-20261012-0900-0a0a\nslot: Development/ITM-001\nitem: ITM-001\nmodules: []\ninputs: []\nretry_of:\nagent_m: a900000000000000000000000000000000000000\nmodel: claude-opus-5-5\nlog:\n---\n\n# JOB-20261012-0901-1b1b\n\n**REGISTER**\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-12T09:01:00Z | queued | — |\n| 2026-10-12T09:02:00Z | running | attempt 1 on ci-dev |\n| 2026-10-12T09:40:00Z | done | pull request #7 merged into sprint/01 |\n\n## Results\n\n- https://github.com/alice/notes/pull/7\n\n## Cost\n\n| Rounds | Cost | Input tokens | Output tokens | Minutes |\n|---|---|---|---|---|\n| 1 | — | — | — | — |\n", "fc90f495d3412d80c8480246b6e1b47494497179": "gate: Sprint planning → Development\nsubject: notes\non: e500000000000000000000000000000000000000\ndecider: alice\ndecision: passed\nreason: the sprint's items are ready\n", "b3afcd3b37eb3e3ba21bec807c7d033a4de257bf": "# Generated by Agent M from docs/tests/schedule.md.\nname: agent-m tests\n" }
      },
      "result": { "commit": "", "runs": [], "dispatched": [], "refused": [], "moved": false }
    },
    {
      "name": "no CI secret",
      "input": {
        "env": { "GITHUB_ACTIONS": "true", "GITHUB_SERVER_URL": "https://github.com", "GITHUB_REPOSITORY": "alice/notes", "AGENT_M_TOKEN": "", "AGENT_M_INSTANCE": "https://github.com/alice/agent-m", "AGENT_M_VERSION": "a900000000000000000000000000000000000000" },
        "fetch": [],
        "clock": "2026-10-12T10:00:00Z",
        "random": [0.1, 0.2, 0.3, 0.4, 0.5],
        "texts": {}
      },
      "refused": "no-token"
    }
  ]
}
```

## Types

```json type
{
  "$id": "ScheduleRow",
  "description": "A kind of test in the schedule: the occasions it runs on, where it runs — hosted, a CLI or sandboxed agent's runner by its name, or people for user tests —, and the row's line in the file (0 for the default).",
  "type": "object",
  "required": ["tests", "occasions", "runsOn", "line"],
  "additionalProperties": false,
  "properties": {
    "tests": { "type": "string", "enum": ["unit", "component", "system", "paid", "release", "user"] },
    "occasions": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["every commit", "pull request", "nightly", "release candidate", "on demand"]
      }
    },
    "runsOn": { "type": "string", "minLength": 1 },
    "line": { "type": "integer", "minimum": 0 }
  },
  "examples": [
    { "tests": "paid", "occasions": ["nightly", "release candidate", "on demand"], "runsOn": "cli-dev", "line": 13 }
  ]
}
```

```json type
{
  "$id": "Schedule",
  "description": "A product's test schedule: whether the product declares it, the time of the nightly run in UTC, the command that runs its tests — empty for node's test runner —, and its rows.",
  "type": "object",
  "required": ["declared", "nightly", "command", "rows"],
  "additionalProperties": false,
  "properties": {
    "declared": { "type": "boolean" },
    "nightly": { "type": "string" },
    "command": { "type": "string" },
    "rows": { "type": "array", "items": { "$ref": "ScheduleRow" } }
  },
  "examples": [
    {
      "declared": false,
      "nightly": "02:00",
      "command": "",
      "rows": [
        {
          "tests": "unit",
          "occasions": ["every commit", "pull request", "nightly", "release candidate", "on demand"],
          "runsOn": "hosted",
          "line": 0
        },
        {
          "tests": "component",
          "occasions": ["every commit", "pull request", "nightly", "release candidate", "on demand"],
          "runsOn": "hosted",
          "line": 0
        },
        {
          "tests": "system",
          "occasions": ["every commit", "pull request", "nightly", "release candidate", "on demand"],
          "runsOn": "hosted",
          "line": 0
        },
        { "tests": "paid", "occasions": ["nightly", "release candidate", "on demand"], "runsOn": "hosted", "line": 0 },
        { "tests": "release", "occasions": ["release candidate", "on demand"], "runsOn": "hosted", "line": 0 },
        { "tests": "user", "occasions": ["release candidate", "on demand"], "runsOn": "people", "line": 0 }
      ]
    }
  ]
}
```

```json type
{
  "$id": "CiSetup",
  "description": "What the configuration is generated with beside the schedule: the instance's repository on GitHub, https://github.com/<owner>/<repository>; the instance's commit the jobs run Agent M at, 40 hex; and the names of the CI secrets holding the keys of paid services, in capitals, digits and underscores — each checked by testWorkflow.",
  "type": "object",
  "required": ["instance", "version", "paidSecrets"],
  "additionalProperties": false,
  "properties": {
    "instance": { "type": "string", "minLength": 1 },
    "version": { "type": "string" },
    "paidSecrets": { "type": "array", "items": { "type": "string" } }
  },
  "examples": [
    {
      "instance": "https://github.com/alice/agent-m",
      "version": "a100000000000000000000000000000000000000",
      "paidSecrets": ["HUB_KEY"]
    }
  ]
}
```

```json type
{
  "$id": "SecretNeed",
  "description": "A CI secret the generated jobs read: its name, what it holds, the jobs that read it — a kind's job, or results, the one that records the runs —, and the environment it is scoped to on GitLab — empty for none.",
  "type": "object",
  "required": ["name", "holds", "jobs", "scope"],
  "additionalProperties": false,
  "properties": {
    "name": { "type": "string" },
    "holds": { "type": "string" },
    "jobs": {
      "type": "array",
      "items": { "type": "string", "enum": ["unit", "component", "system", "paid", "release", "results"] }
    },
    "scope": { "type": "string" }
  },
  "examples": [
    {
      "name": "HUB_KEY",
      "holds": "the key of a paid service the tests call",
      "jobs": ["paid"],
      "scope": "agent-m-paid"
    }
  ]
}
```

```json type
{
  "$id": "NightlySchedule",
  "description": "A GitLab pipeline schedule: the cron line, its time zone, and its description.",
  "type": "object",
  "required": ["cron", "timezone", "description"],
  "additionalProperties": false,
  "properties": {
    "cron": { "type": "string" },
    "timezone": { "type": "string", "const": "UTC" },
    "description": { "type": "string" }
  },
  "examples": [{ "cron": "30 3 * * *", "timezone": "UTC", "description": "agent-m nightly" }]
}
```

```json type
{
  "$id": "ScheduleContent",
  "description": "What the markdown-front-matter syntax reads from a schedule.",
  "type": "object",
  "required": ["fields", "body"],
  "additionalProperties": false,
  "properties": {
    "fields": {
      "type": "object",
      "required": ["nightly"],
      "additionalProperties": false,
      "properties": {
        "nightly": { "type": "string", "pattern": "^([01][0-9]|2[0-3]):[0-5][0-9]$" },
        "command": { "type": "string", "minLength": 1 }
      }
    },
    "body": { "type": "string" }
  },
  "examples": [{ "fields": { "nightly": "03:30", "command": "npm test" }, "body": "\n# Test schedule\n" }]
}
```

```json type
{
  "$id": "JobSecret",
  "description": "A CI secret the job workflow reads: its name, what it holds, and the CI agents whose jobs read it.",
  "type": "object",
  "required": ["name", "holds", "readBy"],
  "additionalProperties": false,
  "properties": {
    "name": { "type": "string", "pattern": "^[A-Z][A-Z0-9_]*$" },
    "holds": { "type": "string" },
    "readBy": { "type": "array", "items": { "type": "string" } }
  },
  "examples": [
    {
      "name": "AGENT_M_AGENT_KEY_CI_DEV",
      "holds": "the key ci-dev's CLI calls its model with, as ANTHROPIC_API_KEY",
      "readBy": ["ci-dev"]
    }
  ]
}
```

```json format
{
  "$id": "ScheduleFile",
  "description": "A product's test schedule.",
  "path": "docs/tests/schedule.md",
  "syntax": "markdown-front-matter",
  "content": "ScheduleContent",
  "examples": ["---\nnightly: 03:30\ncommand: npm test\n---\n\n# Test schedule\n\n| Tests | every commit | pull request | nightly | release candidate | on demand | Runs on |\n|---|:-:|:-:|:-:|:-:|:-:|---|\n| unit | ✓ | ✓ | ✓ | ✓ | ✓ | hosted |\n| component | ✓ | ✓ | ✓ | ✓ | ✓ | hosted |\n| system (with recorded responses) |   |   | ✓ | ✓ | ✓ | hosted |\n| tests that call a paid service or a model |   |   | ✓ | ✓ | ✓ | cli-dev |\n| release |   |   |   | ✓ | ✓ | hosted |\n| user (manual) |   |   |   | ✓ | ✓ | people |\n"]
}
```

```json format
{
  "$id": "GitHubTestWorkflowFile",
  "description": "The tests' workflow a schedule gives a GitHub product; generated, never edited.",
  "path": ".github/workflows/agent-m-tests.yml",
  "syntax": "text",
  "content": "string",
  "examples": ["# Generated by Agent M from docs/tests/schedule.md; change the schedule, not this file.\nname: agent-m tests\non:\n  push:\n    branches-ignore: [test-results]\n    paths-ignore: [\"docs/jobs/**\"]\n  pull_request:\n    paths-ignore: [\"docs/jobs/**\"]\n  schedule:\n    - cron: \"0 2 * * *\"\n  workflow_dispatch:\n    inputs:\n      AGENT_M_OCCASION:\n        description: release candidate or on demand\n        type: choice\n        options: [\"on demand\", \"release candidate\"]\n        default: \"on demand\"\n      AGENT_M_COMMIT:\n        description: the commit to test, empty for the head of the branch\n        type: string\n        default: \"\"\n      AGENT_M_TESTS:\n        description: the kinds of test to run on demand, separated by spaces, empty for every kind\n        type: string\n        default: \"\"\npermissions:\n  contents: read\njobs:\n  occasion:\n    runs-on: ubuntu-latest\n    outputs:\n      occasion: ${{ steps.o.outputs.occasion }}\n      commit: ${{ steps.o.outputs.commit }}\n      unit: ${{ steps.o.outputs.unit }}\n      component: ${{ steps.o.outputs.component }}\n      system: ${{ steps.o.outputs.system }}\n      paid: ${{ steps.o.outputs.paid }}\n      release: ${{ steps.o.outputs.release }}\n    steps:\n      - id: o\n        env:\n          EVENT: ${{ github.event_name }}\n          HEAD: ${{ github.event.pull_request.head.sha || github.sha }}\n          OCCASION: ${{ inputs.AGENT_M_OCCASION }}\n          COMMIT: ${{ inputs.AGENT_M_COMMIT }}\n          TESTS: ${{ inputs.AGENT_M_TESTS }}\n        run: |\n          case \"$EVENT\" in\n            push) occasion=\"every commit\" ;;\n            pull_request) occasion=\"pull request\" ;;\n            schedule) occasion=\"nightly\" ;;\n            *) occasion=\"$OCCASION\" ;;\n          esac\n          case \"$occasion\" in\n            \"every commit\") runs=\"unit component system\" ;;\n            \"pull request\") runs=\"unit component system\" ;;\n            \"nightly\") runs=\"unit component system paid\" ;;\n            \"release candidate\") runs=\"unit component system paid release\" ;;\n            \"on demand\") runs=\"unit component system paid release\" ;;\n            *) runs=\"\" ;;\n          esac\n          if [ \"$occasion\" = \"on demand\" ] && [ -n \"$TESTS\" ]; then\n            chosen=\"\"\n            for t in $runs; do case \" $TESTS \" in *\" $t \"*) chosen=\"$chosen $t\" ;; esac; done\n            runs=\"${chosen# }\"\n          fi\n          echo \"occasion=$occasion\" >> \"$GITHUB_OUTPUT\"\n          echo \"commit=${COMMIT:-$HEAD}\" >> \"$GITHUB_OUTPUT\"\n          for t in unit component system paid release; do\n            case \" $runs \" in *\" $t \"*) echo \"$t=yes\" ;; *) echo \"$t=no\" ;; esac >> \"$GITHUB_OUTPUT\"\n          done\n  unit:\n    needs: occasion\n    if: needs.occasion.outputs.unit == 'yes'\n    runs-on: ubuntu-latest\n    env:\n      AGENT_M_HOME: ${{ github.workspace }}/agent-m\n      AGENT_M_KIND: unit\n      AGENT_M_OUT: ${{ github.workspace }}/agent-m-out/unit\n      AGENT_M_JUNIT: ${{ github.workspace }}/agent-m-out/unit/junit.xml\n    steps:\n      - run: rm -rf \"$AGENT_M_OUT\" && mkdir -p \"$AGENT_M_OUT\"\n      - uses: actions/checkout@v4\n        with:\n          ref: ${{ needs.occasion.outputs.commit }}\n          path: product\n      - uses: actions/checkout@v4\n        with:\n          repository: alice/agent-m\n          ref: a100000000000000000000000000000000000000\n          path: agent-m\n      - uses: actions/setup-node@v4\n        with:\n          node-version: \"22\"\n      - id: tests\n        working-directory: product\n        run: node \"$AGENT_M_HOME/src/ci-entry/main.mjs\" test\n      - if: always()\n        env:\n          OUTCOME: ${{ steps.tests.outcome }}\n        run: |\n          missing=\"$(cat \"$AGENT_M_OUT/missing\" 2>/dev/null)\"\n          mkdir -p \"$AGENT_M_OUT\"\n          {\n            echo \"kind: $AGENT_M_KIND\"\n            echo \"outcome: ${OUTCOME:-skipped}\"\n            echo \"missing: $missing\"\n            echo \"run: gh-${{ github.run_id }}-${{ github.run_attempt }}-unit\"\n            echo \"log: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}\"\n            echo \"participant: GitHub Actions, runner $RUNNER_NAME\"\n          } > \"$AGENT_M_OUT/run.txt\"\n      - if: always()\n        uses: actions/upload-artifact@v4\n        with:\n          name: agent-m-unit\n          path: agent-m-out/unit\n  component:\n    needs: occasion\n    if: needs.occasion.outputs.component == 'yes'\n    runs-on: ubuntu-latest\n    env:\n      AGENT_M_HOME: ${{ github.workspace }}/agent-m\n      AGENT_M_KIND: component\n      AGENT_M_OUT: ${{ github.workspace }}/agent-m-out/component\n      AGENT_M_JUNIT: ${{ github.workspace }}/agent-m-out/component/junit.xml\n    steps:\n      - run: rm -rf \"$AGENT_M_OUT\" && mkdir -p \"$AGENT_M_OUT\"\n      - uses: actions/checkout@v4\n        with:\n          ref: ${{ needs.occasion.outputs.commit }}\n          path: product\n      - uses: actions/checkout@v4\n        with:\n          repository: alice/agent-m\n          ref: a100000000000000000000000000000000000000\n          path: agent-m\n      - uses: actions/setup-node@v4\n        with:\n          node-version: \"22\"\n      - id: tests\n        working-directory: product\n        run: node \"$AGENT_M_HOME/src/ci-entry/main.mjs\" test\n      - if: always()\n        env:\n          OUTCOME: ${{ steps.tests.outcome }}\n        run: |\n          missing=\"$(cat \"$AGENT_M_OUT/missing\" 2>/dev/null)\"\n          mkdir -p \"$AGENT_M_OUT\"\n          {\n            echo \"kind: $AGENT_M_KIND\"\n            echo \"outcome: ${OUTCOME:-skipped}\"\n            echo \"missing: $missing\"\n            echo \"run: gh-${{ github.run_id }}-${{ github.run_attempt }}-component\"\n            echo \"log: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}\"\n            echo \"participant: GitHub Actions, runner $RUNNER_NAME\"\n          } > \"$AGENT_M_OUT/run.txt\"\n      - if: always()\n        uses: actions/upload-artifact@v4\n        with:\n          name: agent-m-component\n          path: agent-m-out/component\n  system:\n    needs: occasion\n    if: needs.occasion.outputs.system == 'yes'\n    runs-on: ubuntu-latest\n    env:\n      AGENT_M_HOME: ${{ github.workspace }}/agent-m\n      AGENT_M_KIND: system\n      AGENT_M_OUT: ${{ github.workspace }}/agent-m-out/system\n      AGENT_M_JUNIT: ${{ github.workspace }}/agent-m-out/system/junit.xml\n    steps:\n      - run: rm -rf \"$AGENT_M_OUT\" && mkdir -p \"$AGENT_M_OUT\"\n      - uses: actions/checkout@v4\n        with:\n          ref: ${{ needs.occasion.outputs.commit }}\n          path: product\n      - uses: actions/checkout@v4\n        with:\n          repository: alice/agent-m\n          ref: a100000000000000000000000000000000000000\n          path: agent-m\n      - uses: actions/setup-node@v4\n        with:\n          node-version: \"22\"\n      - id: tests\n        working-directory: product\n        run: node \"$AGENT_M_HOME/src/ci-entry/main.mjs\" test\n      - if: always()\n        env:\n          OUTCOME: ${{ steps.tests.outcome }}\n        run: |\n          missing=\"$(cat \"$AGENT_M_OUT/missing\" 2>/dev/null)\"\n          mkdir -p \"$AGENT_M_OUT\"\n          {\n            echo \"kind: $AGENT_M_KIND\"\n            echo \"outcome: ${OUTCOME:-skipped}\"\n            echo \"missing: $missing\"\n            echo \"run: gh-${{ github.run_id }}-${{ github.run_attempt }}-system\"\n            echo \"log: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}\"\n            echo \"participant: GitHub Actions, runner $RUNNER_NAME\"\n          } > \"$AGENT_M_OUT/run.txt\"\n      - if: always()\n        uses: actions/upload-artifact@v4\n        with:\n          name: agent-m-system\n          path: agent-m-out/system\n  paid:\n    needs: occasion\n    if: needs.occasion.outputs.paid == 'yes'\n    runs-on: ubuntu-latest\n    env:\n      AGENT_M_HOME: ${{ github.workspace }}/agent-m\n      AGENT_M_KIND: paid\n      AGENT_M_OUT: ${{ github.workspace }}/agent-m-out/paid\n      AGENT_M_JUNIT: ${{ github.workspace }}/agent-m-out/paid/junit.xml\n    steps:\n      - run: rm -rf \"$AGENT_M_OUT\" && mkdir -p \"$AGENT_M_OUT\"\n      - uses: actions/checkout@v4\n        with:\n          ref: ${{ needs.occasion.outputs.commit }}\n          path: product\n      - uses: actions/checkout@v4\n        with:\n          repository: alice/agent-m\n          ref: a100000000000000000000000000000000000000\n          path: agent-m\n      - uses: actions/setup-node@v4\n        with:\n          node-version: \"22\"\n      - id: secrets\n        env:\n          HUB_KEY: ${{ secrets.HUB_KEY }}\n        run: |\n          missing=\"\"\n          [ -n \"$HUB_KEY\" ] || missing=\"$missing HUB_KEY\"\n          missing=\"${missing# }\"\n          echo \"$missing\" > \"$AGENT_M_OUT/missing\"\n          [ -z \"$missing\" ] || { echo \"the secret(s) $missing missing\"; exit 1; }\n      - id: tests\n        if: steps.secrets.outcome == 'success'\n        working-directory: product\n        env:\n          HUB_KEY: ${{ secrets.HUB_KEY }}\n        run: node \"$AGENT_M_HOME/src/ci-entry/main.mjs\" test\n      - if: always()\n        env:\n          OUTCOME: ${{ steps.tests.outcome }}\n        run: |\n          missing=\"$(cat \"$AGENT_M_OUT/missing\" 2>/dev/null)\"\n          mkdir -p \"$AGENT_M_OUT\"\n          {\n            echo \"kind: $AGENT_M_KIND\"\n            echo \"outcome: ${OUTCOME:-skipped}\"\n            echo \"missing: $missing\"\n            echo \"run: gh-${{ github.run_id }}-${{ github.run_attempt }}-paid\"\n            echo \"log: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}\"\n            echo \"participant: GitHub Actions, runner $RUNNER_NAME\"\n          } > \"$AGENT_M_OUT/run.txt\"\n      - if: always()\n        uses: actions/upload-artifact@v4\n        with:\n          name: agent-m-paid\n          path: agent-m-out/paid\n  release:\n    needs: occasion\n    if: needs.occasion.outputs.release == 'yes'\n    runs-on: ubuntu-latest\n    env:\n      AGENT_M_HOME: ${{ github.workspace }}/agent-m\n      AGENT_M_KIND: release\n      AGENT_M_OUT: ${{ github.workspace }}/agent-m-out/release\n      AGENT_M_JUNIT: ${{ github.workspace }}/agent-m-out/release/junit.xml\n    steps:\n      - run: rm -rf \"$AGENT_M_OUT\" && mkdir -p \"$AGENT_M_OUT\"\n      - uses: actions/checkout@v4\n        with:\n          ref: ${{ needs.occasion.outputs.commit }}\n          path: product\n      - uses: actions/checkout@v4\n        with:\n          repository: alice/agent-m\n          ref: a100000000000000000000000000000000000000\n          path: agent-m\n      - uses: actions/setup-node@v4\n        with:\n          node-version: \"22\"\n      - id: tests\n        working-directory: product\n        run: node \"$AGENT_M_HOME/src/ci-entry/main.mjs\" test\n      - if: always()\n        env:\n          OUTCOME: ${{ steps.tests.outcome }}\n        run: |\n          missing=\"$(cat \"$AGENT_M_OUT/missing\" 2>/dev/null)\"\n          mkdir -p \"$AGENT_M_OUT\"\n          {\n            echo \"kind: $AGENT_M_KIND\"\n            echo \"outcome: ${OUTCOME:-skipped}\"\n            echo \"missing: $missing\"\n            echo \"run: gh-${{ github.run_id }}-${{ github.run_attempt }}-release\"\n            echo \"log: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}\"\n            echo \"participant: GitHub Actions, runner $RUNNER_NAME\"\n          } > \"$AGENT_M_OUT/run.txt\"\n      - if: always()\n        uses: actions/upload-artifact@v4\n        with:\n          name: agent-m-release\n          path: agent-m-out/release\n  results:\n    needs: [occasion, unit, component, system, paid, release]\n    if: always() && needs.occasion.result == 'success'\n    runs-on: ubuntu-latest\n    env:\n      AGENT_M_HOME: ${{ github.workspace }}/agent-m\n      AGENT_M_OUT: ${{ github.workspace }}/agent-m-out\n    steps:\n      - uses: actions/checkout@v4\n        with:\n          ref: ${{ needs.occasion.outputs.commit }}\n          path: product\n      - uses: actions/checkout@v4\n        with:\n          repository: alice/agent-m\n          ref: a100000000000000000000000000000000000000\n          path: agent-m\n      - uses: actions/setup-node@v4\n        with:\n          node-version: \"22\"\n      - uses: actions/download-artifact@v4\n        continue-on-error: true\n        with:\n          pattern: agent-m-*\n          path: agent-m-out\n      - working-directory: product\n        env:\n          AGENT_M_TOKEN: ${{ secrets.AGENT_M_TOKEN }}\n          AGENT_M_OCCASION: ${{ needs.occasion.outputs.occasion }}\n          AGENT_M_COMMIT: ${{ needs.occasion.outputs.commit }}\n        run: AGENT_M_NOTES=\"$(ls \"$AGENT_M_OUT\" 2>/dev/null | tr '\\n' ' ')\" node \"$AGENT_M_HOME/src/ci-entry/main.mjs\" results\n"]
}
```

```json format
{
  "$id": "GitLabPipelineFile",
  "description": "The pipeline a schedule gives a GitLab product; generated, never edited.",
  "path": ".gitlab-ci.yml",
  "syntax": "text",
  "content": "string",
  "examples": ["# Generated by Agent M from docs/tests/schedule.md; change the schedule, not this file.\nworkflow:\n  rules:\n    - if: $CI_COMMIT_BRANCH == \"test-results\"\n      when: never\n    - if: $CI_PIPELINE_SOURCE == \"push\" || $CI_PIPELINE_SOURCE == \"merge_request_event\"\n      changes:\n        - \"*\"\n        - \"[!d]*/**/*\"\n        - \"d[!o]*/**/*\"\n        - \"do[!c]*/**/*\"\n        - \"doc[!s]*/**/*\"\n        - \"d/**/*\"\n        - \"do/**/*\"\n        - \"doc/**/*\"\n        - \"docs?*/**/*\"\n        - \"docs/*\"\n        - \"docs/[!j]*/**/*\"\n        - \"docs/j[!o]*/**/*\"\n        - \"docs/jo[!b]*/**/*\"\n        - \"docs/job[!s]*/**/*\"\n        - \"docs/j/**/*\"\n        - \"docs/jo/**/*\"\n        - \"docs/job/**/*\"\n        - \"docs/jobs?*/**/*\"\n    - if: $CI_PIPELINE_SOURCE == \"push\" || $CI_PIPELINE_SOURCE == \"merge_request_event\"\n      when: never\n    - when: always\nvariables:\n  AGENT_M_HOME: \"/tmp/agent-m-$CI_JOB_ID\"\nunit:\n  image: node:22\n  variables:\n    AGENT_M_KIND: unit\n    AGENT_M_OUT: \"$CI_PROJECT_DIR/agent-m-out/unit\"\n    AGENT_M_JUNIT: \"$CI_PROJECT_DIR/agent-m-out/unit/junit.xml\"\n  rules:\n    - if: $CI_PIPELINE_SOURCE == \"push\"\n    - if: $CI_PIPELINE_SOURCE == \"merge_request_event\"\n    - if: $CI_PIPELINE_SOURCE == \"schedule\"\n    - if: $AGENT_M_OCCASION == \"release candidate\"\n    - if: $AGENT_M_OCCASION == \"on demand\" && ($AGENT_M_TESTS == null || $AGENT_M_TESTS == \"\" || $AGENT_M_TESTS =~ /(^| )unit( |$)/)\n  script:\n    - mkdir -p \"$AGENT_M_OUT\"\n    - if [ -n \"$AGENT_M_COMMIT\" ]; then git fetch --quiet origin \"$AGENT_M_COMMIT\" && git checkout --quiet \"$AGENT_M_COMMIT\"; fi\n    - git clone --quiet https://github.com/alice/agent-m.git \"$AGENT_M_HOME\"\n    - git -C \"$AGENT_M_HOME\" checkout --quiet a100000000000000000000000000000000000000\n    - npm test\n  after_script:\n    - |\n      missing=\"$(cat \"$AGENT_M_OUT/missing\" 2>/dev/null)\"\n      mkdir -p \"$AGENT_M_OUT\"\n      {\n        echo \"kind: $AGENT_M_KIND\"\n        echo \"outcome: $CI_JOB_STATUS\"\n        echo \"missing: $missing\"\n        echo \"run: gl-$CI_PIPELINE_ID-$CI_JOB_ID\"\n        echo \"log: $CI_JOB_URL\"\n        echo \"participant: GitLab CI, runner $CI_RUNNER_DESCRIPTION\"\n      } > \"$AGENT_M_OUT/run.txt\"\n  artifacts:\n    when: always\n    paths:\n      - agent-m-out/unit/\ncomponent:\n  image: node:22\n  variables:\n    AGENT_M_KIND: component\n    AGENT_M_OUT: \"$CI_PROJECT_DIR/agent-m-out/component\"\n    AGENT_M_JUNIT: \"$CI_PROJECT_DIR/agent-m-out/component/junit.xml\"\n  rules:\n    - if: $CI_PIPELINE_SOURCE == \"push\"\n    - if: $CI_PIPELINE_SOURCE == \"merge_request_event\"\n    - if: $CI_PIPELINE_SOURCE == \"schedule\"\n    - if: $AGENT_M_OCCASION == \"release candidate\"\n    - if: $AGENT_M_OCCASION == \"on demand\" && ($AGENT_M_TESTS == null || $AGENT_M_TESTS == \"\" || $AGENT_M_TESTS =~ /(^| )component( |$)/)\n  script:\n    - mkdir -p \"$AGENT_M_OUT\"\n    - if [ -n \"$AGENT_M_COMMIT\" ]; then git fetch --quiet origin \"$AGENT_M_COMMIT\" && git checkout --quiet \"$AGENT_M_COMMIT\"; fi\n    - git clone --quiet https://github.com/alice/agent-m.git \"$AGENT_M_HOME\"\n    - git -C \"$AGENT_M_HOME\" checkout --quiet a100000000000000000000000000000000000000\n    - npm test\n  after_script:\n    - |\n      missing=\"$(cat \"$AGENT_M_OUT/missing\" 2>/dev/null)\"\n      mkdir -p \"$AGENT_M_OUT\"\n      {\n        echo \"kind: $AGENT_M_KIND\"\n        echo \"outcome: $CI_JOB_STATUS\"\n        echo \"missing: $missing\"\n        echo \"run: gl-$CI_PIPELINE_ID-$CI_JOB_ID\"\n        echo \"log: $CI_JOB_URL\"\n        echo \"participant: GitLab CI, runner $CI_RUNNER_DESCRIPTION\"\n      } > \"$AGENT_M_OUT/run.txt\"\n  artifacts:\n    when: always\n    paths:\n      - agent-m-out/component/\nsystem:\n  image: node:22\n  variables:\n    AGENT_M_KIND: system\n    AGENT_M_OUT: \"$CI_PROJECT_DIR/agent-m-out/system\"\n    AGENT_M_JUNIT: \"$CI_PROJECT_DIR/agent-m-out/system/junit.xml\"\n  rules:\n    - if: $CI_PIPELINE_SOURCE == \"schedule\"\n    - if: $AGENT_M_OCCASION == \"release candidate\"\n    - if: $AGENT_M_OCCASION == \"on demand\" && ($AGENT_M_TESTS == null || $AGENT_M_TESTS == \"\" || $AGENT_M_TESTS =~ /(^| )system( |$)/)\n  script:\n    - mkdir -p \"$AGENT_M_OUT\"\n    - if [ -n \"$AGENT_M_COMMIT\" ]; then git fetch --quiet origin \"$AGENT_M_COMMIT\" && git checkout --quiet \"$AGENT_M_COMMIT\"; fi\n    - git clone --quiet https://github.com/alice/agent-m.git \"$AGENT_M_HOME\"\n    - git -C \"$AGENT_M_HOME\" checkout --quiet a100000000000000000000000000000000000000\n    - npm test\n  after_script:\n    - |\n      missing=\"$(cat \"$AGENT_M_OUT/missing\" 2>/dev/null)\"\n      mkdir -p \"$AGENT_M_OUT\"\n      {\n        echo \"kind: $AGENT_M_KIND\"\n        echo \"outcome: $CI_JOB_STATUS\"\n        echo \"missing: $missing\"\n        echo \"run: gl-$CI_PIPELINE_ID-$CI_JOB_ID\"\n        echo \"log: $CI_JOB_URL\"\n        echo \"participant: GitLab CI, runner $CI_RUNNER_DESCRIPTION\"\n      } > \"$AGENT_M_OUT/run.txt\"\n  artifacts:\n    when: always\n    paths:\n      - agent-m-out/system/\npaid:\n  image: node:22\n  tags: [cli-dev]\n  environment:\n    name: agent-m-paid\n    action: access\n  variables:\n    AGENT_M_KIND: paid\n    AGENT_M_OUT: \"$CI_PROJECT_DIR/agent-m-out/paid\"\n    AGENT_M_JUNIT: \"$CI_PROJECT_DIR/agent-m-out/paid/junit.xml\"\n  rules:\n    - if: $CI_PIPELINE_SOURCE == \"schedule\"\n    - if: $AGENT_M_OCCASION == \"release candidate\"\n    - if: $AGENT_M_OCCASION == \"on demand\" && ($AGENT_M_TESTS == null || $AGENT_M_TESTS == \"\" || $AGENT_M_TESTS =~ /(^| )paid( |$)/)\n  script:\n    - mkdir -p \"$AGENT_M_OUT\"\n    - if [ -n \"$AGENT_M_COMMIT\" ]; then git fetch --quiet origin \"$AGENT_M_COMMIT\" && git checkout --quiet \"$AGENT_M_COMMIT\"; fi\n    - git clone --quiet https://github.com/alice/agent-m.git \"$AGENT_M_HOME\"\n    - git -C \"$AGENT_M_HOME\" checkout --quiet a100000000000000000000000000000000000000\n    - |\n      missing=\"\"\n      [ -n \"$HUB_KEY\" ] || missing=\"$missing HUB_KEY\"\n      missing=\"${missing# }\"\n      echo \"$missing\" > \"$AGENT_M_OUT/missing\"\n      [ -z \"$missing\" ] || { echo \"the secret(s) $missing missing\"; exit 1; }\n    - npm test\n  after_script:\n    - |\n      missing=\"$(cat \"$AGENT_M_OUT/missing\" 2>/dev/null)\"\n      mkdir -p \"$AGENT_M_OUT\"\n      {\n        echo \"kind: $AGENT_M_KIND\"\n        echo \"outcome: $CI_JOB_STATUS\"\n        echo \"missing: $missing\"\n        echo \"run: gl-$CI_PIPELINE_ID-$CI_JOB_ID\"\n        echo \"log: $CI_JOB_URL\"\n        echo \"participant: GitLab CI, runner $CI_RUNNER_DESCRIPTION\"\n      } > \"$AGENT_M_OUT/run.txt\"\n  artifacts:\n    when: always\n    paths:\n      - agent-m-out/paid/\nrelease:\n  image: node:22\n  variables:\n    AGENT_M_KIND: release\n    AGENT_M_OUT: \"$CI_PROJECT_DIR/agent-m-out/release\"\n    AGENT_M_JUNIT: \"$CI_PROJECT_DIR/agent-m-out/release/junit.xml\"\n  rules:\n    - if: $AGENT_M_OCCASION == \"release candidate\"\n    - if: $AGENT_M_OCCASION == \"on demand\" && ($AGENT_M_TESTS == null || $AGENT_M_TESTS == \"\" || $AGENT_M_TESTS =~ /(^| )release( |$)/)\n  script:\n    - mkdir -p \"$AGENT_M_OUT\"\n    - if [ -n \"$AGENT_M_COMMIT\" ]; then git fetch --quiet origin \"$AGENT_M_COMMIT\" && git checkout --quiet \"$AGENT_M_COMMIT\"; fi\n    - git clone --quiet https://github.com/alice/agent-m.git \"$AGENT_M_HOME\"\n    - git -C \"$AGENT_M_HOME\" checkout --quiet a100000000000000000000000000000000000000\n    - npm test\n  after_script:\n    - |\n      missing=\"$(cat \"$AGENT_M_OUT/missing\" 2>/dev/null)\"\n      mkdir -p \"$AGENT_M_OUT\"\n      {\n        echo \"kind: $AGENT_M_KIND\"\n        echo \"outcome: $CI_JOB_STATUS\"\n        echo \"missing: $missing\"\n        echo \"run: gl-$CI_PIPELINE_ID-$CI_JOB_ID\"\n        echo \"log: $CI_JOB_URL\"\n        echo \"participant: GitLab CI, runner $CI_RUNNER_DESCRIPTION\"\n      } > \"$AGENT_M_OUT/run.txt\"\n  artifacts:\n    when: always\n    paths:\n      - agent-m-out/release/\nagent-m-results:\n  stage: .post\n  image: node:22\n  when: always\n  environment:\n    name: agent-m-results\n    action: access\n  variables:\n    AGENT_M_OUT: \"$CI_PROJECT_DIR/agent-m-out\"\n  script:\n    - if [ -n \"$AGENT_M_COMMIT\" ]; then git fetch --quiet origin \"$AGENT_M_COMMIT\" && git checkout --quiet \"$AGENT_M_COMMIT\"; fi\n    - git clone --quiet https://github.com/alice/agent-m.git \"$AGENT_M_HOME\"\n    - git -C \"$AGENT_M_HOME\" checkout --quiet a100000000000000000000000000000000000000\n    - |\n      case \"$CI_PIPELINE_SOURCE\" in\n        push) occasion=\"every commit\" ;;\n        merge_request_event) occasion=\"pull request\" ;;\n        schedule) occasion=\"nightly\" ;;\n        *) occasion=\"$AGENT_M_OCCASION\" ;;\n      esac\n      AGENT_M_OCCASION=\"$occasion\" AGENT_M_COMMIT=\"${AGENT_M_COMMIT:-$CI_COMMIT_SHA}\" AGENT_M_NOTES=\"$(ls \"$AGENT_M_OUT\" 2>/dev/null | tr '\\n' ' ')\" node \"$AGENT_M_HOME/src/ci-entry/main.mjs\" results\n"]
}
```

```json format
{
  "$id": "GitHubJobWorkflowFile",
  "description": "The workflow of agents' jobs on GitHub; generated from the instance's CI agents, never edited.",
  "path": ".github/workflows/agent-m-job.yml",
  "syntax": "text",
  "content": "string",
  "examples": ["# Generated by Agent M from the CI agents of the instance; change the participants, not this file.\nname: agent-m job\nrun-name: agent-m job ${{ inputs.AGENT_M_JOB }}\non:\n  workflow_dispatch:\n    inputs:\n      AGENT_M_JOB:\n        description: the job's identifier\n        type: string\n        required: true\n      AGENT_M_PARTICIPANT:\n        description: the CI agent that carries it out\n        type: string\n        required: true\npermissions:\n  contents: read\nconcurrency:\n  group: agent-m-job-${{ inputs.AGENT_M_JOB }}\njobs:\n  ci-dev:\n    if: inputs.AGENT_M_PARTICIPANT == 'ci-dev'\n    runs-on: ubuntu-latest\n    timeout-minutes: 300\n    env:\n      AGENT_M_HOME: ${{ github.workspace }}/agent-m\n      AGENT_M_OUT: ${{ github.workspace }}/agent-m-out\n      AGENT_M_JOB: ${{ inputs.AGENT_M_JOB }}\n      AGENT_M_INSTANCE: https://github.com/alice/agent-m\n      AGENT_M_WAIT_MINUTES: \"240\"\n    steps:\n      - run: rm -rf \"$AGENT_M_OUT\" && mkdir -p \"$AGENT_M_OUT\"\n      - uses: actions/checkout@v4\n        with:\n          path: product\n          fetch-depth: 0\n          persist-credentials: false\n      - uses: actions/checkout@v4\n        with:\n          repository: alice/agent-m\n          ref: a100000000000000000000000000000000000000\n          path: agent-m\n      - uses: actions/setup-node@v4\n        with:\n          node-version: \"22\"\n      - run: npm install --global @anthropic-ai/claude-code\n      - id: start\n        working-directory: product\n        env:\n          AGENT_M_TOKEN: ${{ secrets.AGENT_M_TOKEN }}\n        run: node \"$AGENT_M_HOME/src/ci-entry/main.mjs\" job-start\n      - if: steps.start.outputs.next == 'agent'\n        working-directory: product\n        env:\n          BRANCH: ${{ steps.start.outputs.branch }}\n          BASE: ${{ steps.start.outputs.base }}\n        run: |\n          git config user.name \"ci-dev\"\n          git config user.email \"ci-dev@agent-m.invalid\"\n          git checkout \"$BRANCH\" 2>/dev/null || git checkout -b \"$BRANCH\" \"origin/$BASE\"\n      - if: steps.start.outputs.next == 'agent'\n        working-directory: product\n        env:\n          ANTHROPIC_API_KEY: ${{ secrets.AGENT_M_AGENT_KEY_CI_DEV }}\n        run: claude --bare -p \"Carry out the task the input describes.\" --model 'claude-opus-5-5' --permission-mode acceptEdits --allowedTools Bash --permission-prompts none --output-format json < \"$AGENT_M_OUT/prompt.md\" > \"$AGENT_M_OUT/report.json\"\n      - id: push\n        if: always() && steps.start.outputs.next == 'agent'\n        working-directory: product\n        env:\n          AGENT_M_TOKEN: ${{ secrets.AGENT_M_TOKEN }}\n          BRANCH: ${{ steps.start.outputs.branch }}\n          BASE: ${{ steps.start.outputs.base }}\n        run: |\n          node \"$AGENT_M_HOME/src/ci-entry/main.mjs\" may-write\n          base=\"$(git rev-parse --verify --quiet \"origin/$BRANCH\" || git rev-parse \"origin/$BASE\")\"\n          if [ -n \"$(git rev-list \"$base..HEAD\")\" ]; then\n            auth=\"AUTHORIZATION: basic $(printf 'x-access-token:%s' \"$AGENT_M_TOKEN\" | base64 -w0)\"\n            if ! git rev-parse --verify --quiet \"origin/$BRANCH\" >/dev/null; then\n              git -c \"http.https://github.com/.extraheader=$auth\" push origin \"$(git rev-list --reverse \"$base..HEAD\" | head -n 1):refs/heads/$BRANCH\"\n            fi\n            git -c \"http.https://github.com/.extraheader=$auth\" push origin \"HEAD:refs/heads/$BRANCH\"\n            echo \"pushed=true\" >> \"$GITHUB_OUTPUT\"\n          fi\n      - if: always() && steps.start.outputs.next == 'agent'\n        working-directory: product\n        env:\n          AGENT_M_TOKEN: ${{ secrets.AGENT_M_TOKEN }}\n          AGENT_M_PUSHED: ${{ steps.push.outputs.pushed }}\n        run: |\n          while :; do node \"$AGENT_M_HOME/src/ci-entry/main.mjs\" job-observe && break; [ $? -eq 75 ] || exit 1; sleep 60; done\n      - if: always() && steps.start.outputs.run != ''\n        working-directory: product\n        env:\n          AGENT_M_TOKEN: ${{ secrets.AGENT_M_TOKEN }}\n        run: node \"$AGENT_M_HOME/src/ci-entry/main.mjs\" engine-dispatch\n  gpu-dev:\n    if: inputs.AGENT_M_PARTICIPANT == 'gpu-dev'\n    runs-on: [self-hosted, gpu-1]\n    timeout-minutes: 300\n    env:\n      AGENT_M_HOME: ${{ github.workspace }}/agent-m\n      AGENT_M_OUT: ${{ github.workspace }}/agent-m-out\n      AGENT_M_JOB: ${{ inputs.AGENT_M_JOB }}\n      AGENT_M_INSTANCE: https://github.com/alice/agent-m\n      AGENT_M_WAIT_MINUTES: \"240\"\n    steps:\n      - run: rm -rf \"$AGENT_M_OUT\" && mkdir -p \"$AGENT_M_OUT\"\n      - uses: actions/checkout@v4\n        with:\n          path: product\n          fetch-depth: 0\n          persist-credentials: false\n      - uses: actions/checkout@v4\n        with:\n          repository: alice/agent-m\n          ref: a100000000000000000000000000000000000000\n          path: agent-m\n      - uses: actions/setup-node@v4\n        with:\n          node-version: \"22\"\n      - id: start\n        working-directory: product\n        env:\n          AGENT_M_TOKEN: ${{ secrets.AGENT_M_TOKEN }}\n        run: node \"$AGENT_M_HOME/src/ci-entry/main.mjs\" job-start\n      - if: steps.start.outputs.next == 'agent'\n        working-directory: product\n        env:\n          BRANCH: ${{ steps.start.outputs.branch }}\n          BASE: ${{ steps.start.outputs.base }}\n        run: |\n          git config user.name \"gpu-dev\"\n          git config user.email \"gpu-dev@agent-m.invalid\"\n          git checkout \"$BRANCH\" 2>/dev/null || git checkout -b \"$BRANCH\" \"origin/$BASE\"\n      - if: steps.start.outputs.next == 'agent'\n        working-directory: product\n        run: codex exec --model 'codex-model' --sandbox workspace-write --json - < \"$AGENT_M_OUT/prompt.md\" > \"$AGENT_M_OUT/report.json\"\n      - id: push\n        if: always() && steps.start.outputs.next == 'agent'\n        working-directory: product\n        env:\n          AGENT_M_TOKEN: ${{ secrets.AGENT_M_TOKEN }}\n          BRANCH: ${{ steps.start.outputs.branch }}\n          BASE: ${{ steps.start.outputs.base }}\n        run: |\n          node \"$AGENT_M_HOME/src/ci-entry/main.mjs\" may-write\n          base=\"$(git rev-parse --verify --quiet \"origin/$BRANCH\" || git rev-parse \"origin/$BASE\")\"\n          if [ -n \"$(git rev-list \"$base..HEAD\")\" ]; then\n            auth=\"AUTHORIZATION: basic $(printf 'x-access-token:%s' \"$AGENT_M_TOKEN\" | base64 -w0)\"\n            if ! git rev-parse --verify --quiet \"origin/$BRANCH\" >/dev/null; then\n              git -c \"http.https://github.com/.extraheader=$auth\" push origin \"$(git rev-list --reverse \"$base..HEAD\" | head -n 1):refs/heads/$BRANCH\"\n            fi\n            git -c \"http.https://github.com/.extraheader=$auth\" push origin \"HEAD:refs/heads/$BRANCH\"\n            echo \"pushed=true\" >> \"$GITHUB_OUTPUT\"\n          fi\n      - if: always() && steps.start.outputs.next == 'agent'\n        working-directory: product\n        env:\n          AGENT_M_TOKEN: ${{ secrets.AGENT_M_TOKEN }}\n          AGENT_M_PUSHED: ${{ steps.push.outputs.pushed }}\n        run: |\n          while :; do node \"$AGENT_M_HOME/src/ci-entry/main.mjs\" job-observe && break; [ $? -eq 75 ] || exit 1; sleep 60; done\n      - if: always() && steps.start.outputs.run != ''\n        working-directory: product\n        env:\n          AGENT_M_TOKEN: ${{ secrets.AGENT_M_TOKEN }}\n        run: node \"$AGENT_M_HOME/src/ci-entry/main.mjs\" engine-dispatch\n"]
}
```

```json format
{
  "$id": "GitHubDoneWorkflowFile",
  "description": "The check of the Definition of Done on GitHub; generated, never edited.",
  "path": ".github/workflows/agent-m-done.yml",
  "syntax": "text",
  "content": "string",
  "examples": ["# Generated by Agent M; the conditions are the Definition of Done of docs/process.md.\nname: agent-m done\non:\n  pull_request:\npermissions:\n  contents: read\njobs:\n  done:\n    if: startsWith(github.head_ref, 'item/') || startsWith(github.head_ref, 'job/')\n    runs-on: ubuntu-latest\n    timeout-minutes: 120\n    env:\n      AGENT_M_HOME: ${{ github.workspace }}/agent-m\n      AGENT_M_BRANCH: ${{ github.head_ref }}\n      AGENT_M_INSTANCE: https://github.com/alice/agent-m\n    steps:\n      - uses: actions/checkout@v4\n        with:\n          ref: ${{ github.event.repository.default_branch }}\n          path: product\n          persist-credentials: false\n      - uses: actions/checkout@v4\n        with:\n          repository: alice/agent-m\n          ref: a100000000000000000000000000000000000000\n          path: agent-m\n      - uses: actions/setup-node@v4\n        with:\n          node-version: \"22\"\n      - working-directory: product\n        env:\n          AGENT_M_TOKEN: ${{ secrets.AGENT_M_TOKEN }}\n        run: |\n          while :; do node \"$AGENT_M_HOME/src/ci-entry/main.mjs\" done-check && break; [ $? -eq 75 ] || exit 1; sleep 60; done\n"]
}
```

```json format
{
  "$id": "GitHubEngineWorkflowFile",
  "description": "The engine workflow on GitHub, which takes the next step of every open run; generated, never edited.",
  "path": ".github/workflows/agent-m-engine.yml",
  "syntax": "text",
  "content": "string",
  "examples": ["# Generated by Agent M; it takes the next step of every open run of the product.\nname: agent-m engine\nrun-name: agent-m engine\non:\n  workflow_dispatch:\npermissions:\n  contents: read\nconcurrency:\n  group: agent-m-engine\njobs:\n  engine:\n    runs-on: ubuntu-latest\n    timeout-minutes: 30\n    env:\n      AGENT_M_HOME: ${{ github.workspace }}/agent-m\n      AGENT_M_INSTANCE: https://github.com/alice/agent-m\n      AGENT_M_VERSION: a100000000000000000000000000000000000000\n    steps:\n      - uses: actions/checkout@v4\n        with:\n          path: product\n          persist-credentials: false\n      - uses: actions/checkout@v4\n        with:\n          repository: alice/agent-m\n          ref: a100000000000000000000000000000000000000\n          path: agent-m\n      - uses: actions/setup-node@v4\n        with:\n          node-version: \"22\"\n      - working-directory: product\n        env:\n          AGENT_M_TOKEN: ${{ secrets.AGENT_M_TOKEN }}\n        run: node \"$AGENT_M_HOME/src/ci-entry/main.mjs\" engine\n"]
}
```

```json type
{
  "$id": "CiEnv",
  "description": "The environment of a CI job as the steps read it: the platform's variables, those the generated job sets — AGENT_M_KIND, AGENT_M_JUNIT, AGENT_M_COMMIT, AGENT_M_OCCASION, AGENT_M_OUTCOME, AGENT_M_RUN, AGENT_M_LOG, AGENT_M_SECRETS — and the secrets it was given.",
  "type": "object",
  "additionalProperties": { "type": "string" },
  "examples": [{ "AGENT_M_KIND": "system", "AGENT_M_JUNIT": "/home/runner/work/thesis/agent-m-out/system/junit.xml" }]
}
```

```json type
{
  "$id": "RunOutcome",
  "description": "A run and its own outcome.",
  "type": "object",
  "required": ["run", "outcome"],
  "additionalProperties": false,
  "properties": {
    "run": { "type": "string" },
    "outcome": { "type": "string", "enum": ["passed", "failed", "not-run"] }
  },
  "examples": [{ "run": "gh-4711-1-system", "outcome": "failed" }]
}
```

```json type
{
  "$id": "RecordsWritten",
  "description": "The records a pipeline's recording job wrote: their paths on test-results, the commit that added them, and each run's own outcome.",
  "type": "object",
  "required": ["paths", "commit", "outcomes"],
  "additionalProperties": false,
  "properties": {
    "paths": { "type": "array", "items": { "type": "string" } },
    "commit": { "type": "string", "pattern": "^[0-9a-f]{40}$" },
    "outcomes": { "type": "array", "items": { "$ref": "RunOutcome" } }
  },
  "examples": [
    {
      "paths": ["results/c100000000000000000000000000000000000000/gh-4711-1-system.md", "results/c100000000000000000000000000000000000000/gh-4711-1-unit.md"],
      "commit": "b200000000000000000000000000000000000000",
      "outcomes": [
        { "run": "gh-4711-1-system", "outcome": "failed" },
        { "run": "gh-4711-1-unit", "outcome": "not-run" }
      ]
    }
  ]
}
```

```json type
{
  "$id": "RunNoteLines",
  "description": "What the key-value-lines syntax reads from a job's run note.",
  "type": "object",
  "required": ["kind", "outcome", "missing", "run", "log", "participant"],
  "additionalProperties": false,
  "properties": {
    "kind": { "type": "string", "enum": ["unit", "component", "system", "paid", "release"] },
    "outcome": { "type": "string" },
    "missing": { "type": "string" },
    "run": { "type": "string", "minLength": 1 },
    "log": { "type": "string" },
    "participant": { "type": "string" }
  },
  "examples": [
    { "kind": "paid", "outcome": "failed", "missing": "HUB_KEY", "run": "gl-901-5501", "log": "https://gitlab.example.org/group/tools/thesis/-/jobs/5501", "participant": "GitLab CI, runner cli-dev on lab-pc-3" }
  ]
}
```

```json type
{
  "$id": "RunStep",
  "description": "What one step did to a run: the jobs it started, and the state its record gained with the reason — cancelled for a stopped run whose jobs ended; both empty where it stays as recorded.",
  "type": "object",
  "required": ["run", "started", "state", "note"],
  "additionalProperties": false,
  "properties": {
    "run": { "type": "string", "pattern": "^JOB-[0-9]{8}-[0-9]{4}-[0-9a-f]{4}$" },
    "started": { "type": "array", "items": { "type": "string" } },
    "state": { "type": "string", "enum": ["", "running", "waiting-at-gate", "done", "cancelled"] },
    "note": { "type": "string" }
  },
  "examples": [{ "run": "JOB-20261012-0900-0a0a", "started": ["JOB-20261012-1000-1999"], "state": "", "note": "" }]
}
```

```json type
{
  "$id": "EngineStep",
  "description": "What one run of the engine did: the commit of its step — empty where nothing was written —, what it did to each open run, the jobs of CI agents dispatched and those refused, and whether the default branch moved on, so that the engine was dispatched again.",
  "type": "object",
  "required": ["commit", "runs", "dispatched", "refused", "moved"],
  "additionalProperties": false,
  "properties": {
    "commit": { "type": "string", "pattern": "^([0-9a-f]{40})?$" },
    "runs": { "type": "array", "items": { "$ref": "RunStep" } },
    "dispatched": { "type": "array", "items": { "type": "string" } },
    "refused": { "type": "array", "items": { "$ref": "JobRefusal" } },
    "moved": { "type": "boolean" }
  },
  "examples": [
    {
      "commit": "e200000000000000000000000000000000000000",
      "runs": [{ "run": "JOB-20261012-0900-0a0a", "started": ["JOB-20261012-1000-1999"], "state": "", "note": "" }],
      "dispatched": ["JOB-20261012-1000-1999"],
      "refused": [],
      "moved": false
    },
    { "commit": "", "runs": [], "dispatched": [], "refused": [], "moved": true }
  ]
}
```

```json format
{
  "$id": "RunNoteFile",
  "description": "The note a job of a kind of test leaves of its run, written by the job's own last step whatever its status, and passed to the recording job as an artifact.",
  "path": "agent-m-out/{kind}/run.txt",
  "syntax": "key-value-lines",
  "content": "RunNoteLines",
  "examples": ["kind: paid\noutcome: failed\nmissing: HUB_KEY\nrun: gl-901-5501\nlog: https://gitlab.example.org/group/tools/thesis/-/jobs/5501\nparticipant: GitLab CI, runner cli-dev on lab-pc-3\n"]
}
```
