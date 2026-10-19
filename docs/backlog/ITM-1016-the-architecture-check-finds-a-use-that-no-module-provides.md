---
id: ITM-1016
title: The architecture check finds a use that no module provides
level: unit
realises:
  - DEVELOP AGAINST INTERFACES
modules:
  - MOD-trace-graph
builds_on:
tests:
  - unit
origin:
  - ITM-829's draft (sprint team1/93), measured by developer-sonnet-d
---
# ITM-1016 The architecture check finds a use that no module provides

**REGISTER**

## Outcome

A planted `uses:` line `MOD-site-frame.menuOfX`, which no module provides, passed `tests/architecture.test.mjs`,
`architecture-format.test.mjs`, `trace-graph-architecture-impact.test.mjs` and `test_architecture_files.py`.

**First task:** read which check owns a module's uses against the other modules' `provides`.

## Acceptance

- A module file whose `uses` names an interface that no module provides is a finding of the check, which names the file
  and the interface. A test shows it with the planted line, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
