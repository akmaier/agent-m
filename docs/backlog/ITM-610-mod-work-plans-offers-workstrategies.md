---
id: ITM-610
title: MOD-work-plans offers workStrategies, with the recipe architecture-and-model
level: module
realises:
  - UC-045
modules:
  - MOD-work-plans
  - MOD-workflow-entries
  - MOD-desktop-shell
  - MOD-prompt-bar
builds_on:
  - ITM-572
tests:
  - unit
origin:
  - ITM-572's gate (docs/gates/20261016-2243-development-release-testing-163f.md): `draft-plan` meets UnknownStrategy for its recipe `architecture-and-model`, which MOD-work-plans' `workStrategies` gives and which is not built
---
# ITM-610 MOD-work-plans offers workStrategies, with the recipe architecture-and-model

**REGISTER**

## Outcome

MOD-work-plans' `workStrategies` is built with its first strategy, the recipe `architecture-and-model`: "the decision
that states the system, the subsystems' decisions, the module files, the process model with its phases and gates, and
the existing plan" (MOD-work-plans, Interfaces, `workStrategies`). It is registered where every other set is, as ITM-568
registered `runStrategies`:
- CI's `OFFERED` (`src/workflow-entries/compose.mjs`);
- the Bridge's `STRATEGIES` (`src/desktop-shell/compose.mjs`);
- MOD-prompt-bar's `handOverStrategies`.

Each of those modules' files already names `MOD-work-plans.workStrategies`.

The other eight strategies of `workStrategies` are their own items. Each adds its strategy to the same set and changes
no registration:
- **For `draft-plan`:** ITM-613 (`plan-checks`, with `planFindings`) and ITM-614 (`plan-steps`, with `savePlan`).
- **For `propose-items`:** ITM-615 (`backlog-inputs`), ITM-616 (`backlog-checks`, with `backlogFindings`) and ITM-617
  (`backlog-items`, with `saveItems`).
- **For `close-sprint`:** ITM-618 (`sprint-facts`), ITM-619 (`sprint-record-checks`) and ITM-620 (`sprint-record`).

**The readings, settled at sprint team1/56 for sprint 57:**
- **The parts.**
  - One part per file: the decision that refines no other; the decisions that refine it and design modules; every
    module file; `docs/process.md`; and the existing plan's files under `docs/plan/`.
  - The decisions and modules are read from MOD-trace-graph's `traceGraph`, which MOD-work-plans' Uses name, as
    MOD-run-planner's recipe reads them.
  - Each part carries the sources that `context.places.contents` names for its path.
- **Nothing twice.** The parts are built as `implementation-inputs` builds them for the system step. Whether
  MOD-run-planner's code can be called or its pattern must be repeated is read against the Uses: MOD-work-plans does not
  use MOD-run-planner, so the pattern is followed, not imported.
- **Reachable through the real host.** The recipe reads the job's snapshot, which every route gives.
- **Existing tests whose expected result changes:**
  - TST-367002 (`tests/mod-desktop-shell-jobs-composition.test.mjs`) gains `MOD-work-plans.workStrategies`;
  - TST-572007 (`tests/prompt-bar-hand-over-strategies.test.mjs`) gains the ninth set;
  - TST-572002 and TST-572006 change `draft-plan`'s missing strategy from `architecture-and-model` to `plan-checks`, its
    next one.
- **The grep of what changes** (sprint 58's agreement), read at sprint team1/60's start.
  - `architecture-and-model` in `tests` is found in five places:
    - `tests/site-frame-start-hand-over-main.test.mjs:51` and `:57`, and
      `tests/site-frame-start-hand-over-review.test.mjs:64` and `:71`. These are TST-572006's and 572002's
      expectations and comments, named above.
    - `tests/job-catalogue.test.mjs:44`, the catalogue's table, which this item does not touch.
  - `workStrategies` is found only in `src/work-plans/index.mjs:6`, the line that says it is not built.

## Acceptance

- For a fixture product, the recipe gives the parts above, each naming its sources.
- `composeProduct`, `bridgeStrategyRegistrations()` and the tab register `workStrategies` with no `DuplicateStrategy`.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
