---
id: ARC-015
title: A product's CI is generated from its test schedule — GitHub Actions or GitLab CI —, every run writes its result record in a CI step, and every write from CI is made with the person's token from a named CI secret
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
---
# ARC-015 CI generated from the test schedule, and the credentials CI writes with

## Context

Each product declares which test levels run on every commit, on a pull request, nightly, on a
release candidate and on demand (`THE TEST SCHEDULE IS DECLARED PER PRODUCT`); without a
declaration the book's default applies. The CI configuration must follow from the schedule, never
be a second place that says the same (`THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE`). Job
records must not trigger test runs; every run leaves a result record on the append-only branch
`test-results`. The product's Definition of Done — declared in its own repository, defaulting to the
job rules — is checked in CI so that it holds whoever merges. Book ch. 12 §5: CI runs "the complete
test suite" on every commit; ch. 13 §4: paid external calls are mocked and exercised for real only in
"a limited nightly integration test".

Jobs on the server's own machines — the run engine's workflow, the job workflows of CI agents, the
result-record step — push, open pull requests and merge them. The SPEC says with which credential: the
agent authenticates with a key from a CI secret (`A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI
SECRET`), and every write is made with the person's Agent M token from a CI secret, never with the
workflow's built-in token (`A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET`). Until
2026-10-01 this was stated in seven files; this decision now holds it, and the others refer here.

## Decision

1. **The schedule is data** in the product repository, `docs/tests/schedule.md`: a Markdown table,
   one row per level (plus the row *tests that call a paid service*), one column per occasion — the
   same table UC-027 shows. A missing file means the default of `THE DEFAULT SCHEDULE FOLLOWS THE BOOK`.
2. **A generator** (`MOD-ci-generator`) turns schedule, product host and runner choices into:
   - GitHub: `.github/workflows/agent-m-tests.yml` with `push`, `pull_request`, `schedule` and
     `workflow_dispatch` triggers; each trigger's job runs exactly the levels of its column;
     `paths-ignore: ["docs/jobs/**"]` on `push` and `pull_request`, so a commit touching only job
     records starts nothing (`A JOB RECORD STARTS NO CI RUN`); the `push` trigger excludes the branch
     `test-results` (ARC-006);
   - GitLab: `.gitlab-ci.yml` with `rules:` on `$CI_PIPELINE_SOURCE` and `changes:` excluding
     `docs/jobs/**`, and the nightly run as a pipeline schedule created through the API (UC-027 3a) — the keywords
     `paths-ignore` and `rules:changes` read 2026-09-30 in GitHub's workflow syntax reference
     (`https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax`) and GitLab's CI/CD
     YAML reference (`https://docs.gitlab.com/ci/yaml/`);
   - the **engine workflow** (ARC-010) and the **job workflow** that runs CI-agent jobs (ARC-009), each a
     call of the CI entry (ARC-003) with the step to run.

   Generation is deterministic: the same schedule gives byte-identical files, so a test can compare
   the committed configuration with a fresh generation (UC-027 1b).
3. **Which test is which level** is read from each test's declaration (ARC-020: `Level:`, `Guards:`,
   `TST-` identifier); the generated job passes the level to the product's own test runner through a
   documented environment variable, and the product's runner filters by it. Agent M does not replace
   the product's test framework.
4. **Result records are written by a CI step.** After the tests, a final step of each generated job
   converts the runner's report (JUnit XML is the common format the step reads) into a result record
   — commit, levels, participant (the CI service and runner), date, each test's outcome — and commits
   it to the branch `test-results` as a new file, fast-forward only, with `concurrency` per product so
   two runs append one after the other. The step never modifies or deletes a file on that branch. A
   push to `test-results` starts no pipeline, because the generated configuration excludes that branch
   from its triggers (ARC-006: the branch "has no CI trigger").
5. **The Definition of Done check** is a further generated step on pull requests of implementation
   jobs: it reads the product's declared Definition of Done (default: the job rules), the job record,
   the branch's first commit and its CI result, and fails when a condition does not hold, naming it.
6. **Every generated file reaches the default branch through a pull request with green CI**, like code
   (`CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI`).
7. **The credentials CI writes with.** Each product's CI holds two named secrets, which the dashboard
   names and whose settings page it opens, and whose values it never asks for:
   - the **agent's key**, read only by the job workflow and handed only to the agent's provider (`A
     HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET`);
   - the **person's Agent M token**, with which every push, pull request and merge of the engine
     workflow, of the job workflows and of the result-record step is made (`A HOSTED JOB WRITES WITH THE
     PERSON'S TOKEN FROM A CI SECRET`) — on GitHub the one fine-grained token of `ONE GITHUB TOKEN SERVES
     EVERY FEATURE`, which carries *Contents*, *Pull requests*, *Actions* and *Workflows* write; on GitLab
     the product's project access token (`A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN`), stored as a
     protected, masked CI/CD variable.

   The workflow's built-in token (`GITHUB_TOKEN`, `CI_JOB_TOKEN`) is given no write. The CI entry makes
   the `ci-secret` authority of ARC-003 from the named secret, and the generator refuses to write a file
   that writes with the built-in token. The generated files name the secrets, never their values (`NO
   SECRET IN THE REPOSITORY`). The result-record step pushes with the same secret: on GitLab the job token
   may push only where the project allows it — "This setting is turned off by default.", generally
   available in GitLab 18.4 (`https://docs.gitlab.com/ci/jobs/ci_job_token/`, read 2026-09-30) —, and
   one credential path on both hosts is simpler than two.

