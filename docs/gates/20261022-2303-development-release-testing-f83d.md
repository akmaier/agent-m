---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 6ef0075c5734d09f8eed854ba33582a8c706bbc5
  - https://github.com/akmaier/agent-m/pull/1313
date: 2026-10-22 23:03 UTC
---
# Development → Release testing: ITM-843, the scope all reads modelSince, schedule, ci and resourceNeeds

**REGISTER**

## Reason

ITM-843, pull request #1313 into `sprint/team2/104`, passes on `6ef0075c`. CI is green on 28 of 28.

1. **Red first, from the full job logs.** The tests-only commit `ef80c66b` (run 39868631061) fails the re-pinned counts
   and TST-843001 to 012 in five node jobs.
   - In job 120137216354, TST-842001, 003 and 004 are `not ok`.
   - `ok 112 - TST-842002`, the count that does not move, is the known positive.
2. **The accepted text.** MOD-progress-measures.md:145-160 at blob `590997b7`, accepted.
   - `modelSince` is the date the model was declared.
   - `schedule` is the product's own, or the book's default where none is saved.
   - `ci`: `runs` of the head, `configured`, `drift` by MOD-test-schedule's `configurationDrift` (ITM-745, done),
     and `jobWorkflow`.
   - `resourceNeeds` is `reachableBy` over `docs/resources.md`.
   - No job's live state is asked (:150-152); TST-843009 checks it.
3. **g's readings are named, and lie within the text:**
   - `modelSince` is the oldest commit of the unbroken run naming the same `model`;
   - `ci` is `"unknown"` on `InvalidSchedule`, which generates no configuration;
   - no `docs/resources.md` gives `[]`.
4. **One reading copies a path.** The text names MOD-runtimes' `jobWorkflowFiles` for the job workflow's paths
   (:42, :332). That function throws in a browser, where `productFacts` runs, so `facts.mjs` holds the two paths itself.
   - The same two paths already stand in `runtimes/ci.mjs:30`, `runtimes/routes.mjs:14`,
     `settings-pages/resources.mjs:41` and `prompt-bar/hand-over.mjs:36`. This follows that existing pattern (AGENTS.md
     §6a.1), and adds one more copy (principle 2).
   - It is noted for a later item that gives MOD-runtimes one browser-safe name for the paths. It does not block this
     gate.
5. **Tests outside the module are named at the start:**
   - MOD-main-page's TST-827006/007, TST-842001/003/004, TST-847002/003, TST-655003's pattern and `tests/test_main_page.py`'s
     fake;
   - MOD-workflow-entries' main-changed fetch fake.

   Each moves by the CI runs request, and the pull request's table lists every count.
6. **Runs on the head, by this gate:**
   - `tests/progress-measures*`, `tests/main-page*`, `tests/workflow-entries-main-changed` and traceability: 240 of 240;
   - test levels, expected results and `tests/test_main_page.py`: 26 pass, and the one failure fails on `main` on this
     machine too.

## Not an item now

`main-changed.yml` grants `contents: write` only.
- On a private instance, the stored overview's `listCiRuns` would be refused, so `ci.runs` there would be `"unknown"`.
  It would not be wrong: unknown, not guessed.
- The instance here is public, and no text names the workflow's permissions.
- YAGNI: it becomes an item when a private instance needs its stored CI runs.
