---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - f74834478d2ecec3644c7cabd492c7bc01b4b12a
  - https://github.com/akmaier/agent-m/pull/669
date: 2026-10-17 01:55 UTC
---
# Development → Release testing: ITM-610, MOD-work-plans offers workStrategies, with the recipe architecture-and-model

**REGISTER**

## Reason

ITM-610, pull request #669 into `sprint/team1/60`, at head `f7483447`. developer-sonnet-c wrote it.

1. **The tests-only commit is red.** `1129cb79` was pushed alone, and run 38991476239 failed on it. The Scrum Master read
   the five saved logs. Thirteen failures, each new or named by the item:
   - TST-610001 to 610008;
   - TST-572002, 572006 and the file of 572007;
   - TST-367002, in two shards.

   The `todo` are UC-019's standing findings. Under an uncommitted stub, TST-610001 to 610006 failed on behaviour.
2. **CI is green on the head**: run 38992493067 passed ten of ten jobs. GitHub reports the pull request mergeable.
3. **The changes stay in the item's four modules**: MOD-work-plans' new part `strategies.mjs`, and one registration
   each in MOD-workflow-entries, MOD-desktop-shell and MOD-prompt-bar. Three new test files are added, and the four
   tests the item names change.
   - The UC-019 table is the same on the base and on the head.
   - ITM-018 passes, and the fetch spy logged nothing.
   - UC-011's system and release tests pass.
4. **Each of the nine planted faults is caught.**
5. **The Acceptance holds.** The recipe gives the parts the item names, each with its sources. CI, the Bridge and the tab
   register `workStrategies` with no `DuplicateStrategy`.

**Readings judged.**
- **Repeated, not imported — a copy of two rules, and the Product Owner's miss.** The item said to follow MOD-run-planner's
  pattern, since MOD-work-plans does not use MOD-run-planner. The code does so, and copies two rules:
  - **Which sources a file carries**, from `context.places.contents`. It now stands three times: MOD-job-runner's tools
    (`src/job-runner/tools.mjs:69`), `implementation-inputs` (`src/run-planner/inputs.mjs:63`) and this recipe
    (`src/work-plans/strategies.mjs:47`).
  - **Which decisions state the system and its subsystems**, from the graph: in `implementation-inputs` and here.

  AGENTS.md §2 asks to remove such a copy rather than keep the two equal. Nothing in the module files gives either rule
  as an interface. So two drafts for akmaier are committed with this gate:
  - MOD-job-runner's `sourcesOf(context, path)`;
  - MOD-trace-graph's `systemDecisions(graph)`;
  - the Uses of MOD-run-planner and MOD-work-plans that name both.

  ITM-632 and ITM-633 remove the copies once the drafts are accepted. This gate passes the item as its readings set it.
- **A product without `docs/process.md`** gets `UnknownWork { id: "docs/process.md" }`, as `implementation-inputs`
  answers a file the product lacks. The module file names no error of its own for the recipe, so it follows the same
  pattern. Taken.
- **Every file under `docs/plan/` is a part, `order.md` included.** "The existing plan" holds its order. Taken.
