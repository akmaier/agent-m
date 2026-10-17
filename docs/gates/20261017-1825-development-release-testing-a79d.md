---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - ae6d99c2c804a092c48eefdb6324aa7d3cb50db0
  - https://github.com/akmaier/agent-m/pull/742
date: 2026-10-17 18:25 UTC
---
# Development → Release testing: ITM-685, the stages of a product's progress are measured in their module

**REGISTER**

## Reason

ITM-685, pull request #742 into `sprint/team1/74`, at head `ae6d99c2`. It is mergeable, and run 39057803767 is green.

**What holds.**
- **Red first.** The tests-only commit `a2f6daef` was red on its three new files (run 39057605732), each with a missing
  export. An uncommitted stub failed 16 of the 17 tests on behaviour. The 17th, which asserts that nothing is read, is
  caught by F4. The code was pushed after the red was read.
- **Counter-proofs and results.** Eleven planted faults are caught. The node suite fails the same 30 tests by name on the
  base and the head, and no release result changed. ITM-018 passes.
- **Reads.** No page calls the functions yet. `stageShares` reads one result record per commit.
- **Readings 5 to 8 are accepted:**
  - a SPEC entry is decided when `approved` or `in SPEC`, and a use case waits when `open` or `changed`;
  - a person-decided gate is one whose deciding role a `person` holds, and a gate's path is as given;
  - `buildInProgress` lists what a job works on, with `elapsed` in seconds;
  - `src/home/progress.mjs` stays until its importer, the main page, calls the module (ITM-684), as `74.md` says.

**What is missing: reading 1 builds a measure the text does not name.**
- The Tests stage's text reads: "the share of the requirements that a passing test guards on the default branch; a test
  passes by the newest result record of a commit of the default branch that ran it".
- The build counts only the result record of `Facts.snapshot.commit`. A test that ran on an earlier commit of the
  default branch then never passes. That is a narrower measure, and it is shipped under the text's name (AGENTS.md
  §6a.7).
- `Facts` holds no list of the default branch's commits, so the text cannot be met through the interface as stated. The
  interface's own text gives the way: "a stage whose share needs an unknown fact has none, and its detail says which".

## What the rework does

- The Tests stage has no share, and its detail names the missing fact: the default branch's commits.
- Its test is changed first and run red (sprint 56's agreement).
- Building the stage as the text says needs a draft of MOD-progress-measures, which is ITM-809.

## Registered in this commit

- **ITM-809.** The default branch's results (reading 1), the instance's own bar (reading 4), and the types of
  `stageShares` and `currentStage` (readings 2 and 3), as a draft for akmaier. Readings 2 to 4 do not hold this gate:
  - `currentStage` gives `null` when every stage is full;
  - `stageShares` is async;
  - the instance's own bar is not built and waits for that draft.
- **ITM-684** needs `productFacts` with the scope `all`, so that the Requirements, Tests and Release stages have a share.
  This is noted in ITM-684.
- **`overviews.mjs` and its functions** are ITM-797 and ITM-799 already.
