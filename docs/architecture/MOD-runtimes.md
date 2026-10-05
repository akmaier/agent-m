---
id: MOD-runtimes
title: The three routes a job takes
folder: src/runtimes/
realises:
follows:
  - ARC-046
uses:
  - MOD-job-runner.runJob
  - MOD-job-runner.provenanceLines
  - MOD-job-runner.Driver
  - MOD-job-runner.Prepared
  - MOD-job-runner.JobContext
  - MOD-job-runner.JobResult
  - MOD-job-runner.Strategies
  - MOD-job-runner.WriteOutcome
  - MOD-job-ledger.startRecord
  - MOD-job-ledger.appendToRecord
  - MOD-job-ledger.newJobId
  - MOD-job-ledger.JobStart
  - MOD-job-ledger.JobRecord
  - MOD-job-ledger.LiveState
  - MOD-endpoint-calls.endpointDriver
  - MOD-endpoint-calls.EndpointConfig
  - MOD-participant-list.Participant
  - MOD-repository-hosts.Host
  - MOD-repository-hosts.readSnapshot
  - MOD-repository-hosts.commitFiles
  - MOD-repository-hosts.listCiRuns
  - MOD-repository-hosts.cancelCiRun
  - MOD-repository-hosts.ciRunLog
  - MOD-repository-hosts.openPullRequest
  - MOD-repository-hosts.listPullRequests
  - MOD-bridge-client.Bridge
  - MOD-bridge-client.askAgent
  - MOD-bridge-client.handOver
  - MOD-bridge-client.bridgeJobs
  - MOD-bridge-client.bridgeJobLog
  - MOD-bridge-client.cancelOnBridge
  - MOD-test-document.testDeclarations
provides:
  - Route
  - RouteOffer
  - ResourceNeed
  - routesFor
  - queueJob
  - runOnTab
  - bridgeAgentDriver
  - resumeJob
  - liveState
  - jobLog
  - cancelJob
  - retryJob
  - jobWorkflowFiles
  - routeStrategies
---
# MOD-runtimes The three routes a job takes

## Responsibility

It belongs to Participants and jobs (ARC-046). It puts the three routes a job can take — this browser tab, CI, a Bridge
— behind one interface (`A RUNTIME IS INTERCHANGEABLE`): which routes a participant has; queueing a job by its start
record; running it in the tab, with the driver of an endpoint or of an agent on a Bridge; resuming it after its gate;
asking its runtime for its live state and log; cancelling and retrying it. It also gives a product the files of Agent M's
job workflow, and offers the writer that checks and records a coding participant's branch and pull request. The page uses
it in a browser; its writer and its workflow files are used in Node as well.

## Parts

- `index.mjs` — the interface.
- `routes.mjs` — which routes a participant has.
- `tab.mjs` — jobs running in this tab, kept in memory while the tab is open.
- `ci.mjs` — the CI route: queueing, live state, log and cancel through the repository host.
- `bridge.mjs` — the Bridge route through the Bridge client, and the driver of an agent on a Bridge.
- `workflow/github.yml`, `workflow/gitlab.yml` — the templates of the job workflow.
- `pull-request.mjs` — the writer `branch-and-pull-request`.

## Data

It keeps, in memory, the jobs running in this tab; nothing else. A job running in a tab lives as long as the tab; its
record then shows it as ended without record (UC-036).

**Agent M's job workflow in a product.** On GitHub, the file `.github/workflows/agent-m-jobs.yml`; on GitLab, the file
`.gitlab/agent-m-jobs.yml`, which the product's `.gitlab-ci.yml` includes. It is started:

| Event | Entry of MOD-workflow-entries it runs |
|---|---|
| a push to the default branch that changes `docs/jobs/` or `docs/gates/` | `onRecordsChanged` |
| a pull or merge request closed or merged | `onPullRequestClosed` |
| a CI check completed | `onCheckCompleted` |
| a schedule, once a day | `onSchedule` |
| a start from the server's own page, with a job's identifier (UC-010, UC-024) | `onDispatch` |

It has one job for each route of the product's CI agents — the server's own runners, and each self-hosted runner by its
label — and each checks out the product with the person's Agent M token, checks out the instance repository at the
commit the file names, and runs the entry with Node. It reads the person's token from the CI secret `AGENT_M_TOKEN` and
an agent's key from the secret the participant's route names; the dashboard names both and opens the server's page for
secrets, and never asks for a value (`A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET`, `A HOSTED JOB WRITES WITH
THE PERSON'S TOKEN FROM A CI SECRET`). It is not the product's test configuration, which starts no run for job records
(`A JOB RECORD STARTS NO CI RUN`), and it does not check the Definition of Done: the test configuration MOD-test-schedule
generates does, through `onDoneCheck`. Moving a product to a newer commit of the instance is writing the file again, on
a person's decision.

