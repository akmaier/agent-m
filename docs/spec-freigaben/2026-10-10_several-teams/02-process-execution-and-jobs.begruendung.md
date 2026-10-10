# 13. Process execution and jobs: work under its role assignment; Scrum teams plan against what the others hold

**The change.** `NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT` counts the items in progress under the job's role
assignment, `A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT` reads the team's current sprint, and `A JOB GOES ONLY TO A
HOLDER OF ITS ROLE` the job's role assignment. They keep their names and their test files; the check of the first, which
described a test case, now names only its test. Five new requirements: every team runs sprints of its own; a sprint holds
its items until their change is merged into the default branch or they return to the backlog; of two items held by sprints
of different teams, neither changes a module that the other changes or uses; sprint planning lists what the other teams'
sprints hold; a gate is decided within the job's role assignment.

**A check names its test, not its cases.** Every check of this queue names the test file that guards its rule, and nothing
more. What the test shows is the rule above it; which cases show it is the test's design, chosen in the test file by
partitions and boundary values (Vibe Coding, ch. 13: requirements-based testing "translates each requirement into one or
more executable tests and maintains traceability between requirements and test evidence"; "The test designer identifies
key partitions, selects representative values from each partition, and includes boundary values"). PO, 2026-10-10: "The
spec is not the place to define test cases."

**One wording for every model.** A product has one role assignment, or one per team in a model that works in sprints. The
rules on jobs, gates and the work-in-progress limit name the job's role assignment: in Kanban and the V-model the product's
one, in Scrum the job's team. So none of them names a team where a model has none, and the work-in-progress limit of
Kanban counts the product's items, that of a Scrum team with a limit its own.

**Why.** PO, 2026-10-10: teams "have to inspect running sprints in their sprint planning and have to select their backlog
items in a way that they will not produce conflicts." The SPEC already gives the unit of conflict: every item names the
modules it changes (`A BACKLOG ITEM NAMES THE MODULES IT CHANGES`), a job changes only those (`AN IMPLEMENTATION JOB
CHANGES ONLY ITS MODULES`), and a module's file names the interfaces it uses (`A MODULE STATES ITS RESPONSIBILITY AND ITS
INTERFACES`). So a conflict is decided from the repository when a sprint is planned, before any job starts, instead of
at a rebase (UC-034, 6b). An item is held until its change is in the default branch, not only while its sprint runs: a
done item on a sprint branch whose increment is not merged is code that the default branch, from which other teams
branch, does not have.

**Not added, because the SPEC already says it.** No two teams share a sprint branch: `A PHASE OR A TIME BOX MAY HAVE A
BRANCH OF ITS OWN` gives every sprint a branch of its own. An item is in at most one team's sprint: an item held twice
changes its own modules twice, which the module rule refuses. An item that builds on another waits until that one is
merged: it uses the other's modules, which the module rule keeps from it until then. The one module rule states both
directions at once, in place of a rule for each (Vibe Coding, ch. 10, DRY and KISS).

**Decisions of the PO, 2026-10-10:** the unit that must not overlap is the modules plus the interfaces they use, not
modules alone and not subsystems. Sprints are kept per team — `docs/backlog/sprints/<team>/<nn>.md` and the branch
`sprint/<team>/<nn>` stand in UC-032; the sprint records kept so far stay where they are. The backlog keeps no stored
order: "why do we need a backlog order at all. It's decided in the sprint locally anyway." No requirement of the SPEC
names that order; what must come first follows from what items build on, so UC-032 drops it, and with it the order's
place in UC-024, UC-033 and UC-043.

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
MOD-product-process and MOD-work-plans are changed: role assignments, held items, startable per role assignment;
MOD-work-plans' `backlog-order` schema and `saveOrder`, and `docs/backlog/order.md`, go. The measurement and the sprint
records are records and stay as written.
