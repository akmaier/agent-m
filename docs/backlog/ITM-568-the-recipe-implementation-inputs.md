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
builds_on:
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

**Not ready for a sprint yet.** Its readings are settled before it is selected:
- which of the job's inputs names the step or item, and how its modules are read (the item's `modules`);
- what makes "the product's coding standards file", and how a test "names" a module (its header's `Module:`);
- how the views registering strategies, through MOD-site-frame's `start.mjs` and the workflow entries'
  `registerStrategies`, are given `runStrategies`.

## Acceptance

- **The parts.** For a fixture product and an item with two modules, the recipe gives the parts above, each naming its
  sources.
- **The hand-over.** `implement` prepares without `UnknownStrategy`.
- **Tests first.** The first commit holds only the tests, and CI is red on it. No stub is committed.
