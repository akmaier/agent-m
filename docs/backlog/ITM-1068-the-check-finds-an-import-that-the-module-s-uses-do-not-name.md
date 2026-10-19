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
