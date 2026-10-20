---
id: ITM-1145
title: The desktop shell's Quit test waits for its agents, not for time
level: unit
realises:
  - A CANCELLED JOB WRITES NOTHING MORE
modules:
  - MOD-desktop-shell
builds_on:
  - ITM-1055
tests:
  - unit
origin:
  - CI of #1175, sprint team2/97, run 39336293773 on 946e7b0c (agreement 94)
---
# ITM-1145 The desktop shell's Quit test waits for its agents, not for time

**REGISTER**

## Outcome

`tests/mod-desktop-shell-quit-jobs.test.mjs`, "confirming Quit with two jobs running ends both records as cancelled"
(ITM-1055), failed in node (6), job 118346509651 of run 39336293773, on #1175's head `946e7b0c`, with `ERR_ASSERTION`
"waited for both agents to start". The rerun on the same commit passed. #1175 changes no file the test reads. A test that
flips on the same commit is flaky, and is fixed before either team works around it (agreement 94).

## Acceptance

- The cause is named in the pull request, as a data-flow path (AGENTS.md §2), with the run that showed it.
- The test waits for what it asserts, not for time. It passes 20 runs in a row under the CI's own concurrency, recorded in
  the pull request.
- Only the test, or the shell's code where the cause lies there, changes.