## Alternatives

- **One hand-written workflow reading the schedule at run time** — rejected: the schedule decides the
  triggers themselves (nightly or not), and triggers cannot be computed at run time; also GitLab needs
  its own file.
- **Result records as CI artifacts** — rejected by `TEST RESULTS ARE KEPT IN THE REPOSITORY`: servers
  delete them after their retention period.
- **Result records in the default branch** — rejected: a commit per run on the default branch would
  start CI again and bury the history.
- **The built-in token for the job workflows' pushes and pull requests** — rejected by `A HOSTED JOB
  WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET`: its events start no new run, and its pull requests
  wait in "approval-required" (consequences); on GitLab the job token opens no merge request.
- **The built-in token for the result-record step only** (on GitHub it would work, since that push
  needs to start nothing) — not chosen: on GitLab it needs a project setting that is off by default,
  and two credential paths for one kind of step are one more thing to get wrong.
- **A GitHub App installation token** minted in the workflow — GitHub's other documented remedy, which
  "will expire after 1 hour" (`https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-an-installation-access-token-for-a-github-app`,
  read 2026-09-30) — not chosen: minting needs the App's private key, and a second credential beside the
  person's token contradicts `ONE GITHUB TOKEN SERVES EVERY FEATURE`.

## Consequences

- A product whose runner produces no JUnit XML gets a result record with the run's overall outcome
  only and a note naming what is missing; the per-test outcome then needs an adapter in the product.
- GitLab schedules live outside the repository file; the settings page shows the schedule the API
  reports beside the declared one.
- The append-only property of `test-results` is checked over the branch history by a test (ARC-006);
  where the host offers branch protection against force pushes, the settings page recommends it.
- Concurrent runs on one product serialise their result commits; a commit that loses the race is
  retried on the new head, which is safe because it only adds a new file.
- **Why not the built-in token.** Read 2026-09-30 in
  `https://docs.github.com/en/actions/concepts/security/github_token` (recorded in
  `docs/measurements/2026-09-30_architecture-open-points.md`, point 8): "events triggered by the
  `GITHUB_TOKEN` will not create a new workflow run", except that "`workflow_dispatch` and
  `repository_dispatch` events always create workflow runs"; a pull request opened or updated with it
  "creates workflow runs in an **approval-required** state", released only by "a user with write access"
  selecting "**Approve workflows to run**". A run would stop at that click (`A RUN CONTINUES WITHOUT A
  CLICK BETWEEN ITS JOBS`). GitHub's remedy is "a GitHub App installation access token or a personal
  access token", which "lets `pull_request` workflows run automatically (without the approval prompt
  described above)"; the PO chose the person's own token. On GitLab, "When you use a job token to push to
  the project, no CI/CD pipelines are triggered", and the job token can only read merge requests
  (`https://docs.gitlab.com/ci/jobs/ci_job_token/`, read 2026-09-30).
- **The token is stored twice.** A secret cannot be read back — the secrets API lists secrets "without
  revealing their encrypted values" (`https://docs.github.com/en/rest/actions/secrets`, read
  2026-09-30) —, so the person stores the token in the browser and as the secret; the dashboard names the
  secret and opens its page, and the token's renewal (`A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE`) names
  both places.
- The token a CI job writes with needs, per GitHub's permission table
  (`https://docs.github.com/en/rest/authentication/permissions-required-for-fine-grained-personal-access-tokens`,
  read 2026-09-30, measurement point 8): *Contents* write to push through the git data API and to merge a
  pull request, *Pull requests* write to open one, and *Workflows* write where it writes CI files (`A RUN
  SETS UP CI BEFORE IT IMPLEMENTS`); dispatching a run needs *Actions*, as the occasion of `ONE GITHUB
  TOKEN SERVES EVERY FEATURE` states. These are the permissions that requirement names.
- **Open measurement 1 — *Workflows* on a push.** GitHub states the need for *Workflows* write only for
  the releases endpoint ("also need the "Workflows" repository permission (write)") and that "The
  GITHUB_TOKEN available to GitHub Actions cannot be authorized for this"
  (`https://docs.github.com/en/rest/releases/releases`); whether a commit that changes
  `.github/workflows/` through the git data API or `git push` needs it is not documented in what was read.
  Measurement: update a workflow file with a fine-grained token without *Workflows*, and with it; record
  both answers.
- **Open measurement 2 — GitLab.** Whether a push and a merge request made with a GitLab project access
  token start pipelines as usual: GitLab documents the exception only for the job token, and the project
  access token pages say nothing about pipelines (measurement point 8: 0 hits for "pipeline" in
  `project_access_tokens.md`). Measurement: push and open a merge request with a project access token on
  a test project; record the pipelines.
- Which GitLab version runs on `gitlab.rrze.fau.de` and `gitos.rrze.fau.de` matters no longer for
  pushing (the job token is not used to push), only for the features UC-027 uses there.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; revised on 2026-09-30 by Claude (claude-opus-5-5) against commit 1110607b6dc4d9c888549a23a680fbe4b38dd3f1 — SPEC and use cases as accepted that day, and `docs/measurements/2026-09-30_architecture-open-points.md`; revised on 2026-10-01 by Claude (claude-opus-5-5) against commit d0e5631081876203e719a2508d673d904e7768db — the leaner architecture of the architecture review, as the PO approved it (UC-023): the CI credentials of ARC-010 decision 8 and its consequences moved here; open until accepted.*
