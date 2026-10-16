---
id: ITM-557
title: The desktop fixtures' Openbox install waits for the package lock
level: component
realises:
  - CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI
modules:
  - MOD-desktop-shell
builds_on:
  - ITM-541
  - ITM-543
tests:
  - component
origin:
  - the gate of #604 (docs/gates/20261016-1632-development-release-testing-c160.md): the first attempt of run 38932056495 failed TST-276001–006, its Openbox install timed out at 60 seconds (ETIMEDOUT); a re-run passed
---
# ITM-557 The desktop fixtures' Openbox install waits for the package lock

**REGISTER**

## Outcome

The two test files of MOD-desktop-shell that install Openbox, `tests/desktop-shell.test.mjs` (line 140) and
`tests/release-itm-276-desktop-shell.test.mjs` (line 145), ask apt to wait for the package lock. They do so as ITM-543
made the settings tests do: `-o DPkg::Lock::Timeout=50`, beside the existing `-o Acquire::Retries=3`, within the same
limit of 60 seconds.

**Why.** It is the third timeout of this install, and the first since ITM-541 gave it retries and 60 seconds. In the
same shard, other tests run `apt-get` too. #587's re-run found the lock held by another test's install, and that wait is
what ITM-543 cured for the settings tests. The settled reading is the same for these two files. Installing in the
workflow is still no change between jobs, as ITM-541 found, and a skip would leave the release test unseen.

No expected result changes. A failed install still fails the fixture, naming the install.

## Acceptance

- **Both installs wait for the lock.** They carry the lock wait and the retries, within 60 seconds.
- **Counter-proof.** A stand-in that holds the package lock for three seconds makes the install wait and go on with the
  option, and fail at once without it, as ITM-543's counter-proof did.
- **Release test.** TST-276901, a release test, records its local run before and after. It is changed by a developer who
  implemented none of MOD-desktop-shell.
- **No red commit.** None is required, since the item adds no behaviour.
