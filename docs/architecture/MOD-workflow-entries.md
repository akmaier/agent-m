---
id: MOD-workflow-entries
title: The entries CI runs, in a product and in the instance
folder: src/workflow-entries/
realises:
follows:
  - ARC-039
uses:
  - MOD-repository-hosts.connect
  - MOD-repository-hosts.readSnapshot
  - MOD-repository-hosts.commitFiles
  - MOD-repository-hosts.pullRequestFacts
  - MOD-documents.readDocument
  - MOD-documents.readRegister
  - MOD-documents.writeDocument
  - MOD-text-tools.Finding
  - MOD-test-document.TestDeclaration
  - MOD-test-document.testDeclarations
  - MOD-participant-list.participantSchema
  - MOD-endpoint-calls.endpointDriver
  - MOD-agent-processes.agentDriver
  - MOD-job-runner.JobContext
  - MOD-job-runner.registerStrategies
  - MOD-job-runner.prepareJob
  - MOD-job-runner.runJob
  - MOD-job-catalogue.kindOf
  - MOD-job-ledger.JobRecord
  - MOD-job-ledger.RecordPart
  - MOD-job-ledger.newJobId
  - MOD-job-ledger.startRecord
  - MOD-job-ledger.takeJob
  - MOD-job-ledger.appendToRecord
  - MOD-job-ledger.jobState
  - MOD-progress-measures.productFacts
  - MOD-runtimes.queueJob
  - MOD-runtimes.routeStrategies
  - MOD-run-planner.runOf
  - MOD-run-planner.nextActions
  - MOD-run-planner.runStrategies
  - MOD-product-process.declarationSchema
  - MOD-product-process.workflowOf
  - MOD-product-process.gateSchema
  - MOD-product-process.gateStates
  - MOD-product-process.doneCheck
  - MOD-product-process.recordGateDecision
  - MOD-product-process.processStrategies
  - MOD-work-plans.sprintFacts
  - MOD-work-plans.workStrategies
  - MOD-issue-handling.closeWithLinks
  - MOD-issue-handling.issueStrategies
  - MOD-spec-changes.applyApproved
  - MOD-spec-changes.specStrategies
  - MOD-approvals.approvalStrategies
  - MOD-artifact-edits.editStrategies
  - MOD-source-register.recogniseLegalText
  - MOD-source-register.fetchLegalText
  - MOD-source-register.versionCommits
  - MOD-source-register.sourceStrategies
  - MOD-reuse-facts.reuseStrategies
  - MOD-resource-list.resourceStrategies
  - MOD-test-schedule.applyPipelineSchedule
  - MOD-test-schedule.scheduleStrategies
  - MOD-result-records.parseOutcomes
  - MOD-result-records.appendResult
  - MOD-result-records.resultStrategies
  - MOD-bridge-build.buildPlatform
  - MOD-bridge-build.publishRelease
provides:
  - onRecordsChanged
  - onDoneCheck
  - onPullRequestClosed
  - onCheckCompleted
  - onSchedule
  - onDispatch
  - onTestsFinished
  - onApprovalsCommitted
  - onSourcesCommitted
  - onReleaseTagged
  - CiEnvironment
---
# MOD-workflow-entries The entries CI runs, in a product and in the instance

## Responsibility

It is the one module of the Workflows (ARC-039), the CI driver of ARC-037: every entry point that CI runs, in a product's
job workflow and in the instance's own workflows. Each entry reads its event, its secrets and the repository it runs in
from the CI environment, composes the shared modules — registering with the job runner the strategies of the services
whose kinds may run in CI —, does the work of its event, and ends with a status CI shows. It keeps nothing between runs.
It runs in Node, in GitHub Actions or GitLab CI, on hosted or self-hosted runners.

## Parts

- `main.mjs` — reads the entry's name from the command line and the environment, and runs it.
- `compose.mjs` — connects the repository twice — through Access's local clone for its files and records, and through
  the server's API with the same token for pull requests, issues and checks —, reads the participants and the
  declaration, and registers the strategies.
- `product.mjs` — the entries of a product's job workflow.
- `instance.mjs` — the entries of the instance's workflows.

## Data

It keeps nothing. It owns the contract between the workflow files and the entries, `CiEnvironment`. Every file that
runs an entry runs `node src/workflow-entries/main.mjs <entry>` from a checkout of the instance repository at the commit
the file names, in a checkout of the repository the event concerns. In a product, MOD-runtimes' job workflow —
`.github/workflows/agent-m-jobs.yml` on GitHub, `.gitlab/agent-m-jobs.yml` on GitLab — runs `onRecordsChanged`,
`onPullRequestClosed`, `onCheckCompleted`, `onSchedule` and `onDispatch`, and MOD-test-schedule's test configuration runs
`onDoneCheck` in its Definition-of-Done job and `onTestsFinished` after each run's tests; on GitLab each file is included
from the product's `.gitlab-ci.yml`. In the instance, its files under `.github/workflows/` run the instance's entries.

