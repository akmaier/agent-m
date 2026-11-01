---
id: ITM-614
title: MOD-work-plans' writer plan-steps saves a drafted plan
level: module
realises:
  - UC-045
modules:
  - MOD-work-plans
builds_on:
  - ITM-613
tests:
  - unit
origin:
  - the cut of ITM-610 at sprint team1/56: MOD-work-plans' workStrategies, one strategy per item
---
# ITM-614 MOD-work-plans' writer plan-steps saves a drafted plan

**REGISTER**

## Outcome

The writer `plan-steps` — the drafted plan through `savePlan`, with the job's provenance lines — and `savePlan` itself, as MOD-work-plans' file states them. `savePlan` is not built.
It adds its strategy to `workStrategies`, which ITM-610 builds and registers, and changes no registration. With it, `draft-plan` comes closer to being prepared without `UnknownStrategy`.

**The readings.** `savePlan` (MOD-work-plans.md:215-220) calls `planFindings`, `nextIdentifier`, `readHistory`, `commitFiles`, `writeDocument` and, for the writer, `provenanceLines`; each is MOD-work-plans' own or among its Uses. Its sibling `saveItems` (`src/work-plans/saves.mjs:323`) and the writer `backlog-items` are the forms it follows.

**Not ready.** With `plan-steps` handed, the kind `draft-plan` no longer meets the `UnknownStrategy` `plan-steps`, which TST-572006 asserts as its known positive: `assert.equal(await unknownStrategyOf("draft-plan"), "plan-steps")` in `tests/site-frame-start-hand-over-main.test.mjs:52` and `tests/site-frame-start-hand-over-review.test.mjs:64`. Both are MOD-site-frame and MOD-prompt-bar tests (`Module:` lines) that name MOD-work-plans only in a comment. Whether this item may change them is the question `AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES` leaves for akmaier (ITM-1291).

## Acceptance

- The strategy works as MOD-work-plans' file states it, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
