---
id: ITM-1068
title: The check finds an import that the module's uses do not name
level: component
realises:
  - DEVELOP AGAINST INTERFACES
modules:
  - MOD-trace-graph
builds_on:
  - ITM-1016
  - ITM-1112
  - ITM-1113
  - ITM-1114
  - ITM-1115
  - ITM-1116
  - ITM-1141
tests:
  - component
origin:
  - ITM-863's stop (sprint team1/93), from developer-sonnet-a's finding
---
# ITM-1068 The check finds an import that the module's uses do not name

**REGISTER**

## Outcome

`src/home/home.mjs:24`, a file of MOD-main-page, imports `watchForAcceptance` from `../notifications/index.mjs`. MOD-main-page's
uses do not name MOD-notifications. ITM-1016's check compares a module file's uses with the other modules' `provides`. It
does not compare a module's code imports with its uses, so it does not see this.

**First task:** read whether MOD-trace-graph's graph holds the code files' imports (ITM-735), and name the edge the
check would compare against the module's uses.

## Acceptance

- A code file that imports another module's interface that its module's uses do not name is a finding, which names the
  file, the import and the module. A test shows it with a fixture, with a counter-proof. On this repository the findings
  are listed, and each is fixed or drafted.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

## Not ready: a draft for akmaier (developer-sonnet-g's stop, 2026-10-19)

- The graph already holds code nodes and their `imports` edges (ITM-735; MOD-trace-graph.md:97-118, :144-157).
- `graphFindings`' list (MOD-trace-graph.md:183-196) has no check of a code file's import against its module's uses.
- SPEC.md:1226-1228, DEVELOP AGAINST INTERFACES, says of its check "no automatic check; at review".
- So the check needs a draft of MOD-trace-graph, and the SPEC's *Check* line is akmaier's to change. Both go to akmaier
  together.

g's read-only probe found the imports that their module's uses do not name, on the sprint branch. On `main` they are:
- **Missing uses, each an item with a draft:**
  - ITM-1112, MOD-job-ledger: `parseFinding`;
  - ITM-1113, MOD-mail-routes: `instanceOfPagesAddress`, `pagesAddress`;
  - ITM-1114, MOD-test-pages: `blobSha`.
- **A second way to a driver, to read first:** ITM-1115, MOD-review-pages' `endpointDriver`.
- **The old app's own registry:** ITM-1116, `dashboard-app.mjs`, the page views.
- **Already named on `main`:** MOD-work-plans' `isTestFile` and `testDeclarations`, which `3baeb13a` added. The probe read the
  sprint branch's older text.
- **Not found:** the item's own example, `home.mjs:24` → MOD-notifications. It is read again when the check is built.

**Draft `cc802cf0` for akmaier (po-opus-b, 2026-10-19).** `graphFindings` gains the import as an error. Once it is
accepted, the item builds it, with these additions to its acceptance:
- A test over this repository's own files fails a pull request that adds an import its module's uses do not name, as
  `tests/test_coverage_report.py` does for `EVERY CODE FILE BELONGS TO A MODULE`.
- Both `graphFindings` and `moduleRows` decide it by one function.
- It builds on ITM-1112 to ITM-1116 and ITM-1141, so that main holds none before the error exists.