## Interfaces

- `CiEnvironment` — what an entry reads: the entry's name; the CI service (`github` or `gitlab`) and its event with its
  payload; the folder of the checkout and the repository's address; the instance repository and the commit of Agent M
  that runs (named in every commit a job makes, `AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT`); and, by the names the
  dashboard showed when the secrets were set up and never by value in a file: in a product, the person's Agent M token
  (`A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET`) and each CI participant's key
  (`A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET`); in the instance, the workflow's own token for the instance
  repository and the signing secrets of a release; for `onTestsFinished`, the path of the run's JUnit XML report. A
  secret that is missing ends the entry at once with a status that names it, before anything is written (UC-010).
- `onRecordsChanged(env: CiEnvironment) -> Promise<EntryStatus>` — on a push to `docs/jobs/` or `docs/gates/` of a
  product: takes each queued job whose route is this CI service and runs it from its record alone — its kind, the
  parameters of its `## Parameters` and its pinned inputs —, with the driver of its participant, a coding-agent process or
  a model endpoint, the participant's key from its secret, appending its records. No person attends a job in CI: its
  kind's writer writes at once (`A CI AGENT'S DRAFT ENTERS AS OPEN`), and a kind that hands its draft back leaves it in
  the record's end as `draft:`, from which the page shows it and a run starts the job that follows. The entry resumes each
  job of this route whose gate is now recorded (`A JOB STOPS AT EVERY GATE`); and computes the next actions of every run
  the change concerns, from the product's facts read once, taking those of this route and queueing those of other routes
  by their start records (`A RUN CONTINUES WITHOUT A CLICK BETWEEN ITS JOBS`). Two entries that compute the same action
  are safe: only one taking lands.
- `onDoneCheck(env: CiEnvironment) -> Promise<EntryStatus>` — on a pull request of a product opened or updated, run only by
  the Definition-of-Done job of MOD-test-schedule's test configuration: the Definition-of-Done check from the pull
  request's facts and the product's declared conditions, its status and findings shown on the pull request (`A PULL
  REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS`).
- `onPullRequestClosed(env: CiEnvironment) -> Promise<EntryStatus>` — run by the job workflow when a pull request of a
  product is merged or closed: on a merge, the issues it names closed with links, and, on a GitLab server, when it is the
  pull request that set up a run's CI, the project's pipeline schedule of the nightly run set from the merged schedule;
  merged or closed, the next actions of the runs it concerns, as `onRecordsChanged` computes them.
- `onCheckCompleted(env: CiEnvironment) -> Promise<EntryStatus>` — on a completed CI check that a gate of the product's
  workflow names as its decider: the gate's record — decided by that check, passed or not, on which commit (`A GATE NAMES
  WHO DECIDES IT`, `THE GATE IS RECORDED`) —, written through Process's `recordGateDecision`, whose push resumes the
  waiting job.
- `onSchedule(env: CiEnvironment) -> Promise<EntryStatus>` — on the product's schedule: the events in time, such as the
  end of a sprint's time box, whose close, if the product assigned it to an agent, is queued for that agent's route (`A
  SPRINT CLOSED BY AN AGENT STARTS BY ITSELF`).
- `onDispatch(env: CiEnvironment) -> Promise<EntryStatus>` — on a run started from the CI service's own page with the
  inputs the dashboard named (UC-024): writes the job's start record, those inputs its parameters, and runs it as
  `onRecordsChanged` runs a job.
- `onTestsFinished(env: CiEnvironment) -> Promise<EntryStatus>` — in a product, the step after the tests of every run of
  MOD-test-schedule's configuration: the run's result record — the commit, the levels run, the occasion, who ran it, the
  date, the run's address, `uncommitted` when the working tree held changes not in the commit, and each test's outcome
  with the excerpts of its failures — added to the branch `test-results` (`EVERY TEST RUN LEAVES A RESULT RECORD`, `A
  RESULT RECORD IS NEVER REWRITTEN`). A level that did not run is not recorded as passed. On `Moved` it reads the branch
  again and adds again; a record that cannot be added ends the entry with `failed`, so that the run is not shown green
  without its record. It reads the outcomes from the run's JUnit XML report, matched to the declarations of the
  product's tests, and appends the record.
- `onApprovalsCommitted(env: CiEnvironment) -> Promise<EntryStatus>` — in the instance: applies every approval of the
  instance's own SPEC that the dashboard did not apply, with the same functions the dashboard uses, byte for byte, or
  nothing when a text is stale (`WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE`, `A STALE APPROVAL IS NOT
  APPLIED`); the status names what was applied and what was stale.
- `onSourcesCommitted(env: CiEnvironment) -> Promise<EntryStatus>` — in the instance: for each register entry of an EU
  legal text that asks to be fetched, fetches the official text and commits it with its retrieval date, the repository's
  version identifier and its SHA-256, completing the entry; a failed fetch is written into the entry as its error, and
  nothing is guessed (`AN EU LEGAL TEXT IS FETCHED FROM THE OFFICIAL REPOSITORY`).
- `onReleaseTagged(env: CiEnvironment) -> Promise<EntryStatus>` — in the instance, on a release tag: on each platform's
  runner, the Bridge's file of that platform, signed; then the files, checksums, signatures and update feed published as
  the release of the tag (`THE BRIDGE IS SIGNED BY ITS PUBLISHER`); nothing is published when a signature cannot be
  verified.

`EntryStatus` is `{ outcome: "done" | "nothing to do" | "failed" | "not run", summary: string, findings: Finding[] }`;
`not run` names what was missing, such as a secret, and is never shown as passed. Every entry crosses the network to
the repository server and, where it runs a job, to the participant's endpoint or agent; a failure of either ends the
entry with `failed` and the server's or participant's message, and a job it had taken is ended in its record as failed.

## Files

In a product: reads the snapshot of the checkout — `docs/participants.md` and `SPEC.md`, whose requirements are the
process requirements, through the instance's checkout, the product's
`docs/process.md`, its plan or backlog, `docs/jobs/` and `docs/gates/` —, writes job and gate records and the results of
jobs through Access's local clone; reads pull requests and closes issues through the server's API, since the local clone
does no server operation; appends result records to the branch `test-results`; on GitLab, sets the project's pipeline
schedule. In the instance: reads approval records, change queues, `SPEC.md` and `docs/sources/`; writes `SPEC.md`
sections with their decisions and the fetched texts of sources. Reads secrets only from the environment.

## Uses

- `MOD-repository-hosts.connect`, `readSnapshot`, `commitFiles` — the repository the entry runs in, through the local
  clone with the token from the secret; `pullRequestFacts` — the facts the Definition-of-Done check weighs, through the
  server's API with the same token.
- `MOD-documents.readDocument`, `readRegister`, `writeDocument` and `MOD-participant-list.participantSchema` — the
  declaration, the participants; the error of a failed fetch in its register entry.
- `MOD-text-tools.Finding` — the findings an entry reports.
- `MOD-test-document.TestDeclaration`, `testDeclarations` — the declarations of the product's tests, to which a report's
  outcomes are matched.
- `MOD-endpoint-calls.endpointDriver`, `MOD-agent-processes.agentDriver` — the drivers of CI participants.
- `MOD-job-runner.JobContext`, `registerStrategies`, `prepareJob`, `runJob`, `MOD-job-catalogue.kindOf` — running a job of
  any kind from its record, unattended.
- `MOD-job-ledger.JobRecord`, `RecordPart`, `newJobId`, `startRecord`, `takeJob`, `appendToRecord`, `jobState` — the
  records of the jobs it takes, their parameters, and their ends with a draft handed back.
- `MOD-runtimes.queueJob` — queueing the actions of other routes.
- `MOD-progress-measures.productFacts` — the product's facts, read once per entry, from which the next actions of its
  runs are computed.
- `MOD-run-planner.runOf`, `nextActions` — the runs and their next actions.
- `MOD-product-process.declarationSchema`, `workflowOf`, `gateSchema`, `gateStates`, `doneCheck` — the workflow, the
  gates and the Definition of Done, checked by `onDoneCheck`; `recordGateDecision` — a CI check's decision on a gate.
  The workflow is read with the instance's SPEC, where the process requirements stand.
- `MOD-test-schedule.applyPipelineSchedule` — the nightly pipeline schedule on GitLab once a run's CI is merged.
- `MOD-result-records.parseOutcomes`, `appendResult` — a run's outcomes read from its JUnit XML report, and its result
  record.
- `MOD-work-plans.sprintFacts` — the sprints whose time box ended.
- `MOD-issue-handling.closeWithLinks` — closing the issues a merged pull request names, in `onPullRequestClosed`.
- `MOD-spec-changes.applyApproved` — applying the instance's approved SPEC changes.
- `MOD-source-register.recogniseLegalText`, `fetchLegalText`, `versionCommits` — fetching EU legal texts.
- `MOD-bridge-build.buildPlatform`, `MOD-bridge-build.publishRelease` — the Bridge's release.
- The strategies registered with the runner: `MOD-approvals.approvalStrategies`, `MOD-spec-changes.specStrategies`,
  `MOD-artifact-edits.editStrategies`, `MOD-source-register.sourceStrategies`, `MOD-reuse-facts.reuseStrategies`,
  `MOD-resource-list.resourceStrategies`, `MOD-work-plans.workStrategies`, `MOD-run-planner.runStrategies`,
  `MOD-product-process.processStrategies`, `MOD-test-schedule.scheduleStrategies`,
  `MOD-result-records.resultStrategies`, `MOD-issue-handling.issueStrategies`, `MOD-runtimes.routeStrategies`. The
  strategies of the mail kinds are not registered: no mail reaches CI.
