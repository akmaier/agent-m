---
id: ITM-986
title: The facts of a sprint — its increment, what is not done, and its numbers
level: module
realises:
  - UC-041
  - A SPRINT ENDS WITH A REVIEW OF ITS INCREMENT
  - A SPRINT ENDS WITH A RETROSPECTIVE
  - PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
modules:
  - MOD-work-plans
builds_on:
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-041-1, verified against the accepted texts on main at ee5d1364
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-986 The facts of a sprint — its increment, what is not done, and its numbers

**REGISTER**

## Outcome

MOD-work-plans.md:173-178 states `sprintFacts(sprint, facts: { states, jobs, results, pullRequests, issues })` —
"the sprint's increment, what is not done and why, and the numbers of the sprint, each derived; `results` is the branch
`test-results`; a cost only where a job's row has one (`NO COST IS GUESSED`)". UC-041 step 2 (UC-041.md:66-70) shows "the
items that are done — merged, with their Definition of Done met — each with its pull request, the requirements it realises
and the tests that guard them", and step 5 (UC-041.md:82-83) "the numbers of the sprint: jobs failed or retried, time items
waited for a person, flaky tests, cost where known — derived, not typed".

`sprintFacts` is not built: `src/work-plans/index.mjs:6`. It is pure; its caller reads the inputs. The flaky tests come from
MOD-result-records' `flakyTests` (`src/result-records/read.mjs:144`, built). `closeSprint` already takes its output as
`context.facts` (`src/work-plans/saves.mjs:203`).

## Acceptance

- Unit tests that name MOD-work-plans, with fixture item states, job rows, a `test-results` snapshot and pull requests:
  - the increment holds exactly the items whose pull request is merged, each with that pull request, what it realises and
    its tests;
  - every selected item not done is in `notDone` with its state and reason;
  - `failedJobs`, `retriedJobs`, `correctionRounds`, `waitingAtGates`, `waitingForAPerson`, `flakyTests` are counted from
    the inputs; `cost` is "unknown" when no job row has a cost, never zero.
- Counter-proof: an item with an open pull request counted as done fails the increment test.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/work-plans/` and the tests that name MOD-work-plans change.
