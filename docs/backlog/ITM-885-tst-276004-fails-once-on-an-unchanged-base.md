---
id: ITM-885
title: TST-276004 fails once on a base where it passes
level: module
realises:
  - UC-044
  - THE BRIDGE RUNS AS AN APP
modules:
  - MOD-desktop-shell
builds_on:
tests:
  - unit
origin:
  - scrum-master-opus's reading of ITM-874's red run 39102909575 (sprint team1/87)
---
# ITM-885 TST-276004 fails once on a base where it passes

**REGISTER**

## Outcome

TST-276004, "an unwritable private folder is shown without starting a server" (`tests/desktop-shell.test.mjs:307`),
failed in node (7) of run 39102909575 on #845. That pull request changes no file the test loads. The same test passed on
the same base in run 39102882645 (#844) and in run 39099950249 (#840). This is a lead, not a finding: the cause is not
read yet.

The item reads the failing job's log for the assertion that failed and the time the test took against its 120-second
timeout. It names the cause before any change. If the cause is the runner and not the test, the item stops and reports
it.

## Acceptance

- The cause of the one failure is named from its log. Where the cause is in the tests, it is removed, and a deterministic
  test shows that it cannot recur, with a counter-proof. Where it is the runner, the item stops with the cause.
