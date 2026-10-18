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

**Also its cause, found on ITM-936 (sprint team1/91, developer-sonnet-d).** `openWindow`
(`tests/site-usability.d/browser.mjs:149-171`) returns once `/json/list` shows a target whose url starts with
`http://127.0.0.1`, which can be the pending url. Electron's `loadURL` (`:98`) does not report when the navigation
commits, and `readyPage` waits only for `document.readyState` (`:54-57`). So the document can still be the initial
`about:blank`. Measured: with the server holding its answer 2500 ms, `openWindow` returned in 448 ms at `about:blank`
(probe `ITM-936-probe.mjs`). Every caller of `openWindow` shares this. ITM-935's first task checks whether its "/ is loaded"
flake is this race too.

## Acceptance

- `openWindow` returns only once the page has committed the address it opened (`location.href` is that address). A test
  with a server that holds its first answer shows it, with a counter-proof (returning on the target list alone).

- The cause is removed in the boot the two checks share, within the total wait. A test with a fake session reproduces the
  case and shows the page then drawn, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
