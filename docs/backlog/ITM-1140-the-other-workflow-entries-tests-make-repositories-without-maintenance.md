---
id: ITM-1140
title: The other workflow-entries tests make their repositories without git maintenance
level: module
realises:
  - A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
modules:
  - MOD-workflow-entries
builds_on:
  - ITM-1084
tests:
  - unit
origin:
  - developer-sonnet-g's ITM-1084 (pull request #1165, head 2dd1ccb8)
---
# ITM-1140 The other workflow-entries tests make their repositories without git maintenance

**REGISTER**

## Outcome

ITM-1084 found the cause of `ENOTEMPTY` when a test removes its temporary repositories. A push, a commit or a fetch starts
`git maintenance run --auto --detach`, whose child goes on writing into the repository after the command returns.
ITM-1084 switched maintenance off in the two tests that failed. The same helper pattern, `repository()` followed by
`rmSync(root…)`, stands in `tests/workflow-entries-design-kinds.test.mjs`, `-check-completed`, `-job-workflow` and
`-resume-gate`. They have not failed yet, but they have the same writer. They make their repositories as ITM-1084's
helpers do.

## Acceptance

- Run with `GIT_TRACE2_EVENT`, the four files start no `git maintenance` process. The known positive is the count on the
  base, which is above zero.
- It is declared as refactoring: no expected result changes, and CI is green on every commit.
