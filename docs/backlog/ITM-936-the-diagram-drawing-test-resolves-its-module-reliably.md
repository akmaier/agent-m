---
id: ITM-936
title: The diagram drawing test resolves its module reliably
level: unit
realises:
  - UC-025
  - A TEST THAT FLIPS ON THE SAME COMMIT IS FLAKY
modules:
  - MOD-markdown-render
builds_on:
  - ITM-918
tests:
  - unit
origin:
  - team 2's findings for team 1 in team2/93.md (cade4b79), by po-opus-b
---
# ITM-936 The diagram drawing test resolves its module reliably

**REGISTER**

## Outcome

TST-918001 to TST-918003 (`tests/markdown-render-918-diagram-drawn.test.mjs`) failed once in CI on #904 with "Failed to
resolve module specifier '/src/markdown-render/index.mjs'" in Electron, and passed on the rerun. #904 changes only
`src/progress-measures/`.

**First task:** read the job's log and name why the page's import did not resolve: the test's server not yet serving, a
path resolved before the page's base, or a race in the page's load. No change comes before the cause is named.

## Acceptance

- The cause is removed, and a test shows that the page's import resolves only once the server answers, with a
  counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**Not built separately (sprint team1/91).** Its cause is a fault of `openWindow` in `tests/site-usability.d/browser.mjs`,
shared by every caller, and the fix belongs there once, in ITM-935. A second helper beside it would copy `openWindow` and
leave the fault in place. Pull request #909 is closed without merging. At ITM-935's gate, the 918 test is checked to resolve
its module under a held server answer. If it does, this item is done by ITM-935. If not, it is read again.

