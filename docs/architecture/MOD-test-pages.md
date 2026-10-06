---
id: MOD-test-pages
title: The pages of tests and releases
folder: src/test-pages/
realises:
follows:
  - ARC-038
uses:
  - MOD-site-frame.View
  - MOD-site-frame.chosenProduct
  - MOD-site-frame.explain
  - MOD-site-frame.notice
  - MOD-site-frame.runPanel
  - MOD-site-frame.confirmDecision
  - MOD-site-frame.schemaForm
  - MOD-site-frame.embedRoute
  - MOD-markdown-render.renderArtifact
  - MOD-markdown-render.showDifference
  - MOD-browser-store.readSetting
  - MOD-bridge-client.bridgeAt
  - MOD-repository-hosts.readSnapshot
  - MOD-repository-hosts.readHistory
  - MOD-repository-hosts.listTags
  - MOD-repository-hosts.repositoryInfo
  - MOD-repository-hosts.listPullRequests
  - MOD-repository-hosts.mergePullRequest
  - MOD-repository-hosts.listCiRuns
  - MOD-repository-hosts.ciRunLog
  - MOD-repository-hosts.webLinks
  - MOD-documents.readRegister
  - MOD-test-document.testDeclarations
  - MOD-trace-graph.traceGraph
  - MOD-trace-graph.tracesTo
  - MOD-test-schedule.scheduleSchema
  - MOD-test-schedule.defaultSchedule
  - MOD-test-schedule.scheduleFindings
  - MOD-test-schedule.configurationDrift
  - MOD-test-schedule.secretsNeeded
  - MOD-test-schedule.occasionsOf
  - MOD-test-schedule.proposeSchedule
  - MOD-test-schedule.applyPipelineSchedule
  - MOD-test-schedule.scheduleStrategies
  - MOD-result-records.resultSchema
  - MOD-result-records.resultsAt
  - MOD-result-records.appendResult
  - MOD-result-records.flakyTests
  - MOD-result-records.rateComparison
  - MOD-result-records.resultStrategies
  - MOD-release-evidence.nextVersion
  - MOD-release-evidence.startReleaseCandidate
  - MOD-release-evidence.releaseReport
  - MOD-release-evidence.acceptAndRelease
  - MOD-resource-list.resourceSchema
  - MOD-resource-list.reachableBy
  - MOD-approvals.approvalStrategies
  - MOD-participant-list.participantSchema
  - MOD-participant-list.eligible
  - MOD-job-catalogue.kindOf
  - MOD-job-runner.prepareJob
  - MOD-job-ledger.newJobId
  - MOD-job-ledger.listJobs
  - MOD-runtimes.routesFor
  - MOD-runtimes.queueJob
  - MOD-runtimes.runOnTab
  - MOD-runtimes.liveState
  - MOD-runtimes.jobLog
  - MOD-runtimes.routeStrategies
provides:
  - view
---
# MOD-test-pages The pages of tests and releases

## Responsibility

It belongs to the Site (ARC-038). Its one responsibility is the menu entries Tests and Releases, apart from what reads the
trace graph: the schedule of the product's test levels and the CI configuration generated from it; the runs of one
commit, per level and per test, with a missing level run from the page; generating tests; and the release panel — the
next version, the release candidate and its complete run, and the release test report with *Accept and release*. The
tests browser and the audit are views of MOD-trace-pages; the release panel shows the audit of its candidate inside
itself through the frame (`embedRoute`), without using that module.

It serves UC-013, UC-026, UC-027 and UC-028.

It runs in a browser, loaded by `docs/index.html` through MOD-site-frame.

## Parts

- `index.mjs` — the interface: `view`.
- `schedule.mjs` — the schedule and its configuration.
- `runs.mjs` — the runs of a commit.
- `generate.mjs` — generating tests.
- `release.mjs` — the release panel.

## Data

It keeps nothing but the screen, an unsaved form, and the proposed test cases while the person reviews them. Its
formats are those of the modules it uses.

## Interfaces

