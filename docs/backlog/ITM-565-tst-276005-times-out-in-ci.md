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

**Where the 120 seconds went**, read by the Scrum Master from that copy:
- **Not the install.** The Openbox install ended at 18:32:24.11 (status 0), and the fixture was ready at 18:32:24.12.
- **The other tests were quick.** TST-276001–004 and TST-276006 passed in about a second each.
- **TST-276005 stalled.** Its probes ran at 18:32:28.98, 18:32:29.60 and 18:32:30.02–30.03, the last being the second
  start's probe. Then the log holds nothing for 118.9 seconds, until `not ok 92` at 18:34:28.97.

**Why a wait can take minutes and say nothing**, read from `tests/desktop-shell.test.mjs`:
- `wait` (line 26) tries its condition 240 times, 125 ms apart, and swallows every error (`catch {}`). It ends with
  "Timed out waiting for real Electron." and does not say what it waited for.
- Each try is an `evaluate` through `cdp` (lines 160–173), which allows up to 5 seconds to open the socket and 5 more for
  the answer.
- So a main process that stops answering makes each try take up to 10 seconds. The intended bound of about 30 seconds
  becomes up to 40 minutes, and the test's own 120 seconds end it first, with nothing printed.

After the second start, the test waits in turn for:
- `__agentMSecondInstanceCount === count + 1`;
- the second start's exit (`within`, 5 seconds, named);
- the first window visible and not minimised.

One of these never held, and the log cannot say which.

**The settled measure.** It finds where the time goes; it is not a skip:
- **`wait` gets a deadline in time.** It allows 30 seconds from its start, whatever each try takes.
- **It names what it waited for.** It takes a name for its condition. On the deadline it throws "<name> did not hold
  within 30 s", with the last error a try threw.
- **Each wait in TST-276005 gets its name.** For example, "the first window counts the second start", or "the first
  window is visible and not minimised again".
- **One helper.** `tests/release-itm-276-desktop-shell.test.mjs` (line 31) holds the same `wait`, so the helper moves into
  one file both import, `tests/desktop-shell.d/wait.mjs`, whose header names MOD-desktop-shell (AGENTS.md §2, "Nothing
  twice").

The next time the test fails in CI, its message then names the condition that did not hold. If the product itself never
restores the window, that becomes a finding of MOD-desktop-shell for an item of its own.

**Existing tests.** No expected result changes; only the helper's bound and message change. The release test's file
changes, so its developer implements none of MOD-desktop-shell and records its local run before and after.

## Acceptance

- **The bound holds.** A planted condition that never holds makes `wait` throw within 30 seconds, naming the condition
  and the last error. Its message is checked by a test of the helper.
- **The test is unchanged.** TST-276005 passes as before, with every expected value unchanged.
- **The release test.** TST-276901's file passes before and after, and its run is recorded.
