---
id: MOD-job-records
title: Writes and reads job, run, gate and cancel records and derives a job's state
realises:
  - A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
  - A JOB IDENTIFIER IS NEVER REUSED
  - A RUN IS A JOB THAT NAMES ITS JOBS
  - NO COST IS GUESSED
  - A CANCELLED JOB WRITES NOTHING MORE
  - PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
  - THE GATE IS RECORDED
  - AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT
  - ONE DASHBOARD SHOWS EVERY JOB
  - UC-036
follows:
  - ARC-003
  - ARC-006
  - ARC-010
uses: []
provides:
  - newJobId
  - startRecord
  - endRecord
  - gateRecord
  - cancelRecord
  - parseJobRecord
  - jobState
---
# MOD-job-records Writes and reads job, run, gate and cancel records and derives a job's state

## Responsibility

The record format of jobs and runs (ARC-006, ARC-010): start, end, gate and cancel records under
`docs/jobs/` of the product, the job identifier, and a job's state derived from records plus the
runtimes' live report. Pure core.

**Current state.** No code exists.

## Interfaces

- `newJobId(now, random) -> "JOB-YYYYMMDD-HHMM-xxxx"` — start time plus a random part; never reused, a retry gets a new one that names the old.
- `startRecord({ id, kind, product, inputs, participant, runtime, run, slot, agentM, model, startedBy }) -> { path, text }` — `docs/jobs/JOB-<id>.md`, state *queued*, with the Agent M version or commit and the model.
- `endRecord(start, { state, results, cost, usage, rounds }) -> text` — the end state (*done*, *failed*, *cancelled*) and results; a cost only when the runtime reported one or usage times a declared price.
- `gateRecord({ job, gate, decider, decision, reason, text }) -> { path, text }` — who or what decided, when, on which text (blob SHA).
- `cancelRecord({ job, by, at }) -> { path, text }` — the cancel every runtime checks for before each of its commits.
- `parseJobRecord(text) -> record` — any of the records above.
- `jobState(records, live) -> { state, note? }` — `state` is one of the six the SPEC names (queued, running, waiting at a gate, done, failed, cancelled), from the records and what the runtimes report now; a start record without end record that no runtime knows is `failed` with the note *ended without record* (UC-036 1c).

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; open until accepted.*
