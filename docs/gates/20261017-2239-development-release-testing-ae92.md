---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - adaefceddcf8f8cd66b2429b94a81443d607e15f
  - https://github.com/akmaier/agent-m/pull/801
date: 2026-10-17 22:39 UTC
---
# Development → Release testing: ITM-758, the schedule page shows and edits the schedule

## Reason
ITM-758 (MOD-test-pages, route `schedule` up to Save), as narrowed in sprint 80 (UC-027 3b is ITM-850). The first commit
`7cae548b` holds only `tests/test-pages-schedule.test.mjs`, and CI run 39075021463 is red on it. CI is green on the head
(run 39075665262, on `sprint/team2/81`). The change is `src/test-pages/schedule.mjs`, `src/test-pages/index.mjs` and the
new test, whose header names the module. Five counter-proofs replay as recorded. The page shows the book's default marked,
a saved schedule, the refused cells with their reasons, the findings that keep Save from being offered, the runners among
the participants with *run code and tests*, and the secrets by name. The folds built in `schedule.mjs`, because
`explanations.md` holds no schedule topic, go to the sprint review as feedback.
