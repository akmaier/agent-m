# 13. Process execution and jobs: teams run sprints of their own, planned against what the others hold

**The change.** `NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT` counts a team's items in progress, `A TIME BOX WORKS ONLY ON
WHAT WAS SELECTED FOR IT` reads the team's current sprint, and `A JOB GOES ONLY TO A HOLDER OF ITS ROLE` the job's team's
assignment. They keep their names and checks; each check gains a counter-proof with two teams. Ten new requirements:
every team runs sprints of its own, on a branch no other team's sprint uses; a sprint holds its items until their change
is merged into the default branch or they return to the backlog; an item is held by at most one sprint; a sprint changes
no module that another team's sprint changes or uses, and uses none that one changes; a job starts only from a branch
into which everything its item builds on is merged; sprint planning lists what the other teams' sprints hold; a team's
gates are decided within the team.

**Why.** PO, 2026-10-10: teams "have to inspect running sprints in their sprint planning and have to select their backlog
items in a way that they will not produce conflicts." The SPEC already gives the unit of conflict: every item names the
modules it changes (`A BACKLOG ITEM NAMES THE MODULES IT CHANGES`), a job changes only those (`AN IMPLEMENTATION JOB
CHANGES ONLY ITS MODULES`), and a module's file names the interfaces it uses (`A MODULE STATES ITS RESPONSIBILITY AND ITS
INTERFACES`). So a conflict is decided from the repository when a sprint is planned, before any job starts, instead of
at a rebase (UC-034, 6b).

An item is held until its change is in the default branch, not only while its sprint runs: a done item on a sprint branch
whose increment is not merged is code that the default branch, from which other teams branch, does not have. For the
same reason a job starts only where what its item builds on is merged — the module rules ensure it wherever an item's
modules use what it builds on, and this rule covers every other case.

**Decisions of the PO, 2026-10-10:** the unit that must not overlap is the modules plus the interfaces they use, not
modules alone and not subsystems. Sprints are kept per team — `docs/backlog/sprints/<team>/<nn>.md` and the branch
`sprint/<team>/<nn>` stand in UC-032 and UC-002, the SPEC holds only that no two teams share a sprint branch; the sprint
records kept so far stay where they are. The backlog keeps no stored order: "why do we need a backlog order at all. It's decided in
the sprint locally anyway." No requirement of the SPEC names that order; what must come first follows from what items
build on, so UC-032 drops it, and with it the order's place in UC-024, UC-033 and UC-043.

**Not changed:** `WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS` — a change between jobs still goes through a pull request of
its own into the default branch; no rule for it across teams is added until one is needed (UC-041, 7c names the files
that conflict).

**Impact list** (`git grep` at `main`):
- `NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT` stands in SPEC.md, ARC-042, MOD-work-plans, ITM-295, UC-032, UC-034,
  UC-043, `docs/assets/work-items/flow.mjs`, `docs/measurements/2026-10-02_release-tests-sprint-02-b.md`,
  `tests/test_wip_limit.py`, `tests/flow_fixture.py`, `tests/documents-findings.test.mjs`,
  `tests/release-sprint-02-b-dashboard-app.test.mjs`, `tests/release-sprint-02-b-work-items.test.mjs` and the fixtures of
  sprint 02.
- `A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT` stands in the same files, without `tests/test_wip_limit.py`, plus
  UC-041, `docs/backlog/sprints/09.md` and `tests/test_time_box_selection.py`.
- `A JOB GOES ONLY TO A HOLDER OF ITS ROLE` stands in SPEC.md, ARC-042, MOD-product-process, ITM-292, ITM-295, UC-024,
  UC-034, UC-036, UC-043 and the fixtures of sprint 02.

Once the use cases are accepted — not before (`ARCHITECTURE IS DESIGNED ONLY AGAINST ACCEPTED USE CASES`) — ARC-042,
MOD-product-process and MOD-work-plans are changed: team declarations, held items, startable per team; MOD-work-plans' `backlog-order` schema and `saveOrder`, and `docs/backlog/order.md`, go.
The measurement and the sprint records are records and stay as written.
