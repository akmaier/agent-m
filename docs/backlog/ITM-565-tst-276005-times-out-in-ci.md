---
id: ITM-565
title: TST-276005 times out in CI
level: component
realises:
  - CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI
modules:
  - MOD-desktop-shell
builds_on:
  - ITM-557
tests:
  - component
origin:
  - the gate of #616 (docs/gates/20261016-1837-development-release-testing-6fd3.md): run 38948062308's first attempt failed TST-276005 by its own timeout of 120 seconds; a re-run passed
---
# ITM-565 TST-276005 times out in CI

**REGISTER**

## Outcome

TST-276005 (`tests/desktop-shell.test.mjs`, "native close behavior and a second source start restore the first window")
timed out after 120 seconds in CI, then passed on a re-run, in a pull request that touched neither the desktop shell nor
its tests. ITM-541 and ITM-557 made its Openbox install wait for a slow mirror and for the package lock. This is a new
mode: the test itself ran out of time.

**The failing log.** The Scrum Master's copy of job 117132128493's log was fetched at 18:35 UTC, before the re-run. The
logs endpoint now gives the second attempt's content for that id. The copy shows:
- `not ok 92 - TST-276005` (line 777), finished at 18:34:28.97, with `failureType: 'testTimeoutFailure'` and `test timed
  out after 120000ms` (lines 782–783);
- `The operation was canceled.` at 18:34:44.93 (line 786).

So the test itself ran out of its 120 seconds, not the Openbox install.

**Not ready for a sprint yet.** Before it is selected, the job's log is read for where the 120 seconds went: the
install, the Electron start, or the second start's wait. The measure follows from that, as ITM-541 and ITM-543 did. It
is never a skip, which would leave the test unseen.

## Acceptance

- The cause is named from the log, with the place the time went.
- The measure keeps every expected result. A counter-proof shows that the test still fails where the behaviour breaks.
