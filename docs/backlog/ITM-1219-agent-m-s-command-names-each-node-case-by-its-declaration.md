---
id: ITM-1219
title: Agent M's test command names each node case by its declaration
level: module
realises:
  - EVERY TEST RUN LEAVES A RESULT RECORD
  - UC-027
  - UC-028
modules:
  - MOD-test-schedule
builds_on:
  - ITM-1217
  - ITM-1218
tests:
  - unit
origin:
  - the first record of Agent M's generated CI (PR #1341, run 40287501150, test-results runs/6250c5c1…/20261026-0745-pull-request-75b0.md): 3,498 declared tests `not run`
---
# ITM-1219 Agent M's test command names each node case by its declaration

**REGISTER**

## Outcome

MOD-result-records matches a case by the `TST-<nnn>` at the start of its name (`src/result-records/junit.mjs:102`). Node's
JUnit reporter names a case by its test's title alone; Agent M's command (`tests/test-schedule-command.mjs`) passes the node
part of the report through unchanged and renames Python cases only (ITM-1218). In the first record of the generated CI,
3,094 node tests whose case ran under its bare title read `undeclared`, and their declarations `not run`. Example:
TST-472001, `tests/approvals-accept.test.mjs:164`, case `acceptShown — two use cases shown …` in
`pull-request.unit.5.xml`.

The command names each node case `TST-<nnn> <title>` where the declaration before its test names one, as for Python:

- a title written as a template literal matches its case as a pattern (19 tests, e.g. TST-483506 in
  `tests/mail-routes-bridge-draft.test.mjs:177`);
- the cases of a test with subtests, which node's reporter writes as a `<testsuite>` named by the test, take the suite's
  `TST-<nnn>` (7 tests, e.g. TST-398017 in `tests/agent-processes-321.test.mjs:162`).

## Acceptance

- Unit tests naming MOD-test-schedule over fixture node test files: a declared test, a declared test with a template
  title in a loop, a declared test with subtests, and an undeclared test; `parseOutcomes` reads the declared ones
  `passed` or `failed`, not `undeclared`, and the undeclared one by its title. Counter-proof: without the change each
  declared one is `not run`.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only Agent M's command under `tests/` and the tests that name MOD-test-schedule change.