## Interfaces

- `Route` — `{ kind: "tab" } | { kind: "ci", runner: "hosted" | string } | { kind: "bridge", bridge: string }`: where a
  job runs; a runner other than `hosted` is a self-hosted runner's label.
- `RouteOffer` — `{ route: Route, available: boolean, reason: string | null }`: a route and, if it cannot be taken, why.
- `ResourceNeed` — `{ resource: string, route: "bridge" | string }`: a resource a job needs and the route that reaches it —
  `bridge`, or `runner:<label>` —, as MOD-resource-list's `reachableBy` gives it for the product's resources; a
  product's facts carry them (MOD-progress-measures).
- `routesFor(participant: Participant, product: { visibility: "public" | "private" | "internal", jobWorkflow: boolean },
  needs: ResourceNeed[]) -> RouteOffer[]` — the routes by the participant's route in the register: a model endpoint in the
  tab, or through a Bridge for a model server on a computer; a CI agent in CI, on the server's runners or on its runner;
  a CLI or sandboxed agent through its Bridge. A self-hosted runner is offered only for a repository whose server reports
  it private, and refused with the reason otherwise (`A SELF-HOSTED RUNNER SERVES AGENT M ONLY FROM A PRIVATE
  REPOSITORY`). A job that needs no resource reached only by a Bridge or a runner is offered on the server's own runners
  whenever a CI agent can take it (`AGENT M WORKS WITHOUT A LOCAL INSTALLATION`); one that needs such a resource is offered
  only on the routes that reach it (`A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE`); a caller passes as `needs`
  the product's resource needs for a job whose kind says `resources: product`, and none for any other kind. The CI route
  is unavailable, with its files named, while the product has no job workflow.
- `queueJob(host: Host, start: JobStart, route: Route, head: string, bridge?: Bridge) -> Promise<{ path: string, commit:
  string }>` — commits the job's start record, on the head that was read, as the person's commit; on the tab's route the
  start and its taking are one commit. For a job of a run (`start.run`), the same commit appends a `Job started` part
  to the run's record, through MOD-job-ledger's `appendToRecord`: two drivers that computed the same action cannot both
  start it, since the second commit is refused on a head that moved, and its driver computes the run's actions again. The push starts the job workflow on the CI route; a Bridge takes the job when it
  next reads the repository, or at once when `bridge` is given and the job is handed over to it. Crosses the network
  through the host, and to the Bridge; fails with what the host names — the branch moved, a refused token, a used-up rate
  limit —, with what the Bridge client names, and with `WorkflowMissing` for the CI route of a product without the job
  workflow.
- `runOnTab(prepared: Prepared, context: JobContext, connections: { endpoints: Record<string, EndpointConfig>, bridges:
  Record<string, Bridge> }, hooks: { host: Host, record: JobRecord, onOutput?: (chunk: string) => void, signal?:
  AbortSignal }) -> Promise<JobResult>` — runs the prepared job in this tab with MOD-job-runner, attended unless its record
  names a run: builds the drafter's and the reviewers' drivers from their routes — an endpoint's driver from its
  configuration, an agent on a Bridge through `bridgeAgentDriver` with the Bridge the caller hands in —, appends a gate
  reached and the end to the job's record through the host, and returns the result for the page to show. Fails as the
  drivers fail, by name.
- `bridgeAgentDriver(bridge: Bridge, agent: string, participant: Participant) -> Driver` — a driver whose `send` hands the
  input to the named agent on the Bridge through Access's `askAgent`, across the network to the Bridge, and returns its
  answer. Fails with what the Bridge client names: not running, wrong address, token missing or refused, blocked by the
  browser, certificate not trusted.
- `resumeJob(record: JobRecord, gateRecord: string, route: Route, host: Host, head: string, bridge?: Bridge) ->
  Promise<void>` — appends the resumption, naming the gate record, on the head read, and hands the job back to its route:
  in the tab it goes on; on a Bridge it is handed over again when `bridge` is given, and otherwise taken up when the
  Bridge next reads the repository; on CI the push itself starts the job workflow, which goes on.
- `liveState(record: JobRecord, product: { host: Host }, bridges: Record<string, Bridge>) -> Promise<LiveState>` — asks the
  runtime that holds a job that has not ended: the CI service's runs of the job workflow for the job, through the host;
  the list of jobs of the Bridge its record names, among `bridges`; this tab.
  A runtime that cannot be reached gives `reachable: false` and its reason, never an error; a commit the job's branch got
  after a cancel is reported in `writtenAfterCancel` (UC-036).
