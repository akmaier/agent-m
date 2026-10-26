---
id: ITM-1215
title: A test job runs its row's share of the tests without the token (runTests)
level: module
realises:
  - THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE
  - A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET
  - UC-027
modules:
  - MOD-workflow-entries
builds_on:
  - ITM-1213
tests:
  - unit
origin:
  - ITM-476, split after akmaier accepted MOD-workflow-entries on 2026-10-26 (33f3ab1b)
---
# ITM-1215 A test job runs its row's share of the tests without the token (runTests)

**REGISTER**

## Outcome

MOD-workflow-entries' entry `runTests` (MOD-workflow-entries.md, Interfaces), with *The reports of a run*: the files of
`AGENT_M_ROW` among the commit's committed files, read through Access's local clone, as `testsOfRow` names them; then
`AGENT_M_COMMAND`, or node's test runner with its own sharding and JUnit reporter where it is empty, run with those files
and the job's variables, writing `agent-m-reports/<occasion>.<row>.<shard>.xml` and `.status`.

Before anything runs it checks each secret `AGENT_M_SECRETS` names is set, reading no value; one not set ends `not run`
with the status `not run: secret missing: <name>`. It ends `done` on exit 0, `failed` otherwise naming the status,
`nothing to do` for a row without a file (no report), and `failed` before running when a named test file's level cannot
be read, naming each. The command's output goes to the log as it comes. It reads no token and writes nothing to a
repository.

## Acceptance

- Unit tests naming MOD-workflow-entries over a fixture checkout and a fake command: the files handed to the command
  are `testsOfRow`'s; the variables reach it, `AGENT_M_REPORT` among them; each outcome writes its status line; a
  missing secret ends `not run` and the command never runs; an unreadable level ends `failed` naming the file; node's
  test runner is used with its shard flag when the command is empty; no token variable is read.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/workflow-entries/` and the tests that name MOD-workflow-entries change.
