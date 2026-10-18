---
id: ITM-949
title: The hand-over test removes its folder only after every process it started has ended
level: unit
realises:
  - A TEST THAT FLIPS ON THE SAME COMMIT IS FLAKY
modules:
  - MOD-workflow-entries
builds_on:
tests:
  - unit
origin:
  - ITM-948's pull request #920 (sprint team1/91), run 39151670142, node (5) attempt 1, job 117746414703, found by scrum-master-opus
---
# ITM-949 The hand-over test removes its folder only after every process it started has ended

**REGISTER**

## Outcome

**Measured on #920 (`b1135e0e`).** TST-498005 (`tests/workflow-entries-hand-over.test.mjs:365`) failed once with
"ENOTEMPTY: directory not empty, rmdir /tmp/agent-m-ITM-498-…/product.git". The error came from the test's own cleanup,
`rmSync(root, { recursive: true, force: true })` (`:255`). The rerun passed, and #920 does not touch the file.

The same kind of failure has had a measured cause twice before:
- ITM-653: a process the test started was still writing after the test returned.
- ITM-690's note: git was still writing pack files.

A retry in the cleanup would hide that cause.

**First task:** name which process still writes into `root` when the cleanup runs, from the test's own steps. No change
comes before the cause is named.

## Acceptance

- The test waits for every process it starts before it removes `root`, and needs no retry in its cleanup. A scratch copy
  of the test checks that nothing writes into `root` after the test has returned, with a counter-proof that drops the wait.
- The first commit holds only the tests. No stub is committed.
