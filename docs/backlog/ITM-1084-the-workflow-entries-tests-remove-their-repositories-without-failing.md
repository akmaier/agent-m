---
id: ITM-1084
title: The workflow-entries tests remove their repositories without failing
level: module
realises:
  - AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST
modules:
  - MOD-workflow-entries
builds_on:
tests:
  - unit
origin:
  - the gates of ITM-731 (#1076, run 39261476237) and ITM-674 (#1086, run 39268185188), sprint team1/95 and 96
---
# ITM-1084 The workflow-entries tests remove their repositories without failing

**REGISTER**

## Outcome

Two runs failed a workflow-entries test on a pull request that touches none of it. Each test passed on the next run.
- `tests/workflow-entries-gitlab-547.test.mjs:248` (`onDispatch — on GitLab …`), run 39261476237:
  `ENOTEMPTY: directory not empty, rmdir '/tmp/agent-m-gitlab-…/product.git'`.
- `tests/workflow-entries-hand-over.test.mjs:676` (TST-538006), run 39268185188:
  `ENOTEMPTY: directory not empty, rmdir '/tmp/agent-m-ITM-498-…/product.git/objects'`.

Both fail in `rmSync(root, { recursive: true, force: true })` (`workflow-entries-hand-over.test.mjs:255`,
`workflow-entries-gitlab-547.test.mjs:163`, `:218`): something still writes into the temporary repository while it is
removed. A red that no change caused makes a pull request's red unreadable.

**First task:** find what still writes there when the removal runs, for example a git process not awaited.

## Acceptance

- The tests remove their temporary repositories only once nothing writes there, and the removal fails no test. The pull
  request names the writer it found.
- It is declared as refactoring: no expected result changes, and CI is green on every commit.