- `jobLog(record: JobRecord, product: { host: Host }, bridges: Record<string, Bridge>) -> Promise<{ stream:
  AsyncIterable<string> } | { address: string } | { gone: true }>` — the log, streamed from a Bridge or this tab while the
  job runs, the CI run's log by its address, or that the runtime keeps it no longer.
- `cancelJob(record: JobRecord, product: { host: Host }, bridges: Record<string, Bridge>) -> Promise<"cancelled" |
  "cancelling">` — stops the job at its
  runtime: cancels the CI run, tells the Bridge to end the agent's process, or aborts the tab's job. Once the runtime
  confirms, it appends the job's end, `cancelled`, with MOD-job-ledger's `appendToRecord`, as a commit with the
  person's token on the head that was read; `cancelling` while the runtime has not confirmed in time, and nothing is
  appended then. A job no runtime has taken — one still queued, or a run, which no runtime runs — is ended at once. A cancelled job writes nothing more (`A CANCELLED JOB WRITES NOTHING MORE`); a commit the job still
  makes after the cancel is reported by `liveState` as written after the cancel. Errors: those of the host's
  `commitFiles` — `Moved` when the record changed meanwhile, in which case the caller reads the record again.
- `retryJob(record: JobRecord, choice: { participant: Participant, route: Route }, host: Host, head: string) -> Promise<{
  path: string, commit: string }>` — queues a new job with a new identifier and the same inputs and parameters, which names the one it
  retries; the participant is the same or another holder of the role.
- `jobWorkflowFiles(server: "github" | "gitlab", instance: { repository: string, commit: string }, secrets: { token: string,
  keys: string[] }, runners: string[]) -> { path: string, text: string }[]` — the files of the job workflow described under
  Data, for the caller to commit on a person's click.
- `routeStrategies` — `Partial<Strategies>` with the writer `branch-and-pull-request`: reads the branch named after the job
  and its commits. With a host of a server's API, it opens the pull request if the coding participant has not, gives it
  a description that names the job, the plan step or backlog item, its modules, the requirements its new tests guard —
  read with MOD-test-document's `testDeclarations` — and the provenance lines, and returns its address. With a local host
  — a Bridge's clone, which makes no server requests and throws `NotSupported` for them — it opens nothing and returns
  the branch and the pull request the agent reports. Either way the Definition-of-Done check in CI verifies the pull
  request. It never merges: a pull request is merged once the Definition of Done holds (ARC-042). Fails with `NoBranch`,
  `NoCommits`, and what the host names.

## Files

It writes, through the host, the start records of jobs, the parts it appends, and pull requests; it returns the job
workflow's files for its caller to commit. It reads the job's branch and its test files.

## Uses

- `MOD-job-runner.runJob`, `MOD-job-runner.provenanceLines`, `MOD-job-runner.Driver`, `MOD-job-runner.Prepared`,
  `MOD-job-runner.JobContext`, `MOD-job-runner.JobResult`, `MOD-job-runner.Strategies`, `MOD-job-runner.WriteOutcome` —
  running a job in the tab, the drivers it builds, and the writer it offers.
- `MOD-job-ledger.startRecord`, `MOD-job-ledger.appendToRecord`, `MOD-job-ledger.newJobId`, `MOD-job-ledger.JobStart`,
  `MOD-job-ledger.JobRecord`, `MOD-job-ledger.LiveState` — the records it writes and the live state it reports.
- `MOD-endpoint-calls.endpointDriver`, `MOD-endpoint-calls.EndpointConfig` — the driver of an endpoint in the tab.
- `MOD-participant-list.Participant` — a participant's route.
- `MOD-repository-hosts.Host`, `MOD-repository-hosts.readSnapshot`, `MOD-repository-hosts.commitFiles`,
  `MOD-repository-hosts.listCiRuns`, `MOD-repository-hosts.cancelCiRun`, `MOD-repository-hosts.ciRunLog`,
  `MOD-repository-hosts.openPullRequest`, `MOD-repository-hosts.listPullRequests` — the CI route and the pull request.
- `MOD-bridge-client.Bridge`, `MOD-bridge-client.askAgent`, `MOD-bridge-client.handOver`, `MOD-bridge-client.bridgeJobs`,
  `MOD-bridge-client.bridgeJobLog`, `MOD-bridge-client.cancelOnBridge` — the Bridge route, on the Bridges its callers
  hand in.
- `MOD-test-document.testDeclarations` — the requirements a pull request's new tests guard.

The workflow files name the entries of MOD-workflow-entries by their path in the instance repository; this module does not
call them.
