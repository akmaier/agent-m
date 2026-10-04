---
id: ARC-010
title: The run engine is stateless and event-driven — pure functions compute a run's plan and its next jobs from the records in the repository, and every runtime starts what they return
forced_by:
  - A RUN EXECUTES THE PROCESS MODEL OVER A SELECTION
  - A RUN CONTINUES WITHOUT A CLICK BETWEEN ITS JOBS
  - A RUN FOLLOWS THE MODULES' INTERFACES
  - A RUN SETS UP CI BEFORE IT IMPLEMENTS
  - A RUN HAS LIMITS FIXED AT ITS START
  - A RUN IS A JOB THAT NAMES ITS JOBS
  - A RUN ENDS WITH THE VALIDATION OF ITS MODULES
  - A JOB STOPS AT EVERY GATE
  - A JOB GOES ONLY TO A HOLDER OF ITS ROLE
  - PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
  - A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
  - A JOB RECORD STARTS NO CI RUN
  - A JOB IDENTIFIER IS NEVER REUSED
  - A CANCELLED JOB WRITES NOTHING MORE
  - ONE DASHBOARD SHOWS EVERY JOB
  - NO COST IS GUESSED
  - RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER
  - A SPRINT CLOSED BY AN AGENT STARTS BY ITSELF
  - A RUNTIME IS INTERCHANGEABLE
  - NO SERVER
  - UC-010
  - UC-034
  - UC-036
  - UC-041
  - UC-043
---
# ARC-010 A stateless, event-driven run engine

## Context

A run carries out the product's process model over a selection: CI first if missing, then one job per module in the
order of their interfaces, then the test battery, and at its end the validation of what was built — starting each job
by itself, stopping at gates a person decides, and within limits fixed at the start (UC-043). In a product that works
from a backlog, the selection is backlog items, and each item's job includes its tests (UC-034). There is no server
that could hold a scheduler (`NO SERVER`), and state is derived, not stored (`PROGRESS AND JOB STATE ARE DERIVED, NOT
STORED`). Jobs run in three places — the browser, CI and the bridge —, any of which may be switched off, and one
dashboard shows every job with its state and cost (UC-036).

Book ch. 10 §"APIs": a REST interaction is stateless, and any server instance can handle any request, because no
request depends on previous state. The engine takes the same stance: any runtime may compute the next step, because
the step depends only on the records.

## Decision

1. **The engine is pure functions in the kernel** (`MOD-run-engine`). `MOD-run-engine.nextJobs` computes, from a
   snapshot read at one commit — the run's plan, its jobs, the gate records, the CI check results, the commit each gate
   its jobs wait for is decided on (ARC-019 decision 6), and for a backlog its items with their facts and the running
   sprint —, the jobs to start now, what waits and why, whether the run is done, and the limit that stopped it. Nothing
   is remembered between calls.
2. **The queue is the job records.** A job's record is `docs/jobs/JOB-<yyyymmdd>-<hhmm>-<hex4>.md` in the repository of
   the product it works on: written at its start with its kind, phase, role, participant, runtime, run and slot, the
   item and modules it works on, its inputs, the job it retries, the Agent M version, the model and, where the author
   chose it, who merges an agent's pull request — the agent or a person (UC-034 8); extended by each state it enters,
   with its time; and at its end by its results, correction rounds, and the cost and usage its runtime reported
   (`MOD-run-engine.jobRecordText`). What was written is never changed. A record holds six states; *ended without
   record* is derived and never written. A new identifier is the start's minute and a random part, drawn again while a
   job of the product has it (`MOD-run-engine.newJobId`). Each job of a run has a slot key no other job of the run
   holds; two engines computing at once cannot start a slot twice, because the second commit fails its fast-forward and
   recomputes on the new head.
3. **A run is a job** of the kind `run` whose record names its selection, its limits and the participant chosen for
   each role, and every job it started, each added as it starts; each of those jobs names the run.
4. **The plan follows the workflow** (`MOD-run-engine.runPlan`): the CI job first when the product has no CI
   configuration; from the first phase that produces `MOD`, one implementation job per selected module — after the
   modules whose interfaces it uses (`MOD-run-engine.moduleOrder`; a cycle is refused before the run starts, naming its
   modules) — or per selected item, after the items it depends on; for a later phase that produces `TST` and no `MOD`,
   one test-battery job for the selection, by a holder of its role other than the implementers; no job for a phase
   that produces neither. Every job goes to the participant chosen for its role, who must hold it. A job meets the
   gates leaving its phase before its merge; the gates into a run's phase from a phase without jobs are decided for the
   product, and its jobs wait for them. The run ends with the validation view of its modules (UC-025).
5. **Triggers — any of three, all equivalent.** On GitHub, the product's engine workflow `agent-m-engine.yml` (ARC-015)
   is dispatched — by the last step of a job's run that belongs to a run, by a click a run waits for
   (`MOD-main-page.engineOnCi`), and by itself when its commit finds the default branch moved on —, never by a push, so
   a commit that changes only job records starts no CI run (`A JOB RECORD STARTS NO CI RUN`); it takes the next step of
   every open run and dispatches the jobs whose participant is a CI agent (`MOD-ci-entry.engine`). The bridge, while
   running, takes the steps of the products it serves and the queued jobs of its own agents — it connects out, so it
   works behind NAT; the browser computes the first jobs on **Start run**, and starts model-endpoint jobs in the tab.
6. **Limits are inputs, not state.** A run starts no job beyond its jobs-at-once limit; it stops starting jobs when the
   costs its jobs' runtimes reported reach its cost limit, or a job reached its correction-round limit, and says which.
7. **State and cost are derived** (`MOD-run-engine.jobState`, `MOD-run-engine.jobCost`): the end state a record holds;
   the live state the job's runtime reports; *ended without record* when the runtime is reachable and does not know the
   job; the last recorded state, with a note, when it cannot be reached or was not asked. A cancel is a record of its
   own, `docs/jobs/cancels/<job>.md`; the job shows as cancelling until its runtime confirms. A cost is shown only as
   the runtime reported it, or as its reported usage at the participant's declared price; otherwise the usage with
   *price unknown*, or *unknown*. One list holds every job of every product the instance manages, with its product, what
   it works on, its kind, participant, runtime, state, elapsed time, cost and log — waiting at a gate first, then by
   state, each newest first (`MOD-run-engine.jobList`).
8. **A sprint's close starts by itself** when its closer is not a person, the sprint has ended, and no close record
   exists (`MOD-run-engine.closeDue`).
9. **A step of a run** (`MOD-run-engine.advance`), the same in every runtime: from the run's snapshot read as the main
   page reads the product (`MOD-process-views.runSnapshot`) and its next jobs, the start records of the jobs it starts —
   each with where it runs and its model, from its participant (`MOD-job-runner.runtimeOf`); a slot whose participant no
   runtime serves, a person's, waits, named — and the run's record listing every job it started, each added as it starts
   — a retry a click started among them —, with one more state where its state or its reason changed: *running* while a
   job of it is queued or running or one starts, with the limit that stopped it; *waiting at a gate*, with every reason,
   when nothing runs and nothing can start — a gate a person decides, a failed job awaiting its retry, a limit —; *done*
   once every slot of its plan is done. A run's record begins *running*: the click that starts it starts its first jobs.

```mermaid
sequenceDiagram
    actor A as Author
    participant D as Dashboard (browser)
    participant R as Product repository
    participant W as Engine workflow (CI)
    participant B as Agent M Bridge
    participant C as Coding agent
    A->>D: Start run (selection, limits)
    D->>D: runPlan, nextJobs
    D->>R: commit run record + start records (queued)
    D->>W: dispatch, on the same click
    W->>W: read the product; per open run its snapshot, nextJobs, advance
    W->>R: commit the step: start records, the run's state where it changed
    W->>R: dispatch the CI jobs it started
    B->>R: poll: queued jobs for my agents?
    B->>C: run job
    C->>R: branch, tests, code, pull request
    B->>R: append end state (done / failed)
    B->>B: nextJobs — dependants of the finished module
    B->>R: commit next start records
    Note over W,R: a CI job's last step dispatches W again; a gate decided by a person:<br/>the run waits there, and the click recording the decision dispatches W
```

## Alternatives

- **A long-running scheduler** in the bridge or a hosted queue — a server (`NO SERVER`), or a process whose state is
  lost with the machine; a run would stop when one laptop sleeps.
- **The engine as a loop in the browser tab** — a run over all modules takes hours; it would stop when the tab closes.
- **GitHub Actions `needs:` graphs generated per run** — the graph is known only as jobs finish (a failed job blocks its
  dependants, a gate waits for a person), and GitLab has a different syntax; the engine would be written twice.
- **Stored run state** — a `run.json` updated after each job; `PROGRESS AND JOB STATE ARE DERIVED, NOT STORED`, and
  concurrent writers would conflict on one file.
- **A job kind named per phase in the model** — the kinds of artifact a phase produces already say which job carries
  it out; a second name per phase could contradict them.
- **The engine started by a push that touches `docs/jobs/`** — rejected by `A JOB RECORD STARTS NO CI RUN`: the
  generated CI configuration starts no run for a commit that changes only job records.
