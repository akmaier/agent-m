---
id: MOD-run-engine
title: Computes the next jobs of a run from the records in the repository
realises:
  - A RUN EXECUTES THE PROCESS MODEL OVER A SELECTION
  - A RUN CONTINUES WITHOUT A CLICK BETWEEN ITS JOBS
  - A RUN FOLLOWS THE MODULES' INTERFACES
  - A RUN SETS UP CI BEFORE IT IMPLEMENTS
  - A RUN HAS LIMITS FIXED AT ITS START
  - A JOB GOES ONLY TO A HOLDER OF ITS ROLE
  - A JOB STOPS AT EVERY GATE
  - NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT
  - A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT
  - NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED
  - AGILE IMPLEMENTATION STARTS FROM THE BACKLOG
  - A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE
  - A SPRINT CLOSED BY AN AGENT STARTS BY ITSELF
  - AGENT M WORKS WITHOUT A LOCAL INSTALLATION
  - UC-034
  - UC-043
follows:
  - ARC-003
  - ARC-010
uses:
  - MOD-job-records.parseJobRecord
  - MOD-job-records.jobState
  - MOD-process-model.deriveWorkflow
  - MOD-process-model.assignable
  - MOD-process-model.gateDecision
  - MOD-review-core.parseArchitecture
  - MOD-review-core.deriveStatus
  - MOD-resources.reachableRoutes
provides:
  - nextJobs
  - runPlan
  - moduleOrder
  - startable
---
# MOD-run-engine Computes the next jobs of a run from the records in the repository

## Responsibility

The run engine of ARC-010: a pure function from a snapshot of records to the jobs to start next.
Any runtime may call it — the engine workflow, the bridge, the browser — and they agree because
nothing is remembered between calls. Queueing a job means committing its start record; that is done
by the caller through MOD-git-host.

**Current state.** No code exists.

## Interfaces

- `nextJobs(snapshot) -> { start: [jobSpec], waiting: [reason], done, stop }` — pure: from the run record, all job, gate and approval records, the modules' `uses`, the workflow, role holders and the pull-request and CI states passed in, the jobs to start now, each with a slot key no existing record holds; limits reached give `stop` with the limit named.
- `runPlan({ selection, workflow, modules, limits }) -> plan` — the parts of a run in order, the jobs, the role holder of each, every gate and its decider, what is sent where; for the run panel before *Start run*.
- `moduleOrder(modules, selection) -> { layers } | { cycle }` — the selection ordered by `uses`; a cycle is refused and its modules named.
- `startable(item, snapshot) -> { ok } | { reasons }` — whether a job may start now: everything it names accepted, WIP limit, time-box selection, a holder of its role, a route to its resources (hosted CI offered when it needs no local resource).

Uses, as declared above: `MOD-job-records.parseJobRecord`, `MOD-job-records.jobState`, `MOD-process-model.deriveWorkflow`, `MOD-process-model.assignable`, `MOD-process-model.gateDecision`, `MOD-review-core.parseArchitecture`, `MOD-review-core.deriveStatus`, `MOD-resources.reachableRoutes`.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; open until accepted.*
