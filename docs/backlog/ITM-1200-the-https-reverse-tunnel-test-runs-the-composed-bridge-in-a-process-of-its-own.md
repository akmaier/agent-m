---
id: ITM-1200
title: The HTTPS reverse-tunnel test runs the composed Bridge in a process of its own beside the dashboard
level: module
realises:
  - UC-003
  - UC-044
modules:
  - MOD-settings-pages
builds_on:
tests:
  - component
origin:
  - 567225b9, which moved TST-266001 and TST-266002 to a Bridge composed in a child process after ac9378ef; TST-294001 was left as it was
---
# ITM-1200 The HTTPS reverse-tunnel test runs the composed Bridge in a process of its own beside the dashboard

**REGISTER**

## Outcome

TST-294001 (`tests/component-itm-294-https-reverse-tunnel.test.mjs`, component; its header names MOD-settings-pages
first) writes one child program that imports both the dashboard harness (`openDashboard`, `tests/app-harness.mjs`) and
MOD-desktop-shell's `compose`, and runs both in that one process (`:84-144`).
- Since `ac9378ef` the live page registers every view's strategies at load. A Bridge composed in the same process
  registers its own in the same registry of the job runner.
- `567225b9` found that collision for TST-266001 and TST-266002: `DuplicateStrategy 'the recipes use-cases is registered
  by MOD-approvals and again by review-pages'`. MOD-job-runner "keeps the registry of strategies of the program it runs
  in", and the Bridge and the dashboard are two programs. Those tests now start `compose()` in a child process that
  answers with its address and token.
- TST-294001 runs only on the controlled Ubuntu job (`skip: !onControlledUbuntu`), so a local run does not show whether it
  meets the same collision.

**First task:** read TST-294001's latest CI run on `main` and name whether it fails with `DuplicateStrategy`. Where it
does not, the item stops and reports that run, since then nothing is to be built.

## Acceptance

- TST-294001 starts the real `compose()` in a process of its own, as TST-266001 and TST-266002 do since `567225b9`, and
  the dashboard in another.
- Only how the test prepares its fixture changes; every assertion and expected result stays as it is.
- The test passes on the controlled Ubuntu job.
