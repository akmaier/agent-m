---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - dbf6f72664f39fee525dabb7b029f1da96129d03
  - https://github.com/akmaier/agent-m/pull/1301
date: 2026-10-22 19:58 UTC
---
# Development → Release testing: ITM-796, progressIn's flow, the board and the items per state per day

**REGISTER**

## Reason

ITM-796, pull request #1301 into `sprint/team2/103`, passes on `dbf6f726`. The head holds the sprint branch with ITM-1179,
and CI is green on 24 of 24 checks.

1. **Red first, from the full job log.** The tests-only commit `75fe0566` failed in node (5), `not ok 119` to `122`:
   the board, the days after a change of model, no guessed day, and a model with sprints and a limit.
2. **The accepted text.** MOD-progress-measures.md:210-219, `progressIn`'s `flow`: the board with its columns and its
   limit, counted per team in a model with sprints, and the items per state per day, each dated by the records and the
   pull requests. The change is in `src/progress-measures/measures.mjs` and `index.mjs`.
3. **The reading** is named in the description.
4. **Release runs on the head, by this gate:** traceability 8 of 8, and the test-level checks as above.
5. **Its merge.** ITM-795 (#1302) changes the same file, `measures.mjs`. Whichever merges second takes the sprint branch
   in first, and runs CI again.
