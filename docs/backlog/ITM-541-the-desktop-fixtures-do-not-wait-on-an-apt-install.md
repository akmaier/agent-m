---
id: ITM-541
title: The desktop fixtures do not wait on an apt install
level: system
realises:
  - THE BRIDGE RUNS AS AN APP
modules:
  - MOD-desktop-shell
builds_on:
tests:
  - release
origin:
  - the end gates of #584 (sprint team1/43): TST-276901 failed once in CI, because the fixture's apt install of Openbox timed out after 40 seconds
---
# ITM-541 The desktop fixtures do not wait on an apt install

**REGISTER**

## Outcome

TST-276901 (`tests/release-itm-276-desktop-shell.test.mjs`) failed once in CI. Its fixture installs Openbox with
`sudo apt-get install` inside the test, with a limit of 40 seconds, and the runner's mirror did not answer in time. The
same install stands in `tests/desktop-shell.test.mjs`, `tests/dashboard-backlog-layout.test.mjs` and
`tests/release-itm-290-public-settings-layout.test.mjs`, and `tests/component-itm-294-https-reverse-tunnel.test.mjs`
installs packages the same way. So any pull request's CI may meet the same wait.

The start decision that selects this item settles, from the texts, where a package a test needs is installed. One reading
is that it is installed once per job, before the tests, by the workflow; another, a shared fixture that installs it once
and tells "could not install" apart from a failure of the behaviour under test. It names what each reading changes —
a workflow file is changed between jobs (`WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS`) —, and keeps every expected
result of those tests.

## Acceptance

- The tests that need Openbox no longer fail on a slow mirror, and no expected result changes.
- They are changed by a Developer who implemented none of the desktop shell's behaviour, since one of them is a release
  test.
