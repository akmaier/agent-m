---
id: ITM-568
title: The recipe implementation-inputs
level: module
realises:
  - UC-024
  - UC-049
  - RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS
modules:
  - MOD-run-planner
  - MOD-workflow-entries
  - MOD-desktop-shell
builds_on:
  - ITM-573
tests:
  - unit
origin:
  - ITM-505's gate (#621): `implement` and `refactor` name the recipe `implementation-inputs`, which MOD-run-planner's `runStrategies` offers, and no module registers it (`git grep implementation-inputs` in `src/` finds only the kinds' `kind.md` and `prompt.md`; `src/run-planner/` does not exist), so a hand-over of `implement` is refused at the click with `UnknownStrategy`
---
# ITM-568 The recipe implementation-inputs

**REGISTER**

## Outcome

MOD-run-planner's `runStrategies`, cut to its recipe `implementation-inputs`, as its file states it. The recipe is "for
a step or item":
- the file of each of its modules;
- the decision of their subsystem, and the decision that states the system;
- the SPEC;
- the interfaces — the `## Interfaces` of their files, not the code — of the modules they use;
- the code in their folders and the tests that name them;
- the product's coding standards file, if it has one.

For a subsystem's integration, it gives the subsystem's decision and the files, code and tests of its modules. For the
system, it gives the decision that states it, the subsystems' decisions and the use cases. Each part names the sources
whose content it carries.

`src/run-planner/` does not exist yet. This is the module's first code, and its other functions are later items.

**The readings, settled at sprint team1/52** from MOD-run-planner (Interfaces, `runStrategies`), UC-024 step 4 and the
code that registers strategies:
- **The step or item.** The job's `params.items` names its backlog items, as the prompt bar writes them
  (`src/prompt-bar/hand-over.mjs:75`), and `params.steps` its plan steps.
- **Its modules.** An item's modules are its `modules`, read with `artifactSchemas().item`; a step's modules are those
  of its file under `docs/plan/`.
- **What it gives for each module.**
  - its file `docs/architecture/<MOD>.md`;
  - the decisions it `follows`, the subsystem's, and the decision that states the system, which is the decision that
    `refines` no other, as the review pages tell it (`src/review-pages/flow.mjs:50`);
  - `SPEC.md`;
  - for each module its `uses` names, that module file's `## Interfaces` section alone, not its code;
  - the code under its `folder`, and the tests that name it: those with an `exercises` edge to it in MOD-trace-graph's
    `traceGraph`, which ITM-573 builds from each test declaration's `module:`.
- **A subsystem's integration and the system.** A step that names a subsystem's decision and no module gives that
  decision and the files, code and tests of its modules. A step that names the decision that states the system gives
  it, the subsystems' decisions and the use cases.
- **The sources of each part.** A part carries the sources whose content it holds, as a part does elsewhere
  (MOD-job-runner's `Part`). Each path that `context.places.contents` names for a restricted source carries that
  source; every other part carries none.
- **The coding standards file is cut** from this item until akmaier accepts the draft that names it (`AGENTS.md` at the
  product's root). MOD-run-planner's accepted text says "the product's coding standards file, if it has one" without a
  path, and no other text names one.
- **Where it is registered.** MOD-workflow-entries registers it in CI: its `OFFERED` list
  (`src/workflow-entries/compose.mjs:126`) gains `["MOD-run-planner", runPlanner, "runStrategies"]`. MOD-desktop-shell
  registers it on a Bridge, through `bridgeStrategyRegistrations()` (`src/desktop-shell/compose.mjs:25`). Both modules'
  uses name `runStrategies` already.
- **In the tab** it is not registered by this item. A hand-over of `implement` from the prompt bar is prepared in the
  tab, and the page's views do not hand it. That is a gap of the texts, ITM-572.

**Existing test whose expected result changes:** TST-367002 (`tests/mod-desktop-shell-jobs-composition.test.mjs:79–84`),
which deep-equals `bridgeStrategyRegistrations()` as four registrations. It gains `MOD-run-planner.runStrategies` as the
fifth, and its header's line changes with it. Its header names MOD-desktop-shell, a module of this item. The developer
found it by grepping for `bridgeStrategyRegistrations`, the output this item changes. No test asserts the CI `OFFERED`
list.

**Other tests.** No expected result names `runStrategies`. Three tests register their own stand-in under the name
`implementation-inputs`, which a real registration in the same process would meet as `DuplicateStrategy`:
- `tests/job-catalogue-instruction.test.mjs:21`;
- `tests/job-runner-run.test.mjs:71`;
- `tests/prompt-bar-hand-over.test.mjs:219`.

The real recipe is registered only where an entry composes a product (`registerStrategiesOnce` in
`src/workflow-entries/compose.mjs`) or a Bridge composes (`src/desktop-shell/compose.mjs:32`). So these tests are run
with the change, and their expected results stay as long as they import neither.

## Acceptance

- **The parts.** For a fixture product and an item with two modules, the recipe gives the parts above, each naming its
  sources.
- **The hand-over.** `implement` prepares without `UnknownStrategy`.
- **Tests first.** The first commit holds only the tests, and CI is red on it. No stub is committed.
