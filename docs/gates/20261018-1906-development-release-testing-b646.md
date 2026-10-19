---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 038a02c7a48b17b35ac8a8a67566a84f74b6a157
  - https://github.com/akmaier/agent-m/pull/926
date: 2026-10-18 19:06 UTC
---
# Development → Release testing: ITM-646, rejected — the check's tests share a file with another concern

**REGISTER**

## Reason

ITM-646 (MOD-site-frame), pull request #926 into `sprint/team1/92`, is rejected on `038a02c7`, for the place of its tests
only.

**What holds.**
- The participant trailer is on all four commits: `developer-sonnet-d`.
- The red is `33be8d05`: run 39156226325 fails TST-646004.
- The topic `source-selection` and the line in `src/site-frame/index.mjs:5` are MOD-site-frame's.
- The check (`tests/site-frame-topics.mjs`) is test code, as ruled in 92.md. Its counter-proof is reported: with the topic
  removed, TST-646004 fails, naming `src/review-pages/kinds.mjs`.
- CI run 39156893324 passes all twenty jobs. `git merge-tree --write-tree` merges the head into `sprint/team1/92` without
  a conflict (tree `67f3cc9e`).

**What fails: TST-646001 to 646004 stand in `tests/site-frame-book-pointers.test.mjs`.**
- That file's header (`:1-16`) gives it one concern: each of UC-002's choices points to a chapter of the book. Its name
  says the same.
- The topic check is another concern: every topic a view names is held by `explanations.md`. Both read the same data
  file, but that does not make them one concern. The header names nothing of the check.
- AGENTS.md §2, principle 1: "Two concerns never share a file." This is the stopgap that 92.md declined for ITM-641 on
  the same day.
- The file was chosen because a new test file shifts the sorted list, and TST-945005 then fails. That is ITM-958's
  defect, and it is not answered by moving tests into another file.

**What passes the gate on the next head:**
- TST-646001 to 646004 stand in a test file of their own, beside `tests/site-frame-topics.mjs`.
- That file adds a name to the sorted list, so #926 waits for ITM-958, as #927 does. It is otherwise built and waits
  unmerged.
