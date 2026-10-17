---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 0d2ad933e1dfa9406d3d3c50362757e66684a96e
  - https://github.com/akmaier/agent-m/pull/719
date: 2026-10-17 10:16 UTC
---
# Development → Release testing: ITM-628, Step A's permissions fold under "Why these?"

**REGISTER**

## Reason

ITM-628, pull request #719 into `sprint/team1/70`, at head `0d2ad933`. developer-sonnet-e wrote it.

**Red.** Run 39023593792 on `e5662e5a` has 3 failures:
- node (0): `# fail 2`, with `# todo 2`;
- node (1): `# fail 1`, with `# todo 1`, both existing.

They are TST-588002 and 588016, both named, and the new TST-628001.

**The change**, as the readings confirmed:
- `explain(topic, label = "What is this?")`, and the JSDoc follows.
- Step A shows `setup-key` under *What is this?* and `setup-key-permissions` under *Why these?*, as UC-014 gives both.
- "Why *Only select repositories*?" stays in `setup-key`.

**What else holds.**
- CI is green, ten of ten in run 39023946839, and the pull request is mergeable.
- With ITM-679 merged, the UC-014 release file gives 13 pass and 1 todo on the head, and ITM-679's *Why these?*
  subtest passes.
- Three planted faults are caught. ITM-018 and `test_step_explanations` pass.
- No release test was changed by this item. TST-627004 and 627006 were ITM-679's, merged first (sprint 68's
  agreement).

**Findings** (sprint 63's agreement):
- **ITM-679's *Why these?* subtest passes with the label dropped.** It checks that the permissions are named, not that
  their fold reads *Why these?*. This is registered as ITM-701, for a participant other than this item's developer.
- **A local `node --test tests/` picks up `tests/fixtures/groups/repo/tests/export.test.js`,** a fixture, and CI does not.
  This is registered as ITM-702.
