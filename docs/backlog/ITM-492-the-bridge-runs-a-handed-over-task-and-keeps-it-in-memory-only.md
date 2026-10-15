---
id: ITM-492
title: The Bridge runs a handed-over task and keeps it in memory only
level: module
realises:
  - UC-049
  - A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
  - A CANCELLED JOB WRITES NOTHING MORE
modules:
  - MOD-bridge-jobs
builds_on:
  - ITM-490
  - ITM-491
tests:
  - unit
  - component
origin:
  - the architecture of the prompt bar, accepted by akmaier at 7e893c63 (110d2499)
  - MOD-bridge-jobs, `POST /v1/jobs`
---
# ITM-492 The Bridge runs a handed-over task and keeps it in memory only

**REGISTER**

## Outcome

A job whose record says that its task travels with the hand-over is run by the Bridge with the request's `task` as its
instruction, kept only in memory and written to no file, log line, commit message or record; its end names its commits,
files and pull request and no draft; the Bridge's own reading never takes such a job; a hand-over of such a job without a
task is `invalid-request`.

## Acceptance

- A fixture hand-over with a task runs the fixture agent with that task; no file, log line or record the Bridge writes
  holds it — a counter-proof plants it in a log line and the test finds it.
- The same record found by the Bridge's own reading is not taken; without `task` the request is refused.
