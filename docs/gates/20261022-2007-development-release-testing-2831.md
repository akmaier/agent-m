---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 8c8d5cf3312c9109f864b656d7ab32b951e6f10a
  - https://github.com/akmaier/agent-m/pull/1300
date: 2026-10-22 20:07 UTC
---
# Development → Release testing: ITM-1161, blocked names an item held through a module it uses

**REGISTER**

## Reason

ITM-1161, pull request #1300 into `sprint/team2/103`, passes on `8c8d5cf3`. The head merges the sprint branch with #1302
and #1303 (`bba81f04`). Run 39844872949 is green on 24 of 24 checks, `apt-archives` included (14 s); the slowest shard
is node (4), 92 s, within the job's two minutes (SPEC.md:1533-1535).

1. **Red first, from the full job log.** The tests-only commit `1b16c198` failed in node (8), `not ok 94` and `99`,
   `productFacts`' scope `work` and `modules` (sprint record `docs/backlog/sprints/team2/103.md`, "Before the gates").
2. **TST-919001 passed on this run.** Its failure on the earlier head (job 120052173255,
   `tests/dashboard-backlog-layout.test.mjs:264`) was the chart-resize wait, not this item's; the backlog page does not
   call `blocked`.
3. **The reading** was named in the description of the first push (16:19 UTC): AGENTS.md §2 "Nothing twice", SPEC.md
   SPRINTS OF DIFFERENT TEAMS CHANGE NO MODULE THE OTHER CHANGES OR USES, book chapters 9, 11, 12 and 13, and
   MOD-progress-measures.md at blob `590997b7` with its record `docs/approvals/MOD-progress-measures-590997b78a30.md`.
   - **The description now holds ITM-795's text.** An edit at 16:23 UTC replaced it with #1302's description. The 16:19
     version is in the pull request's edit history. It should be put back before the merge, so that the pull request
     describes its own item.
4. **Scope.** `src/progress-measures/facts.mjs` and `overviews.mjs`, and two test files of the module; `heldBy` goes and
   `conflicts` of MOD-work-plans is used (AGENTS.md §2, principle 2). The declared level `unit` is delivered.
5. **Release runs on the head, by this gate:**
   - traceability 8 of 8;
   - test levels and expected results: 7 pass and 1 fails,
     `test_the_tests_of_the_repository_that_read_a_document_are_listed`, which fails the same way on `main` on this
     machine.
