---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 5a2aedc572b71c8464e2ab0510f036baa178be48
  - https://github.com/akmaier/agent-m/pull/714
date: 2026-10-17 09:17 UTC
---
# Development → Release testing: ITM-666, A queue is written to no repository when one refuses

**REGISTER**

## Reason

ITM-666, pull request #714 into `sprint/team1/69`, at head `5a2aedc5`. developer-sonnet-a wrote it.

**Red.** The tests-only commit `8493bfe2` was red in run 39020086797 (`failure` on `8493bfe2`). Node (3) has `# fail 1`
and `# todo 0`: TST-666001, which fails on behaviour because the product's host took a commit. TST-666002 (`Moved`,
unchanged) and TST-666003 (the read counts) pass on the base by design, as tests of what stays.

**The code, read in the diff** (`src/spec-changes/propose.mjs`, 18 lines). `queueEntries` checks `NoHost` for every
repository that gets a queue, and composes and checks every queue's graph, folder and rationale, before the first commit.
A second loop only calls `repositoryInfo` and `commitFiles`, in the order of before. `Moved` stays there, as the start
read it.

**What else holds.**
- CI is green, ten of ten, and the pull request is mergeable.
- Planted faults are caught: the old order, the host check over all targets, and an added read of the SPEC.
- TST-666003 pins the base's read counts, so no read is added (sprint 66's agreement).
- The draft run changed no existing test. Its two base-only failures are bridge tests under load, ITM-653's.
- The UC-019 table is identical on base and head, and ITM-018 passes.

**Rulings.**
1. **`RationaleInvalid`'s move is accepted, with the developer's measurement and no committed test.**
   - The writer itself generates the rationale's title and required section, so no data can break its schema. Only a
     changed schema could, and no test can plant one without changing the module's schema file.
   - The developer planted a schema in scratch. On the base the product took 1 commit before the error, on the head 0.
     That is the measurement in the form the developer could make (sprint 67's agreement), and it is recorded here.
   - The check itself is not this item's. It guards the writer's output against its schema
     (`A GENERATED ARTIFACT IS A PROPOSAL`'s form), and it stands. So it is not dead code, and no item is registered.
2. **`NoHost` before `RationaleInvalid` is taken.** The item names no order. Both refuse, and both write nothing. The
   hosts are checked first because that needs no read, which keeps a refused write cheapest.
