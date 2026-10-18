---
id: ITM-935
title: The accessibility check loads its first route reliably
level: unit
realises:
  - THE SITE SERVES A SCREEN READER
  - A TEST THAT FLIPS ON THE SAME COMMIT IS FLAKY
  - A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
modules:
  - MOD-site-frame
builds_on:
  - ITM-930
tests:
  - unit
origin:
  - team 2's findings for team 1 in team2/93.md (cade4b79), by po-opus-b
---
# ITM-935 The accessibility check loads its first route reliably

**REGISTER**

## Outcome

TST-905001 to TST-905010 (`tests/site-accessibility.test.mjs`) failed once in CI with "/ is loaded did not hold within 30
s", on #895 (sprint team2/92) and on #905 (sprint team2/93). Both passed on a rerun, and neither pull request touches what
the check loads. #905 was opened after ITM-930's resends reached `main`, so they did not cover this case.

**First task:** read both jobs' logs and name what the wait for "/ is loaded" saw: a navigation that never committed, a page
that loaded and was not recognised, or a slow staging. No change comes before the cause is named.

## Acceptance

- The cause is removed in the boot the two checks share, within the total wait. A test with a fake session reproduces the
  case and shows the page then drawn, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
