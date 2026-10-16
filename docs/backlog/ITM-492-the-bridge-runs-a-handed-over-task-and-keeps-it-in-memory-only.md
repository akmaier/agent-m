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

What the module file leaves unstated, and what is built:
- **How the task becomes the job's instruction.** The Bridge prepares the job from its record, as today
  (`src/bridge-jobs/watch.mjs`), with the record's parameters and `instruction` set to the request's `task`. The task is
  held in memory only.
- **A task for a job whose record says `in parameters`.** It is ignored, and the job runs from its record as today.
- **The end of such a job.** Its `draft` is `null`, and its results are the commits, files and pull request, as today.
- **The log.** No line the Bridge itself writes holds the task. The agent's own output goes to the log as today.
- **The Bridge's own reading.** It leaves a record whose task travels with the hand-over queued and does not take it.
- **The fixture.** The test's job is of a kind whose recipes name `instruction`, so that the agent's input shows the
  task. Kinds a conversation may hand over that name no `instruction` recipe — `implement`, `fix-bug`, `write-tests` —
  are a question for akmaier in sprint team1/35's start decision. This item does not change them.

No existing test's expected result changes, release tests included:
- the tests of `POST /v1/jobs` (`tests/bridge-jobs-watch.test.mjs`, `tests/bridge-http-323.test.mjs`,
  `tests/bridge-job-task-491.test.mjs`) send no task, which stays optional;
- no existing record says `with the hand-over`.

## Acceptance

- A fixture hand-over with a task runs the fixture agent with that task; no file, log line or record the Bridge writes
  holds it — a counter-proof plants it in a log line and the test finds it.
- The same record found by the Bridge's own reading is not taken; without `task` the request is refused.
- The first commit holds only the tests, and CI is red on it. If it fails only because a function does not exist yet, the
  Developer runs it once locally against an uncommitted stub and lists the tests that fail on behaviour.
- Each test states its expected values in its own text (`A TEST DOES NOT TAKE ITS EXPECTED RESULT FROM A DOCUMENT`); an
  existing test that the change turns red is not changed here: the Developer stops and names it.
