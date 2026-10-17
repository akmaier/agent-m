---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - ab62a267c5170e8daef3d28e8796a37295c6c5d9
  - https://github.com/akmaier/agent-m/pull/757
date: 2026-10-17 19:32 UTC
---
# Development → Release testing: ITM-688, a backlog's findings are the work-plans module's

**REGISTER**

## Reason

ITM-688, pull request #757 into `sprint/team1/75`, at head `ab62a267`. It is mergeable, and run 39062637591 is green.

**Red, then code.** The tests-only commit `8f3be3e7` was red in run 39062452614 on exactly the 14 new tests, TST-688001 to
014. An uncommitted stub failed 12 of them on behaviour. The other two are the no-finding cases. The code was pushed after
the run had ended.

**The acceptance is met.**
- `backlogFindings(items, architecture)` is built in the new `src/work-plans/checks.mjs`, as `MOD-work-plans.md:170-172`
  states it, and exported from the index.
- It uses only the module's Uses, `MOD-documents.classifyCandidates` and `MOD-text-tools.finding`.
- It makes no request: the fetch spy was checked against a known positive.
- The old `work-items.mjs` and `flow.mjs` stay until their importers go (ITM-681, ITM-684).
- Ten planted faults are caught. No existing or release result changed, and ITM-018 passes.

**Readings.**
- **Accepted as the module's text says:**
  - reading 1, an error only when no named module is described;
  - reading 2, a reciprocal pair and a self-reference;
  - reading 3, a restated title through `classifyCandidates`, warned on both items;
  - reading 5, line 1 for a front-matter field.

  The SPEC's Check of `A BACKLOG ITEM NAMES THE MODULES IT CHANGES` reads wider than reading 1. It is
  `tests/test_backlog_item_fields.py`, which still runs, so the requirement stays guarded. The difference is ITM-817.
- **Reading 4, the borrowed rule names**, is accepted for now, as `finding()` requires one. ITM-817 settles them.

**Findings, registered or noted:**
- **ITM-817** holds the wider module rule, circles of three or more, the rule names, and a home for the old
  `itemProblems` checks before the old file goes. It is a draft for akmaier first.
- **The cost**, 539 ms for 607 items, is measured and matters only once a click calls it. It is named here for UC-033's
  item.
- **The test headers that still name `MOD-work-items`** belong to MOD-work-plans' later job, which moves them, as the
  Parts say.
- **`finding()` refusing a UC-… rule** goes with ITM-817's rule names.
