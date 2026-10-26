---
id: ITM-1221
title: Agent M's test command matches a node case only to its own file's declarations
level: module
realises:
  - EVERY TEST RUN LEAVES A RESULT RECORD
  - UC-027
  - UC-028
modules:
  - MOD-test-schedule
builds_on:
  - ITM-1219
tests:
  - unit
origin:
  - the record of Agent M's generated CI on 2d253004 (run 40290040279, test-results runs/2d253004…/20261026-0809-pull-request-3a1d.md): 373 declared tests `not run`, about 330 of them lost in the command
---
# ITM-1221 Agent M's test command matches a node case only to its own file's declarations

**REGISTER**

## Outcome

In the record of run 40290040279, Agent M's command (`tests/test-schedule-command.mjs`) still gives about 330 declared node
tests no case of their own:

- **A case is matched against every declaration of its shard.** Node 22's JUnit reporter, the release the generated
  configuration provides, writes no `file` attribute, so the command falls back to all declarations of the shard
  (`:93`). A declaration whose title is a bare template (`${id}`) matches every name (`:78`), and takes the case: in shard
  2 of the unit row, the subtests `claude`, `codex`, `opencode` of TST-398017 (`tests/agent-processes-321.test.mjs:162`) are
  renamed `TST-584001 …`, after a fixture in `tests/job-runner-check-fixes.test.mjs:195–200`. About 184 tests, among them
  TST-398017/018/019 and TST-472318.
- **A name holding `>` is not read.** Node escapes `<` but not `>` in an attribute, and the tag pattern
  `<testcase\b[^>]*>` (`:86`) ends inside the value, so `name` reads `null` and the case keeps its title. 113 tests, e.g.
  TST-472106 (`bridge:<name> — …`).
- **A name that starts with a number the file does not declare is kept.** `TST-262-001: …` stays as it is (`:91`) and
  parseOutcomes reads `TST-262`; about 39 tests, e.g. TST-472089, TST-477005, TST-478001.

The command matches a node case only against the declarations of the file it ran in; a title that is a template alone
matches no case; the cases of a test with subtests take the enclosing suite's declared `TST-<nnn>` before any title
pattern; tags are read with their quoted values whole; and a name keeps its leading `TST-<nnn>` only when that is a
declaration of its file, otherwise it is named by its declaration. How the command knows a case's file is the command's.

## Acceptance

- Unit tests naming MOD-test-schedule, over fixture node files in one shard run with the Node.js release the generated
  configuration provides: a file with a `${id}` declaration beside a file with a declared test with subtests; a declared
  title holding `<name>`; a declared test whose title starts with an undeclared `TST-262-001`. `parseOutcomes` reads each
  declared test by its own id. Counter-proof: before the change each is `not run`.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only Agent M's command under `tests/` and the tests that name MOD-test-schedule change.
