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

TST-276901 (`tests/release-itm-276-desktop-shell.test.mjs`) failed once in CI. Its fixture's `sudo apt-get install`
of Openbox, limited to 40 seconds, waited on the runner's mirror.

Settled: the fixture is mended where it stands, in MOD-desktop-shell's two test files that install Openbox
(`tests/desktop-shell.test.mjs` and `tests/release-itm-276-desktop-shell.test.mjs`).
- **Why not the workflow.** Installing a package in the workflow is no kind of change between jobs that `WHAT NO MODULE
  OWNS IS CHANGED BETWEEN JOBS` names: a workflow change only runs an entry a module's file names.
- **Why no skip.** Skipping on a failed install would leave the release test unseen.
- **What changes.** The install asks apt to retry a slow mirror (`-o Acquire::Retries=3`), with a limit of 60 seconds,
  within the job's two minutes. A failed install still fails the fixture, naming the install as now.

The same install in tests of other modules — `tests/dashboard-backlog-layout.test.mjs` and
`tests/release-itm-290-public-settings-layout.test.mjs` — is theirs, and is mended in the same way when one of them meets
the wait. No expected result changes.

## Acceptance

- The tests that need Openbox no longer fail on a slow mirror, and no expected result changes.
- They are changed by a Developer who implemented none of the desktop shell's behaviour, since one of them is a release
  test.
