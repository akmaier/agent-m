---
id: ITM-761
title: Run on this commit
level: module
realises:
  - UC-028
  - THE PAGE NAMES WHERE IT SENDS
  - ONE CLICK PER DECISION
  - A ROLE NAMES THE CAPABILITIES IT NEEDS
  - THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
modules:
  - MOD-test-pages
builds_on:
  - ITM-760
  - ITM-586
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-761 Run on this commit

**REGISTER**

## Outcome

*Run on this commit* on the route `runs/<commit>` (UC-028 steps 5 to 7, 5a, 5b):
- the levels without a record are preset;
- the participants that can run them are offered, through `eligible`;
- the run panel names where the run happens, which paid services it calls and which secrets it uses by name;
- **Run** queues one job of kind `run-tests` on the commit, on the server's CI or through a Bridge, and shows its
  progress through `liveState`;
- the view updates when the record arrives;
- a missing capability is named with a link to UC-017 (5a);
- without a token, the workflow's page on GitHub opens with the commit named (5b).

The view hands `resultStrategies` and `routeStrategies` to the frame.

## Acceptance

- With fake hosts and runtimes, the tests state:
  - the preset levels;
  - the run panel's destinations;
  - one queued job of kind `run-tests` per click, with the commit and the levels;
  - 5a and 5b.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/test-pages/` and the tests that name MOD-test-pages change.