- `view: View` — its routes, and the strategies its kinds use in the tab — `scheduleStrategies`, `resultStrategies`,
  `routeStrategies`, `approvalStrategies`:
  - `schedule` — the table of levels by occasion, a form from the schedule's schema, the book's default marked as such
    until one is saved; the release candidate column that cannot be cleared and the commit and pull request columns that
    refuse tests calling a paid service, each with its reason; the nightly time, the test command, the runner per row
    among the participants that can run tests; the secrets needed, by name, with the server's secrets page; *Save*,
    which opens with `proposeSchedule` one pull request holding the schedule and the configuration generated from it;
    its CI result, and *Merge* once green, after which, on a GitLab server, `applyPipelineSchedule` sets the project's
    nightly pipeline schedule and the page links it; a configuration edited by hand shown against the schedule; the last
    run per occasion, and a nightly run that has not run.
  - `runs`, `runs/<commit>` — a commit chosen from the default branch, an open pull request or a release tag; one line
    per level — passed, failed, flaky, *not run on this commit* with the occasion that would run it —; a level's tests
    with their outcomes, rates with their number of runs, and what each guards; a failed test's expected result beside
    the observed one, with its log; *Run on this commit* with its run panel, which queues a job of the kind `run-tests`
    on the commit — on the server's CI, or on a participant through its Bridge —, or opens the workflow's page on GitHub
    without a token; for a release candidate, the checklist of user-level tests, whose outcomes the people assigned enter,
    each appended as a result record.
  - `generate` — the accepted requirements, use cases and modules with the levels whose tests already guard each, the
    uncovered ones preselected; the levels chosen; the participants that fill the test-writing role, the implementer left
    out for release tests and said so; the run panel; a job of the kind `propose-tests`, run attended through the
    participant's Bridge — or, for a CI agent, on CI, its cases then read from its job's record —; the proposed cases
    beside the existing tests of the same identifier, removed, edited or reclassified; *Write tests*, which queues a job
    of the kind `write-tests` with the cases as the person left them, the selection and the levels, on the participant's
    route — the participant writes the tests and their counter-proofs on a branch and opens a pull request.
  - `release` — the release panel, also the address by which the browser's notifications lead to a release test report
    that waits for acceptance (MOD-notifications): the next version of the product's own line, preset to a minor step,
    and the changelog entry, both editable; *Start release candidate*; the run on the job list; when it ends, every
    level with its result, every model-dependent check as a rate against the running version, every requirement with its
    evidence — the audit of the candidate, drawn by the trace pages' route inside this panel —, and the release test
    report with *Accept and release*, which asks first for the reason of every failing test and every worse rate.

## Files

It writes, only on a person's click: the pull request that holds the schedule and the generated configuration, and on a
GitLab server the nightly pipeline schedule, through MOD-test-schedule; a user test's outcome, appended as a result
record; a job's start record through MOD-runtimes; the release candidate, the report, its approval, the changelog entry
and the tag through MOD-release-evidence. It reads the product's snapshot, its history, tags, pull requests and CI runs,
the result records on the branch `test-results`, the product's resources and the instance's participants.

## Uses

- MOD-site-frame.View, MOD-site-frame.chosenProduct, MOD-site-frame.explain, MOD-site-frame.notice,
  MOD-site-frame.runPanel, MOD-site-frame.confirmDecision, MOD-site-frame.schemaForm — the frame's parts, the schedule's
  form and a user test's outcome; MOD-site-frame.embedRoute — the audit of a candidate inside the release panel.
- MOD-markdown-render.renderArtifact, MOD-markdown-render.showDifference — the report, the configuration against the
  schedule.
- MOD-browser-store.readSetting — the endpoints' configurations and the Bridges' settings a job needs;
  MOD-bridge-client.bridgeAt — a handle for each Bridge, handed to the runtimes.
- MOD-repository-hosts.readSnapshot, MOD-repository-hosts.readHistory, MOD-repository-hosts.listTags,
  MOD-repository-hosts.listPullRequests — the commits to choose from; MOD-repository-hosts.repositoryInfo — the
  repository's visibility for the routes of a job; MOD-repository-hosts.mergePullRequest,
  MOD-repository-hosts.listCiRuns — the schedule's pull request, its CI and its merge; MOD-repository-hosts.ciRunLog,
  MOD-repository-hosts.webLinks — a run's log, and the secrets, workflow and pipeline schedule pages.
- MOD-documents.readRegister, MOD-resource-list.resourceSchema, MOD-participant-list.participantSchema — the product's
  resources and the instance's participants, which the schedule's runners and paid services come from;
  MOD-resource-list.reachableBy — the routes that reach the product's resources, for the routes of `write-tests` and
  `run-tests`.
- MOD-test-document.testDeclarations, MOD-trace-graph.traceGraph, MOD-trace-graph.tracesTo — which levels guard what.
- MOD-test-schedule.scheduleSchema, MOD-test-schedule.defaultSchedule, MOD-test-schedule.scheduleFindings,
  MOD-test-schedule.configurationDrift, MOD-test-schedule.secretsNeeded, MOD-test-schedule.occasionsOf — the schedule;
  MOD-test-schedule.proposeSchedule, MOD-test-schedule.applyPipelineSchedule — its save and, on GitLab, its nightly run.
- MOD-result-records.resultSchema, MOD-result-records.resultsAt, MOD-result-records.appendResult,
  MOD-result-records.flakyTests, MOD-result-records.rateComparison — the outcomes of a commit and a user test's outcome.
- MOD-release-evidence.nextVersion, MOD-release-evidence.startReleaseCandidate, MOD-release-evidence.releaseReport,
  MOD-release-evidence.acceptAndRelease — the release.
- MOD-participant-list.eligible — who can write or run tests; MOD-job-ledger.listJobs — the implementer of a behaviour,
  left out for its release tests, and the cases a job of `propose-tests` on CI recorded.
- MOD-job-catalogue.kindOf, MOD-job-runner.prepareJob — the run panels; MOD-job-ledger.newJobId,
  MOD-runtimes.routesFor, MOD-runtimes.queueJob, MOD-runtimes.runOnTab, MOD-runtimes.liveState, MOD-runtimes.jobLog —
  proposing and writing tests and running levels on their routes.
- MOD-test-schedule.scheduleStrategies, MOD-result-records.resultStrategies, MOD-runtimes.routeStrategies,
  MOD-approvals.approvalStrategies — the strategies of its kinds, handed to the frame.
