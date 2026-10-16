---
id: ITM-543
title: A test's apt install waits for the package lock
level: system
realises:
  - UC-044
modules:
  - MOD-settings-pages
builds_on:
  - ITM-541
tests:
  - release
origin:
  - the end gates of #587 (sprint team1/44): TST-290115 failed once in CI — "Could not get lock /var/lib/dpkg/lock-frontend. It is held by process … (apt-get)" — while another test of the same shard installed with apt
---
# ITM-543 A test's apt install waits for the package lock

**REGISTER**

## Outcome

Two test files of MOD-settings-pages install system packages with `apt-get` while other tests of the same CI shard may
install too: TST-290115 (`tests/release-itm-290-public-settings-layout.test.mjs`, its declaration names MOD-settings-pages)
and TST-294001 (`tests/component-itm-294-https-reverse-tunnel.test.mjs`, whose header names MOD-settings-pages among its
modules). When the package lock is held, the install fails at once. The desktop shell's fixtures wait for the lock, but
these do not.

What is built, settled as ITM-541 settled the desktop shell's install:
- Each of those `apt-get` calls asks apt to wait for the package lock and to retry a slow mirror:
  `-o DPkg::Lock::Timeout=50 -o Acquire::Retries=3`.
- The install's `spawnSync` limit is raised to 60 seconds, within the test's and the job's limits.
- A failed install still fails the test, naming the install as it does now.
- No workflow changes, nothing is skipped, and no expected result changes.

Left out, named: `tests/dashboard-backlog-layout.test.mjs` installs Openbox the same way. Its header names
MOD-dashboard-app, which is no module of the accepted architecture, so no item may change it. Moving it to the module
that now holds what it tests is a change between jobs, for when it meets the lock.

## Acceptance

- The three `apt-get` calls carry `DPkg::Lock::Timeout=50` and `Acquire::Retries=3`, and the limit of 60 seconds.
- Counter-proof: a planted install of a package that does not exist still fails the test, naming the install.
- They are changed by a Developer who implemented none of MOD-settings-pages' behaviour, since TST-290115 is a release
  test. That test's local run is recorded before and after.
