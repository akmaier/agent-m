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
  - MOD-repository-hosts.readHistory
  - MOD-documents.readDocument
  - MOD-documents.readRegister
  - MOD-documents.writeDocument
  - MOD-text-tools.Finding
  - MOD-test-document.TestDeclaration
  - MOD-test-document.testDeclarations
  - MOD-participant-list.participantSchema
  - MOD-endpoint-calls.endpointDriver
  - MOD-endpoint-calls.diagnoseEndpoint
  - MOD-endpoint-calls.testEndpoint
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
  - MOD-run-planner.finishRun
  - MOD-run-planner.runStrategies
  - MOD-product-process.declarationSchema
  - MOD-product-process.productWorkflow
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
  - MOD-trace-graph.publishGraph
  - MOD-approvals.statuses
  - MOD-approvals.lastAcceptedText
  - MOD-progress-measures.publishOverview
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
  - chooseAgentKey
  - leaveResult
  - writeResult
  - onTestsFinished
  - onApprovalsCommitted
  - onSourcesCommitted
  - onReleaseTagged
  - onMainChanged
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
  - In a product's job workflow it also connects the checkout of the instance as a host, through Access's local clone.
    That host is `productFacts`' `instanceAt`: the instance at the commit a product's declaration names, which is
    another commit than the one the checkout holds.
  - The clone fetches that commit from its origin with its own credentials (MOD-repository-hosts' `readSnapshot`), the
    access the job workflow checked the instance out with. No further token is used, and the generated files are
    unchanged.
- `product.mjs` — the entries of a product's job workflow.
- `result.mjs` — the run's result between the agent's machine and the writing machine of a product's job workflow on
  GitHub: the repository the agent's checkout pushes into, what is kept for later, the result packed, read, checked and
  written.
- `instance.mjs` — the entries of the instance's workflows.
- **Taken over, outside this folder** (`CODE OUTSIDE THE ARCHITECTURE IS MOVED INTO IT`; the count in `docs/measurements/2026-10-17_code-outside-every-module.md`). Each file goes as stated, in this module's own implementation jobs:
  - `.github/workflows/apply-approvals.yml`, `.github/workflows/fetch-sources.yml`, `.github/workflows/main-changed.yml`, `.github/workflows/release.yml`: named here, since GitHub fixes their place; `apply-approvals.yml` runs `onApprovalsCommitted`, `main-changed.yml` runs `onMainChanged` and `release.yml` runs `onReleaseTagged`, each and nothing else, as this module states.
  - `tools/apply_approvals.py`: removed once the workflow runs the entry.
  - `tests/test_apply_approvals.py`: its header names this module.

## Data

It keeps nothing. It owns the contract between the workflow files and the entries, `CiEnvironment`. Every file that
runs an entry runs `node src/workflow-entries/main.mjs <entry>` from a checkout of the instance repository at the commit
the file names, in a checkout of the repository the event concerns. In a product, MOD-runtimes' job workflow —
`.github/workflows/agent-m-jobs.yml` on GitHub, `.gitlab/agent-m-jobs.yml` on GitLab — runs `onRecordsChanged`,
`onPullRequestClosed`, `onCheckCompleted`, `onSchedule` and `onDispatch`; on GitHub, where a run has two machines
(MOD-runtimes, Data), `onRecordsChanged` and `onDispatch` run on the agent's machine, after `chooseAgentKey` and followed
by `leaveResult`, and `writeResult` and the other entries on the writing machine. MOD-test-schedule's test configuration runs
`onDoneCheck` in its Definition-of-Done job and `onTestsFinished` after each run's tests; on GitLab each file is included
from the product's `.gitlab-ci.yml`. In the instance, one file under `.github/workflows/` runs each of its entries —
`onApprovalsCommitted` on a push to `docs/approvals/`, `onSourcesCommitted` on a push to `docs/sources/` and on dispatch
for *Fetch again* (UC-004 7a), `onReleaseTagged` on a release tag, `onMainChanged` on every push to the default branch — and does nothing but run it.

On GitHub's agent's machine, `onRecordsChanged` and `onDispatch` run only the jobs whose key is the one the machine was
given, or none the file reads; a job of another of the file's keys stays queued for the run its own key's machine makes,
which the push of this run's result starts. They read no token. What they commit — the taking, a resumption, a start
record, the writer's commits, and the branch the agent pushes — lands in the result's own repository, the checkout's push
address; a pull request the writer opens and each job's end are kept for the writing machine, since the end names the
pull request and the commits as they stand once written. The records' bookkeeping thus reaches the product only through
the writing machine.

## Interfaces

- `CiEnvironment` — what an entry reads: the entry's name; the CI service (`github` or `gitlab`) and its event with its
  payload; the folder of the checkout and the repository's address; the instance repository and the commit of Agent M
  that runs (named in every commit a job makes, `AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT`); and, by the names the
  dashboard showed when the secrets were set up and never by value in a file: in a product, the person's Agent M token
  (`A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET`) and each CI participant's key
  (`A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET`) — on GitHub's agent's machine no token and the one key whose
  place among the key names the machine is given, on the writing machine the token and every key —, the machine, `agent`
  or `write`, the folder of the result between them, and the file of a step's outputs; in the instance, the workflow's own token for the instance
  repository and the signing secrets of a release; for `onTestsFinished`, the path of the run's JUnit XML report. A
  secret that is missing ends the entry at once with a status that names it, before anything is written (UC-010).
- `onRecordsChanged(env: CiEnvironment) -> Promise<EntryStatus>` — on a push to `docs/jobs/` or `docs/gates/` of a
  product: takes each queued job whose route is this CI service, except one whose task travels with its hand-over, which
  `onDispatch` takes, and runs it from its record alone — its kind, the
  parameters of its `## Parameters` and its pinned inputs —, with the driver of its participant, a coding-agent process or
  a model endpoint, the participant's key from its secret, appending its records. No person attends a job in CI: its
  kind's writer writes at once (`A CI AGENT'S DRAFT ENTERS AS OPEN`), and a kind that hands its draft back leaves it in
  the record's end as `draft:`, from which the page shows it and a run starts the job that follows. The entry resumes each
  job of this route whose gate is now recorded (`A JOB STOPS AT EVERY GATE`); and computes the next actions of every run
  the change concerns, from the product's facts read once, taking those of this route and queueing those of other routes
  by their start records (`A RUN CONTINUES WITHOUT A CLICK BETWEEN ITS JOBS`). Two entries that compute the same action
  are safe: only one taking lands. A job whose writer committed nothing, since its result equals the current files,
  ends done, and its end record and the entry's summary say `no change` (UC-010 4a).
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
- `onSchedule(env: CiEnvironment) -> Promise<EntryStatus>` — on the product's schedule: the events in time. Each sprint
  that MOD-work-plans' `sprintsToClose` names — its time box ended, or, without one, every selected item done or the
  Product Owner's `## Ended` — whose closer is an agent gets its close, a job of kind `close-sprint`, queued for that
  agent's route, unless a close of it is already queued or running (`A SPRINT CLOSED BY AN AGENT STARTS BY ITSELF`).
- `onDispatch(env: CiEnvironment) -> Promise<EntryStatus>` — on a run started from the CI service's own page with the
  inputs the dashboard named (UC-024): writes the job's start record, those inputs its parameters, and runs it as
  `onRecordsChanged` runs a job. On a run a hand-over started (UC-049 4a), whose input `job` names a queued record whose
  task travels with the hand-over: takes that job and runs it with the input `task` as its instruction — for a model
  endpoint, with opencode working with the endpoint the input `endpoint` names and the key from the CI secret the input
  `secret` names (MOD-agent-processes) —; a record that holds `declares` is run with the `Participant` of
  MOD-participant-list's shape built from it alone — its name and model from `participant` and `model`, its place from
  `## Destinations`, its context and capabilities from `declares`, the type *model endpoint* and no price —, any other
  with the participant of the instance's list that it names; it writes the task to no file, and a branch whose commit
  messages or pull request text hold the task's words is refused by name, the job then ending failed with nothing
  merged — on GitHub's agent's machine, where the branch is not on the server yet, `writeResult` refuses it; it appends the job's end with its commits, files and pull request, and leaves the answer in the run's summary
  and log — in the log between the lines `--- answer of <id> ---` and `--- end of the answer of <id> ---` —, where the
  prompt bar reads it. An endpoint the run cannot reach ends it `failed`, its summary naming the
  reason that MOD-endpoint-calls' `diagnoseEndpoint` gives and the routes that would work — a self-hosted runner, or a
  Bridge (UC-049 4d).
- `chooseAgentKey(env: CiEnvironment) -> Promise<EntryStatus>` — on GitHub, before the agent's machine starts, on a
  machine that holds no secret: which agent's job of the route runs, given as the step's output `agent` — the place, from
  1, of the key the run's job reads among the key names, 0 for none. The key is the one the input `secret` names for a
  hand-over to a model endpoint, for any other start the one the route of the job's participant names, and on a push the
  one of the oldest queued job of the route; a name the file does not read is none, and the agent's machine then ends
  `not run`, naming it. Writes nothing.
- `leaveResult(env: CiEnvironment) -> Promise<EntryStatus>` — on GitHub's agent's machine, after its entry, whether that
  ended well or not: the result packed for the writing machine — the default branch and the base, each branch that is new
  or moved as a bundle that keeps every commit's identifier, the pull requests and ends kept for later. `nothing to do`
  where the entry made none.
- `writeResult(env: CiEnvironment) -> Promise<EntryStatus>` — on GitHub's writing machine, which runs no agent, with the
  person's token: the result downloaded, read and checked. It is refused where a commit changes a workflow file of the
  repository (`.github/workflows/`, `.gitlab-ci.yml`, `.gitlab/`), where a key of the run or the token stands in a commit's
  message, a file a commit changes, a branch's name or what was kept, and, for a hand-over, where the task's words stand
  in a commit's message or a kept pull request. A result that passes is written: the default branch's commits pushed as
  they are, or, where the branch moved meanwhile, each picked onto it in its order; every other branch pushed as it is,
  never forced; each kept pull request opened, or the open or merged one of its branch taken; each job's end appended,
  naming its commits and pull requests as they now stand. A result that is refused, or that does not apply on the branch
  as it stands now, writes no branch, and each job it ended is ended `failed`, naming why, except one another run has
  taken or ended meanwhile, which is that run's. While the agent works, a job's record shows it queued: its taking
  reaches the product with the result.
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
  legal text that waits for its fetch, as MOD-source-register defines it, and for the entry a run started with the input
  `source` names, fetches the official text and commits it with its retrieval date, the repository's version identifier
  and its SHA-256, completing the entry; for an entry that already has versions, the text is appended as a further
  version, and nothing is written when its SHA-256 equals an existing version's (`A SOURCE VERSION IS NEVER OVERWRITTEN`). A failed fetch writes
  nothing and ends the entry `failed`, its summary naming the register entry and the failure, which the library shows
  beside the entry with *Fetch again* (UC-004 7a); nothing is guessed (`AN EU LEGAL TEXT IS FETCHED FROM THE OFFICIAL
  REPOSITORY`).
- `onMainChanged(env: CiEnvironment) -> Promise<EntryStatus>` — in the instance, on every push to the default branch: what
  a page would otherwise derive from that commit at the moment it is opened, computed once and stored as records the page
  reads. It reads the commit's snapshot once.
  - It adds the commit's graph and the impact lists of its decision and module files that are not accepted
    (MOD-trace-graph's `publishGraph`). Each such file comes with the text it was last accepted at and that text's commit:
    MOD-approvals' `statuses` names the files, and `lastAcceptedText` gives each one's text, read once per file here.
  - It adds the commit's overview and the facts its files alone give (MOD-progress-measures' `publishOverview`): what
    the main page's cards and the specification's waiting entries need — the stage shares, what waits, the model, the
    build with every pull request taken into account and the records of its jobs, the change queues not yet in the SPEC
    —, so that no page lists the pull requests or reads every queue when it is opened.
  - A file the branches already hold for that commit is left as it is: `nothing to do`. A failure of one leaves the other
    written and ends the entry `failed`, naming it. The pages never derive the graph themselves (MOD-trace-graph's
    `storedGraph`), so the workflow tries a failed entry again, and runs on a schedule as well, every 15 minutes, for the
    head of the default branch, which stores what a push's run missed.
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
jobs through Access's local clone — on GitHub's agent's machine into the result's own repository, which the writing
machine pushes —; reads pull requests and closes issues through the server's API, since the local clone
does no server operation; appends result records to the branch `test-results`; on GitLab, sets the project's pipeline
schedule. It also reads the instance's process models at the commit the product's declaration names, through the
checkout of the instance, which fetches that commit. In the instance: reads approval records, change queues, `SPEC.md`
and `docs/sources/`; writes `SPEC.md`
sections with their decisions and the fetched texts of sources. Reads secrets only from the environment.

## Uses

- `MOD-repository-hosts.connect`, `readSnapshot`, `commitFiles` — the repository the entry runs in, through the local
  clone with the token from the secret; `pullRequestFacts` — the facts the Definition-of-Done check weighs, through the
  server's API with the same token; `readHistory` — the commit messages of a branch a hand-over's run pushed without a
  pull request, so that a branch holding the task's words is refused whether or not a pull request was opened. In a product's job workflow, also the instance at the commit a declaration names,
  through the checkout of the instance, which fetches it with its own credentials.
- `MOD-documents.readDocument`, `readRegister`, `writeDocument` and `MOD-participant-list.participantSchema` — the
  declaration, the participants, the register entries.
- `MOD-text-tools.Finding` — the findings an entry reports.
- `MOD-test-document.TestDeclaration`, `testDeclarations` — the declarations of the product's tests, to which a report's
  outcomes are matched.
- `MOD-endpoint-calls.endpointDriver`, `MOD-agent-processes.agentDriver` — the drivers of CI participants;
  `MOD-endpoint-calls.diagnoseEndpoint` — why a handed-over run could not reach its endpoint;
  `MOD-endpoint-calls.testEndpoint` — after a handed-over run's agent failed working with an endpoint, one short request to
  that endpoint, whose diagnosis names the reason where the endpoint is the cause.
- `MOD-job-runner.JobContext`, `registerStrategies`, `prepareJob`, `runJob`, `MOD-job-catalogue.kindOf` — running a job of
  any kind from its record, unattended.
- `MOD-job-ledger.JobRecord`, `RecordPart`, `newJobId`, `startRecord`, `takeJob`, `appendToRecord`, `jobState` — the
  records of the jobs it takes, their parameters, and their ends with a draft handed back.
- `MOD-runtimes.queueJob` — queueing the actions of other routes.
- `MOD-progress-measures.productFacts` — the product's facts, read once per entry, from which the next actions of its
  runs are computed.
- `MOD-run-planner.runOf`, `nextActions`, `finishRun` — the runs, their next actions, and a run's end on `finish`.
- `MOD-trace-graph.publishGraph`, `MOD-approvals.statuses`, `lastAcceptedText`, `MOD-progress-measures.publishOverview` —
  the records `onMainChanged` stores for each commit of the default branch.
- `MOD-product-process.declarationSchema`, `productWorkflow`, `gateSchema`, `gateStates`, `doneCheck` — the workflow,
  the gates and the Definition of Done, checked by `onDoneCheck`; `recordGateDecision` — a CI check's decision on a
  gate.
  The workflow is read with the instance's SPEC, where the process requirements stand.
- `MOD-test-schedule.applyPipelineSchedule` — the nightly pipeline schedule on GitLab once a run's CI is merged.
- `MOD-result-records.parseOutcomes`, `appendResult` — a run's outcomes read from its JUnit XML report, and its result
  record.
- `MOD-work-plans.sprintFacts`, `MOD-work-plans.sprintsToClose` — a sprint's facts, and the sprints whose close starts now.
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
