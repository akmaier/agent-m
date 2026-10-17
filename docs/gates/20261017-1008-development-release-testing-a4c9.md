---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 6eb2c6ef6918052b5cba4201b9e38cd09ece6363
  - https://github.com/akmaier/agent-m/pull/717
date: 2026-10-17 10:08 UTC
---
# Development → Release testing: ITM-679, UC-014's release test reads Step A's two folds

**REGISTER**

## Reason

ITM-679, pull request #717 into `sprint/team1/70`, at head `6eb2c6ef`. developer-sonnet-b wrote it, and builds none of
ITM-628 (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).

**The change.** Only `tests/release-uc-014-setup-route.test.mjs` changes, in two commits, with nothing rewritten and no
`src` file touched.
- **TST-627006:** each step holds a folded *What is this?* with a body. Step A's *Why these?* is a todo subtest naming
  ITM-628, as the item's acceptance asks. The word "exactly", which UC-014 does not hold, is gone.
- **TST-627004** (the extension before this gate) takes the first of Step A's folds for which the unchanged
  `assertPermissionWithWhy` holds, and asserts it is closed. It neither counts the folds nor takes an index, and its
  expected purposes are unchanged.

**The acceptance, against the local runs.**
- On `sprint/team1/70`, the file gives 13 pass and 1 todo, before and after.
- **Planted on scratch:**
  - Step A split into *What is this?* and a *Why these?* holding the list, as ITM-628 makes it: no failure;
  - the two folds in reversed order: no failure;
  - the earlier second-fold plant now passes.
- **The counter-proof:** with the permissions in no fold, TST-627004 and TST-627005 fail.
- CI is green, ten of ten in run 39023486104, in mode rest, which skips release tests. The sprint's pull request into
  `main` runs it in mode all.
- GitHub reports the pull request mergeable, and ITM-018 passes.

**No CI red,** as for ITM-645 and ITM-664: the change asks nothing the base fails. Its red is the counter-proof.

**For sprint 70's feedback:** the developer did not list the scratchpad again after the extension, only after the first
report.