- **The engine started when a job workflow completes (GitHub's `workflow_run`)** — not chosen: GitHub runs such chains
  at most three levels deep, and a run of more jobs would stop: "You can't use `workflow_run` to chain together more
  than three levels of workflows"
  (`https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows`). A dispatch by
  the job's last step has no such limit documented.

## Consequences

- No use-case step is realised here. The steps of UC-010, UC-034, UC-036, UC-041 and UC-043 are actions on the
  dashboard's pages and in the runtimes; they are realised where those are designed, by their interfaces together with
  these.
- Every job start, state and end is a commit under `docs/jobs/`, and none starts a CI run: the tests CI ignores them,
  and the engine workflow runs only when it is dispatched.
- A product without its engine workflow — a GitLab product whose pipeline is not set up, a fork with Actions disabled —
  advances a run only while a bridge or a tab computes `nextJobs`; the run panel says which triggers exist.
- The executor that carries one job from its start record to its end record in every runtime — its driver, its
  correction loop, its check for a cancel before each commit, the gates it meets before its merge — is the decision of
  the job runtimes; it writes the records this decision defines.

## Modules

### MOD-run-engine

```json module
{
  "id": "MOD-run-engine",
  "folder": "src/run-engine/",
  "layer": "kernel",
  "responsibility": "Everything about a job that is the same in every runtime and needs no runtime: its identifier, its record and the cancel record, its state from the records and what its runtime reports, its cost as reported, one list of every job of every product, the order of modules by their interfaces, the plan of a run, the jobs a run starts next, the files of one of its steps, and whether a sprint's close starts by itself.",
  "realises": ["A JOB GOES ONLY TO A HOLDER OF ITS ROLE", "A JOB IS RECORDED IN ITS PRODUCT REPOSITORY", "A JOB IDENTIFIER IS NEVER REUSED", "ONE DASHBOARD SHOWS EVERY JOB", "NO COST IS GUESSED", "PROGRESS AND JOB STATE ARE DERIVED, NOT STORED", "A RUN EXECUTES THE PROCESS MODEL OVER A SELECTION", "A RUN CONTINUES WITHOUT A CLICK BETWEEN ITS JOBS", "A RUN FOLLOWS THE MODULES' INTERFACES", "A RUN SETS UP CI BEFORE IT IMPLEMENTS", "A RUN HAS LIMITS FIXED AT ITS START", "A RUN IS A JOB THAT NAMES ITS JOBS", "RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER", "A SPRINT CLOSED BY AN AGENT STARTS BY ITSELF"],
  "owns": ["JobStateEntry", "Money", "MoneyOrNone", "Usage", "UsageOrNone", "Limits", "LimitsOrNone", "JobAssignment", "JobRecord", "CancelInput", "CancelRecord", "CancelRecordOrNone", "LiveState", "LiveStateOrNone", "JobStateShown", "Price", "PriceOrNone", "CostShown", "JobEntry", "JobRow", "ModuleUses", "ModuleWaves", "RunInput", "RunSlot", "RunPlan", "RunJob", "RunItem", "GateText", "RunSnapshot", "JobSpec", "NextJobs", "RunStart", "AdvanceInput", "JobStateEntryOrNone", "Advance", "CloseDue", "JobRecordContent", "CancelRecordFields", "JobRecordFile", "CancelRecordFile"],
  "uses": ["MOD-contracts", "MOD-process-model", "MOD-work-items"]
}
```

```json interface
{
  "id": "MOD-run-engine.newJobId",
  "summary": "A new job's identifier: JOB-, the start's date and minute, and the first four characters of a random hex string; refused when a job of the product already has it, so that the caller draws again.",
  "params": [
    { "name": "at", "type": "string" },
    { "name": "random", "type": "string" },
    { "name": "taken", "type": "string[]" }
  ],
  "result": "string",
  "async": false,
  "refusals": [{ "code": "taken", "when": "a job of the product already has the identifier" }],
  "examples": [
    {
      "name": "a start",
      "input": { "at": "2026-10-10T09:15:42Z", "random": "1b1b9e", "taken": ["JOB-20261010-0905-0c0c"] },
      "result": "JOB-20261010-0915-1b1b"
    },
    {
      "name": "an identifier a job already has",
      "input": { "at": "2026-10-10T09:15:42Z", "random": "1b1b9e", "taken": ["JOB-20261010-0915-1b1b"] },
      "refused": "taken"
    }
  ]
}
```

```json interface
{
  "id": "MOD-run-engine.jobRecordText",
  "summary": "The record of a job and where it lies, docs/jobs/<id>.md: front matter with what it works on, where and by whom; for a run its selection, limits and assignments; the states it entered with their times; once it ended, its results, rounds, reported cost and usage; for a run, the jobs it started.",
  "params": [{ "name": "record", "type": "JobRecord" }],
  "result": "FileText",
  "async": false,
  "refusals": [],
  "examples": [
    {
      "name": "a queued job of a run",
      "input": {
        "record": {
          "id": "JOB-20261010-0915-1b1b",
          "path": "docs/jobs/JOB-20261010-0915-1b1b.md",
          "kind": "implement",
          "phase": "Implementation",
          "role": "Developers",
          "participant": "cli-dev",
          "runtime": "bridge",
          "run": "JOB-20261010-0900-0a0a",
          "slot": "Implementation/MOD-a",
          "item": "",
          "modules": ["MOD-a"],
          "inputs": ["docs/architecture/ARC-004-the-store.md"],
          "retryOf": "",
          "agentM": "2026.10.1",
          "model": "claude-opus-5-5",
          "log": "",
          "selection": [],
          "limits": null,
          "assignments": [],
          "states": [{ "at": "2026-10-10T09:15:00Z", "state": "queued", "note": "" }],
          "results": [],
          "rounds": 0,
          "cost": null,
          "usage": null,
          "jobs": []
        }
      },
      "result": { "path": "docs/jobs/JOB-20261010-0915-1b1b.md", "text": "---\nid: JOB-20261010-0915-1b1b\nkind: implement\nphase: Implementation\nrole: Developers\nparticipant: cli-dev\nruntime: bridge\nrun: JOB-20261010-0900-0a0a\nslot: Implementation/MOD-a\nitem:\nmodules:\n  - MOD-a\ninputs:\n  - docs/architecture/ARC-004-the-store.md\nretry_of:\nagent_m: 2026.10.1\nmodel: claude-opus-5-5\nlog:\n---\n\n# JOB-20261010-0915-1b1b\n\n**REGISTER**\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-10T09:15:00Z | queued | — |\n" }
    },
    {
      "name": "the job done, with its result and usage",
      "input": {
        "record": {
          "id": "JOB-20261010-0915-1b1b",
          "path": "docs/jobs/JOB-20261010-0915-1b1b.md",
          "kind": "implement",
          "phase": "Implementation",
          "role": "Developers",
          "participant": "cli-dev",
          "runtime": "bridge",
          "run": "JOB-20261010-0900-0a0a",
          "slot": "Implementation/MOD-a",
          "item": "",
          "modules": ["MOD-a"],
          "inputs": ["docs/architecture/ARC-004-the-store.md"],
          "retryOf": "",
          "agentM": "2026.10.1",
          "model": "claude-opus-5-5",
          "log": "",
          "selection": [],
          "limits": null,
          "assignments": [],
          "states": [
            { "at": "2026-10-10T09:15:00Z", "state": "queued", "note": "" },
            { "at": "2026-10-10T09:16:00Z", "state": "running", "note": "" },
            { "at": "2026-10-10T10:40:00Z", "state": "done", "note": "" }
          ],
          "results": ["https://github.com/alice/thesis/pull/71"],
          "rounds": 2,
          "cost": null,
          "usage": { "inputTokens": 150000, "outputTokens": 32000, "minutes": null },
          "jobs": []
        }
      },
      "result": { "path": "docs/jobs/JOB-20261010-0915-1b1b.md", "text": "---\nid: JOB-20261010-0915-1b1b\nkind: implement\nphase: Implementation\nrole: Developers\nparticipant: cli-dev\nruntime: bridge\nrun: JOB-20261010-0900-0a0a\nslot: Implementation/MOD-a\nitem:\nmodules:\n  - MOD-a\ninputs:\n  - docs/architecture/ARC-004-the-store.md\nretry_of:\nagent_m: 2026.10.1\nmodel: claude-opus-5-5\nlog:\n---\n\n# JOB-20261010-0915-1b1b\n\n**REGISTER**\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-10T09:15:00Z | queued | — |\n| 2026-10-10T09:16:00Z | running | — |\n| 2026-10-10T10:40:00Z | done | — |\n\n## Results\n\n- https://github.com/alice/thesis/pull/71\n\n## Cost\n\n| Rounds | Cost | Input tokens | Output tokens | Minutes |\n|---|---|---|---|---|\n| 2 | — | 150000 | 32000 | — |\n" }
    },
    {
      "name": "a run at its end, naming its jobs",
      "input": {
        "record": {
          "id": "JOB-20261010-0900-0a0a",
          "path": "docs/jobs/JOB-20261010-0900-0a0a.md",
          "kind": "run",
          "phase": "",
          "role": "",
          "participant": "alice",
          "runtime": "browser",
          "run": "",
          "slot": "",
          "item": "",
          "modules": [],
          "inputs": [],
          "retryOf": "",
          "agentM": "2026.10.1",
          "model": "",
          "log": "",
          "selection": ["MOD-a", "MOD-b", "MOD-c", "MOD-d"],
          "limits": { "jobsAtOnce": 3, "cost": { "amount": 20, "currency": "USD" }, "rounds": 5 },
          "assignments": [
            { "role": "Developers", "participant": "cli-dev" },
            { "role": "Tester", "participant": "ci-dev" }
          ],
          "states": [
            { "at": "2026-10-10T09:00:00Z", "state": "running", "note": "" },
            { "at": "2026-10-11T16:20:00Z", "state": "done", "note": "" }
          ],
          "results": [],
          "rounds": 0,
          "cost": null,
          "usage": null,
          "jobs": ["JOB-20261010-0905-0c0c", "JOB-20261010-0915-1b1b", "JOB-20261010-0916-2c2c", "JOB-20261010-1100-3d3d", "JOB-20261010-1300-4e4e", "JOB-20261011-0900-5e5e"]
        }
      },
      "result": { "path": "docs/jobs/JOB-20261010-0900-0a0a.md", "text": "---\nid: JOB-20261010-0900-0a0a\nkind: run\nphase:\nrole:\nparticipant: alice\nruntime: browser\nrun:\nslot:\nitem:\nmodules: []\ninputs: []\nretry_of:\nagent_m: 2026.10.1\nmodel:\nlog:\n---\n\n# JOB-20261010-0900-0a0a\n\n**REGISTER**\n\n## Selection\n\n- MOD-a\n- MOD-b\n- MOD-c\n- MOD-d\n\n## Limits\n\n| Jobs at once | Cost | Rounds |\n|---|---|---|\n| 3 | 20 USD | 5 |\n\n## Assignments\n\n| Role | Participant |\n|---|---|\n| Developers | cli-dev |\n| Tester | ci-dev |\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-10T09:00:00Z | running | — |\n| 2026-10-11T16:20:00Z | done | — |\n\n## Cost\n\n| Rounds | Cost | Input tokens | Output tokens | Minutes |\n|---|---|---|---|---|\n| 0 | — | — | — | — |\n\n## Jobs\n\n- JOB-20261010-0905-0c0c\n- JOB-20261010-0915-1b1b\n- JOB-20261010-0916-2c2c\n- JOB-20261010-1100-3d3d\n- JOB-20261010-1300-4e4e\n- JOB-20261011-0900-5e5e\n" }
    },
    {
      "name": "an agent's job whose pull request a person merges",
      "input": {
        "record": {
          "id": "JOB-20261012-0800-9a9a",
          "path": "docs/jobs/JOB-20261012-0800-9a9a.md",
          "kind": "implement-item",
          "phase": "Implementation",
          "role": "Developers",
          "participant": "ci-dev",
          "runtime": "ci",
          "run": "",
          "slot": "",
          "item": "ITM-014",
          "modules": [],
          "inputs": [],
          "retryOf": "",
          "agentM": "2026.10.1",
          "model": "claude-opus-5-5",
          "log": "",
          "selection": [],
          "limits": null,
          "assignments": [],
          "states": [{ "at": "2026-10-12T08:00:00Z", "state": "queued", "note": "" }],
          "results": [],
          "rounds": 0,
          "cost": null,
          "usage": null,
          "jobs": [],
          "mergeBy": "person"
        }
      },
      "result": { "path": "docs/jobs/JOB-20261012-0800-9a9a.md", "text": "---\nid: JOB-20261012-0800-9a9a\nkind: implement-item\nphase: Implementation\nrole: Developers\nparticipant: ci-dev\nruntime: ci\nrun:\nslot:\nitem: ITM-014\nmodules: []\ninputs: []\nretry_of:\nagent_m: 2026.10.1\nmodel: claude-opus-5-5\nmerge_by: person\nlog:\n---\n\n# JOB-20261012-0800-9a9a\n\n**REGISTER**\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-12T08:00:00Z | queued | — |\n" }
    }
  ]
}
```

```json interface
{
  "id": "MOD-run-engine.parseJobRecord",
  "summary": "A job record as its file holds it; a state outside the six a record may hold is refused — ended without record is derived, never written.",
  "params": [{ "name": "path", "type": "string" }, { "name": "text", "type": "string" }],
  "result": "JobRecord",
  "async": false,
  "refusals": [
    { "code": "not-a-job-record", "when": "the path is not docs/jobs/JOB-<yyyymmdd>-<hhmm>-<hex4>.md, the front matter names another job, or no state is recorded" },
    { "code": "unknown-state", "when": "a recorded state is not queued, running, waiting-at-gate, done, failed or cancelled" }
  ],
  "examples": [
    {
      "name": "a queued job",
      "input": { "path": "docs/jobs/JOB-20261010-0915-1b1b.md", "text": "---\nid: JOB-20261010-0915-1b1b\nkind: implement\nphase: Implementation\nrole: Developers\nparticipant: cli-dev\nruntime: bridge\nrun: JOB-20261010-0900-0a0a\nslot: Implementation/MOD-a\nitem:\nmodules:\n  - MOD-a\ninputs:\n  - docs/architecture/ARC-004-the-store.md\nretry_of:\nagent_m: 2026.10.1\nmodel: claude-opus-5-5\nlog:\n---\n\n# JOB-20261010-0915-1b1b\n\n**REGISTER**\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-10T09:15:00Z | queued | — |\n" },
      "result": {
        "id": "JOB-20261010-0915-1b1b",
        "path": "docs/jobs/JOB-20261010-0915-1b1b.md",
        "kind": "implement",
        "phase": "Implementation",
        "role": "Developers",
        "participant": "cli-dev",
        "runtime": "bridge",
        "run": "JOB-20261010-0900-0a0a",
        "slot": "Implementation/MOD-a",
        "item": "",
        "modules": ["MOD-a"],
        "inputs": ["docs/architecture/ARC-004-the-store.md"],
        "retryOf": "",
        "agentM": "2026.10.1",
        "model": "claude-opus-5-5",
        "log": "",
        "selection": [],
        "limits": null,
        "assignments": [],
        "states": [{ "at": "2026-10-10T09:15:00Z", "state": "queued", "note": "" }],
        "results": [],
        "rounds": 0,
        "cost": null,
        "usage": null,
        "jobs": []
      }
    },
    {
      "name": "a state no record holds",
      "input": { "path": "docs/jobs/JOB-20261010-0915-1b1b.md", "text": "---\nid: JOB-20261010-0915-1b1b\nkind: implement\nphase: Implementation\nrole: Developers\nparticipant: cli-dev\nruntime: bridge\nrun: JOB-20261010-0900-0a0a\nslot: Implementation/MOD-a\nitem:\nmodules:\n  - MOD-a\ninputs:\n  - docs/architecture/ARC-004-the-store.md\nretry_of:\nagent_m: 2026.10.1\nmodel: claude-opus-5-5\nlog:\n---\n\n# JOB-20261010-0915-1b1b\n\n**REGISTER**\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-10T09:15:00Z | paused | — |\n" },
      "refused": "unknown-state"
    },
    {
      "name": "a file outside docs/jobs",
      "input": { "path": "docs/JOB-20261010-0915-1b1b.md", "text": "---\nid: JOB-20261010-0915-1b1b\nkind: implement\nphase: Implementation\nrole: Developers\nparticipant: cli-dev\nruntime: bridge\nrun: JOB-20261010-0900-0a0a\nslot: Implementation/MOD-a\nitem:\nmodules:\n  - MOD-a\ninputs:\n  - docs/architecture/ARC-004-the-store.md\nretry_of:\nagent_m: 2026.10.1\nmodel: claude-opus-5-5\nlog:\n---\n\n# JOB-20261010-0915-1b1b\n\n**REGISTER**\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-10T09:15:00Z | queued | — |\n" },
      "refused": "not-a-job-record"
    }
  ]
}
```

```json interface
{
  "id": "MOD-run-engine.cancelRecordText",
  "summary": "The record of a person's cancel and where it lies, docs/jobs/cancels/<id>.md: the job, who cancelled it, and when.",
  "params": [{ "name": "cancel", "type": "CancelInput" }],
  "result": "FileText",
  "async": false,
  "refusals": [],
  "examples": [
    {
      "name": "alice cancels a job",
      "input": { "cancel": { "job": "JOB-20261010-0915-1b1b", "by": "alice", "at": "2026-10-10T09:30:00Z" } },
      "result": { "path": "docs/jobs/cancels/JOB-20261010-0915-1b1b.md", "text": "job: JOB-20261010-0915-1b1b\nby: alice\nat: 2026-10-10T09:30:00Z\n" }
    }
  ]
}
```

```json interface
{
  "id": "MOD-run-engine.parseCancelRecord",
  "summary": "A cancel record as its file holds it.",
  "params": [{ "name": "path", "type": "string" }, { "name": "text", "type": "string" }],
  "result": "CancelRecord",
  "async": false,
  "refusals": [
    { "code": "not-a-cancel-record", "when": "the path is not docs/jobs/cancels/<job>.md, or the text names another job, no one, or no time" }
  ],
  "examples": [
    {
      "name": "a cancel",
      "input": { "path": "docs/jobs/cancels/JOB-20261010-0915-1b1b.md", "text": "job: JOB-20261010-0915-1b1b\nby: alice\nat: 2026-10-10T09:30:00Z\n" },
      "result": { "path": "docs/jobs/cancels/JOB-20261010-0915-1b1b.md", "job": "JOB-20261010-0915-1b1b", "by": "alice", "at": "2026-10-10T09:30:00Z" }
    },
    {
      "name": "a cancel of another job",
      "input": { "path": "docs/jobs/cancels/JOB-20261010-0916-2c2c.md", "text": "job: JOB-20261010-0915-1b1b\nby: alice\nat: 2026-10-10T09:30:00Z\n" },
      "refused": "not-a-cancel-record"
    }
  ]
}
```

```json interface
{
  "id": "MOD-run-engine.jobState",
  "summary": "A job's state, one of the seven, with a note: an end state its record holds; for a cancelled job, cancelled once its runtime confirms and its live state with \"cancelling\" before; the live state its runtime reports; ended without record when the runtime is reachable and does not know the job; the last recorded state when the runtime cannot be reached or was not asked.",
  "params": [
    { "name": "record", "type": "JobRecord" },
    { "name": "cancel", "type": "CancelRecordOrNone" },
    { "name": "live", "type": "LiveStateOrNone" }
  ],
  "result": "JobStateShown",
  "async": false,
  "refusals": [],
  "examples": [
    {
      "name": "running in its bridge",
      "input": {
        "record": {
          "id": "JOB-20261010-0915-1b1b",
          "path": "docs/jobs/JOB-20261010-0915-1b1b.md",
          "kind": "implement",
          "phase": "Implementation",
          "role": "Developers",
          "participant": "cli-dev",
          "runtime": "bridge",
          "run": "JOB-20261010-0900-0a0a",
          "slot": "Implementation/MOD-a",
          "item": "",
          "modules": ["MOD-a"],
          "inputs": ["docs/architecture/ARC-004-the-store.md"],
          "retryOf": "",
          "agentM": "2026.10.1",
          "model": "claude-opus-5-5",
          "log": "",
          "selection": [],
          "limits": null,
          "assignments": [],
          "states": [{ "at": "2026-10-10T09:15:00Z", "state": "queued", "note": "" }],
          "results": [],
          "rounds": 0,
          "cost": null,
          "usage": null,
          "jobs": []
        },
        "cancel": null,
        "live": { "reachable": true, "state": "running" }
      },
      "result": { "state": "running", "note": "" }
    },
    {
      "name": "a bridge that does not know it",
      "input": {
        "record": {
          "id": "JOB-20261010-0915-1b1b",
          "path": "docs/jobs/JOB-20261010-0915-1b1b.md",
          "kind": "implement",
          "phase": "Implementation",
          "role": "Developers",
          "participant": "cli-dev",
          "runtime": "bridge",
          "run": "JOB-20261010-0900-0a0a",
          "slot": "Implementation/MOD-a",
          "item": "",
          "modules": ["MOD-a"],
          "inputs": ["docs/architecture/ARC-004-the-store.md"],
          "retryOf": "",
          "agentM": "2026.10.1",
          "model": "claude-opus-5-5",
          "log": "",
          "selection": [],
          "limits": null,
          "assignments": [],
          "states": [{ "at": "2026-10-10T09:15:00Z", "state": "queued", "note": "" }],
          "results": [],
          "rounds": 0,
          "cost": null,
          "usage": null,
          "jobs": []
        },
        "cancel": null,
        "live": { "reachable": true, "state": "" }
      },
      "result": { "state": "ended-without-record", "note": "bridge does not know the job" }
    },
    {
      "name": "a bridge that cannot be reached",
      "input": {
        "record": {
          "id": "JOB-20261010-0915-1b1b",
          "path": "docs/jobs/JOB-20261010-0915-1b1b.md",
          "kind": "implement",
          "phase": "Implementation",
          "role": "Developers",
          "participant": "cli-dev",
          "runtime": "bridge",
          "run": "JOB-20261010-0900-0a0a",
          "slot": "Implementation/MOD-a",
          "item": "",
          "modules": ["MOD-a"],
          "inputs": ["docs/architecture/ARC-004-the-store.md"],
          "retryOf": "",
          "agentM": "2026.10.1",
          "model": "claude-opus-5-5",
          "log": "",
          "selection": [],
          "limits": null,
          "assignments": [],
          "states": [{ "at": "2026-10-10T09:15:00Z", "state": "queued", "note": "" }],
          "results": [],
          "rounds": 0,
          "cost": null,
          "usage": null,
          "jobs": []
        },
        "cancel": null,
        "live": { "reachable": false, "state": "" }
      },
      "result": { "state": "queued", "note": "bridge cannot be reached; this is the state last recorded" }
    },
    {
      "name": "a runtime not asked",
      "input": {
        "record": {
          "id": "JOB-20261010-0915-1b1b",
          "path": "docs/jobs/JOB-20261010-0915-1b1b.md",
          "kind": "implement",
          "phase": "Implementation",
          "role": "Developers",
          "participant": "cli-dev",
          "runtime": "bridge",
          "run": "JOB-20261010-0900-0a0a",
          "slot": "Implementation/MOD-a",
          "item": "",
          "modules": ["MOD-a"],
          "inputs": ["docs/architecture/ARC-004-the-store.md"],
          "retryOf": "",
          "agentM": "2026.10.1",
          "model": "claude-opus-5-5",
          "log": "",
          "selection": [],
          "limits": null,
          "assignments": [],
          "states": [{ "at": "2026-10-10T09:15:00Z", "state": "queued", "note": "" }],
          "results": [],
          "rounds": 0,
          "cost": null,
          "usage": null,
          "jobs": []
        },
        "cancel": null,
        "live": null
      },
      "result": { "state": "queued", "note": "bridge was not asked; this is the state last recorded" }
    },
    {
      "name": "cancelled, not yet confirmed",
      "input": {
        "record": {
          "id": "JOB-20261010-0915-1b1b",
          "path": "docs/jobs/JOB-20261010-0915-1b1b.md",
          "kind": "implement",
          "phase": "Implementation",
          "role": "Developers",
          "participant": "cli-dev",
          "runtime": "bridge",
          "run": "JOB-20261010-0900-0a0a",
          "slot": "Implementation/MOD-a",
          "item": "",
          "modules": ["MOD-a"],
          "inputs": ["docs/architecture/ARC-004-the-store.md"],
          "retryOf": "",
          "agentM": "2026.10.1",
          "model": "claude-opus-5-5",
          "log": "",
          "selection": [],
          "limits": null,
          "assignments": [],
          "states": [{ "at": "2026-10-10T09:15:00Z", "state": "queued", "note": "" }],
          "results": [],
          "rounds": 0,
          "cost": null,
          "usage": null,
          "jobs": []
        },
        "cancel": { "path": "docs/jobs/cancels/JOB-20261010-0915-1b1b.md", "job": "JOB-20261010-0915-1b1b", "by": "alice", "at": "2026-10-10T09:30:00Z" },
        "live": { "reachable": true, "state": "running" }
      },
      "result": { "state": "running", "note": "cancelling since 2026-10-10T09:30:00Z" }
    },
    {
      "name": "done",
      "input": {
        "record": {
          "id": "JOB-20261010-0915-1b1b",
          "path": "docs/jobs/JOB-20261010-0915-1b1b.md",
          "kind": "implement",
          "phase": "Implementation",
          "role": "Developers",
          "participant": "cli-dev",
          "runtime": "bridge",
          "run": "JOB-20261010-0900-0a0a",
          "slot": "Implementation/MOD-a",
          "item": "",
          "modules": ["MOD-a"],
          "inputs": ["docs/architecture/ARC-004-the-store.md"],
          "retryOf": "",
          "agentM": "2026.10.1",
          "model": "claude-opus-5-5",
          "log": "",
          "selection": [],
          "limits": null,
          "assignments": [],
          "states": [
            { "at": "2026-10-10T09:15:00Z", "state": "queued", "note": "" },
            { "at": "2026-10-10T09:16:00Z", "state": "running", "note": "" },
            { "at": "2026-10-10T10:40:00Z", "state": "done", "note": "" }
          ],
          "results": ["https://github.com/alice/thesis/pull/71"],
          "rounds": 2,
          "cost": null,
          "usage": { "inputTokens": 150000, "outputTokens": 32000, "minutes": null },
          "jobs": []
        },
        "cancel": null,
        "live": null
      },
      "result": { "state": "done", "note": "" }
    }
  ]
}
```

```json interface
{
  "id": "MOD-run-engine.jobCost",
  "summary": "A job's cost as it may be shown: the cost its runtime reported; or the usage it reported priced at the participant's declared price; or the usage with \"price unknown\"; or \"unknown\" — never a figure nobody reported.",
  "params": [
    { "name": "cost", "type": "MoneyOrNone" },
    { "name": "usage", "type": "UsageOrNone" },
    { "name": "price", "type": "PriceOrNone" }
  ],
  "result": "CostShown",
  "async": false,
  "refusals": [],
  "examples": [
    {
      "name": "reported by the runtime",
      "input": { "cost": { "amount": 0.85, "currency": "USD" }, "usage": null, "price": null },
      "result": { "shown": "0.85 USD", "amount": 0.85, "currency": "USD" }
    },
    {
      "name": "usage at the declared price",
      "input": {
        "cost": null,
        "usage": { "inputTokens": 150000, "outputTokens": 32000, "minutes": null },
        "price": { "currency": "EUR", "input": 2, "output": 3.5 }
      },
      "result": { "shown": "182 k tokens · 0.41 EUR at the declared price", "amount": 0.41, "currency": "EUR" }
    },
    {
      "name": "usage without a price",
      "input": { "cost": null, "usage": { "inputTokens": null, "outputTokens": null, "minutes": 14 }, "price": null },
      "result": { "shown": "14 min, price unknown", "amount": null, "currency": "" }
    },
    {
      "name": "nothing reported",
      "input": { "cost": null, "usage": null, "price": null },
      "result": { "shown": "unknown", "amount": null, "currency": "" }
    }
  ]
}
```

```json interface
{
  "id": "MOD-run-engine.jobList",
  "summary": "One list of every job of every product the instance manages: per job its product, identifier, what it works on — its item, its modules, or its inputs —, kind, participant, runtime, state with its note, start, elapsed minutes — to its last recorded state once it ended, to now while it runs —, cost as shown and log; waiting at a gate first, then running, queued, failed, ended without record, cancelled and done, each newest first.",
  "params": [{ "name": "entries", "type": "JobEntry[]" }, { "name": "now", "type": "string" }],
  "result": "JobRow[]",
  "async": false,
  "refusals": [],
  "examples": [
    {
      "name": "two products, three runtimes",
      "input": {
        "entries": [
          {
            "product": "thesis-tool",
            "record": {
              "id": "JOB-20261010-0915-1b1b",
              "path": "docs/jobs/JOB-20261010-0915-1b1b.md",
              "kind": "implement",
              "phase": "Implementation",
              "role": "Developers",
              "participant": "cli-dev",
              "runtime": "bridge",
              "run": "JOB-20261010-0900-0a0a",
              "slot": "Implementation/MOD-a",
              "item": "",
              "modules": ["MOD-a"],
              "inputs": ["docs/architecture/ARC-004-the-store.md"],
              "retryOf": "",
              "agentM": "2026.10.1",
              "model": "claude-opus-5-5",
              "log": "",
              "selection": [],
              "limits": null,
              "assignments": [],
              "states": [{ "at": "2026-10-10T09:15:00Z", "state": "queued", "note": "" }],
              "results": [],
              "rounds": 0,
              "cost": null,
              "usage": null,
              "jobs": []
            },
            "state": { "state": "running", "note": "" },
            "cost": { "shown": "unknown", "amount": null, "currency": "" }
          },
          {
            "product": "agent-m",
            "record": {
              "id": "JOB-20261009-1400-5f5f",
              "path": "docs/jobs/JOB-20261009-1400-5f5f.md",
              "kind": "test-battery",
              "phase": "Testing",
              "role": "Tester",
              "participant": "ci-dev",
              "runtime": "ci",
              "run": "JOB-20261010-0900-0a0a",
              "slot": "Testing/selection",
              "item": "",
              "modules": ["MOD-a"],
              "inputs": ["docs/architecture/ARC-004-the-store.md"],
              "retryOf": "",
              "agentM": "2026.10.1",
              "model": "claude-opus-5-5",
              "log": "https://github.com/akmaier/agent-m/actions/runs/7",
              "selection": [],
              "limits": null,
              "assignments": [],
              "states": [
                { "at": "2026-10-09T14:00:00Z", "state": "queued", "note": "" },
                { "at": "2026-10-09T14:01:00Z", "state": "running", "note": "" },
                { "at": "2026-10-09T15:30:00Z", "state": "waiting-at-gate", "note": "Testing → Validation" }
              ],
              "results": [],
              "rounds": 0,
              "cost": null,
              "usage": null,
              "jobs": []
            },
            "state": { "state": "waiting-at-gate", "note": "" },
            "cost": { "shown": "89 min, price unknown", "amount": null, "currency": "" }
          },
          {
            "product": "agent-m",
            "record": {
              "id": "JOB-20261008-1000-6a6a",
              "path": "docs/jobs/JOB-20261008-1000-6a6a.md",
              "kind": "derive-requirements",
              "phase": "Requirements",
              "role": "Analyst",
              "participant": "hub-writer",
              "runtime": "browser",
              "run": "",
              "slot": "",
              "item": "",
              "modules": [],
              "inputs": ["docs/sources/SRC-007.md"],
              "retryOf": "",
              "agentM": "2026.10.1",
              "model": "claude-opus-5-5",
              "log": "",
              "selection": [],
              "limits": null,
              "assignments": [],
              "states": [{ "at": "2026-10-08T10:00:00Z", "state": "running", "note": "" }],
              "results": [],
              "rounds": 0,
              "cost": null,
              "usage": null,
              "jobs": []
            },
            "state": { "state": "ended-without-record", "note": "browser does not know the job" },
            "cost": { "shown": "unknown", "amount": null, "currency": "" }
          }
        ],
        "now": "2026-10-10T10:00:00Z"
      },
      "result": [
        { "product": "agent-m", "id": "JOB-20261009-1400-5f5f", "worksOn": "MOD-a", "kind": "test-battery", "participant": "ci-dev", "runtime": "ci", "state": "waiting-at-gate", "note": "", "started": "2026-10-09T14:00:00Z", "elapsedMinutes": 1200, "cost": "89 min, price unknown", "log": "https://github.com/akmaier/agent-m/actions/runs/7" },
        { "product": "thesis-tool", "id": "JOB-20261010-0915-1b1b", "worksOn": "MOD-a", "kind": "implement", "participant": "cli-dev", "runtime": "bridge", "state": "running", "note": "", "started": "2026-10-10T09:15:00Z", "elapsedMinutes": 45, "cost": "unknown", "log": "" },
        { "product": "agent-m", "id": "JOB-20261008-1000-6a6a", "worksOn": "docs/sources/SRC-007.md", "kind": "derive-requirements", "participant": "hub-writer", "runtime": "browser", "state": "ended-without-record", "note": "browser does not know the job", "started": "2026-10-08T10:00:00Z", "elapsedMinutes": 0, "cost": "unknown", "log": "" }
      ]
    }
  ]
}
```

```json interface
{
  "id": "MOD-run-engine.moduleOrder",
  "summary": "The selected modules in waves: each wave holds the modules whose used modules within the selection are in earlier waves; refused, naming the modules, when their interfaces use each other in a cycle.",
  "params": [{ "name": "uses", "type": "ModuleUses[]" }, { "name": "selection", "type": "string[]" }],
  "result": "ModuleWaves",
  "async": false,
  "refusals": [{ "code": "cycle", "when": "the interfaces of selected modules use each other in a cycle" }],
  "examples": [
    {
      "name": "A before B before C, D alongside",
      "input": {
        "uses": [
          { "module": "MOD-a", "uses": [] },
          { "module": "MOD-b", "uses": ["MOD-a"] },
          { "module": "MOD-c", "uses": ["MOD-b", "MOD-contracts"] },
          { "module": "MOD-d", "uses": [] }
        ],
        "selection": ["MOD-a", "MOD-b", "MOD-c", "MOD-d"]
      },
      "result": { "waves": [["MOD-a", "MOD-d"], ["MOD-b"], ["MOD-c"]] }
    },
    {
      "name": "a cycle",
      "input": {
        "uses": [
          { "module": "MOD-b", "uses": ["MOD-a"] },
          { "module": "MOD-c", "uses": ["MOD-b", "MOD-contracts"] },
          { "module": "MOD-d", "uses": [] },
          { "module": "MOD-a", "uses": ["MOD-c"] }
        ],
        "selection": ["MOD-a", "MOD-b", "MOD-c", "MOD-d"]
      },
      "refused": "cycle"
    }
  ]
}
```

```json interface
{
  "id": "MOD-run-engine.runPlan",
  "summary": "The plan of a run before it starts: the CI job first when the product has none; from the first phase that produces MOD, one implementation job per module — after the modules it uses — or per item — after the items it depends on —; for a later phase that produces TST and no MOD, one test-battery job for the selection by a holder of its role other than the implementers; no job for any other phase. Each job names its participant, what it waits for, the gates into its phase from a phase without jobs, and the gates it meets before its merge.",
  "params": [{ "name": "input", "type": "RunInput" }],
  "result": "RunPlan",
  "async": false,
  "refusals": [
    { "code": "no-implementation-phase", "when": "no phase of the workflow produces MOD" },
    { "code": "cycle", "when": "the selected modules' interfaces form a cycle" },
    { "code": "no-holder", "when": "no participant holds a role a job needs" },
    { "code": "not-a-holder", "when": "a chosen participant does not hold the role" },
    { "code": "no-other-holder", "when": "the test battery has no holder besides the implementers" }
  ],
  "examples": [
    {
      "name": "a V-model run over four modules",
      "input": {
        "input": {
          "product": "thesis-tool",
          "kind": "planned",
          "selection": ["MOD-a", "MOD-b", "MOD-c", "MOD-d"],
          "phases": [
            {
              "name": "Requirements",
              "role": "Analyst",
              "produces": "requirements, UC",
              "kinds": ["UC", "requirement"],
              "line": 14,
              "practice": ""
            },
            { "name": "Design", "role": "Architect", "produces": "ARC", "kinds": ["ARC"], "line": 15, "practice": "" },
            {
              "name": "Implementation",
              "role": "Developers",
              "produces": "MOD",
              "kinds": ["MOD"],
              "line": 16,
              "practice": ""
            },
            { "name": "Testing", "role": "Tester", "produces": "TST", "kinds": ["TST"], "line": 17, "practice": "" },
            {
              "name": "Validation",
              "role": "Analyst",
              "produces": "the validation of the requirements",
              "kinds": [],
              "line": 18,
              "practice": ""
            },
            {
              "name": "Deployment",
              "role": "Operator",
              "produces": "the deployed release",
              "kinds": [],
              "line": 14,
              "practice": "devops"
            }
          ],
          "gates": [
            {
              "between": "Design → Implementation",
              "from": "Design",
              "to": "Implementation",
              "artifacts": "ARC",
              "kinds": ["ARC"],
              "condition": "every requirement has an ARC, and the design is accepted",
              "decider": { "role": "Architect" },
              "line": 41,
              "practice": "",
              "requirement": "",
              "source": "",
              "holders": ["alice"]
            },
            {
              "between": "Implementation → Testing",
              "from": "Implementation",
              "to": "Testing",
              "artifacts": "MOD",
              "kinds": ["MOD"],
              "condition": "CI is green",
              "decider": { "check": "tests" },
              "line": 42,
              "practice": "",
              "requirement": "",
              "source": "",
              "holders": []
            },
            {
              "between": "Validation → Deployment",
              "from": "Validation",
              "to": "Deployment",
              "artifacts": "TST",
              "kinds": ["TST"],
              "condition": "the deployment check is green",
              "decider": { "check": "deploy" },
              "line": 31,
              "practice": "devops",
              "requirement": "",
              "source": "",
              "holders": []
            },
            {
              "between": "Testing → Validation",
              "from": "Testing",
              "to": "Validation",
              "artifacts": "TST",
              "kinds": ["TST"],
              "condition": "every unit's verification is recorded",
              "decider": { "role": "Tester" },
              "line": 41,
              "practice": "",
              "requirement": "UNIT VERIFICATION IS DOCUMENTED",
              "source": "IEC 62304, 5.5.5",
              "holders": ["ci-dev"]
            }
          ],
          "roles": [
            {
              "name": "Analyst",
              "filledBy": "either",
              "capabilities": ["draft text", "read the repository"],
              "line": 48,
              "holders": ["alice"]
            },
            {
              "name": "Architect",
              "filledBy": "person",
              "capabilities": ["read the repository"],
              "line": 49,
              "holders": ["alice"]
            },
            {
              "name": "Developers",
              "filledBy": "agent",
              "capabilities": ["read the repository", "write to the repository", "run code and tests"],
              "line": 50,
              "holders": ["cli-dev"]
            },
            {
              "name": "Tester",
              "filledBy": "either",
              "capabilities": ["read the repository", "run code and tests"],
              "line": 51,
              "holders": ["ci-dev"]
            },
            {
              "name": "Operator",
              "filledBy": "agent",
              "capabilities": ["read the repository", "run code and tests"],
              "line": 37,
              "holders": ["ci-dev"]
            }
          ],
          "uses": [
            { "module": "MOD-a", "uses": [] },
            { "module": "MOD-b", "uses": ["MOD-a"] },
            { "module": "MOD-c", "uses": ["MOD-b", "MOD-contracts"] },
            { "module": "MOD-d", "uses": [] }
          ],
          "items": [],
          "ciConfigured": false,
          "assignments": [],
          "limits": { "jobsAtOnce": 3, "cost": { "amount": 20, "currency": "USD" }, "rounds": 5 }
        }
      },
      "result": {
        "product": "thesis-tool",
        "kind": "planned",
        "slots": [
          {
            "key": "configure-ci",
            "kind": "configure-ci",
            "phase": "Implementation",
            "role": "Developers",
            "participant": "cli-dev",
            "unit": "",
            "item": "",
            "modules": [],
            "after": [],
            "gates": [],
            "meets": []
          },
          {
            "key": "Implementation/MOD-a",
            "kind": "implement",
            "phase": "Implementation",
            "role": "Developers",
            "participant": "cli-dev",
            "unit": "MOD-a",
            "item": "",
            "modules": ["MOD-a"],
            "after": ["configure-ci"],
            "gates": ["Design → Implementation"],
            "meets": ["Implementation → Testing"]
          },
          {
            "key": "Implementation/MOD-d",
            "kind": "implement",
            "phase": "Implementation",
            "role": "Developers",
            "participant": "cli-dev",
            "unit": "MOD-d",
            "item": "",
            "modules": ["MOD-d"],
            "after": ["configure-ci"],
            "gates": ["Design → Implementation"],
            "meets": ["Implementation → Testing"]
          },
          {
            "key": "Implementation/MOD-b",
            "kind": "implement",
            "phase": "Implementation",
            "role": "Developers",
            "participant": "cli-dev",
            "unit": "MOD-b",
            "item": "",
            "modules": ["MOD-b"],
            "after": ["configure-ci", "Implementation/MOD-a"],
            "gates": ["Design → Implementation"],
            "meets": ["Implementation → Testing"]
          },
          {
            "key": "Implementation/MOD-c",
            "kind": "implement",
            "phase": "Implementation",
            "role": "Developers",
            "participant": "cli-dev",
            "unit": "MOD-c",
            "item": "",
            "modules": ["MOD-c"],
            "after": ["configure-ci", "Implementation/MOD-b"],
            "gates": ["Design → Implementation"],
            "meets": ["Implementation → Testing"]
          },
          {
            "key": "Testing/selection",
            "kind": "test-battery",
            "phase": "Testing",
            "role": "Tester",
            "participant": "ci-dev",
            "unit": "selection",
            "item": "",
            "modules": ["MOD-a", "MOD-d", "MOD-b", "MOD-c"],
            "after": ["Implementation/MOD-a", "Implementation/MOD-d", "Implementation/MOD-b", "Implementation/MOD-c"],
            "gates": [],
            "meets": ["Testing → Validation"]
          }
        ],
        "gates": [
          {
            "between": "Design → Implementation",
            "from": "Design",
            "to": "Implementation",
            "artifacts": "ARC",
            "kinds": ["ARC"],
            "condition": "every requirement has an ARC, and the design is accepted",
            "decider": { "role": "Architect" },
            "line": 41,
            "practice": "",
            "requirement": "",
            "source": "",
            "holders": ["alice"]
          },
          {
            "between": "Implementation → Testing",
            "from": "Implementation",
            "to": "Testing",
            "artifacts": "MOD",
            "kinds": ["MOD"],
            "condition": "CI is green",
            "decider": { "check": "tests" },
            "line": 42,
            "practice": "",
            "requirement": "",
            "source": "",
            "holders": []
          },
          {
            "between": "Testing → Validation",
            "from": "Testing",
            "to": "Validation",
            "artifacts": "TST",
            "kinds": ["TST"],
            "condition": "every unit's verification is recorded",
            "decider": { "role": "Tester" },
            "line": 41,
            "practice": "",
            "requirement": "UNIT VERIFICATION IS DOCUMENTED",
            "source": "IEC 62304, 5.5.5",
            "holders": ["ci-dev"]
          }
        ],
        "limits": { "jobsAtOnce": 3, "cost": { "amount": 20, "currency": "USD" }, "rounds": 5 }
      }
    },
    {
      "name": "a run over two backlog items",
      "input": {
        "input": {
          "product": "thesis-tool",
          "kind": "pulled",
          "selection": ["ITM-014", "ITM-015"],
          "phases": [
            {
              "name": "Sprint planning",
              "role": "Product Owner",
              "produces": "ITM",
              "kinds": ["ITM"],
              "line": 12,
              "practice": ""
            },
            {
              "name": "Development",
              "role": "Developers",
              "produces": "MOD, TST",
              "kinds": ["MOD", "TST"],
              "line": 13,
              "practice": ""
            },
            {
              "name": "Sprint review",
              "role": "Product Owner",
              "produces": "the review of the increment",
              "kinds": [],
              "line": 14,
              "practice": ""
            }
          ],
          "gates": [
            {
              "between": "Development → Sprint review",
              "from": "Development",
              "to": "Sprint review",
              "artifacts": "MOD",
              "kinds": ["MOD"],
              "condition": "CI is green",
              "decider": { "role": "Product Owner" },
              "line": 28,
              "practice": "",
              "requirement": "",
              "source": "",
              "holders": ["alice"]
            }
          ],
          "roles": [
            {
              "name": "Product Owner",
              "filledBy": "person",
              "capabilities": ["read the repository", "write to the repository"],
              "line": 34,
              "holders": ["alice"]
            },
            {
              "name": "Developers",
              "filledBy": "agent",
              "capabilities": ["read the repository", "write to the repository", "run code and tests"],
              "line": 35,
              "holders": ["cli-dev", "ci-dev"]
            }
          ],
          "uses": [],
          "items": [
            {
              "id": "ITM-014",
              "path": "docs/backlog/ITM-014-export-a-chapter-as-pdf.md",
              "title": "Export a chapter as PDF",
              "kind": "implementation",
              "realises": ["A CHAPTER IS EXPORTED", "UC-003"],
              "modules": ["MOD-export"],
              "dependsOn": ["ITM-009"],
              "origins": ["https://github.com/alice/thesis/issues/57"],
              "outcome": "The author presses Export on a chapter and receives a PDF of it.",
              "criteria": ["The PDF holds the chapter's text and figures."],
              "notes": ""
            },
            {
              "id": "ITM-015",
              "path": "docs/backlog/ITM-015-write-a-chapter-in-the-editor.md",
              "title": "Write a chapter in the editor",
              "kind": "implementation",
              "realises": ["NO SERVER", "UC-002"],
              "modules": ["MOD-pages"],
              "dependsOn": [],
              "origins": ["UC-002"],
              "outcome": "Write a chapter in the editor.",
              "criteria": [],
              "notes": ""
            }
          ],
          "ciConfigured": true,
          "assignments": [{ "role": "Developers", "participant": "ci-dev" }],
          "limits": { "jobsAtOnce": 2, "cost": null, "rounds": 5 }
        }
      },
      "result": {
        "product": "thesis-tool",
        "kind": "pulled",
        "slots": [
          {
            "key": "Development/ITM-014",
            "kind": "implement",
            "phase": "Development",
            "role": "Developers",
            "participant": "ci-dev",
            "unit": "ITM-014",
            "item": "ITM-014",
            "modules": ["MOD-export"],
            "after": [],
            "gates": [],
            "meets": ["Development → Sprint review"]
          },
          {
            "key": "Development/ITM-015",
            "kind": "implement",
            "phase": "Development",
            "role": "Developers",
            "participant": "ci-dev",
            "unit": "ITM-015",
            "item": "ITM-015",
            "modules": ["MOD-pages"],
            "after": [],
            "gates": [],
            "meets": ["Development → Sprint review"]
          }
        ],
        "gates": [
          {
            "between": "Development → Sprint review",
            "from": "Development",
            "to": "Sprint review",
            "artifacts": "MOD",
            "kinds": ["MOD"],
            "condition": "CI is green",
            "decider": { "role": "Product Owner" },
            "line": 28,
            "practice": "",
            "requirement": "",
            "source": "",
            "holders": ["alice"]
          }
        ],
        "limits": { "jobsAtOnce": 2, "cost": null, "rounds": 5 }
      }
    },
    {
      "name": "a participant who does not hold the role",
      "input": {
        "input": {
          "product": "thesis-tool",
          "kind": "planned",
          "selection": ["MOD-a", "MOD-b", "MOD-c", "MOD-d"],
          "phases": [
            {
              "name": "Requirements",
              "role": "Analyst",
              "produces": "requirements, UC",
              "kinds": ["UC", "requirement"],
              "line": 14,
              "practice": ""
            },
            { "name": "Design", "role": "Architect", "produces": "ARC", "kinds": ["ARC"], "line": 15, "practice": "" },
            {
              "name": "Implementation",
              "role": "Developers",
              "produces": "MOD",
              "kinds": ["MOD"],
              "line": 16,
              "practice": ""
            },
            { "name": "Testing", "role": "Tester", "produces": "TST", "kinds": ["TST"], "line": 17, "practice": "" },
            {
              "name": "Validation",
              "role": "Analyst",
              "produces": "the validation of the requirements",
              "kinds": [],
              "line": 18,
              "practice": ""
            },
            {
              "name": "Deployment",
              "role": "Operator",
              "produces": "the deployed release",
              "kinds": [],
              "line": 14,
              "practice": "devops"
            }
          ],
          "gates": [
            {
              "between": "Design → Implementation",
              "from": "Design",
              "to": "Implementation",
              "artifacts": "ARC",
              "kinds": ["ARC"],
              "condition": "every requirement has an ARC, and the design is accepted",
              "decider": { "role": "Architect" },
              "line": 41,
              "practice": "",
              "requirement": "",
              "source": "",
              "holders": ["alice"]
            },
            {
              "between": "Implementation → Testing",
              "from": "Implementation",
              "to": "Testing",
              "artifacts": "MOD",
              "kinds": ["MOD"],
              "condition": "CI is green",
              "decider": { "check": "tests" },
              "line": 42,
              "practice": "",
              "requirement": "",
              "source": "",
              "holders": []
            },
            {
              "between": "Validation → Deployment",
              "from": "Validation",
              "to": "Deployment",
              "artifacts": "TST",
              "kinds": ["TST"],
              "condition": "the deployment check is green",
              "decider": { "check": "deploy" },
              "line": 31,
              "practice": "devops",
              "requirement": "",
              "source": "",
              "holders": []
            },
            {
              "between": "Testing → Validation",
              "from": "Testing",
              "to": "Validation",
              "artifacts": "TST",
              "kinds": ["TST"],
              "condition": "every unit's verification is recorded",
              "decider": { "role": "Tester" },
              "line": 41,
              "practice": "",
              "requirement": "UNIT VERIFICATION IS DOCUMENTED",
              "source": "IEC 62304, 5.5.5",
              "holders": ["ci-dev"]
            }
          ],
          "roles": [
            {
              "name": "Analyst",
              "filledBy": "either",
              "capabilities": ["draft text", "read the repository"],
              "line": 48,
              "holders": ["alice"]
            },
            {
              "name": "Architect",
              "filledBy": "person",
              "capabilities": ["read the repository"],
              "line": 49,
              "holders": ["alice"]
            },
            {
              "name": "Developers",
              "filledBy": "agent",
              "capabilities": ["read the repository", "write to the repository", "run code and tests"],
              "line": 50,
              "holders": ["cli-dev"]
            },
            {
              "name": "Tester",
              "filledBy": "either",
              "capabilities": ["read the repository", "run code and tests"],
              "line": 51,
              "holders": ["ci-dev"]
            },
            {
              "name": "Operator",
              "filledBy": "agent",
              "capabilities": ["read the repository", "run code and tests"],
              "line": 37,
              "holders": ["ci-dev"]
            }
          ],
          "uses": [
            { "module": "MOD-a", "uses": [] },
            { "module": "MOD-b", "uses": ["MOD-a"] },
            { "module": "MOD-c", "uses": ["MOD-b", "MOD-contracts"] },
            { "module": "MOD-d", "uses": [] }
          ],
          "items": [],
          "ciConfigured": false,
          "assignments": [{ "role": "Developers", "participant": "alice" }],
          "limits": { "jobsAtOnce": 3, "cost": { "amount": 20, "currency": "USD" }, "rounds": 5 }
        }
      },
      "refused": "not-a-holder"
    },
    {
      "name": "only the implementer could test",
      "input": {
        "input": {
          "product": "thesis-tool",
          "kind": "planned",
          "selection": ["MOD-a", "MOD-b", "MOD-c", "MOD-d"],
          "phases": [
            {
              "name": "Requirements",
              "role": "Analyst",
              "produces": "requirements, UC",
              "kinds": ["UC", "requirement"],
              "line": 14,
              "practice": ""
            },
            { "name": "Design", "role": "Architect", "produces": "ARC", "kinds": ["ARC"], "line": 15, "practice": "" },
            {
              "name": "Implementation",
              "role": "Developers",
              "produces": "MOD",
              "kinds": ["MOD"],
              "line": 16,
              "practice": ""
            },
            { "name": "Testing", "role": "Tester", "produces": "TST", "kinds": ["TST"], "line": 17, "practice": "" },
            {
              "name": "Validation",
              "role": "Analyst",
              "produces": "the validation of the requirements",
              "kinds": [],
              "line": 18,
              "practice": ""
            },
            {
              "name": "Deployment",
              "role": "Operator",
              "produces": "the deployed release",
              "kinds": [],
              "line": 14,
              "practice": "devops"
            }
          ],
          "gates": [
            {
              "between": "Design → Implementation",
              "from": "Design",
              "to": "Implementation",
              "artifacts": "ARC",
              "kinds": ["ARC"],
              "condition": "every requirement has an ARC, and the design is accepted",
              "decider": { "role": "Architect" },
              "line": 41,
              "practice": "",
              "requirement": "",
              "source": "",
              "holders": ["alice"]
            },
            {
              "between": "Implementation → Testing",
              "from": "Implementation",
              "to": "Testing",
              "artifacts": "MOD",
              "kinds": ["MOD"],
              "condition": "CI is green",
              "decider": { "check": "tests" },
              "line": 42,
              "practice": "",
              "requirement": "",
              "source": "",
              "holders": []
            },
            {
              "between": "Validation → Deployment",
              "from": "Validation",
              "to": "Deployment",
              "artifacts": "TST",
              "kinds": ["TST"],
              "condition": "the deployment check is green",
              "decider": { "check": "deploy" },
              "line": 31,
              "practice": "devops",
              "requirement": "",
              "source": "",
              "holders": []
            },
            {
              "between": "Testing → Validation",
              "from": "Testing",
              "to": "Validation",
              "artifacts": "TST",
              "kinds": ["TST"],
              "condition": "every unit's verification is recorded",
              "decider": { "role": "Tester" },
              "line": 41,
              "practice": "",
              "requirement": "UNIT VERIFICATION IS DOCUMENTED",
              "source": "IEC 62304, 5.5.5",
              "holders": ["ci-dev"]
            }
          ],
          "roles": [
            {
              "name": "Analyst",
              "filledBy": "either",
              "capabilities": ["draft text", "read the repository"],
              "line": 48,
              "holders": ["alice"]
            },
            {
              "name": "Architect",
              "filledBy": "person",
              "capabilities": ["read the repository"],
              "line": 49,
              "holders": ["alice"]
            },
            {
              "name": "Developers",
              "filledBy": "agent",
              "capabilities": ["read the repository", "write to the repository", "run code and tests"],
              "line": 50,
              "holders": ["cli-dev"]
            },
            {
              "name": "Tester",
              "filledBy": "either",
              "capabilities": ["read the repository", "run code and tests"],
              "line": 51,
              "holders": ["cli-dev"]
            },
            {
              "name": "Operator",
              "filledBy": "agent",
              "capabilities": ["read the repository", "run code and tests"],
              "line": 37,
              "holders": ["ci-dev"]
            }
          ],
          "uses": [
            { "module": "MOD-a", "uses": [] },
            { "module": "MOD-b", "uses": ["MOD-a"] },
            { "module": "MOD-c", "uses": ["MOD-b", "MOD-contracts"] },
            { "module": "MOD-d", "uses": [] }
          ],
          "items": [],
          "ciConfigured": false,
          "assignments": [],
          "limits": { "jobsAtOnce": 3, "cost": { "amount": 20, "currency": "USD" }, "rounds": 5 }
        }
      },
      "refused": "no-other-holder"
    },
    {
      "name": "a role nobody holds",
      "input": {
        "input": {
          "product": "thesis-tool",
          "kind": "planned",
          "selection": ["MOD-a", "MOD-b", "MOD-c", "MOD-d"],
          "phases": [
            {
              "name": "Requirements",
              "role": "Analyst",
              "produces": "requirements, UC",
              "kinds": ["UC", "requirement"],
              "line": 14,
              "practice": ""
            },
            { "name": "Design", "role": "Architect", "produces": "ARC", "kinds": ["ARC"], "line": 15, "practice": "" },
            {
              "name": "Implementation",
              "role": "Developers",
              "produces": "MOD",
              "kinds": ["MOD"],
              "line": 16,
              "practice": ""
            },
            { "name": "Testing", "role": "Tester", "produces": "TST", "kinds": ["TST"], "line": 17, "practice": "" },
            {
              "name": "Validation",
              "role": "Analyst",
              "produces": "the validation of the requirements",
              "kinds": [],
              "line": 18,
              "practice": ""
            },
            {
              "name": "Deployment",
              "role": "Operator",
              "produces": "the deployed release",
              "kinds": [],
              "line": 14,
              "practice": "devops"
            }
          ],
          "gates": [
            {
              "between": "Design → Implementation",
              "from": "Design",
              "to": "Implementation",
              "artifacts": "ARC",
              "kinds": ["ARC"],
              "condition": "every requirement has an ARC, and the design is accepted",
              "decider": { "role": "Architect" },
              "line": 41,
              "practice": "",
              "requirement": "",
              "source": "",
              "holders": ["alice"]
            },
            {
              "between": "Implementation → Testing",
              "from": "Implementation",
              "to": "Testing",
              "artifacts": "MOD",
              "kinds": ["MOD"],
              "condition": "CI is green",
              "decider": { "check": "tests" },
              "line": 42,
              "practice": "",
              "requirement": "",
              "source": "",
              "holders": []
            },
            {
              "between": "Validation → Deployment",
              "from": "Validation",
              "to": "Deployment",
              "artifacts": "TST",
              "kinds": ["TST"],
              "condition": "the deployment check is green",
              "decider": { "check": "deploy" },
              "line": 31,
              "practice": "devops",
              "requirement": "",
              "source": "",
              "holders": []
            },
            {
              "between": "Testing → Validation",
              "from": "Testing",
              "to": "Validation",
              "artifacts": "TST",
              "kinds": ["TST"],
              "condition": "every unit's verification is recorded",
              "decider": { "role": "Tester" },
              "line": 41,
              "practice": "",
              "requirement": "UNIT VERIFICATION IS DOCUMENTED",
              "source": "IEC 62304, 5.5.5",
              "holders": ["ci-dev"]
            }
          ],
          "roles": [
            {
              "name": "Analyst",
              "filledBy": "either",
              "capabilities": ["draft text", "read the repository"],
              "line": 48,
              "holders": ["alice"]
            },
            {
              "name": "Architect",
              "filledBy": "person",
              "capabilities": ["read the repository"],
              "line": 49,
              "holders": ["alice"]
            },
            {
              "name": "Developers",
              "filledBy": "agent",
              "capabilities": ["read the repository", "write to the repository", "run code and tests"],
              "line": 50,
              "holders": []
            },
            {
              "name": "Tester",
              "filledBy": "either",
              "capabilities": ["read the repository", "run code and tests"],
              "line": 51,
              "holders": ["ci-dev"]
            },
            {
              "name": "Operator",
              "filledBy": "agent",
              "capabilities": ["read the repository", "run code and tests"],
              "line": 37,
              "holders": ["ci-dev"]
            }
          ],
          "uses": [
            { "module": "MOD-a", "uses": [] },
            { "module": "MOD-b", "uses": ["MOD-a"] },
            { "module": "MOD-c", "uses": ["MOD-b", "MOD-contracts"] },
            { "module": "MOD-d", "uses": [] }
          ],
          "items": [],
          "ciConfigured": false,
          "assignments": [],
          "limits": { "jobsAtOnce": 3, "cost": { "amount": 20, "currency": "USD" }, "rounds": 5 }
        }
      },
      "refused": "no-holder"
    }
  ]
}
```

```json interface
{
  "id": "MOD-run-engine.nextJobs",
  "summary": "The jobs a run starts now, from its plan and the records: a job whose slot has no job yet, whose predecessors are done, whose gates into its phase are passed for the product, and — for an item — whose item may start, up to the jobs-at-once limit; what waits and why; whether the run is done; and the limit that stopped it.",
  "params": [{ "name": "snapshot", "type": "RunSnapshot" }],
  "result": "NextJobs",
  "async": false,
  "refusals": [],
  "examples": [
    {
      "name": "the start: CI first",
      "input": {
        "snapshot": {
          "run": "JOB-20261010-0900-0a0a",
          "plan": {
            "product": "thesis-tool",
            "kind": "planned",
            "slots": [
              {
                "key": "configure-ci",
                "kind": "configure-ci",
                "phase": "Implementation",
                "role": "Developers",
                "participant": "cli-dev",
                "unit": "",
                "item": "",
                "modules": [],
                "after": [],
                "gates": [],
                "meets": []
              },
              {
                "key": "Implementation/MOD-a",
                "kind": "implement",
                "phase": "Implementation",
                "role": "Developers",
                "participant": "cli-dev",
                "unit": "MOD-a",
                "item": "",
                "modules": ["MOD-a"],
                "after": ["configure-ci"],
                "gates": ["Design → Implementation"],
                "meets": ["Implementation → Testing"]
              },
              {
                "key": "Implementation/MOD-d",
                "kind": "implement",
                "phase": "Implementation",
                "role": "Developers",
                "participant": "cli-dev",
                "unit": "MOD-d",
                "item": "",
                "modules": ["MOD-d"],
                "after": ["configure-ci"],
                "gates": ["Design → Implementation"],
                "meets": ["Implementation → Testing"]
              },
              {
                "key": "Implementation/MOD-b",
                "kind": "implement",
                "phase": "Implementation",
                "role": "Developers",
                "participant": "cli-dev",
                "unit": "MOD-b",
                "item": "",
                "modules": ["MOD-b"],
                "after": ["configure-ci", "Implementation/MOD-a"],
                "gates": ["Design → Implementation"],
                "meets": ["Implementation → Testing"]
              },
              {
                "key": "Implementation/MOD-c",
                "kind": "implement",
                "phase": "Implementation",
                "role": "Developers",
                "participant": "cli-dev",
                "unit": "MOD-c",
                "item": "",
                "modules": ["MOD-c"],
                "after": ["configure-ci", "Implementation/MOD-b"],
                "gates": ["Design → Implementation"],
                "meets": ["Implementation → Testing"]
              },
              {
                "key": "Testing/selection",
                "kind": "test-battery",
                "phase": "Testing",
                "role": "Tester",
                "participant": "ci-dev",
                "unit": "selection",
                "item": "",
                "modules": ["MOD-a", "MOD-d", "MOD-b", "MOD-c"],
                "after": ["Implementation/MOD-a", "Implementation/MOD-d", "Implementation/MOD-b", "Implementation/MOD-c"],
                "gates": [],
                "meets": ["Testing → Validation"]
              }
            ],
            "gates": [
              {
                "between": "Design → Implementation",
                "from": "Design",
                "to": "Implementation",
                "artifacts": "ARC",
                "kinds": ["ARC"],
                "condition": "every requirement has an ARC, and the design is accepted",
                "decider": { "role": "Architect" },
                "line": 41,
                "practice": "",
                "requirement": "",
                "source": "",
                "holders": ["alice"]
              },
              {
                "between": "Implementation → Testing",
                "from": "Implementation",
                "to": "Testing",
                "artifacts": "MOD",
                "kinds": ["MOD"],
                "condition": "CI is green",
                "decider": { "check": "tests" },
                "line": 42,
                "practice": "",
                "requirement": "",
                "source": "",
                "holders": []
              },
              {
                "between": "Testing → Validation",
                "from": "Testing",
                "to": "Validation",
                "artifacts": "TST",
                "kinds": ["TST"],
                "condition": "every unit's verification is recorded",
                "decider": { "role": "Tester" },
                "line": 41,
                "practice": "",
                "requirement": "UNIT VERIFICATION IS DOCUMENTED",
                "source": "IEC 62304, 5.5.5",
                "holders": ["ci-dev"]
              }
            ],
            "limits": { "jobsAtOnce": 3, "cost": { "amount": 20, "currency": "USD" }, "rounds": 5 }
          },
          "jobs": [],
          "gateRecords": [],
          "checks": [],
          "texts": [{ "gate": "Design → Implementation", "on": "c300000000000000000000000000000000000000" }],
          "items": [],
          "sprint": null,
          "sprints": false,
          "wipLimit": null,
          "inProgress": 0
        }
      },
      "result": {
        "start": [
          {
            "slot": "configure-ci",
            "kind": "configure-ci",
            "phase": "Implementation",
            "role": "Developers",
            "participant": "cli-dev",
            "run": "JOB-20261010-0900-0a0a",
            "item": "",
            "modules": []
          }
        ],
        "waiting": [],
        "done": false,
        "stop": ""
      }
    },
    {
      "name": "the design gate not yet passed",
      "input": {
        "snapshot": {
          "run": "JOB-20261010-0900-0a0a",
          "plan": {
            "product": "thesis-tool",
            "kind": "planned",
            "slots": [
              {
                "key": "configure-ci",
                "kind": "configure-ci",
                "phase": "Implementation",
                "role": "Developers",
                "participant": "cli-dev",
                "unit": "",
                "item": "",
                "modules": [],
                "after": [],
                "gates": [],
                "meets": []
              },
              {
                "key": "Implementation/MOD-a",
                "kind": "implement",
                "phase": "Implementation",
                "role": "Developers",
                "participant": "cli-dev",
                "unit": "MOD-a",
                "item": "",
                "modules": ["MOD-a"],
                "after": ["configure-ci"],
                "gates": ["Design → Implementation"],
                "meets": ["Implementation → Testing"]
              },
              {
                "key": "Implementation/MOD-d",
                "kind": "implement",
                "phase": "Implementation",
                "role": "Developers",
                "participant": "cli-dev",
                "unit": "MOD-d",
                "item": "",
                "modules": ["MOD-d"],
                "after": ["configure-ci"],
                "gates": ["Design → Implementation"],
                "meets": ["Implementation → Testing"]
              },
              {
                "key": "Implementation/MOD-b",
                "kind": "implement",
                "phase": "Implementation",
                "role": "Developers",
                "participant": "cli-dev",
                "unit": "MOD-b",
                "item": "",
                "modules": ["MOD-b"],
                "after": ["configure-ci", "Implementation/MOD-a"],
                "gates": ["Design → Implementation"],
                "meets": ["Implementation → Testing"]
              },
              {
                "key": "Implementation/MOD-c",
                "kind": "implement",
                "phase": "Implementation",
                "role": "Developers",
                "participant": "cli-dev",
                "unit": "MOD-c",
                "item": "",
                "modules": ["MOD-c"],
                "after": ["configure-ci", "Implementation/MOD-b"],
                "gates": ["Design → Implementation"],
                "meets": ["Implementation → Testing"]
              },
              {
                "key": "Testing/selection",
                "kind": "test-battery",
                "phase": "Testing",
                "role": "Tester",
                "participant": "ci-dev",
                "unit": "selection",
                "item": "",
                "modules": ["MOD-a", "MOD-d", "MOD-b", "MOD-c"],
                "after": ["Implementation/MOD-a", "Implementation/MOD-d", "Implementation/MOD-b", "Implementation/MOD-c"],
                "gates": [],
                "meets": ["Testing → Validation"]
              }
            ],
            "gates": [
              {
                "between": "Design → Implementation",
                "from": "Design",
                "to": "Implementation",
                "artifacts": "ARC",
                "kinds": ["ARC"],
                "condition": "every requirement has an ARC, and the design is accepted",
                "decider": { "role": "Architect" },
                "line": 41,
                "practice": "",
                "requirement": "",
                "source": "",
                "holders": ["alice"]
              },
              {
                "between": "Implementation → Testing",
                "from": "Implementation",
                "to": "Testing",
                "artifacts": "MOD",
                "kinds": ["MOD"],
                "condition": "CI is green",
                "decider": { "check": "tests" },
                "line": 42,
                "practice": "",
                "requirement": "",
                "source": "",
                "holders": []
              },
              {
                "between": "Testing → Validation",
                "from": "Testing",
                "to": "Validation",
                "artifacts": "TST",
                "kinds": ["TST"],
                "condition": "every unit's verification is recorded",
                "decider": { "role": "Tester" },
                "line": 41,
                "practice": "",
                "requirement": "UNIT VERIFICATION IS DOCUMENTED",
                "source": "IEC 62304, 5.5.5",
                "holders": ["ci-dev"]
              }
            ],
            "limits": { "jobsAtOnce": 3, "cost": { "amount": 20, "currency": "USD" }, "rounds": 5 }
          },
          "jobs": [
            { "id": "JOB-20261010-0905-0c0c", "slot": "configure-ci", "run": "JOB-20261010-0900-0a0a", "participant": "cli-dev", "started": "2026-10-10T09:05:00Z", "state": "done", "cost": null, "rounds": 0 }
          ],
          "gateRecords": [],
          "checks": [],
          "texts": [{ "gate": "Design → Implementation", "on": "c300000000000000000000000000000000000000" }],
          "items": [],
          "sprint": null,
          "sprints": false,
          "wipLimit": null,
          "inProgress": 0
        }
      },
      "result": {
        "start": [],
        "waiting": ["Implementation/MOD-a: Design → Implementation waits for alice", "Implementation/MOD-d: Design → Implementation waits for alice"],
        "done": false,
        "stop": ""
      }
    },
    {
      "name": "MOD-b after MOD-a while MOD-d runs",
      "input": {
        "snapshot": {
          "run": "JOB-20261010-0900-0a0a",
          "plan": {
            "product": "thesis-tool",
            "kind": "planned",
            "slots": [
              {
                "key": "configure-ci",
                "kind": "configure-ci",
                "phase": "Implementation",
                "role": "Developers",
                "participant": "cli-dev",
                "unit": "",
                "item": "",
                "modules": [],
                "after": [],
                "gates": [],
                "meets": []
              },
              {
                "key": "Implementation/MOD-a",
                "kind": "implement",
                "phase": "Implementation",
                "role": "Developers",
                "participant": "cli-dev",
                "unit": "MOD-a",
                "item": "",
                "modules": ["MOD-a"],
                "after": ["configure-ci"],
                "gates": ["Design → Implementation"],
                "meets": ["Implementation → Testing"]
              },
              {
                "key": "Implementation/MOD-d",
                "kind": "implement",
                "phase": "Implementation",
                "role": "Developers",
                "participant": "cli-dev",
                "unit": "MOD-d",
                "item": "",
                "modules": ["MOD-d"],
                "after": ["configure-ci"],
                "gates": ["Design → Implementation"],
                "meets": ["Implementation → Testing"]
              },
              {
                "key": "Implementation/MOD-b",
                "kind": "implement",
                "phase": "Implementation",
                "role": "Developers",
                "participant": "cli-dev",
                "unit": "MOD-b",
                "item": "",
                "modules": ["MOD-b"],
                "after": ["configure-ci", "Implementation/MOD-a"],
                "gates": ["Design → Implementation"],
                "meets": ["Implementation → Testing"]
              },
              {
                "key": "Implementation/MOD-c",
                "kind": "implement",
                "phase": "Implementation",
                "role": "Developers",
                "participant": "cli-dev",
                "unit": "MOD-c",
                "item": "",
                "modules": ["MOD-c"],
                "after": ["configure-ci", "Implementation/MOD-b"],
                "gates": ["Design → Implementation"],
                "meets": ["Implementation → Testing"]
              },
              {
                "key": "Testing/selection",
                "kind": "test-battery",
                "phase": "Testing",
                "role": "Tester",
                "participant": "ci-dev",
                "unit": "selection",
                "item": "",
                "modules": ["MOD-a", "MOD-d", "MOD-b", "MOD-c"],
                "after": ["Implementation/MOD-a", "Implementation/MOD-d", "Implementation/MOD-b", "Implementation/MOD-c"],
                "gates": [],
                "meets": ["Testing → Validation"]
              }
            ],
            "gates": [
              {
                "between": "Design → Implementation",
                "from": "Design",
                "to": "Implementation",
                "artifacts": "ARC",
                "kinds": ["ARC"],
                "condition": "every requirement has an ARC, and the design is accepted",
                "decider": { "role": "Architect" },
                "line": 41,
                "practice": "",
                "requirement": "",
                "source": "",
                "holders": ["alice"]
              },
              {
                "between": "Implementation → Testing",
                "from": "Implementation",
                "to": "Testing",
                "artifacts": "MOD",
                "kinds": ["MOD"],
                "condition": "CI is green",
                "decider": { "check": "tests" },
                "line": 42,
                "practice": "",
                "requirement": "",
                "source": "",
                "holders": []
              },
              {
                "between": "Testing → Validation",
                "from": "Testing",
                "to": "Validation",
                "artifacts": "TST",
                "kinds": ["TST"],
                "condition": "every unit's verification is recorded",
                "decider": { "role": "Tester" },
                "line": 41,
                "practice": "",
                "requirement": "UNIT VERIFICATION IS DOCUMENTED",
                "source": "IEC 62304, 5.5.5",
                "holders": ["ci-dev"]
              }
            ],
            "limits": { "jobsAtOnce": 3, "cost": { "amount": 20, "currency": "USD" }, "rounds": 5 }
          },
          "jobs": [
            { "id": "JOB-20261010-0905-0c0c", "slot": "configure-ci", "run": "JOB-20261010-0900-0a0a", "participant": "cli-dev", "started": "2026-10-10T09:05:00Z", "state": "done", "cost": null, "rounds": 0 },
            {
              "id": "JOB-20261010-0915-1b1b",
              "slot": "Implementation/MOD-a",
              "run": "JOB-20261010-0900-0a0a",
              "participant": "cli-dev",
              "started": "2026-10-10T09:15:00Z",
              "state": "done",
              "cost": { "amount": 4, "currency": "USD" },
              "rounds": 1
            },
            { "id": "JOB-20261010-0916-2c2c", "slot": "Implementation/MOD-d", "run": "JOB-20261010-0900-0a0a", "participant": "cli-dev", "started": "2026-10-10T09:16:00Z", "state": "running", "cost": null, "rounds": 0 }
          ],
          "gateRecords": [
            { "path": "docs/jobs/gates/thesis-tool-design-implementation-c30000000000.md", "from": "Design", "to": "Implementation", "subject": "thesis-tool", "on": "c300000000000000000000000000000000000000", "decider": "alice", "decision": "passed", "reason": "every requirement has an ARC" }
          ],
          "checks": [],
          "texts": [{ "gate": "Design → Implementation", "on": "c300000000000000000000000000000000000000" }],
          "items": [],
          "sprint": null,
          "sprints": false,
          "wipLimit": null,
          "inProgress": 0
        }
      },
      "result": {
        "start": [
          {
            "slot": "Implementation/MOD-b",
            "kind": "implement",
            "phase": "Implementation",
            "role": "Developers",
            "participant": "cli-dev",
            "run": "JOB-20261010-0900-0a0a",
            "item": "",
            "modules": ["MOD-b"]
          }
        ],
        "waiting": [],
        "done": false,
        "stop": ""
      }
    },
    {
      "name": "the design changed after its gate passed",
      "input": {
        "snapshot": {
          "run": "JOB-20261010-0900-0a0a",
          "plan": {
            "product": "thesis-tool",
            "kind": "planned",
            "slots": [
              {
                "key": "configure-ci",
                "kind": "configure-ci",
                "phase": "Implementation",
                "role": "Developers",
                "participant": "cli-dev",
                "unit": "",
                "item": "",
                "modules": [],
                "after": [],
                "gates": [],
                "meets": []
              },
              {
                "key": "Implementation/MOD-a",
                "kind": "implement",
                "phase": "Implementation",
                "role": "Developers",
                "participant": "cli-dev",
                "unit": "MOD-a",
                "item": "",
                "modules": ["MOD-a"],
                "after": ["configure-ci"],
                "gates": ["Design → Implementation"],
                "meets": ["Implementation → Testing"]
              },
              {
                "key": "Implementation/MOD-d",
                "kind": "implement",
                "phase": "Implementation",
                "role": "Developers",
                "participant": "cli-dev",
                "unit": "MOD-d",
                "item": "",
                "modules": ["MOD-d"],
                "after": ["configure-ci"],
                "gates": ["Design → Implementation"],
                "meets": ["Implementation → Testing"]
              },
              {
                "key": "Implementation/MOD-b",
                "kind": "implement",
                "phase": "Implementation",
                "role": "Developers",
                "participant": "cli-dev",
                "unit": "MOD-b",
                "item": "",
                "modules": ["MOD-b"],
                "after": ["configure-ci", "Implementation/MOD-a"],
                "gates": ["Design → Implementation"],
                "meets": ["Implementation → Testing"]
              },
              {
                "key": "Implementation/MOD-c",
                "kind": "implement",
                "phase": "Implementation",
                "role": "Developers",
                "participant": "cli-dev",
                "unit": "MOD-c",
                "item": "",
                "modules": ["MOD-c"],
                "after": ["configure-ci", "Implementation/MOD-b"],
                "gates": ["Design → Implementation"],
                "meets": ["Implementation → Testing"]
              },
              {
                "key": "Testing/selection",
                "kind": "test-battery",
                "phase": "Testing",
                "role": "Tester",
                "participant": "ci-dev",
                "unit": "selection",
                "item": "",
                "modules": ["MOD-a", "MOD-d", "MOD-b", "MOD-c"],
                "after": ["Implementation/MOD-a", "Implementation/MOD-d", "Implementation/MOD-b", "Implementation/MOD-c"],
                "gates": [],
                "meets": ["Testing → Validation"]
              }
            ],
            "gates": [
              {
                "between": "Design → Implementation",
                "from": "Design",
                "to": "Implementation",
                "artifacts": "ARC",
                "kinds": ["ARC"],
                "condition": "every requirement has an ARC, and the design is accepted",
                "decider": { "role": "Architect" },
                "line": 41,
                "practice": "",
                "requirement": "",
                "source": "",
                "holders": ["alice"]
              },
              {
                "between": "Implementation → Testing",
                "from": "Implementation",
                "to": "Testing",
                "artifacts": "MOD",
                "kinds": ["MOD"],
                "condition": "CI is green",
                "decider": { "check": "tests" },
                "line": 42,
                "practice": "",
                "requirement": "",
                "source": "",
                "holders": []
              },
              {
                "between": "Testing → Validation",
                "from": "Testing",
                "to": "Validation",
                "artifacts": "TST",
                "kinds": ["TST"],
                "condition": "every unit's verification is recorded",
                "decider": { "role": "Tester" },
                "line": 41,
                "practice": "",
                "requirement": "UNIT VERIFICATION IS DOCUMENTED",
                "source": "IEC 62304, 5.5.5",
                "holders": ["ci-dev"]
              }
            ],
            "limits": { "jobsAtOnce": 3, "cost": { "amount": 20, "currency": "USD" }, "rounds": 5 }
          },
          "jobs": [
            { "id": "JOB-20261010-0905-0c0c", "slot": "configure-ci", "run": "JOB-20261010-0900-0a0a", "participant": "cli-dev", "started": "2026-10-10T09:05:00Z", "state": "done", "cost": null, "rounds": 0 }
          ],
          "gateRecords": [
            { "path": "docs/jobs/gates/thesis-tool-design-implementation-c30000000000.md", "from": "Design", "to": "Implementation", "subject": "thesis-tool", "on": "c300000000000000000000000000000000000000", "decider": "alice", "decision": "passed", "reason": "every requirement has an ARC" }
          ],
          "checks": [],
          "texts": [{ "gate": "Design → Implementation", "on": "c400000000000000000000000000000000000000" }],
          "items": [],
          "sprint": null,
          "sprints": false,
          "wipLimit": null,
          "inProgress": 0
        }
      },
      "result": {
        "start": [],
        "waiting": ["Implementation/MOD-a: Design → Implementation was passed by alice on an earlier text and waits for a decision on the current one", "Implementation/MOD-d: Design → Implementation was passed by alice on an earlier text and waits for a decision on the current one"],
        "done": false,
        "stop": ""
      }
    },
    {
      "name": "the cost limit reached",
      "input": {
        "snapshot": {
          "run": "JOB-20261010-0900-0a0a",
          "plan": {
            "product": "thesis-tool",
            "kind": "planned",
            "slots": [
              {
                "key": "configure-ci",
                "kind": "configure-ci",
                "phase": "Implementation",
                "role": "Developers",
                "participant": "cli-dev",
                "unit": "",
                "item": "",
                "modules": [],
                "after": [],
                "gates": [],
                "meets": []
              },
              {
                "key": "Implementation/MOD-a",
                "kind": "implement",
                "phase": "Implementation",
                "role": "Developers",
                "participant": "cli-dev",
                "unit": "MOD-a",
                "item": "",
                "modules": ["MOD-a"],
                "after": ["configure-ci"],
                "gates": ["Design → Implementation"],
                "meets": ["Implementation → Testing"]
              },
              {
                "key": "Implementation/MOD-d",
                "kind": "implement",
                "phase": "Implementation",
                "role": "Developers",
                "participant": "cli-dev",
                "unit": "MOD-d",
                "item": "",
                "modules": ["MOD-d"],
                "after": ["configure-ci"],
                "gates": ["Design → Implementation"],
                "meets": ["Implementation → Testing"]
              },
              {
                "key": "Implementation/MOD-b",
                "kind": "implement",
                "phase": "Implementation",
                "role": "Developers",
                "participant": "cli-dev",
                "unit": "MOD-b",
                "item": "",
                "modules": ["MOD-b"],
                "after": ["configure-ci", "Implementation/MOD-a"],
                "gates": ["Design → Implementation"],
                "meets": ["Implementation → Testing"]
              },
              {
                "key": "Implementation/MOD-c",
                "kind": "implement",
                "phase": "Implementation",
                "role": "Developers",
                "participant": "cli-dev",
                "unit": "MOD-c",
                "item": "",
                "modules": ["MOD-c"],
                "after": ["configure-ci", "Implementation/MOD-b"],
                "gates": ["Design → Implementation"],
                "meets": ["Implementation → Testing"]
              },
              {
                "key": "Testing/selection",
                "kind": "test-battery",
                "phase": "Testing",
                "role": "Tester",
                "participant": "ci-dev",
                "unit": "selection",
                "item": "",
                "modules": ["MOD-a", "MOD-d", "MOD-b", "MOD-c"],
                "after": ["Implementation/MOD-a", "Implementation/MOD-d", "Implementation/MOD-b", "Implementation/MOD-c"],
                "gates": [],
                "meets": ["Testing → Validation"]
              }
            ],
            "gates": [
              {
                "between": "Design → Implementation",
                "from": "Design",
                "to": "Implementation",
                "artifacts": "ARC",
                "kinds": ["ARC"],
                "condition": "every requirement has an ARC, and the design is accepted",
                "decider": { "role": "Architect" },
                "line": 41,
                "practice": "",
                "requirement": "",
                "source": "",
                "holders": ["alice"]
              },
              {
                "between": "Implementation → Testing",
                "from": "Implementation",
                "to": "Testing",
                "artifacts": "MOD",
                "kinds": ["MOD"],
                "condition": "CI is green",
                "decider": { "check": "tests" },
                "line": 42,
                "practice": "",
                "requirement": "",
                "source": "",
                "holders": []
              },
              {
                "between": "Testing → Validation",
                "from": "Testing",
                "to": "Validation",
                "artifacts": "TST",
                "kinds": ["TST"],
                "condition": "every unit's verification is recorded",
                "decider": { "role": "Tester" },
                "line": 41,
                "practice": "",
                "requirement": "UNIT VERIFICATION IS DOCUMENTED",
                "source": "IEC 62304, 5.5.5",
                "holders": ["ci-dev"]
              }
            ],
            "limits": { "jobsAtOnce": 3, "cost": { "amount": 20, "currency": "USD" }, "rounds": 5 }
          },
          "jobs": [
            { "id": "JOB-20261010-0905-0c0c", "slot": "configure-ci", "run": "JOB-20261010-0900-0a0a", "participant": "cli-dev", "started": "2026-10-10T09:05:00Z", "state": "done", "cost": null, "rounds": 0 },
            {
              "id": "JOB-20261010-0915-1b1b",
              "slot": "Implementation/MOD-a",
              "run": "JOB-20261010-0900-0a0a",
              "participant": "cli-dev",
              "started": "2026-10-10T09:15:00Z",
              "state": "done",
              "cost": { "amount": 4, "currency": "USD" },
              "rounds": 1
            },
            {
              "id": "JOB-20261010-1100-3d3d",
              "slot": "Implementation/MOD-b",
              "run": "JOB-20261010-0900-0a0a",
              "participant": "cli-dev",
              "started": "2026-10-10T11:00:00Z",
              "state": "done",
              "cost": { "amount": 17, "currency": "USD" },
              "rounds": 2
            },
            { "id": "JOB-20261010-0916-2c2c", "slot": "Implementation/MOD-d", "run": "JOB-20261010-0900-0a0a", "participant": "cli-dev", "started": "2026-10-10T09:16:00Z", "state": "done", "cost": null, "rounds": 0 }
          ],
          "gateRecords": [
            { "path": "docs/jobs/gates/thesis-tool-design-implementation-c30000000000.md", "from": "Design", "to": "Implementation", "subject": "thesis-tool", "on": "c300000000000000000000000000000000000000", "decider": "alice", "decision": "passed", "reason": "every requirement has an ARC" }
          ],
          "checks": [],
          "texts": [{ "gate": "Design → Implementation", "on": "c300000000000000000000000000000000000000" }],
          "items": [],
          "sprint": null,
          "sprints": false,
          "wipLimit": null,
          "inProgress": 0
        }
      },
      "result": {
        "start": [],
        "waiting": [],
        "done": false,
        "stop": "the cost limit of 20 USD is reached: 21 USD reported"
      }
    },
    {
      "name": "one job at once",
      "input": {
        "snapshot": {
          "run": "JOB-20261010-0900-0a0a",
          "plan": {
            "product": "thesis-tool",
            "kind": "planned",
            "slots": [
              {
                "key": "configure-ci",
                "kind": "configure-ci",
                "phase": "Implementation",
                "role": "Developers",
                "participant": "cli-dev",
                "unit": "",
                "item": "",
                "modules": [],
                "after": [],
                "gates": [],
                "meets": []
              },
              {
                "key": "Implementation/MOD-a",
                "kind": "implement",
                "phase": "Implementation",
                "role": "Developers",
                "participant": "cli-dev",
                "unit": "MOD-a",
                "item": "",
                "modules": ["MOD-a"],
                "after": ["configure-ci"],
                "gates": ["Design → Implementation"],
                "meets": ["Implementation → Testing"]
              },
              {
                "key": "Implementation/MOD-d",
                "kind": "implement",
                "phase": "Implementation",
                "role": "Developers",
                "participant": "cli-dev",
                "unit": "MOD-d",
                "item": "",
                "modules": ["MOD-d"],
                "after": ["configure-ci"],
                "gates": ["Design → Implementation"],
                "meets": ["Implementation → Testing"]
              },
              {
                "key": "Implementation/MOD-b",
                "kind": "implement",
                "phase": "Implementation",
                "role": "Developers",
                "participant": "cli-dev",
                "unit": "MOD-b",
                "item": "",
                "modules": ["MOD-b"],
                "after": ["configure-ci", "Implementation/MOD-a"],
                "gates": ["Design → Implementation"],
                "meets": ["Implementation → Testing"]
              },
              {
                "key": "Implementation/MOD-c",
                "kind": "implement",
                "phase": "Implementation",
                "role": "Developers",
                "participant": "cli-dev",
                "unit": "MOD-c",
                "item": "",
                "modules": ["MOD-c"],
                "after": ["configure-ci", "Implementation/MOD-b"],
                "gates": ["Design → Implementation"],
                "meets": ["Implementation → Testing"]
              },
              {
                "key": "Testing/selection",
                "kind": "test-battery",
                "phase": "Testing",
                "role": "Tester",
                "participant": "ci-dev",
                "unit": "selection",
                "item": "",
                "modules": ["MOD-a", "MOD-d", "MOD-b", "MOD-c"],
                "after": ["Implementation/MOD-a", "Implementation/MOD-d", "Implementation/MOD-b", "Implementation/MOD-c"],
                "gates": [],
                "meets": ["Testing → Validation"]
              }
            ],
            "gates": [
              {
                "between": "Design → Implementation",
                "from": "Design",
                "to": "Implementation",
                "artifacts": "ARC",
                "kinds": ["ARC"],
                "condition": "every requirement has an ARC, and the design is accepted",
                "decider": { "role": "Architect" },
                "line": 41,
                "practice": "",
                "requirement": "",
                "source": "",
                "holders": ["alice"]
              },
              {
                "between": "Implementation → Testing",
                "from": "Implementation",
                "to": "Testing",
                "artifacts": "MOD",
                "kinds": ["MOD"],
                "condition": "CI is green",
                "decider": { "check": "tests" },
                "line": 42,
                "practice": "",
                "requirement": "",
                "source": "",
                "holders": []
              },
              {
                "between": "Testing → Validation",
                "from": "Testing",
                "to": "Validation",
                "artifacts": "TST",
                "kinds": ["TST"],
                "condition": "every unit's verification is recorded",
                "decider": { "role": "Tester" },
                "line": 41,
                "practice": "",
                "requirement": "UNIT VERIFICATION IS DOCUMENTED",
                "source": "IEC 62304, 5.5.5",
                "holders": ["ci-dev"]
              }
            ],
            "limits": { "jobsAtOnce": 1, "cost": { "amount": 20, "currency": "USD" }, "rounds": 5 }
          },
          "jobs": [
            { "id": "JOB-20261010-0905-0c0c", "slot": "configure-ci", "run": "JOB-20261010-0900-0a0a", "participant": "cli-dev", "started": "2026-10-10T09:05:00Z", "state": "done", "cost": null, "rounds": 0 }
          ],
          "gateRecords": [
            { "path": "docs/jobs/gates/thesis-tool-design-implementation-c30000000000.md", "from": "Design", "to": "Implementation", "subject": "thesis-tool", "on": "c300000000000000000000000000000000000000", "decider": "alice", "decision": "passed", "reason": "every requirement has an ARC" }
          ],
          "checks": [],
          "texts": [{ "gate": "Design → Implementation", "on": "c300000000000000000000000000000000000000" }],
          "items": [],
          "sprint": null,
          "sprints": false,
          "wipLimit": null,
          "inProgress": 0
        }
      },
      "result": {
        "start": [
          {
            "slot": "Implementation/MOD-a",
            "kind": "implement",
            "phase": "Implementation",
            "role": "Developers",
            "participant": "cli-dev",
            "run": "JOB-20261010-0900-0a0a",
            "item": "",
            "modules": ["MOD-a"]
          }
        ],
        "waiting": ["1 job waits for the limit of 1 job at once"],
        "done": false,
        "stop": ""
      }
    },
    {
      "name": "a job reached the round limit",
      "input": {
        "snapshot": {
          "run": "JOB-20261010-0900-0a0a",
          "plan": {
            "product": "thesis-tool",
            "kind": "planned",
            "slots": [
              {
                "key": "configure-ci",
                "kind": "configure-ci",
                "phase": "Implementation",
                "role": "Developers",
                "participant": "cli-dev",
                "unit": "",
                "item": "",
                "modules": [],
                "after": [],
                "gates": [],
                "meets": []
              },
              {
                "key": "Implementation/MOD-a",
                "kind": "implement",
                "phase": "Implementation",
                "role": "Developers",
                "participant": "cli-dev",
                "unit": "MOD-a",
                "item": "",
                "modules": ["MOD-a"],
                "after": ["configure-ci"],
                "gates": ["Design → Implementation"],
                "meets": ["Implementation → Testing"]
              },
              {
                "key": "Implementation/MOD-d",
                "kind": "implement",
                "phase": "Implementation",
                "role": "Developers",
                "participant": "cli-dev",
                "unit": "MOD-d",
                "item": "",
                "modules": ["MOD-d"],
                "after": ["configure-ci"],
                "gates": ["Design → Implementation"],
                "meets": ["Implementation → Testing"]
              },
              {
                "key": "Implementation/MOD-b",
                "kind": "implement",
                "phase": "Implementation",
                "role": "Developers",
                "participant": "cli-dev",
                "unit": "MOD-b",
                "item": "",
                "modules": ["MOD-b"],
                "after": ["configure-ci", "Implementation/MOD-a"],
                "gates": ["Design → Implementation"],
                "meets": ["Implementation → Testing"]
              },
              {
                "key": "Implementation/MOD-c",
                "kind": "implement",
                "phase": "Implementation",
                "role": "Developers",
                "participant": "cli-dev",
                "unit": "MOD-c",
                "item": "",
                "modules": ["MOD-c"],
                "after": ["configure-ci", "Implementation/MOD-b"],
                "gates": ["Design → Implementation"],
                "meets": ["Implementation → Testing"]
              },
              {
                "key": "Testing/selection",
                "kind": "test-battery",
                "phase": "Testing",
                "role": "Tester",
                "participant": "ci-dev",
                "unit": "selection",
                "item": "",
                "modules": ["MOD-a", "MOD-d", "MOD-b", "MOD-c"],
                "after": ["Implementation/MOD-a", "Implementation/MOD-d", "Implementation/MOD-b", "Implementation/MOD-c"],
                "gates": [],
                "meets": ["Testing → Validation"]
              }
            ],
            "gates": [
              {
                "between": "Design → Implementation",
                "from": "Design",
                "to": "Implementation",
                "artifacts": "ARC",
                "kinds": ["ARC"],
                "condition": "every requirement has an ARC, and the design is accepted",
                "decider": { "role": "Architect" },
                "line": 41,
                "practice": "",
                "requirement": "",
                "source": "",
                "holders": ["alice"]
              },
              {
                "between": "Implementation → Testing",
                "from": "Implementation",
                "to": "Testing",
                "artifacts": "MOD",
                "kinds": ["MOD"],
                "condition": "CI is green",
                "decider": { "check": "tests" },
                "line": 42,
                "practice": "",
                "requirement": "",
                "source": "",
                "holders": []
              },
              {
                "between": "Testing → Validation",
                "from": "Testing",
                "to": "Validation",
                "artifacts": "TST",
                "kinds": ["TST"],
                "condition": "every unit's verification is recorded",
                "decider": { "role": "Tester" },
                "line": 41,
                "practice": "",
                "requirement": "UNIT VERIFICATION IS DOCUMENTED",
                "source": "IEC 62304, 5.5.5",
                "holders": ["ci-dev"]
              }
            ],
            "limits": { "jobsAtOnce": 3, "cost": { "amount": 20, "currency": "USD" }, "rounds": 5 }
          },
          "jobs": [
            { "id": "JOB-20261010-0905-0c0c", "slot": "configure-ci", "run": "JOB-20261010-0900-0a0a", "participant": "cli-dev", "started": "2026-10-10T09:05:00Z", "state": "done", "cost": null, "rounds": 0 },
            {
              "id": "JOB-20261010-0915-1b1b",
              "slot": "Implementation/MOD-a",
              "run": "JOB-20261010-0900-0a0a",
              "participant": "cli-dev",
              "started": "2026-10-10T09:15:00Z",
              "state": "done",
              "cost": { "amount": 4, "currency": "USD" },
              "rounds": 5
            },
            { "id": "JOB-20261010-0916-2c2c", "slot": "Implementation/MOD-d", "run": "JOB-20261010-0900-0a0a", "participant": "cli-dev", "started": "2026-10-10T09:16:00Z", "state": "running", "cost": null, "rounds": 0 }
          ],
          "gateRecords": [
            { "path": "docs/jobs/gates/thesis-tool-design-implementation-c30000000000.md", "from": "Design", "to": "Implementation", "subject": "thesis-tool", "on": "c300000000000000000000000000000000000000", "decider": "alice", "decision": "passed", "reason": "every requirement has an ARC" }
          ],
          "checks": [],
          "texts": [{ "gate": "Design → Implementation", "on": "c300000000000000000000000000000000000000" }],
          "items": [],
          "sprint": null,
          "sprints": false,
          "wipLimit": null,
          "inProgress": 0
        }
      },
      "result": {
        "start": [],
        "waiting": [],
        "done": false,
        "stop": "JOB-20261010-0915-1b1b reached the limit of 5 correction rounds"
      }
    },
    {
      "name": "backlog items, one waiting for acceptance",
      "input": {
        "snapshot": {
          "run": "JOB-20261010-0900-0a0a",
          "plan": {
            "product": "thesis-tool",
            "kind": "pulled",
            "slots": [
              {
                "key": "Development/ITM-014",
                "kind": "implement",
                "phase": "Development",
                "role": "Developers",
                "participant": "ci-dev",
                "unit": "ITM-014",
                "item": "ITM-014",
                "modules": ["MOD-export"],
                "after": [],
                "gates": [],
                "meets": ["Development → Sprint review"]
              },
              {
                "key": "Development/ITM-015",
                "kind": "implement",
                "phase": "Development",
                "role": "Developers",
                "participant": "ci-dev",
                "unit": "ITM-015",
                "item": "ITM-015",
                "modules": ["MOD-pages"],
                "after": [],
                "gates": [],
                "meets": ["Development → Sprint review"]
              }
            ],
            "gates": [
              {
                "between": "Development → Sprint review",
                "from": "Development",
                "to": "Sprint review",
                "artifacts": "MOD",
                "kinds": ["MOD"],
                "condition": "CI is green",
                "decider": { "role": "Product Owner" },
                "line": 28,
                "practice": "",
                "requirement": "",
                "source": "",
                "holders": ["alice"]
              }
            ],
            "limits": { "jobsAtOnce": 2, "cost": null, "rounds": 5 }
          },
          "jobs": [],
          "gateRecords": [],
          "checks": [],
          "texts": [{ "gate": "Design → Implementation", "on": "c300000000000000000000000000000000000000" }],
          "items": [
            {
              "item": {
                "id": "ITM-014",
                "path": "docs/backlog/ITM-014-export-a-chapter-as-pdf.md",
                "title": "Export a chapter as PDF",
                "kind": "implementation",
                "realises": ["A CHAPTER IS EXPORTED", "UC-003"],
                "modules": ["MOD-export"],
                "dependsOn": ["ITM-009"],
                "origins": ["https://github.com/alice/thesis/issues/57"],
                "outcome": "The author presses Export on a chapter and receives a PDF of it.",
                "criteria": ["The PDF holds the chapter's text and figures."],
                "notes": ""
              },
              "facts": {
                "added": "2026-10-05T08:00:00Z",
                "accepted": [{ "name": "UC-003", "at": "2026-10-01T10:00:00Z" }],
                "jobs": [],
                "pullRequests": [],
                "proposals": [],
                "rejections": []
              }
            },
            {
              "item": {
                "id": "ITM-015",
                "path": "docs/backlog/ITM-015-write-a-chapter-in-the-editor.md",
                "title": "Write a chapter in the editor",
                "kind": "implementation",
                "realises": ["NO SERVER", "UC-002"],
                "modules": ["MOD-pages"],
                "dependsOn": [],
                "origins": ["UC-002"],
                "outcome": "Write a chapter in the editor.",
                "criteria": [],
                "notes": ""
              },
              "facts": {
                "added": "2026-10-05T08:00:00Z",
                "accepted": [
                  { "name": "NO SERVER", "at": "2026-09-01T10:00:00Z" },
                  { "name": "UC-002", "at": "2026-09-01T10:00:00Z" },
                  { "name": "ONE CLICK", "at": "2026-09-01T10:00:00Z" },
                  { "name": "UC-001", "at": "2026-09-01T10:00:00Z" }
                ],
                "jobs": [],
                "pullRequests": [],
                "proposals": [],
                "rejections": []
              }
            }
          ],
          "sprint": {
            "id": "sprint-04",
            "path": "docs/backlog/sprints/sprint-04.md",
            "goal": "The author exports and writes chapters",
            "start": "2026-10-05",
            "end": "",
            "timeBoxEnd": "2026-10-18",
            "selection": ["ITM-014", "ITM-015"],
            "closer": "cli-dev",
            "branch": "sprint/04"
          },
          "sprints": true,
          "wipLimit": null,
          "inProgress": 0
        }
      },
      "result": {
        "start": [
          {
            "slot": "Development/ITM-015",
            "kind": "implement",
            "phase": "Development",
            "role": "Developers",
            "participant": "ci-dev",
            "run": "JOB-20261010-0900-0a0a",
            "item": "ITM-015",
            "modules": ["MOD-pages"]
          }
        ],
        "waiting": ["Development/ITM-014: A CHAPTER IS EXPORTED is not accepted"],
        "done": false,
        "stop": ""
      }
    }
  ]
}
```

```json interface
{
  "id": "MOD-run-engine.advance",
  "summary": "What a runtime writes for one step of a run: the start records of the jobs it starts — each with an identifier from a draw that no job of the product holds, naming the run and its slot, queued —, and the run's record listing every job it started, each added as it starts — a retry a click started among them —, with one more state where its state or its reason changed: running while a job of it is queued or running or one starts, with the limit that stopped it; waiting at a gate, with every reason, when nothing runs and nothing can start; done once every slot of its plan is done.",
  "params": [{ "name": "input", "type": "AdvanceInput" }],
  "result": "Advance",
  "async": false,
  "refusals": [
    { "code": "not-a-run", "when": "the record is not a run's" },
    { "code": "ended", "when": "the run has ended" },
    { "code": "no-identifier", "when": "the draws give no free identifier for every job to start" },
    { "code": "unchanged", "when": "no job starts and the run's state and reason stay as recorded" }
  ],
  "examples": [
    {
      "name": "MOD-b starts after MOD-a",
      "input": {
        "input": {
          "run": {
            "id": "JOB-20261010-0900-0a0a",
            "path": "docs/jobs/JOB-20261010-0900-0a0a.md",
            "kind": "run",
            "phase": "",
            "role": "",
            "participant": "alice",
            "runtime": "browser",
            "run": "",
            "slot": "",
            "item": "",
            "modules": [],
            "inputs": [],
            "retryOf": "",
            "agentM": "2026.10.1",
            "model": "",
            "log": "",
            "selection": ["MOD-a", "MOD-b", "MOD-c", "MOD-d"],
            "limits": { "jobsAtOnce": 3, "cost": { "amount": 20, "currency": "USD" }, "rounds": 5 },
            "assignments": [
              { "role": "Developers", "participant": "cli-dev" },
              { "role": "Tester", "participant": "ci-dev" }
            ],
            "states": [{ "at": "2026-10-10T09:00:00Z", "state": "running", "note": "" }],
            "results": [],
            "rounds": 0,
            "cost": null,
            "usage": null,
            "jobs": ["JOB-20261010-0905-0c0c", "JOB-20261010-0915-1b1b", "JOB-20261010-0916-2c2c"]
          },
          "next": {
            "start": [
              {
                "slot": "Implementation/MOD-b",
                "kind": "implement",
                "phase": "Implementation",
                "role": "Developers",
                "participant": "cli-dev",
                "run": "JOB-20261010-0900-0a0a",
                "item": "",
                "modules": ["MOD-b"]
              }
            ],
            "waiting": [],
            "done": false,
            "stop": ""
          },
          "start": [
            {
              "slot": "Implementation/MOD-b",
              "kind": "implement",
              "phase": "Implementation",
              "role": "Developers",
              "participant": "cli-dev",
              "run": "JOB-20261010-0900-0a0a",
              "item": "",
              "modules": ["MOD-b"],
              "runtime": "bridge",
              "model": "claude-opus-5-5"
            }
          ],
          "held": [],
          "jobs": [
            { "id": "JOB-20261010-0905-0c0c", "slot": "configure-ci", "run": "JOB-20261010-0900-0a0a", "participant": "cli-dev", "started": "2026-10-10T09:05:00Z", "state": "done", "cost": null, "rounds": 0 },
            {
              "id": "JOB-20261010-0915-1b1b",
              "slot": "Implementation/MOD-a",
              "run": "JOB-20261010-0900-0a0a",
              "participant": "cli-dev",
              "started": "2026-10-10T09:15:00Z",
              "state": "done",
              "cost": { "amount": 4, "currency": "USD" },
              "rounds": 1
            },
            { "id": "JOB-20261010-0916-2c2c", "slot": "Implementation/MOD-d", "run": "JOB-20261010-0900-0a0a", "participant": "cli-dev", "started": "2026-10-10T09:16:00Z", "state": "running", "cost": null, "rounds": 0 }
          ],
          "taken": ["JOB-20261010-0900-0a0a", "JOB-20261010-0905-0c0c", "JOB-20261010-0915-1b1b", "JOB-20261010-0916-2c2c"],
          "draws": ["7a7a", "8b8b"],
          "now": "2026-10-10T10:45:00Z",
          "agentM": "2026.10.1"
        }
      },
      "result": {
        "files": [
          { "path": "docs/jobs/JOB-20261010-1045-7a7a.md", "text": "---\nid: JOB-20261010-1045-7a7a\nkind: implement\nphase: Implementation\nrole: Developers\nparticipant: cli-dev\nruntime: bridge\nrun: JOB-20261010-0900-0a0a\nslot: Implementation/MOD-b\nitem:\nmodules:\n  - MOD-b\ninputs: []\nretry_of:\nagent_m: 2026.10.1\nmodel: claude-opus-5-5\nlog:\n---\n\n# JOB-20261010-1045-7a7a\n\n**REGISTER**\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-10T10:45:00Z | queued | — |\n" },
          { "path": "docs/jobs/JOB-20261010-0900-0a0a.md", "text": "---\nid: JOB-20261010-0900-0a0a\nkind: run\nphase:\nrole:\nparticipant: alice\nruntime: browser\nrun:\nslot:\nitem:\nmodules: []\ninputs: []\nretry_of:\nagent_m: 2026.10.1\nmodel:\nlog:\n---\n\n# JOB-20261010-0900-0a0a\n\n**REGISTER**\n\n## Selection\n\n- MOD-a\n- MOD-b\n- MOD-c\n- MOD-d\n\n## Limits\n\n| Jobs at once | Cost | Rounds |\n|---|---|---|\n| 3 | 20 USD | 5 |\n\n## Assignments\n\n| Role | Participant |\n|---|---|\n| Developers | cli-dev |\n| Tester | ci-dev |\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-10T09:00:00Z | running | — |\n\n## Jobs\n\n- JOB-20261010-0905-0c0c\n- JOB-20261010-0915-1b1b\n- JOB-20261010-0916-2c2c\n- JOB-20261010-1045-7a7a\n" }
        ],
        "started": ["JOB-20261010-1045-7a7a"],
        "state": null,
        "message": "run JOB-20261010-0900-0a0a starts JOB-20261010-1045-7a7a"
      }
    },
    {
      "name": "the design gate waits for a person",
      "input": {
        "input": {
          "run": {
            "id": "JOB-20261010-0900-0a0a",
            "path": "docs/jobs/JOB-20261010-0900-0a0a.md",
            "kind": "run",
            "phase": "",
            "role": "",
            "participant": "alice",
            "runtime": "browser",
            "run": "",
            "slot": "",
            "item": "",
            "modules": [],
            "inputs": [],
            "retryOf": "",
            "agentM": "2026.10.1",
            "model": "",
            "log": "",
            "selection": ["MOD-a", "MOD-b", "MOD-c", "MOD-d"],
            "limits": { "jobsAtOnce": 3, "cost": { "amount": 20, "currency": "USD" }, "rounds": 5 },
            "assignments": [
              { "role": "Developers", "participant": "cli-dev" },
              { "role": "Tester", "participant": "ci-dev" }
            ],
            "states": [{ "at": "2026-10-10T09:00:00Z", "state": "running", "note": "" }],
            "results": [],
            "rounds": 0,
            "cost": null,
            "usage": null,
            "jobs": ["JOB-20261010-0905-0c0c", "JOB-20261010-0915-1b1b", "JOB-20261010-0916-2c2c"]
          },
          "next": {
            "start": [],
            "waiting": ["Implementation/MOD-a: Design → Implementation waits for alice", "Implementation/MOD-d: Design → Implementation waits for alice"],
            "done": false,
            "stop": ""
          },
          "start": [],
          "held": [],
          "jobs": [
            { "id": "JOB-20261010-0905-0c0c", "slot": "configure-ci", "run": "JOB-20261010-0900-0a0a", "participant": "cli-dev", "started": "2026-10-10T09:05:00Z", "state": "done", "cost": null, "rounds": 0 }
          ],
          "taken": ["JOB-20261010-0900-0a0a", "JOB-20261010-0905-0c0c"],
          "draws": ["7a7a", "8b8b"],
          "now": "2026-10-10T10:45:00Z",
          "agentM": "2026.10.1"
        }
      },
      "result": {
        "files": [
          { "path": "docs/jobs/JOB-20261010-0900-0a0a.md", "text": "---\nid: JOB-20261010-0900-0a0a\nkind: run\nphase:\nrole:\nparticipant: alice\nruntime: browser\nrun:\nslot:\nitem:\nmodules: []\ninputs: []\nretry_of:\nagent_m: 2026.10.1\nmodel:\nlog:\n---\n\n# JOB-20261010-0900-0a0a\n\n**REGISTER**\n\n## Selection\n\n- MOD-a\n- MOD-b\n- MOD-c\n- MOD-d\n\n## Limits\n\n| Jobs at once | Cost | Rounds |\n|---|---|---|\n| 3 | 20 USD | 5 |\n\n## Assignments\n\n| Role | Participant |\n|---|---|\n| Developers | cli-dev |\n| Tester | ci-dev |\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-10T09:00:00Z | running | — |\n| 2026-10-10T10:45:00Z | waiting-at-gate | Implementation/MOD-a: Design → Implementation waits for alice; Implementation/MOD-d: Design → Implementation waits for alice |\n\n## Jobs\n\n- JOB-20261010-0905-0c0c\n- JOB-20261010-0915-1b1b\n- JOB-20261010-0916-2c2c\n" }
        ],
        "started": [],
        "state": { "at": "2026-10-10T10:45:00Z", "state": "waiting-at-gate", "note": "Implementation/MOD-a: Design → Implementation waits for alice; Implementation/MOD-d: Design → Implementation waits for alice" },
        "message": "run JOB-20261010-0900-0a0a is waiting at a gate"
      }
    },
    {
      "name": "the cost limit reached while a job runs",
      "input": {
        "input": {
          "run": {
            "id": "JOB-20261010-0900-0a0a",
            "path": "docs/jobs/JOB-20261010-0900-0a0a.md",
            "kind": "run",
            "phase": "",
            "role": "",
            "participant": "alice",
            "runtime": "browser",
            "run": "",
            "slot": "",
            "item": "",
            "modules": [],
            "inputs": [],
            "retryOf": "",
            "agentM": "2026.10.1",
            "model": "",
            "log": "",
            "selection": ["MOD-a", "MOD-b", "MOD-c", "MOD-d"],
            "limits": { "jobsAtOnce": 3, "cost": { "amount": 20, "currency": "USD" }, "rounds": 5 },
            "assignments": [
              { "role": "Developers", "participant": "cli-dev" },
              { "role": "Tester", "participant": "ci-dev" }
            ],
            "states": [{ "at": "2026-10-10T09:00:00Z", "state": "running", "note": "" }],
            "results": [],
            "rounds": 0,
            "cost": null,
            "usage": null,
            "jobs": ["JOB-20261010-0905-0c0c", "JOB-20261010-0915-1b1b", "JOB-20261010-0916-2c2c"]
          },
          "next": {
            "start": [],
            "waiting": [],
            "done": false,
            "stop": "the cost limit of 20 USD is reached: 21 USD reported"
          },
          "start": [],
          "held": [],
          "jobs": [
            { "id": "JOB-20261010-0905-0c0c", "slot": "configure-ci", "run": "JOB-20261010-0900-0a0a", "participant": "cli-dev", "started": "2026-10-10T09:05:00Z", "state": "done", "cost": null, "rounds": 0 },
            {
              "id": "JOB-20261010-0915-1b1b",
              "slot": "Implementation/MOD-a",
              "run": "JOB-20261010-0900-0a0a",
              "participant": "cli-dev",
              "started": "2026-10-10T09:15:00Z",
              "state": "done",
              "cost": { "amount": 4, "currency": "USD" },
              "rounds": 1
            },
            {
              "id": "JOB-20261010-1100-3d3d",
              "slot": "Implementation/MOD-b",
              "run": "JOB-20261010-0900-0a0a",
              "participant": "cli-dev",
              "started": "2026-10-10T11:00:00Z",
              "state": "done",
              "cost": { "amount": 17, "currency": "USD" },
              "rounds": 2
            },
            { "id": "JOB-20261010-0916-2c2c", "slot": "Implementation/MOD-d", "run": "JOB-20261010-0900-0a0a", "participant": "cli-dev", "started": "2026-10-10T09:16:00Z", "state": "running", "cost": null, "rounds": 0 }
          ],
          "taken": ["JOB-20261010-0900-0a0a", "JOB-20261010-0905-0c0c", "JOB-20261010-0915-1b1b", "JOB-20261010-1100-3d3d", "JOB-20261010-0916-2c2c"],
          "draws": ["7a7a", "8b8b"],
          "now": "2026-10-10T10:45:00Z",
          "agentM": "2026.10.1"
        }
      },
      "result": {
        "files": [
          { "path": "docs/jobs/JOB-20261010-0900-0a0a.md", "text": "---\nid: JOB-20261010-0900-0a0a\nkind: run\nphase:\nrole:\nparticipant: alice\nruntime: browser\nrun:\nslot:\nitem:\nmodules: []\ninputs: []\nretry_of:\nagent_m: 2026.10.1\nmodel:\nlog:\n---\n\n# JOB-20261010-0900-0a0a\n\n**REGISTER**\n\n## Selection\n\n- MOD-a\n- MOD-b\n- MOD-c\n- MOD-d\n\n## Limits\n\n| Jobs at once | Cost | Rounds |\n|---|---|---|\n| 3 | 20 USD | 5 |\n\n## Assignments\n\n| Role | Participant |\n|---|---|\n| Developers | cli-dev |\n| Tester | ci-dev |\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-10T09:00:00Z | running | — |\n| 2026-10-10T10:45:00Z | running | the cost limit of 20 USD is reached: 21 USD reported |\n\n## Jobs\n\n- JOB-20261010-0905-0c0c\n- JOB-20261010-0915-1b1b\n- JOB-20261010-0916-2c2c\n- JOB-20261010-1100-3d3d\n" }
        ],
        "started": [],
        "state": { "at": "2026-10-10T10:45:00Z", "state": "running", "note": "the cost limit of 20 USD is reached: 21 USD reported" },
        "message": "run JOB-20261010-0900-0a0a is running"
      }
    },
    {
      "name": "a slot no runtime serves",
      "input": {
        "input": {
          "run": {
            "id": "JOB-20261010-0900-0a0a",
            "path": "docs/jobs/JOB-20261010-0900-0a0a.md",
            "kind": "run",
            "phase": "",
            "role": "",
            "participant": "alice",
            "runtime": "browser",
            "run": "",
            "slot": "",
            "item": "",
            "modules": [],
            "inputs": [],
            "retryOf": "",
            "agentM": "2026.10.1",
            "model": "",
            "log": "",
            "selection": ["MOD-a", "MOD-b", "MOD-c", "MOD-d"],
            "limits": { "jobsAtOnce": 3, "cost": { "amount": 20, "currency": "USD" }, "rounds": 5 },
            "assignments": [
              { "role": "Developers", "participant": "cli-dev" },
              { "role": "Tester", "participant": "ci-dev" }
            ],
            "states": [{ "at": "2026-10-10T09:00:00Z", "state": "running", "note": "" }],
            "results": [],
            "rounds": 0,
            "cost": null,
            "usage": null,
            "jobs": ["JOB-20261010-0905-0c0c", "JOB-20261010-0915-1b1b", "JOB-20261010-0916-2c2c"]
          },
          "next": {
            "start": [
              {
                "slot": "Implementation/MOD-b",
                "kind": "implement",
                "phase": "Implementation",
                "role": "Developers",
                "participant": "cli-dev",
                "run": "JOB-20261010-0900-0a0a",
                "item": "",
                "modules": ["MOD-b"]
              }
            ],
            "waiting": [],
            "done": false,
            "stop": ""
          },
          "start": [],
          "held": ["Implementation/MOD-b: alice is a person; a person's work is no job a runtime carries out"],
          "jobs": [
            { "id": "JOB-20261010-0905-0c0c", "slot": "configure-ci", "run": "JOB-20261010-0900-0a0a", "participant": "cli-dev", "started": "2026-10-10T09:05:00Z", "state": "done", "cost": null, "rounds": 0 },
            {
              "id": "JOB-20261010-0915-1b1b",
              "slot": "Implementation/MOD-a",
              "run": "JOB-20261010-0900-0a0a",
              "participant": "cli-dev",
              "started": "2026-10-10T09:15:00Z",
              "state": "done",
              "cost": { "amount": 4, "currency": "USD" },
              "rounds": 1
            },
            { "id": "JOB-20261010-0916-2c2c", "slot": "Implementation/MOD-d", "run": "JOB-20261010-0900-0a0a", "participant": "cli-dev", "started": "2026-10-10T09:16:00Z", "state": "done", "cost": null, "rounds": 0 }
          ],
          "taken": ["JOB-20261010-0900-0a0a", "JOB-20261010-0905-0c0c", "JOB-20261010-0915-1b1b", "JOB-20261010-0916-2c2c"],
          "draws": ["7a7a", "8b8b"],
          "now": "2026-10-10T10:45:00Z",
          "agentM": "2026.10.1"
        }
      },
      "result": {
        "files": [
          { "path": "docs/jobs/JOB-20261010-0900-0a0a.md", "text": "---\nid: JOB-20261010-0900-0a0a\nkind: run\nphase:\nrole:\nparticipant: alice\nruntime: browser\nrun:\nslot:\nitem:\nmodules: []\ninputs: []\nretry_of:\nagent_m: 2026.10.1\nmodel:\nlog:\n---\n\n# JOB-20261010-0900-0a0a\n\n**REGISTER**\n\n## Selection\n\n- MOD-a\n- MOD-b\n- MOD-c\n- MOD-d\n\n## Limits\n\n| Jobs at once | Cost | Rounds |\n|---|---|---|\n| 3 | 20 USD | 5 |\n\n## Assignments\n\n| Role | Participant |\n|---|---|\n| Developers | cli-dev |\n| Tester | ci-dev |\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-10T09:00:00Z | running | — |\n| 2026-10-10T10:45:00Z | waiting-at-gate | Implementation/MOD-b: alice is a person; a person's work is no job a runtime carries out |\n\n## Jobs\n\n- JOB-20261010-0905-0c0c\n- JOB-20261010-0915-1b1b\n- JOB-20261010-0916-2c2c\n" }
        ],
        "started": [],
        "state": { "at": "2026-10-10T10:45:00Z", "state": "waiting-at-gate", "note": "Implementation/MOD-b: alice is a person; a person's work is no job a runtime carries out" },
        "message": "run JOB-20261010-0900-0a0a is waiting at a gate"
      }
    },
    {
      "name": "a retry a click started",
      "input": {
        "input": {
          "run": {
            "id": "JOB-20261010-0900-0a0a",
            "path": "docs/jobs/JOB-20261010-0900-0a0a.md",
            "kind": "run",
            "phase": "",
            "role": "",
            "participant": "alice",
            "runtime": "browser",
            "run": "",
            "slot": "",
            "item": "",
            "modules": [],
            "inputs": [],
            "retryOf": "",
            "agentM": "2026.10.1",
            "model": "",
            "log": "",
            "selection": ["MOD-a", "MOD-b", "MOD-c", "MOD-d"],
            "limits": { "jobsAtOnce": 3, "cost": { "amount": 20, "currency": "USD" }, "rounds": 5 },
            "assignments": [
              { "role": "Developers", "participant": "cli-dev" },
              { "role": "Tester", "participant": "ci-dev" }
            ],
            "states": [{ "at": "2026-10-10T09:00:00Z", "state": "running", "note": "" }],
            "results": [],
            "rounds": 0,
            "cost": null,
            "usage": null,
            "jobs": ["JOB-20261010-0905-0c0c", "JOB-20261010-0915-1b1b", "JOB-20261010-0916-2c2c"]
          },
          "next": { "start": [], "waiting": [], "done": false, "stop": "" },
          "start": [],
          "held": [],
          "jobs": [
            { "id": "JOB-20261010-0905-0c0c", "slot": "configure-ci", "run": "JOB-20261010-0900-0a0a", "participant": "cli-dev", "started": "2026-10-10T09:05:00Z", "state": "done", "cost": null, "rounds": 0 },
            {
              "id": "JOB-20261010-0915-1b1b",
              "slot": "Implementation/MOD-a",
              "run": "JOB-20261010-0900-0a0a",
              "participant": "cli-dev",
              "started": "2026-10-10T09:15:00Z",
              "state": "done",
              "cost": { "amount": 4, "currency": "USD" },
              "rounds": 1
            },
            { "id": "JOB-20261010-0916-2c2c", "slot": "Implementation/MOD-d", "run": "JOB-20261010-0900-0a0a", "participant": "cli-dev", "started": "2026-10-10T09:16:00Z", "state": "failed", "cost": null, "rounds": 0 },
            { "id": "JOB-20261010-1030-9c9c", "slot": "Implementation/MOD-d", "run": "JOB-20261010-0900-0a0a", "participant": "cli-dev", "started": "2026-10-10T10:30:00Z", "state": "running", "cost": null, "rounds": 0 }
          ],
          "taken": ["JOB-20261010-0900-0a0a", "JOB-20261010-0905-0c0c", "JOB-20261010-0915-1b1b", "JOB-20261010-0916-2c2c", "JOB-20261010-1030-9c9c"],
          "draws": ["7a7a", "8b8b"],
          "now": "2026-10-10T10:45:00Z",
          "agentM": "2026.10.1"
        }
      },
      "result": {
        "files": [
          { "path": "docs/jobs/JOB-20261010-0900-0a0a.md", "text": "---\nid: JOB-20261010-0900-0a0a\nkind: run\nphase:\nrole:\nparticipant: alice\nruntime: browser\nrun:\nslot:\nitem:\nmodules: []\ninputs: []\nretry_of:\nagent_m: 2026.10.1\nmodel:\nlog:\n---\n\n# JOB-20261010-0900-0a0a\n\n**REGISTER**\n\n## Selection\n\n- MOD-a\n- MOD-b\n- MOD-c\n- MOD-d\n\n## Limits\n\n| Jobs at once | Cost | Rounds |\n|---|---|---|\n| 3 | 20 USD | 5 |\n\n## Assignments\n\n| Role | Participant |\n|---|---|\n| Developers | cli-dev |\n| Tester | ci-dev |\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-10T09:00:00Z | running | — |\n\n## Jobs\n\n- JOB-20261010-0905-0c0c\n- JOB-20261010-0915-1b1b\n- JOB-20261010-0916-2c2c\n- JOB-20261010-1030-9c9c\n" }
        ],
        "started": [],
        "state": null,
        "message": "run JOB-20261010-0900-0a0a names JOB-20261010-1030-9c9c"
      }
    },
    {
      "name": "every slot done",
      "input": {
        "input": {
          "run": {
            "id": "JOB-20261010-0900-0a0a",
            "path": "docs/jobs/JOB-20261010-0900-0a0a.md",
            "kind": "run",
            "phase": "",
            "role": "",
            "participant": "alice",
            "runtime": "browser",
            "run": "",
            "slot": "",
            "item": "",
            "modules": [],
            "inputs": [],
            "retryOf": "",
            "agentM": "2026.10.1",
            "model": "",
            "log": "",
            "selection": ["MOD-a", "MOD-b", "MOD-c", "MOD-d"],
            "limits": { "jobsAtOnce": 3, "cost": { "amount": 20, "currency": "USD" }, "rounds": 5 },
            "assignments": [
              { "role": "Developers", "participant": "cli-dev" },
              { "role": "Tester", "participant": "ci-dev" }
            ],
            "states": [{ "at": "2026-10-10T09:00:00Z", "state": "running", "note": "" }],
            "results": [],
            "rounds": 0,
            "cost": null,
            "usage": null,
            "jobs": ["JOB-20261010-0900-aaaa", "JOB-20261010-1000-bbbb", "JOB-20261010-1100-cccc", "JOB-20261010-1200-dddd", "JOB-20261010-1300-eeee", "JOB-20261011-1400-ffff"]
          },
          "next": { "start": [], "waiting": [], "done": true, "stop": "" },
          "start": [],
          "held": [],
          "jobs": [
            { "id": "JOB-20261010-0900-aaaa", "slot": "configure-ci", "run": "JOB-20261010-0900-0a0a", "participant": "cli-dev", "started": "2026-10-10T09:00:00Z", "state": "done", "cost": null, "rounds": 0 },
            { "id": "JOB-20261010-1000-bbbb", "slot": "Implementation/MOD-a", "run": "JOB-20261010-0900-0a0a", "participant": "cli-dev", "started": "2026-10-10T09:00:00Z", "state": "done", "cost": null, "rounds": 0 },
            { "id": "JOB-20261010-1100-cccc", "slot": "Implementation/MOD-d", "run": "JOB-20261010-0900-0a0a", "participant": "cli-dev", "started": "2026-10-10T09:00:00Z", "state": "done", "cost": null, "rounds": 0 },
            { "id": "JOB-20261010-1200-dddd", "slot": "Implementation/MOD-b", "run": "JOB-20261010-0900-0a0a", "participant": "cli-dev", "started": "2026-10-10T09:00:00Z", "state": "done", "cost": null, "rounds": 0 },
            { "id": "JOB-20261010-1300-eeee", "slot": "Implementation/MOD-c", "run": "JOB-20261010-0900-0a0a", "participant": "cli-dev", "started": "2026-10-10T09:00:00Z", "state": "done", "cost": null, "rounds": 0 },
            { "id": "JOB-20261011-1400-ffff", "slot": "Testing/selection", "run": "JOB-20261010-0900-0a0a", "participant": "cli-dev", "started": "2026-10-10T09:00:00Z", "state": "done", "cost": null, "rounds": 0 }
          ],
          "taken": ["JOB-20261010-0900-0a0a", "JOB-20261010-0900-aaaa", "JOB-20261010-1000-bbbb", "JOB-20261010-1100-cccc", "JOB-20261010-1200-dddd", "JOB-20261010-1300-eeee", "JOB-20261011-1400-ffff"],
          "draws": ["7a7a", "8b8b"],
          "now": "2026-10-10T10:45:00Z",
          "agentM": "2026.10.1"
        }
      },
      "result": {
        "files": [
          { "path": "docs/jobs/JOB-20261010-0900-0a0a.md", "text": "---\nid: JOB-20261010-0900-0a0a\nkind: run\nphase:\nrole:\nparticipant: alice\nruntime: browser\nrun:\nslot:\nitem:\nmodules: []\ninputs: []\nretry_of:\nagent_m: 2026.10.1\nmodel:\nlog:\n---\n\n# JOB-20261010-0900-0a0a\n\n**REGISTER**\n\n## Selection\n\n- MOD-a\n- MOD-b\n- MOD-c\n- MOD-d\n\n## Limits\n\n| Jobs at once | Cost | Rounds |\n|---|---|---|\n| 3 | 20 USD | 5 |\n\n## Assignments\n\n| Role | Participant |\n|---|---|\n| Developers | cli-dev |\n| Tester | ci-dev |\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-10T09:00:00Z | running | — |\n| 2026-10-10T10:45:00Z | done | every slot of its plan is done |\n\n## Cost\n\n| Rounds | Cost | Input tokens | Output tokens | Minutes |\n|---|---|---|---|---|\n| 0 | — | — | — | — |\n\n## Jobs\n\n- JOB-20261010-0900-aaaa\n- JOB-20261010-1000-bbbb\n- JOB-20261010-1100-cccc\n- JOB-20261010-1200-dddd\n- JOB-20261010-1300-eeee\n- JOB-20261011-1400-ffff\n" }
        ],
        "started": [],
        "state": { "at": "2026-10-10T10:45:00Z", "state": "done", "note": "every slot of its plan is done" },
        "message": "run JOB-20261010-0900-0a0a is done"
      }
    },
    {
      "name": "nothing changed",
      "input": {
        "input": {
          "run": {
            "id": "JOB-20261010-0900-0a0a",
            "path": "docs/jobs/JOB-20261010-0900-0a0a.md",
            "kind": "run",
            "phase": "",
            "role": "",
            "participant": "alice",
            "runtime": "browser",
            "run": "",
            "slot": "",
            "item": "",
            "modules": [],
            "inputs": [],
            "retryOf": "",
            "agentM": "2026.10.1",
            "model": "",
            "log": "",
            "selection": ["MOD-a", "MOD-b", "MOD-c", "MOD-d"],
            "limits": { "jobsAtOnce": 3, "cost": { "amount": 20, "currency": "USD" }, "rounds": 5 },
            "assignments": [
              { "role": "Developers", "participant": "cli-dev" },
              { "role": "Tester", "participant": "ci-dev" }
            ],
            "states": [{ "at": "2026-10-10T09:00:00Z", "state": "running", "note": "" }],
            "results": [],
            "rounds": 0,
            "cost": null,
            "usage": null,
            "jobs": ["JOB-20261010-0905-0c0c", "JOB-20261010-0915-1b1b", "JOB-20261010-0916-2c2c"]
          },
          "next": { "start": [], "waiting": [], "done": false, "stop": "" },
          "start": [],
          "held": [],
          "jobs": [
            { "id": "JOB-20261010-0905-0c0c", "slot": "configure-ci", "run": "JOB-20261010-0900-0a0a", "participant": "cli-dev", "started": "2026-10-10T09:05:00Z", "state": "done", "cost": null, "rounds": 0 },
            {
              "id": "JOB-20261010-0915-1b1b",
              "slot": "Implementation/MOD-a",
              "run": "JOB-20261010-0900-0a0a",
              "participant": "cli-dev",
              "started": "2026-10-10T09:15:00Z",
              "state": "done",
              "cost": { "amount": 4, "currency": "USD" },
              "rounds": 1
            },
            { "id": "JOB-20261010-0916-2c2c", "slot": "Implementation/MOD-d", "run": "JOB-20261010-0900-0a0a", "participant": "cli-dev", "started": "2026-10-10T09:16:00Z", "state": "running", "cost": null, "rounds": 0 }
          ],
          "taken": ["JOB-20261010-0900-0a0a", "JOB-20261010-0905-0c0c", "JOB-20261010-0915-1b1b", "JOB-20261010-0916-2c2c"],
          "draws": ["7a7a", "8b8b"],
          "now": "2026-10-10T10:45:00Z",
          "agentM": "2026.10.1"
        }
      },
      "refused": "unchanged"
    },
    {
      "name": "a run that ended",
      "input": {
        "input": {
          "run": {
            "id": "JOB-20261010-0900-0a0a",
            "path": "docs/jobs/JOB-20261010-0900-0a0a.md",
            "kind": "run",
            "phase": "",
            "role": "",
            "participant": "alice",
            "runtime": "browser",
            "run": "",
            "slot": "",
            "item": "",
            "modules": [],
            "inputs": [],
            "retryOf": "",
            "agentM": "2026.10.1",
            "model": "",
            "log": "",
            "selection": ["MOD-a", "MOD-b", "MOD-c", "MOD-d"],
            "limits": { "jobsAtOnce": 3, "cost": { "amount": 20, "currency": "USD" }, "rounds": 5 },
            "assignments": [
              { "role": "Developers", "participant": "cli-dev" },
              { "role": "Tester", "participant": "ci-dev" }
            ],
            "states": [
              { "at": "2026-10-10T09:00:00Z", "state": "running", "note": "" },
              { "at": "2026-10-11T16:20:00Z", "state": "done", "note": "" }
            ],
            "results": [],
            "rounds": 0,
            "cost": null,
            "usage": null,
            "jobs": ["JOB-20261010-0905-0c0c", "JOB-20261010-0915-1b1b", "JOB-20261010-0916-2c2c", "JOB-20261010-1100-3d3d", "JOB-20261010-1300-4e4e", "JOB-20261011-0900-5e5e"]
          },
          "next": {
            "start": [
              {
                "slot": "Implementation/MOD-b",
                "kind": "implement",
                "phase": "Implementation",
                "role": "Developers",
                "participant": "cli-dev",
                "run": "JOB-20261010-0900-0a0a",
                "item": "",
                "modules": ["MOD-b"]
              }
            ],
            "waiting": [],
            "done": false,
            "stop": ""
          },
          "start": [
            {
              "slot": "Implementation/MOD-b",
              "kind": "implement",
              "phase": "Implementation",
              "role": "Developers",
              "participant": "cli-dev",
              "run": "JOB-20261010-0900-0a0a",
              "item": "",
              "modules": ["MOD-b"],
              "runtime": "bridge",
              "model": "claude-opus-5-5"
            }
          ],
          "held": [],
          "jobs": [
            { "id": "JOB-20261010-0905-0c0c", "slot": "configure-ci", "run": "JOB-20261010-0900-0a0a", "participant": "cli-dev", "started": "2026-10-10T09:05:00Z", "state": "done", "cost": null, "rounds": 0 },
            {
              "id": "JOB-20261010-0915-1b1b",
              "slot": "Implementation/MOD-a",
              "run": "JOB-20261010-0900-0a0a",
              "participant": "cli-dev",
              "started": "2026-10-10T09:15:00Z",
              "state": "done",
              "cost": { "amount": 4, "currency": "USD" },
              "rounds": 1
            },
            { "id": "JOB-20261010-0916-2c2c", "slot": "Implementation/MOD-d", "run": "JOB-20261010-0900-0a0a", "participant": "cli-dev", "started": "2026-10-10T09:16:00Z", "state": "running", "cost": null, "rounds": 0 }
          ],
          "taken": ["JOB-20261010-0900-0a0a", "JOB-20261010-0905-0c0c", "JOB-20261010-0915-1b1b", "JOB-20261010-0916-2c2c"],
          "draws": ["7a7a", "8b8b"],
          "now": "2026-10-10T10:45:00Z",
          "agentM": "2026.10.1"
        }
      },
      "refused": "ended"
    },
    {
      "name": "every draw taken",
      "input": {
        "input": {
          "run": {
            "id": "JOB-20261010-0900-0a0a",
            "path": "docs/jobs/JOB-20261010-0900-0a0a.md",
            "kind": "run",
            "phase": "",
            "role": "",
            "participant": "alice",
            "runtime": "browser",
            "run": "",
            "slot": "",
            "item": "",
            "modules": [],
            "inputs": [],
            "retryOf": "",
            "agentM": "2026.10.1",
            "model": "",
            "log": "",
            "selection": ["MOD-a", "MOD-b", "MOD-c", "MOD-d"],
            "limits": { "jobsAtOnce": 3, "cost": { "amount": 20, "currency": "USD" }, "rounds": 5 },
            "assignments": [
              { "role": "Developers", "participant": "cli-dev" },
              { "role": "Tester", "participant": "ci-dev" }
            ],
            "states": [{ "at": "2026-10-10T09:00:00Z", "state": "running", "note": "" }],
            "results": [],
            "rounds": 0,
            "cost": null,
            "usage": null,
            "jobs": ["JOB-20261010-0905-0c0c", "JOB-20261010-0915-1b1b", "JOB-20261010-0916-2c2c"]
          },
          "next": {
            "start": [
              {
                "slot": "Implementation/MOD-b",
                "kind": "implement",
                "phase": "Implementation",
                "role": "Developers",
                "participant": "cli-dev",
                "run": "JOB-20261010-0900-0a0a",
                "item": "",
                "modules": ["MOD-b"]
              }
            ],
            "waiting": [],
            "done": false,
            "stop": ""
          },
          "start": [
            {
              "slot": "Implementation/MOD-b",
              "kind": "implement",
              "phase": "Implementation",
              "role": "Developers",
              "participant": "cli-dev",
              "run": "JOB-20261010-0900-0a0a",
              "item": "",
              "modules": ["MOD-b"],
              "runtime": "bridge",
              "model": "claude-opus-5-5"
            }
          ],
          "held": [],
          "jobs": [
            { "id": "JOB-20261010-0905-0c0c", "slot": "configure-ci", "run": "JOB-20261010-0900-0a0a", "participant": "cli-dev", "started": "2026-10-10T09:05:00Z", "state": "done", "cost": null, "rounds": 0 },
            {
              "id": "JOB-20261010-0915-1b1b",
              "slot": "Implementation/MOD-a",
              "run": "JOB-20261010-0900-0a0a",
              "participant": "cli-dev",
              "started": "2026-10-10T09:15:00Z",
              "state": "done",
              "cost": { "amount": 4, "currency": "USD" },
              "rounds": 1
            },
            { "id": "JOB-20261010-0916-2c2c", "slot": "Implementation/MOD-d", "run": "JOB-20261010-0900-0a0a", "participant": "cli-dev", "started": "2026-10-10T09:16:00Z", "state": "running", "cost": null, "rounds": 0 }
          ],
          "taken": ["JOB-20261010-0900-0a0a", "JOB-20261010-0905-0c0c", "JOB-20261010-0915-1b1b", "JOB-20261010-0916-2c2c", "JOB-20261010-1045-0c0c"],
          "draws": ["0c0c"],
          "now": "2026-10-10T10:45:00Z",
          "agentM": "2026.10.1"
        }
      },
      "refused": "no-identifier"
    }
  ]
}
```

```json interface
{
  "id": "MOD-run-engine.closeDue",
  "summary": "Whether the close of a sprint starts by itself: its closer is not a person, the sprint has ended, and no close record exists.",
  "params": [
    { "name": "sprint", "type": "Sprint" },
    { "name": "closer", "type": "Closer" },
    { "name": "today", "type": "string" },
    { "name": "done", "type": "string[]" },
    { "name": "closed", "type": "boolean" }
  ],
  "result": "CloseDue",
  "async": false,
  "refusals": [],
  "examples": [
    {
      "name": "an agent's sprint without a time box, every item done",
      "input": {
        "sprint": {
          "id": "sprint-04",
          "path": "docs/backlog/sprints/sprint-04.md",
          "goal": "The author exports and writes chapters",
          "start": "2026-10-05",
          "end": "",
          "timeBoxEnd": "",
          "selection": ["ITM-014", "ITM-015"],
          "closer": "cli-dev",
          "branch": "sprint/04"
        },
        "closer": { "name": "cli-dev", "type": "CLI agent" },
        "today": "2026-10-09",
        "done": ["ITM-014", "ITM-015"],
        "closed": false
      },
      "result": { "due": true, "reason": "every selected item is done" }
    },
    {
      "name": "a person closes",
      "input": {
        "sprint": {
          "id": "sprint-04",
          "path": "docs/backlog/sprints/sprint-04.md",
          "goal": "The author exports and writes chapters",
          "start": "2026-10-05",
          "end": "",
          "timeBoxEnd": "2026-10-18",
          "selection": ["ITM-014", "ITM-015"],
          "closer": "cli-dev",
          "branch": "sprint/04"
        },
        "closer": { "name": "alice", "type": "person" },
        "today": "2026-10-20",
        "done": [],
        "closed": false
      },
      "result": { "due": false, "reason": "alice closes sprint-04 by hand" }
    }
  ]
}
```

## Types

```json type
{
  "$id": "JobStateEntry",
  "description": "A state a job entered, when, and a note — the gate it waits at, or why it failed.",
  "type": "object",
  "required": ["at", "state", "note"],
  "additionalProperties": false,
  "properties": {
    "at": { "type": "string", "pattern": "^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$" },
    "state": { "type": "string", "enum": ["queued", "running", "waiting-at-gate", "done", "failed", "cancelled"] },
    "note": { "type": "string" }
  },
  "examples": [{ "at": "2026-10-10T09:15:00Z", "state": "queued", "note": "" }]
}
```

```json type
{
  "$id": "Money",
  "description": "An amount in a currency.",
  "type": "object",
  "required": ["amount", "currency"],
  "additionalProperties": false,
  "properties": {
    "amount": { "type": "number", "minimum": 0 },
    "currency": { "type": "string", "pattern": "^[A-Z]{3}$" }
  },
  "examples": [{ "amount": 0.85, "currency": "USD" }]
}
```

```json type
{
  "$id": "MoneyOrNone",
  "description": "An amount, or null where none is reported or set.",
  "anyOf": [{ "$ref": "Money" }, { "type": "null" }],
  "examples": [{ "amount": 20, "currency": "USD" }, null]
}
```

```json type
{
  "$id": "Usage",
  "description": "What a runtime reported a job used: input and output tokens, and minutes — each null where not reported.",
  "type": "object",
  "required": ["inputTokens", "outputTokens", "minutes"],
  "additionalProperties": false,
  "properties": {
    "inputTokens": { "anyOf": [{ "type": "integer", "minimum": 0 }, { "type": "null" }] },
    "outputTokens": { "anyOf": [{ "type": "integer", "minimum": 0 }, { "type": "null" }] },
    "minutes": { "anyOf": [{ "type": "number", "minimum": 0 }, { "type": "null" }] }
  },
  "examples": [{ "inputTokens": 150000, "outputTokens": 32000, "minutes": null }]
}
```

```json type
{
  "$id": "UsageOrNone",
  "description": "A usage, or null where none is reported.",
  "anyOf": [{ "$ref": "Usage" }, { "type": "null" }],
  "examples": [null]
}
```

```json type
{
  "$id": "Limits",
  "description": "A run's limits, fixed at its start: jobs at once, the cost — null for none —, and the correction rounds per draft.",
  "type": "object",
  "required": ["jobsAtOnce", "cost", "rounds"],
  "additionalProperties": false,
  "properties": {
    "jobsAtOnce": { "type": "integer", "minimum": 1 },
    "cost": { "$ref": "MoneyOrNone" },
    "rounds": { "type": "integer", "minimum": 1 }
  },
  "examples": [{ "jobsAtOnce": 3, "cost": { "amount": 20, "currency": "USD" }, "rounds": 5 }]
}
```

```json type
{
  "$id": "LimitsOrNone",
  "description": "A run's limits, or null for a job that is no run.",
  "anyOf": [{ "$ref": "Limits" }, { "type": "null" }],
  "examples": [null]
}
```

```json type
{
  "$id": "JobAssignment",
  "description": "The participant chosen for a role.",
  "type": "object",
  "required": ["role", "participant"],
  "additionalProperties": false,
  "properties": { "role": { "type": "string" }, "participant": { "type": "string" } },
  "examples": [{ "role": "Developers", "participant": "ci-dev" }]
}
```

```json type
{
  "$id": "JobRecord",
  "description": "A job's record: its identifier and path; its kind — a job definition's kind, or run —; its phase and role; its participant and runtime — browser, ci or bridge —; the run it belongs to and its slot there; the item and modules it works on and its inputs; the job it retries; the Agent M version and the model; for an agent's job where the author chose it, who merges its pull request — the agent (participant) or a person; where its log is; for a run, its selection, limits and assignments; the states it entered; once ended, its results, correction rounds, reported cost and usage; for a run, the jobs it started.",
  "type": "object",
  "required": ["id", "path", "kind", "phase", "role", "participant", "runtime", "run", "slot", "item", "modules", "inputs", "retryOf", "agentM", "model", "log", "selection", "limits", "assignments", "states", "results", "rounds", "cost", "usage", "jobs"],
  "additionalProperties": false,
  "properties": {
    "id": { "type": "string", "pattern": "^JOB-[0-9]{8}-[0-9]{4}-[0-9a-f]{4}$" },
    "path": { "type": "string" },
    "kind": { "type": "string", "minLength": 1 },
    "phase": { "type": "string" },
    "role": { "type": "string" },
    "participant": { "type": "string" },
    "runtime": { "type": "string", "enum": ["browser", "ci", "bridge"] },
    "run": { "type": "string", "pattern": "^(JOB-[0-9]{8}-[0-9]{4}-[0-9a-f]{4})?$" },
    "slot": { "type": "string" },
    "item": { "type": "string" },
    "modules": { "type": "array", "items": { "type": "string" } },
    "inputs": { "type": "array", "items": { "type": "string" } },
    "retryOf": { "type": "string", "pattern": "^(JOB-[0-9]{8}-[0-9]{4}-[0-9a-f]{4})?$" },
    "agentM": { "type": "string" },
    "model": { "type": "string" },
    "mergeBy": { "type": "string", "enum": ["participant", "person"] },
    "log": { "type": "string" },
    "selection": { "type": "array", "items": { "type": "string" } },
    "limits": { "$ref": "LimitsOrNone" },
    "assignments": { "type": "array", "items": { "$ref": "JobAssignment" } },
    "states": { "type": "array", "items": { "$ref": "JobStateEntry" }, "minItems": 1 },
    "results": { "type": "array", "items": { "type": "string" } },
    "rounds": { "type": "integer", "minimum": 0 },
    "cost": { "$ref": "MoneyOrNone" },
    "usage": { "$ref": "UsageOrNone" },
    "jobs": { "type": "array", "items": { "type": "string", "pattern": "^JOB-[0-9]{8}-[0-9]{4}-[0-9a-f]{4}$" } }
  },
  "examples": [
    {
      "id": "JOB-20261010-0915-1b1b",
      "path": "docs/jobs/JOB-20261010-0915-1b1b.md",
      "kind": "implement",
      "phase": "Implementation",
      "role": "Developers",
      "participant": "cli-dev",
      "runtime": "bridge",
      "run": "JOB-20261010-0900-0a0a",
      "slot": "Implementation/MOD-a",
      "item": "",
      "modules": ["MOD-a"],
      "inputs": ["docs/architecture/ARC-004-the-store.md"],
      "retryOf": "",
      "agentM": "2026.10.1",
      "model": "claude-opus-5-5",
      "log": "",
      "selection": [],
      "limits": null,
      "assignments": [],
      "states": [{ "at": "2026-10-10T09:15:00Z", "state": "queued", "note": "" }],
      "results": [],
      "rounds": 0,
      "cost": null,
      "usage": null,
      "jobs": []
    }
  ]
}
```

```json type
{
  "$id": "CancelInput",
  "description": "A person's cancel of a job, and when.",
  "type": "object",
  "required": ["job", "by", "at"],
  "additionalProperties": false,
  "properties": {
    "job": { "type": "string", "pattern": "^JOB-[0-9]{8}-[0-9]{4}-[0-9a-f]{4}$" },
    "by": { "type": "string", "minLength": 1 },
    "at": { "type": "string", "pattern": "^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$" }
  },
  "examples": [{ "job": "JOB-20261010-0915-1b1b", "by": "alice", "at": "2026-10-10T09:30:00Z" }]
}
```

```json type
{
  "$id": "CancelRecord",
  "description": "A cancel record as read.",
  "type": "object",
  "required": ["path", "job", "by", "at"],
  "additionalProperties": false,
  "properties": {
    "path": { "type": "string" },
    "job": { "type": "string", "pattern": "^JOB-[0-9]{8}-[0-9]{4}-[0-9a-f]{4}$" },
    "by": { "type": "string", "minLength": 1 },
    "at": { "type": "string", "pattern": "^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$" }
  },
  "examples": [
    { "path": "docs/jobs/cancels/JOB-20261010-0915-1b1b.md", "job": "JOB-20261010-0915-1b1b", "by": "alice", "at": "2026-10-10T09:30:00Z" }
  ]
}
```

```json type
{
  "$id": "CancelRecordOrNone",
  "description": "A cancel record, or null.",
  "anyOf": [{ "$ref": "CancelRecord" }, { "type": "null" }],
  "examples": [null]
}
```

```json type
{
  "$id": "LiveState",
  "description": "What a job's runtime reports now: whether it can be reached, and the job's state there — empty when the runtime does not know the job, stopped when it ended it.",
  "type": "object",
  "required": ["reachable", "state"],
  "additionalProperties": false,
  "properties": {
    "reachable": { "type": "boolean" },
    "state": { "type": "string", "enum": ["", "queued", "running", "waiting-at-gate", "stopped"] }
  },
  "examples": [{ "reachable": true, "state": "running" }]
}
```

```json type
{
  "$id": "LiveStateOrNone",
  "description": "A live state, or null when nothing was asked.",
  "anyOf": [{ "$ref": "LiveState" }, { "type": "null" }],
  "examples": [null]
}
```

```json type
{
  "$id": "JobStateShown",
  "description": "A job's state, one of the seven, and a note.",
  "type": "object",
  "required": ["state", "note"],
  "additionalProperties": false,
  "properties": {
    "state": {
      "type": "string",
      "enum": ["queued", "running", "waiting-at-gate", "done", "failed", "cancelled", "ended-without-record"]
    },
    "note": { "type": "string" }
  },
  "examples": [{ "state": "ended-without-record", "note": "bridge does not know the job" }]
}
```

```json type
{
  "$id": "Price",
  "description": "A participant's declared price per million input and output tokens.",
  "type": "object",
  "required": ["currency", "input", "output"],
  "additionalProperties": false,
  "properties": {
    "currency": { "type": "string", "pattern": "^[A-Z]{3}$" },
    "input": { "type": "number", "minimum": 0 },
    "output": { "type": "number", "minimum": 0 }
  },
  "examples": [{ "currency": "EUR", "input": 2, "output": 3.5 }]
}
```

```json type
{
  "$id": "PriceOrNone",
  "description": "A declared price, or null where the participant declares none.",
  "anyOf": [{ "$ref": "Price" }, { "type": "null" }],
  "examples": [null]
}
```

```json type
{
  "$id": "CostShown",
  "description": "A job's cost as shown, the amount — null where none is known —, and its currency.",
  "type": "object",
  "required": ["shown", "amount", "currency"],
  "additionalProperties": false,
  "properties": {
    "shown": { "type": "string" },
    "amount": { "anyOf": [{ "type": "number", "minimum": 0 }, { "type": "null" }] },
    "currency": { "type": "string" }
  },
  "examples": [{ "shown": "182 k tokens · 0.41 EUR at the declared price", "amount": 0.41, "currency": "EUR" }]
}
```

```json type
{
  "$id": "JobEntry",
  "description": "A job as the job list reads it: its product, its record, its state and its cost as shown.",
  "type": "object",
  "required": ["product", "record", "state", "cost"],
  "additionalProperties": false,
  "properties": {
    "product": { "type": "string", "minLength": 1 },
    "record": { "$ref": "JobRecord" },
    "state": { "$ref": "JobStateShown" },
    "cost": { "$ref": "CostShown" }
  },
  "examples": [
    {
      "product": "thesis-tool",
      "record": {
        "id": "JOB-20261010-0915-1b1b",
        "path": "docs/jobs/JOB-20261010-0915-1b1b.md",
        "kind": "implement",
        "phase": "Implementation",
        "role": "Developers",
        "participant": "cli-dev",
        "runtime": "bridge",
        "run": "JOB-20261010-0900-0a0a",
        "slot": "Implementation/MOD-a",
        "item": "",
        "modules": ["MOD-a"],
        "inputs": ["docs/architecture/ARC-004-the-store.md"],
        "retryOf": "",
        "agentM": "2026.10.1",
        "model": "claude-opus-5-5",
        "log": "",
        "selection": [],
        "limits": null,
        "assignments": [],
        "states": [{ "at": "2026-10-10T09:15:00Z", "state": "queued", "note": "" }],
        "results": [],
        "rounds": 0,
        "cost": null,
        "usage": null,
        "jobs": []
      },
      "state": { "state": "running", "note": "" },
      "cost": { "shown": "unknown", "amount": null, "currency": "" }
    }
  ]
}
```

```json type
{
  "$id": "JobRow",
  "description": "A row of the job list.",
  "type": "object",
  "required": ["product", "id", "worksOn", "kind", "participant", "runtime", "state", "note", "started", "elapsedMinutes", "cost", "log"],
  "additionalProperties": false,
  "properties": {
    "product": { "type": "string" },
    "id": { "type": "string", "pattern": "^JOB-[0-9]{8}-[0-9]{4}-[0-9a-f]{4}$" },
    "worksOn": { "type": "string" },
    "kind": { "type": "string" },
    "participant": { "type": "string" },
    "runtime": { "type": "string", "enum": ["browser", "ci", "bridge"] },
    "state": {
      "type": "string",
      "enum": ["queued", "running", "waiting-at-gate", "done", "failed", "cancelled", "ended-without-record"]
    },
    "note": { "type": "string" },
    "started": { "type": "string", "pattern": "^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$" },
    "elapsedMinutes": { "type": "integer", "minimum": 0 },
    "cost": { "type": "string" },
    "log": { "type": "string" }
  },
  "examples": [
    { "product": "agent-m", "id": "JOB-20261009-1400-5f5f", "worksOn": "MOD-a", "kind": "test-battery", "participant": "ci-dev", "runtime": "ci", "state": "waiting-at-gate", "note": "", "started": "2026-10-09T14:00:00Z", "elapsedMinutes": 1200, "cost": "89 min, price unknown", "log": "https://github.com/akmaier/agent-m/actions/runs/7" }
  ]
}
```

```json type
{
  "$id": "ModuleUses",
  "description": "A module and the modules whose interfaces it uses.",
  "type": "object",
  "required": ["module", "uses"],
  "additionalProperties": false,
  "properties": {
    "module": { "type": "string", "pattern": "^MOD-" },
    "uses": { "type": "array", "items": { "type": "string" } }
  },
  "examples": [{ "module": "MOD-b", "uses": ["MOD-a"] }]
}
```

```json type
{
  "$id": "ModuleWaves",
  "description": "Modules in waves, each after the earlier ones.",
  "type": "object",
  "required": ["waves"],
  "additionalProperties": false,
  "properties": { "waves": { "type": "array", "items": { "type": "array", "items": { "type": "string" } } } },
  "examples": [{ "waves": [["MOD-a", "MOD-d"], ["MOD-b"], ["MOD-c"]] }]
}
```

```json type
{
  "$id": "RunInput",
  "description": "What a run is planned from: the product, whether its work is planned or pulled, the selection — modules or items —, the workflow's phases, gates and roles, the modules' uses, the backlog items in their order, whether the product has its CI configuration, the participants the author chose, and the limits.",
  "type": "object",
  "required": ["product", "kind", "selection", "phases", "gates", "roles", "uses", "items", "ciConfigured", "assignments", "limits"],
  "additionalProperties": false,
  "properties": {
    "product": { "type": "string", "minLength": 1 },
    "kind": { "type": "string", "enum": ["planned", "pulled"] },
    "selection": { "type": "array", "items": { "type": "string" }, "minItems": 1 },
    "phases": { "type": "array", "items": { "$ref": "WorkflowPhase" } },
    "gates": { "type": "array", "items": { "$ref": "WorkflowGate" } },
    "roles": { "type": "array", "items": { "$ref": "WorkflowRole" } },
    "uses": { "type": "array", "items": { "$ref": "ModuleUses" } },
    "items": { "type": "array", "items": { "$ref": "BacklogItem" } },
    "ciConfigured": { "type": "boolean" },
    "assignments": { "type": "array", "items": { "$ref": "JobAssignment" } },
    "limits": { "$ref": "Limits" }
  },
  "examples": [
    {
      "product": "thesis-tool",
      "kind": "pulled",
      "selection": ["ITM-014", "ITM-015"],
      "phases": [
        {
          "name": "Sprint planning",
          "role": "Product Owner",
          "produces": "ITM",
          "kinds": ["ITM"],
          "line": 12,
          "practice": ""
        },
        {
          "name": "Development",
          "role": "Developers",
          "produces": "MOD, TST",
          "kinds": ["MOD", "TST"],
          "line": 13,
          "practice": ""
        },
        {
          "name": "Sprint review",
          "role": "Product Owner",
          "produces": "the review of the increment",
          "kinds": [],
          "line": 14,
          "practice": ""
        }
      ],
      "gates": [
        {
          "between": "Development → Sprint review",
          "from": "Development",
          "to": "Sprint review",
          "artifacts": "MOD",
          "kinds": ["MOD"],
          "condition": "CI is green",
          "decider": { "role": "Product Owner" },
          "line": 28,
          "practice": "",
          "requirement": "",
          "source": "",
          "holders": ["alice"]
        }
      ],
      "roles": [
        {
          "name": "Product Owner",
          "filledBy": "person",
          "capabilities": ["read the repository", "write to the repository"],
          "line": 34,
          "holders": ["alice"]
        },
        {
          "name": "Developers",
          "filledBy": "agent",
          "capabilities": ["read the repository", "write to the repository", "run code and tests"],
          "line": 35,
          "holders": ["cli-dev", "ci-dev"]
        }
      ],
      "uses": [],
      "items": [
        {
          "id": "ITM-014",
          "path": "docs/backlog/ITM-014-export-a-chapter-as-pdf.md",
          "title": "Export a chapter as PDF",
          "kind": "implementation",
          "realises": ["A CHAPTER IS EXPORTED", "UC-003"],
          "modules": ["MOD-export"],
          "dependsOn": ["ITM-009"],
          "origins": ["https://github.com/alice/thesis/issues/57"],
          "outcome": "The author presses Export on a chapter and receives a PDF of it.",
          "criteria": ["The PDF holds the chapter's text and figures."],
          "notes": ""
        },
        {
          "id": "ITM-015",
          "path": "docs/backlog/ITM-015-write-a-chapter-in-the-editor.md",
          "title": "Write a chapter in the editor",
          "kind": "implementation",
          "realises": ["NO SERVER", "UC-002"],
          "modules": ["MOD-pages"],
          "dependsOn": [],
          "origins": ["UC-002"],
          "outcome": "Write a chapter in the editor.",
          "criteria": [],
          "notes": ""
        }
      ],
      "ciConfigured": true,
      "assignments": [{ "role": "Developers", "participant": "ci-dev" }],
      "limits": { "jobsAtOnce": 2, "cost": null, "rounds": 5 }
    }
  ]
}
```

```json type
{
  "$id": "RunSlot",
  "description": "A job a run will start: its slot key, its kind, phase, role and participant, the module or item it works on, the slots it waits for, the gates into its phase decided for the product, and the gates it meets before its merge.",
  "type": "object",
  "required": ["key", "kind", "phase", "role", "participant", "unit", "item", "modules", "after", "gates", "meets"],
  "additionalProperties": false,
  "properties": {
    "key": { "type": "string" },
    "kind": { "type": "string", "enum": ["configure-ci", "implement", "test-battery"] },
    "phase": { "type": "string" },
    "role": { "type": "string" },
    "participant": { "type": "string" },
    "unit": { "type": "string" },
    "item": { "type": "string" },
    "modules": { "type": "array", "items": { "type": "string" } },
    "after": { "type": "array", "items": { "type": "string" } },
    "gates": { "type": "array", "items": { "type": "string" } },
    "meets": { "type": "array", "items": { "type": "string" } }
  },
  "examples": [
    {
      "key": "Implementation/MOD-a",
      "kind": "implement",
      "phase": "Implementation",
      "role": "Developers",
      "participant": "cli-dev",
      "unit": "MOD-a",
      "item": "",
      "modules": ["MOD-a"],
      "after": ["configure-ci"],
      "gates": ["Design → Implementation"],
      "meets": ["Implementation → Testing"]
    }
  ]
}
```

```json type
{
  "$id": "RunPlan",
  "description": "A run's plan: the product, the kind of work, the jobs in order, the gates they meet or wait for, and the limits.",
  "type": "object",
  "required": ["product", "kind", "slots", "gates", "limits"],
  "additionalProperties": false,
  "properties": {
    "product": { "type": "string" },
    "kind": { "type": "string", "enum": ["planned", "pulled"] },
    "slots": { "type": "array", "items": { "$ref": "RunSlot" } },
    "gates": { "type": "array", "items": { "$ref": "WorkflowGate" } },
    "limits": { "$ref": "Limits" }
  },
  "examples": [
    {
      "product": "thesis-tool",
      "kind": "pulled",
      "slots": [
        {
          "key": "Development/ITM-014",
          "kind": "implement",
          "phase": "Development",
          "role": "Developers",
          "participant": "ci-dev",
          "unit": "ITM-014",
          "item": "ITM-014",
          "modules": ["MOD-export"],
          "after": [],
          "gates": [],
          "meets": ["Development → Sprint review"]
        },
        {
          "key": "Development/ITM-015",
          "kind": "implement",
          "phase": "Development",
          "role": "Developers",
          "participant": "ci-dev",
          "unit": "ITM-015",
          "item": "ITM-015",
          "modules": ["MOD-pages"],
          "after": [],
          "gates": [],
          "meets": ["Development → Sprint review"]
        }
      ],
      "gates": [
        {
          "between": "Development → Sprint review",
          "from": "Development",
          "to": "Sprint review",
          "artifacts": "MOD",
          "kinds": ["MOD"],
          "condition": "CI is green",
          "decider": { "role": "Product Owner" },
          "line": 28,
          "practice": "",
          "requirement": "",
          "source": "",
          "holders": ["alice"]
        }
      ],
      "limits": { "jobsAtOnce": 2, "cost": null, "rounds": 5 }
    }
  ]
}
```

```json type
{
  "$id": "RunJob",
  "description": "A job of a run as the engine reads it: its identifier, slot and run, its participant, when it started, its state, its reported cost and its correction rounds.",
  "type": "object",
  "required": ["id", "slot", "run", "participant", "started", "state", "cost", "rounds"],
  "additionalProperties": false,
  "properties": {
    "id": { "type": "string", "pattern": "^JOB-[0-9]{8}-[0-9]{4}-[0-9a-f]{4}$" },
    "slot": { "type": "string" },
    "run": { "type": "string", "pattern": "^JOB-[0-9]{8}-[0-9]{4}-[0-9a-f]{4}$" },
    "participant": { "type": "string" },
    "started": { "type": "string", "pattern": "^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$" },
    "state": {
      "type": "string",
      "enum": ["queued", "running", "waiting-at-gate", "done", "failed", "cancelled", "ended-without-record"]
    },
    "cost": { "$ref": "MoneyOrNone" },
    "rounds": { "type": "integer", "minimum": 0 }
  },
  "examples": [
    {
      "id": "JOB-20261010-0915-1b1b",
      "slot": "Implementation/MOD-a",
      "run": "JOB-20261010-0900-0a0a",
      "participant": "cli-dev",
      "started": "2026-10-10T09:15:00Z",
      "state": "done",
      "cost": { "amount": 4, "currency": "USD" },
      "rounds": 1
    }
  ]
}
```

```json type
{
  "$id": "RunItem",
  "description": "A backlog item of a run and its facts.",
  "type": "object",
  "required": ["item", "facts"],
  "additionalProperties": false,
  "properties": { "item": { "$ref": "BacklogItem" }, "facts": { "$ref": "ItemFacts" } },
  "examples": [
    {
      "item": {
        "id": "ITM-015",
        "path": "docs/backlog/ITM-015-write-a-chapter-in-the-editor.md",
        "title": "Write a chapter in the editor",
        "kind": "implementation",
        "realises": ["NO SERVER", "UC-002"],
        "modules": ["MOD-pages"],
        "dependsOn": [],
        "origins": ["UC-002"],
        "outcome": "Write a chapter in the editor.",
        "criteria": [],
        "notes": ""
      },
      "facts": {
        "added": "2026-10-05T08:00:00Z",
        "accepted": [
          { "name": "NO SERVER", "at": "2026-09-01T10:00:00Z" },
          { "name": "UC-002", "at": "2026-09-01T10:00:00Z" },
          { "name": "ONE CLICK", "at": "2026-09-01T10:00:00Z" },
          { "name": "UC-001", "at": "2026-09-01T10:00:00Z" }
        ],
        "jobs": [],
        "pullRequests": [],
        "proposals": [],
        "rejections": []
      }
    }
  ]
}
```

```json type
{
  "$id": "GateText",
  "description": "A gate a run's jobs wait for, which the product passes, and the commit it is decided on: the newest commit that changed a path of what it checks — empty for a gate that checks none.",
  "type": "object",
  "required": ["gate", "on"],
  "additionalProperties": false,
  "properties": {
    "gate": { "type": "string", "pattern": "^.+ → .+$" },
    "on": { "type": "string", "pattern": "^([0-9a-f]{40})?$" }
  },
  "examples": [{ "gate": "Design → Implementation", "on": "c300000000000000000000000000000000000000" }]
}
```

```json type
{
  "$id": "RunSnapshot",
  "description": "What the next jobs of a run are computed from, read at one commit: the run, its plan, its jobs, the gate records and CI check results, the commit each gate its jobs wait for is decided on, and — for items — the items with their facts, the running sprint, whether the work runs in sprints, the WIP limit and how many items count against it.",
  "type": "object",
  "required": ["run", "plan", "jobs", "gateRecords", "checks", "texts", "items", "sprint", "sprints", "wipLimit", "inProgress"],
  "additionalProperties": false,
  "properties": {
    "run": { "type": "string", "pattern": "^JOB-[0-9]{8}-[0-9]{4}-[0-9a-f]{4}$" },
    "plan": { "$ref": "RunPlan" },
    "jobs": { "type": "array", "items": { "$ref": "RunJob" } },
    "gateRecords": { "type": "array", "items": { "$ref": "GateRecord" } },
    "checks": { "type": "array", "items": { "$ref": "CheckResult" } },
    "texts": { "type": "array", "items": { "$ref": "GateText" } },
    "items": { "type": "array", "items": { "$ref": "RunItem" } },
    "sprint": { "$ref": "SprintOrNone" },
    "sprints": { "type": "boolean" },
    "wipLimit": { "anyOf": [{ "type": "integer", "minimum": 1 }, { "type": "null" }] },
    "inProgress": { "type": "integer", "minimum": 0 }
  },
  "examples": [
    {
      "run": "JOB-20261010-0900-0a0a",
      "plan": {
        "product": "thesis-tool",
        "kind": "planned",
        "slots": [
          {
            "key": "configure-ci",
            "kind": "configure-ci",
            "phase": "Implementation",
            "role": "Developers",
            "participant": "cli-dev",
            "unit": "",
            "item": "",
            "modules": [],
            "after": [],
            "gates": [],
            "meets": []
          },
          {
            "key": "Implementation/MOD-a",
            "kind": "implement",
            "phase": "Implementation",
            "role": "Developers",
            "participant": "cli-dev",
            "unit": "MOD-a",
            "item": "",
            "modules": ["MOD-a"],
            "after": ["configure-ci"],
            "gates": ["Design → Implementation"],
            "meets": ["Implementation → Testing"]
          },
          {
            "key": "Implementation/MOD-d",
            "kind": "implement",
            "phase": "Implementation",
            "role": "Developers",
            "participant": "cli-dev",
            "unit": "MOD-d",
            "item": "",
            "modules": ["MOD-d"],
            "after": ["configure-ci"],
            "gates": ["Design → Implementation"],
            "meets": ["Implementation → Testing"]
          },
          {
            "key": "Implementation/MOD-b",
            "kind": "implement",
            "phase": "Implementation",
            "role": "Developers",
            "participant": "cli-dev",
            "unit": "MOD-b",
            "item": "",
            "modules": ["MOD-b"],
            "after": ["configure-ci", "Implementation/MOD-a"],
            "gates": ["Design → Implementation"],
            "meets": ["Implementation → Testing"]
          },
          {
            "key": "Implementation/MOD-c",
            "kind": "implement",
            "phase": "Implementation",
            "role": "Developers",
            "participant": "cli-dev",
            "unit": "MOD-c",
            "item": "",
            "modules": ["MOD-c"],
            "after": ["configure-ci", "Implementation/MOD-b"],
            "gates": ["Design → Implementation"],
            "meets": ["Implementation → Testing"]
          },
          {
            "key": "Testing/selection",
            "kind": "test-battery",
            "phase": "Testing",
            "role": "Tester",
            "participant": "ci-dev",
            "unit": "selection",
            "item": "",
            "modules": ["MOD-a", "MOD-d", "MOD-b", "MOD-c"],
            "after": ["Implementation/MOD-a", "Implementation/MOD-d", "Implementation/MOD-b", "Implementation/MOD-c"],
            "gates": [],
            "meets": ["Testing → Validation"]
          }
        ],
        "gates": [
          {
            "between": "Design → Implementation",
            "from": "Design",
            "to": "Implementation",
            "artifacts": "ARC",
            "kinds": ["ARC"],
            "condition": "every requirement has an ARC, and the design is accepted",
            "decider": { "role": "Architect" },
            "line": 41,
            "practice": "",
            "requirement": "",
            "source": "",
            "holders": ["alice"]
          },
          {
            "between": "Implementation → Testing",
            "from": "Implementation",
            "to": "Testing",
            "artifacts": "MOD",
            "kinds": ["MOD"],
            "condition": "CI is green",
            "decider": { "check": "tests" },
            "line": 42,
            "practice": "",
            "requirement": "",
            "source": "",
            "holders": []
          },
          {
            "between": "Testing → Validation",
            "from": "Testing",
            "to": "Validation",
            "artifacts": "TST",
            "kinds": ["TST"],
            "condition": "every unit's verification is recorded",
            "decider": { "role": "Tester" },
            "line": 41,
            "practice": "",
            "requirement": "UNIT VERIFICATION IS DOCUMENTED",
            "source": "IEC 62304, 5.5.5",
            "holders": ["ci-dev"]
          }
        ],
        "limits": { "jobsAtOnce": 3, "cost": { "amount": 20, "currency": "USD" }, "rounds": 5 }
      },
      "jobs": [
        { "id": "JOB-20261010-0905-0c0c", "slot": "configure-ci", "run": "JOB-20261010-0900-0a0a", "participant": "cli-dev", "started": "2026-10-10T09:05:00Z", "state": "done", "cost": null, "rounds": 0 },
        {
          "id": "JOB-20261010-0915-1b1b",
          "slot": "Implementation/MOD-a",
          "run": "JOB-20261010-0900-0a0a",
          "participant": "cli-dev",
          "started": "2026-10-10T09:15:00Z",
          "state": "done",
          "cost": { "amount": 4, "currency": "USD" },
          "rounds": 5
        },
        { "id": "JOB-20261010-0916-2c2c", "slot": "Implementation/MOD-d", "run": "JOB-20261010-0900-0a0a", "participant": "cli-dev", "started": "2026-10-10T09:16:00Z", "state": "running", "cost": null, "rounds": 0 }
      ],
      "gateRecords": [
        { "path": "docs/jobs/gates/thesis-tool-design-implementation-c30000000000.md", "from": "Design", "to": "Implementation", "subject": "thesis-tool", "on": "c300000000000000000000000000000000000000", "decider": "alice", "decision": "passed", "reason": "every requirement has an ARC" }
      ],
      "checks": [],
      "texts": [{ "gate": "Design → Implementation", "on": "c300000000000000000000000000000000000000" }],
      "items": [],
      "sprint": null,
      "sprints": false,
      "wipLimit": null,
      "inProgress": 0
    }
  ]
}
```

```json type
{
  "$id": "JobSpec",
  "description": "A job to start: its slot, kind, phase, role, participant and run, and the item and modules it works on.",
  "type": "object",
  "required": ["slot", "kind", "phase", "role", "participant", "run", "item", "modules"],
  "additionalProperties": false,
  "properties": {
    "slot": { "type": "string" },
    "kind": { "type": "string" },
    "phase": { "type": "string" },
    "role": { "type": "string" },
    "participant": { "type": "string" },
    "run": { "type": "string", "pattern": "^JOB-[0-9]{8}-[0-9]{4}-[0-9a-f]{4}$" },
    "item": { "type": "string" },
    "modules": { "type": "array", "items": { "type": "string" } }
  },
  "examples": [
    {
      "slot": "configure-ci",
      "kind": "configure-ci",
      "phase": "Implementation",
      "role": "Developers",
      "participant": "cli-dev",
      "run": "JOB-20261010-0900-0a0a",
      "item": "",
      "modules": []
    }
  ]
}
```

```json type
{
  "$id": "NextJobs",
  "description": "The jobs to start, what waits and why, whether the run is done, and the limit that stopped it — empty while none did.",
  "type": "object",
  "required": ["start", "waiting", "done", "stop"],
  "additionalProperties": false,
  "properties": {
    "start": { "type": "array", "items": { "$ref": "JobSpec" } },
    "waiting": { "type": "array", "items": { "type": "string" } },
    "done": { "type": "boolean" },
    "stop": { "type": "string" }
  },
  "examples": [
    {
      "start": [],
      "waiting": ["Implementation/MOD-a: Design → Implementation waits for alice", "Implementation/MOD-d: Design → Implementation waits for alice"],
      "done": false,
      "stop": ""
    }
  ]
}
```

```json type
{
  "$id": "RunStart",
  "description": "A job a step of a run starts: its slot, kind, phase, role, participant and run, the item and modules it works on, where it runs and the model it names.",
  "type": "object",
  "required": ["slot", "kind", "phase", "role", "participant", "run", "item", "modules", "runtime", "model"],
  "additionalProperties": false,
  "properties": {
    "slot": { "type": "string" },
    "kind": { "type": "string" },
    "phase": { "type": "string" },
    "role": { "type": "string" },
    "participant": { "type": "string" },
    "run": { "type": "string", "pattern": "^JOB-[0-9]{8}-[0-9]{4}-[0-9a-f]{4}$" },
    "item": { "type": "string" },
    "modules": { "type": "array", "items": { "type": "string" } },
    "runtime": { "type": "string", "enum": ["browser", "ci", "bridge"] },
    "model": { "type": "string" }
  },
  "examples": [
    {
      "slot": "Implementation/MOD-b",
      "kind": "implement",
      "phase": "Implementation",
      "role": "Developers",
      "participant": "cli-dev",
      "run": "JOB-20261010-0900-0a0a",
      "item": "",
      "modules": ["MOD-b"],
      "runtime": "bridge",
      "model": "claude-opus-5-5"
    }
  ]
}
```

```json type
{
  "$id": "AdvanceInput",
  "description": "What one step of a run is written from: the run's record, its next jobs, the jobs it starts with where each runs, why a slot whose participant no runtime serves waits, the run's jobs as the engine read them, every job identifier the product holds, random draws for new identifiers, the time and the Agent M version.",
  "type": "object",
  "required": ["run", "next", "start", "held", "jobs", "taken", "draws", "now", "agentM"],
  "additionalProperties": false,
  "properties": {
    "run": { "$ref": "JobRecord" },
    "next": { "$ref": "NextJobs" },
    "start": { "type": "array", "items": { "$ref": "RunStart" } },
    "held": { "type": "array", "items": { "type": "string" } },
    "jobs": { "type": "array", "items": { "$ref": "RunJob" } },
    "taken": { "type": "array", "items": { "type": "string", "pattern": "^JOB-[0-9]{8}-[0-9]{4}-[0-9a-f]{4}$" } },
    "draws": { "type": "array", "items": { "type": "string", "pattern": "^[0-9a-f]{4}" } },
    "now": { "type": "string", "pattern": "^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$" },
    "agentM": { "type": "string" }
  },
  "examples": [
    {
      "run": {
        "id": "JOB-20261010-0900-0a0a",
        "path": "docs/jobs/JOB-20261010-0900-0a0a.md",
        "kind": "run",
        "phase": "",
        "role": "",
        "participant": "alice",
        "runtime": "browser",
        "run": "",
        "slot": "",
        "item": "",
        "modules": [],
        "inputs": [],
        "retryOf": "",
        "agentM": "2026.10.1",
        "model": "",
        "log": "",
        "selection": ["MOD-a", "MOD-b", "MOD-c", "MOD-d"],
        "limits": { "jobsAtOnce": 3, "cost": { "amount": 20, "currency": "USD" }, "rounds": 5 },
        "assignments": [
          { "role": "Developers", "participant": "cli-dev" },
          { "role": "Tester", "participant": "ci-dev" }
        ],
        "states": [{ "at": "2026-10-10T09:00:00Z", "state": "running", "note": "" }],
        "results": [],
        "rounds": 0,
        "cost": null,
        "usage": null,
        "jobs": ["JOB-20261010-0905-0c0c", "JOB-20261010-0915-1b1b", "JOB-20261010-0916-2c2c"]
      },
      "next": {
        "start": [],
        "waiting": ["Implementation/MOD-a: Design → Implementation waits for alice", "Implementation/MOD-d: Design → Implementation waits for alice"],
        "done": false,
        "stop": ""
      },
      "start": [],
      "held": [],
      "jobs": [
        { "id": "JOB-20261010-0905-0c0c", "slot": "configure-ci", "run": "JOB-20261010-0900-0a0a", "participant": "cli-dev", "started": "2026-10-10T09:05:00Z", "state": "done", "cost": null, "rounds": 0 }
      ],
      "taken": ["JOB-20261010-0900-0a0a", "JOB-20261010-0905-0c0c"],
      "draws": ["7a7a", "8b8b"],
      "now": "2026-10-10T10:45:00Z",
      "agentM": "2026.10.1"
    }
  ]
}
```

```json type
{
  "$id": "JobStateEntryOrNone",
  "description": "A state a run's record gains, or null where it stays as recorded.",
  "anyOf": [{ "$ref": "JobStateEntry" }, { "type": "null" }],
  "examples": [null]
}
```

```json type
{
  "$id": "Advance",
  "description": "One step of a run: the files to commit, the jobs it starts, the state the run's record gains — null where it stays — and the commit message.",
  "type": "object",
  "required": ["files", "started", "state", "message"],
  "additionalProperties": false,
  "properties": {
    "files": { "type": "array", "items": { "$ref": "FileText" } },
    "started": { "type": "array", "items": { "type": "string", "pattern": "^JOB-[0-9]{8}-[0-9]{4}-[0-9a-f]{4}$" } },
    "state": { "$ref": "JobStateEntryOrNone" },
    "message": { "type": "string", "minLength": 1 }
  },
  "examples": [
    {
      "files": [
        { "path": "docs/jobs/JOB-20261010-0900-0a0a.md", "text": "---\nid: JOB-20261010-0900-0a0a\nkind: run\nphase:\nrole:\nparticipant: alice\nruntime: browser\nrun:\nslot:\nitem:\nmodules: []\ninputs: []\nretry_of:\nagent_m: 2026.10.1\nmodel:\nlog:\n---\n\n# JOB-20261010-0900-0a0a\n\n**REGISTER**\n\n## Selection\n\n- MOD-a\n- MOD-b\n- MOD-c\n- MOD-d\n\n## Limits\n\n| Jobs at once | Cost | Rounds |\n|---|---|---|\n| 3 | 20 USD | 5 |\n\n## Assignments\n\n| Role | Participant |\n|---|---|\n| Developers | cli-dev |\n| Tester | ci-dev |\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-10T09:00:00Z | running | — |\n| 2026-10-10T10:45:00Z | waiting-at-gate | Implementation/MOD-a: Design → Implementation waits for alice; Implementation/MOD-d: Design → Implementation waits for alice |\n\n## Jobs\n\n- JOB-20261010-0905-0c0c\n- JOB-20261010-0915-1b1b\n- JOB-20261010-0916-2c2c\n" }
      ],
      "started": [],
      "state": { "at": "2026-10-10T10:45:00Z", "state": "waiting-at-gate", "note": "Implementation/MOD-a: Design → Implementation waits for alice; Implementation/MOD-d: Design → Implementation waits for alice" },
      "message": "run JOB-20261010-0900-0a0a is waiting at a gate"
    }
  ]
}
```

```json type
{
  "$id": "CloseDue",
  "description": "Whether a sprint's close starts by itself, and why.",
  "type": "object",
  "required": ["due", "reason"],
  "additionalProperties": false,
  "properties": { "due": { "type": "boolean" }, "reason": { "type": "string" } },
  "examples": [{ "due": true, "reason": "every selected item is done" }]
}
```

```json type
{
  "$id": "JobRecordContent",
  "description": "What the markdown-front-matter syntax reads from a job record.",
  "type": "object",
  "required": ["fields", "body"],
  "additionalProperties": false,
  "properties": {
    "fields": {
      "type": "object",
      "required": ["id", "kind", "participant", "runtime"],
      "additionalProperties": { "anyOf": [{ "type": "string" }, { "type": "array", "items": { "type": "string" } }] },
      "properties": {
        "id": { "type": "string", "pattern": "^JOB-[0-9]{8}-[0-9]{4}-[0-9a-f]{4}$" },
        "kind": { "type": "string", "minLength": 1 },
        "participant": { "type": "string", "minLength": 1 },
        "runtime": { "type": "string", "enum": ["browser", "ci", "bridge"] }
      }
    },
    "body": { "type": "string" }
  },
  "examples": [
    {
      "fields": { "id": "JOB-20261010-0915-1b1b", "kind": "implement", "participant": "cli-dev", "runtime": "bridge" },
      "body": "# JOB-20261010-0915-1b1b\n"
    }
  ]
}
```

```json type
{
  "$id": "CancelRecordFields",
  "description": "What the key-value-lines syntax reads from a cancel record.",
  "type": "object",
  "required": ["job", "by", "at"],
  "additionalProperties": false,
  "properties": {
    "job": { "type": "string", "pattern": "^JOB-[0-9]{8}-[0-9]{4}-[0-9a-f]{4}$" },
    "by": { "type": "string", "minLength": 1 },
    "at": { "type": "string", "pattern": "^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$" }
  },
  "examples": [{ "job": "JOB-20261010-0915-1b1b", "by": "alice", "at": "2026-10-10T09:30:00Z" }]
}
```

```json format
{
  "$id": "JobRecordFile",
  "description": "A job's record in the repository of the product it works on, written at its start and extended by each state it enters and by its end.",
  "path": "docs/jobs/{id}.md",
  "syntax": "markdown-front-matter",
  "content": "JobRecordContent",
  "examples": ["---\nid: JOB-20261010-0915-1b1b\nkind: implement\nphase: Implementation\nrole: Developers\nparticipant: cli-dev\nruntime: bridge\nrun: JOB-20261010-0900-0a0a\nslot: Implementation/MOD-a\nitem:\nmodules:\n  - MOD-a\ninputs:\n  - docs/architecture/ARC-004-the-store.md\nretry_of:\nagent_m: 2026.10.1\nmodel: claude-opus-5-5\nlog:\n---\n\n# JOB-20261010-0915-1b1b\n\n**REGISTER**\n\n## States\n\n| At | State | Note |\n|---|---|---|\n| 2026-10-10T09:15:00Z | queued | — |\n"]
}
```

```json format
{
  "$id": "CancelRecordFile",
  "description": "A person's cancel of a job, written once.",
  "path": "docs/jobs/cancels/{id}.md",
  "syntax": "key-value-lines",
  "content": "CancelRecordFields",
  "examples": ["job: JOB-20261010-0915-1b1b\nby: alice\nat: 2026-10-10T09:30:00Z\n"]
}
```
