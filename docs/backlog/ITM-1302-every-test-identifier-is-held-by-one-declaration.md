---
id: ITM-1302
title: Every test identifier is held by one declaration
level: module
realises:
  - EVERY ARTIFACT HAS AN IDENTIFIER
modules:
  - MOD-agent-processes
  - MOD-site-frame
  - MOD-endpoint-calls
  - MOD-identifiers
  - MOD-implementation-pages
  - MOD-prompt-bar
  - MOD-job-ledger
  - MOD-runtimes
  - MOD-job-runner
  - MOD-mail-handling
  - MOD-repository-hosts
  - MOD-spec-document
  - MOD-trace-graph
  - MOD-spec-changes
builds_on:
  - ITM-1297
tests:
  - unit
origin:
  - po-opus-c's gate of ITM-1297 (PR #1413), docs/gates/20261029-0722-development-release-testing-e535.md
---
# ITM-1302 Every test identifier is held by one declaration

**REGISTER**

## Outcome

MOD-test-document's reader, over every test file under `tests/` (fixtures left out), finds 16 identifiers that two
declarations hold:
- TST-1225001 and 1225002: `agent-processes-prompt-delivery`, `site-frame-test-topics`;
- TST-1206001: `endpoint-tool-loop`, `site-frame-tests-menu`;
- TST-472244: `identifiers-kind`, `identifiers-next`;
- TST-1300005: `implementation-pages-plan-stored-graph`, `prompt-bar-spawn-reads`;
- TST-472718: `job-ledger-append`, `runtimes-tab`;
- TST-472335: twice in `job-runner-prepare`;
- TST-1110001 and 1110002: `mail-handling-release`, `repository-hosts-pull-requests`;
- TST-1201001: `prompt-bar-offer`, `test_requirement_fields.py`;
- TST-1300001 to 1300003: `prompt-bar-spawn-reads`, `trace-graph-latest`;
- TST-1300004: `prompt-bar-spawn-reads`, `trace-graph-publish`;
- TST-472541: `repository-hosts-file-pages`, `repository-hosts-history`;
- TST-677005: `spec-changes-accept-batched`, `spec-changes-queues-batched`.

EVERY ARTIFACT HAS AN IDENTIFIER gives each artifact one of its own (SPEC.md:52-54). In each pair, the declaration added
later, by the version history, takes a new identifier that no current file and no history holds (THE NAME IS THE ID AND IT
SURVIVES). The earlier one keeps its own.

## Acceptance

- Over every test file under `tests/`, the reader finds no identifier held by two declarations. The pull request names the
  run, and a known positive: a planted second declaration of one identifier is found.
- Each renumbered declaration is named in the pull request, with its old and new identifier and the commit that added it.
- Only the declarations' first lines change, and no expected result. CI is green on every commit (refactoring).
- Tests of other modules this Outcome changes: only the test files listed above, each named by one of the item's modules.
