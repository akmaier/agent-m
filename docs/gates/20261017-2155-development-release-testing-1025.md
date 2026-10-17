---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 809b23e66591ad6e57574b4dbed2301fb56bdea3
  - https://github.com/akmaier/agent-m/pull/790
date: 2026-10-17 21:55 UTC
---
# Development → Release testing: ITM-841, the model catalogue is read in one batch

**REGISTER**

## Reason

ITM-841, pull request #790 into `sprint/team1/78`, at head `809b23e6`. It is mergeable, and its checks are green. It
changes `src/model-catalogue/index.mjs` by six lines and adds a test file and its helper, +244/−2.

**Red, then code.** The tests-only commit `4f162377` was red in run 39072446645 on exactly the four cases that need the
change: ten models, one model and 250 models with a token, and one `readMany` before any read. The code was pushed after
the run had ended.

**The acceptance is met.**
- `catalogue()` names the model files to `Snapshot.readMany` once, before it reads them. `Snapshot` is in
  MOD-model-catalogue's Uses, so no draft was needed.
- With a token, ten models take one batch where they took ten requests, and 250 models take three batches.
- This repository's one model keeps its one request, and without a token nothing changes.
- Every test has the models present (sprint 77's agreement), and the three that pin what must not change pass on the
  base as well.
- Two planted faults are caught.
- The 21 files of the module and its callers give the same result for each test. The fetch spy saw no real request, and
  ITM-018 passes.

**Findings.**
- `release-sprint-16-practice-workflow` fails locally on the base and the head alike, and passes on CI. It is the known
  environment gap.
- The second counting fake, `tests/model-catalogue-load.mjs`, is the duplicate ITM-712 removes with one shared fake of the
  batch request. This is noted there.
