---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 1edbe6993cf0bdd9d973150a6d6a0f541e2060cd
  - https://github.com/akmaier/agent-m/pull/904
date: 2026-10-18 18:55 UTC
---
# Development → Release testing: ITM-873, the progress facts build no graph nobody reads, second gate

**REGISTER**

## Reason

ITM-873, pull request #904, now into `sprint/team2/94`, passes on `1edbe699`. Its first rejection was `ba157fdf`, on
`c55d1a9a`. I checked it in a clone of my own.

**The condition of the rejection is gone, by the accepted text.** The change contradicted MOD-progress-measures'
accepted sentence that the scope `all` reads the trace graph. That text is now the accepted blob `30691d42`, whose
:167 reads "It builds no trace graph: `graph` is `"unknown"` in both scopes". The code of `src/progress-measures/` is
unchanged since `c55d1a9a`.
- TST-536015 and TST-826005 change one expected value each, `graph: "unknown"`. The item names both since `25a88509`,
  and the accepted text changes the behaviour they assert (`docs/instructions/product-owner.md`, check 3).
- The search for readers of `Facts.graph` holds, as at the first gate.

**Replayed.**
- The new tests on the sprint head's `src/` fail 5 of 5.
- On the head, the tests of MOD-progress-measures, the new file and `tests/test-schedule-ci-shards.test.mjs` pass, 64 of
  64.
- The head is green (run 39156042101).

**The renamed test file: admissible as a name, and no fix.**
- The file `tests/progress-measures-no-graph.test.mjs` became `tests/main-page-progress-no-graph.test.mjs` (`53b8bb23`,
  `1edbe699`). The name was chosen by trying names until TST-945005 passed.
- I replayed both names on the head. With the old name, TST-945005 fails ("plain index % 8 keeps them apart, so these
  lists cannot show the fault"). With the new name, it passes.
- The fault is in TST-945005, not in #904. Its counter-proof runs over `repositoryFiles()`
  (`tests/test-schedule-ci-shards.test.mjs:188`), so whether plain `index % 8` puts two Electron files into one shard
  depends on which file names exist. Any new test file of either team can fail it by chance; #925's passed by chance.
- A test file's name is free: the gate's check 3 asks that a new test file's header names its module, and this header
  names MOD-progress-measures. So the rename breaks no rule and is admissible.
- It is not a fix, and under AGENTS.md §6a it is recorded as what it is: a name chosen to pass a test that fails by
  chance. The defect goes to a backlog item for MOD-test-schedule's counter-proof, and to team 1, whose sprint 92 holds
  that module.
