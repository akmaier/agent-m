---
id: MOD-run-engine
title: The job runtime — job, gate, cancel and run records, the next jobs of a run, and one job carried from its start record to its end record in any runtime
realises:
  - NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED
  - A JOB GOES ONLY TO A HOLDER OF ITS ROLE
  - A JOB STOPS AT EVERY GATE
  - THE GATE IS RECORDED
  - A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
  - A JOB IDENTIFIER IS NEVER REUSED
  - PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
  - ONE DASHBOARD SHOWS EVERY JOB
  - A CANCELLED JOB WRITES NOTHING MORE
  - NO COST IS GUESSED
  - AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT
  - A CI AGENT'S DRAFT ENTERS AS OPEN
  - AGENT M WORKS WITHOUT A LOCAL INSTALLATION
  - A RUN EXECUTES THE PROCESS MODEL OVER A SELECTION
  - A RUN CONTINUES WITHOUT A CLICK BETWEEN ITS JOBS
  - A RUN SETS UP CI BEFORE IT IMPLEMENTS
  - A RUN HAS LIMITS FIXED AT ITS START
  - A RUN IS A JOB THAT NAMES ITS JOBS
  - A SPRINT CLOSED BY AN AGENT STARTS BY ITSELF
  - UC-010
  - UC-011
  - UC-024
  - UC-034
  - UC-036
  - UC-043
follows:
  - ARC-003
  - ARC-006
  - ARC-007
  - ARC-010
uses:
  - MOD-job-harness.loadDefinition
  - MOD-job-harness.renderPrompt
  - MOD-job-harness.contextFits
  - MOD-job-harness.mayReceive
  - MOD-job-harness.runDraft
  - MOD-process-model.deriveWorkflow
  - MOD-process-model.assignable
  - MOD-process-model.gateDecision
  - MOD-work-items.derivePlan
  - MOD-work-items.backlogOrder
  - MOD-work-items.sprint
  - MOD-work-items.itemState
  - MOD-traceability.linkGraph
  - MOD-traceability.moduleOrder
  - MOD-traceability.moduleRows
provides:
  - newJobId
  - startRecord
  - endRecord
  - gateRecord
  - cancelRecord
  - parseJobRecord
  - jobState
  - nextJobs
  - runPlan
  - startable
  - runJob
---
# MOD-run-engine The job runtime

## Responsibility

Kernel. Everything about a job that is the same in the tab, in CI and in the bridge (ARC-010): its
identifier, its records under `docs/jobs/` — start, end, gate, cancel, and the run that names its jobs —,
its state derived from the records and what the runtimes report now, whether it may start, the next jobs
of a run, and the one executor that carries a job from its start record to its end record. The engine is
a pure function of a snapshot of records, so any runtime may compute the next step; the executor reaches
the outside only through the ports its runtime hands it — the git host with that runtime's authority
(ARC-003), the participant's driver, a clock and a random source. Which credential a runtime writes with
is not its business (ARC-003, ARC-015). The checks a drafting job's loop runs are handed in by the
runtime, as the definition names them (ARC-007).

## Interfaces

- `newJobId(now, random) -> "JOB-YYYYMMDD-HHMM-xxxx"` — start time plus a random part; never reused, a retry gets a new one that names the old.
- `startRecord({ id, kind, product, inputs, participant, runtime, run, slot, agentM, model, startedBy }) -> { path, text }` — `docs/jobs/JOB-<id>.md`, state *queued*, with the Agent M version or commit and the model.
- `endRecord(start, { state, results, cost, usage, rounds }) -> text` — the end state (*done*, *failed*, *cancelled*; *ended without record* is derived, never written) and results; a cost only when the runtime reported one or usage times a declared price.
- `gateRecord({ job, gate, decider, decision, reason, text }) -> { path, text }` — who or what decided, when, on which text (blob SHA).
- `cancelRecord({ job, by, at }) -> { path, text }` — the cancel every runtime checks for before each commit of the job.
- `parseJobRecord(text) -> record` — any of the records above.
- `jobState(records, live) -> { state, note? }` — one of the seven states the SPEC names (queued, running, waiting at a gate, done, failed, cancelled, ended without record), from the records and what the runtimes report now; a start record without end record that no runtime knows is *ended without record* — never *failed*, which would claim an outcome nobody observed; any other value is rejected.
- `nextJobs(snapshot) -> { start: [jobSpec], waiting: [reason], done, stop }` — pure: from the run record, all job, gate and approval records, the modules' `uses`, the workflow, role holders, the backlog or plan and the pull-request and CI states passed in, the jobs to start now, each with a slot key no existing record holds; CI is set up first where the product has none; a sprint whose close an agent holds is closed when the sprint ends — its time box ends, or, without one, every selected item is done or its end is recorded; limits reached give `stop` with the limit named.
- `runPlan({ selection, workflow, modules, limits }) -> plan` — the parts of a run in order, the jobs, the role holder of each, every gate and its decider, what is sent where; for the run panel before *Start run*.
- `startable(item, snapshot) -> { ok, routes } | { reasons }` — whether a job may start now: everything it names accepted, the WIP limit, the current sprint's selection, a holder of its role who may receive its content, a route to its resources — the hosted CI route offered when it needs no local resource.
- `runJob(job, ports) -> { endRecord, results }` — the executor of ARC-010 decision 8: reads the definition, assembles and checks what is sent, runs the driver — a drafting job through `runDraft` with the checks in `ports` —, checks for a cancel record before each commit, commits the result on the route the definition names (a drafting job's result only as an open artifact or a queue entry), and writes the end record with rounds, versions and the cost as reported.

## Testing

Unit tests for the records, `jobState`, `nextJobs`, `runPlan` and `startable` over fixture snapshots — a
V-model fixture with three accepted modules yields the jobs of every phase in the model's order; with a
gate decided by a person a run waits there and nowhere else (`tests/test_process_run.py`); a state outside
the seven is rejected. Component tests for `runJob` with fake ports: a fake git host that records every
commit, a scripted driver, a fixed clock and random source; a cancel record placed between two commits
leaves the branch at the first (`tests/test_job_cancel.py`); a job without reported cost ends with cost
*unknown*. No model is called; the loop's rates belong to MOD-job-harness.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; revised on 2026-09-30 by Claude (claude-opus-5-5) against commit 1110607b6dc4d9c888549a23a680fbe4b38dd3f1 — SPEC and use cases as accepted that day, and `docs/measurements/2026-09-30_architecture-open-points.md`; revised on 2026-10-01 by Claude (claude-opus-5-5) against commit d0e5631081876203e719a2508d673d904e7768db — the leaner architecture of the architecture review, as the PO approved it (UC-023): the job runtime, taking over MOD-job-records and the bridge's job polling, with the executor runJob; the run order moved to MOD-traceability, the CI credentials to ARC-015; revised on 2026-10-01 by Claude (claude-opus-5-5) against commit b09cb03fbe9a8f311d75626fb2629a48968bfade — queue 2026-10-01d: a sprint without a time box; open until accepted.*
