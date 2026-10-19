---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 77a135d44dc78136a0d25f9dc0c2c4c5019e24a5
  - https://github.com/akmaier/agent-m/pull/1086
date: 2026-10-19 14:28 UTC
---
# Development → Release testing: ITM-674, passed — an entry's impact is read from one graph per snapshot

**REGISTER**

## Reason

ITM-674 (MOD-spec-changes), pull request #1086 into `sprint/team1/96`, passes on `77a135d4`.

- **Two commits, one parent each, no merge, both with the trailer `developer-sonnet-c`.**
  - `05e56d50` holds only tests: `tests/spec-changes-impact-graph.test.mjs` (level `unit`).
  - `77a135d4` changes only `src/spec-changes/accept.mjs` and `propose.mjs`.
    - `graphOf(snapshot)` builds MOD-trace-graph's graph once per snapshot object, in a `WeakMap`, and drops a failed
      build.
    - `impactOf` and `queueEntries` read the graph from it.
- **The red,** run 39268185188, job 118113179119 on `05e56d50`: `# fail 1`, `# cancelled 0`, exactly TST-674001.
  TST-674002 and TST-674003 guard.
  - The run's other failure, job 118113179100's TST-538006 of `workflow-entries`, is in a file this pull request does not
    touch.
  - It fails in removing a temporary repository (`ENOTEMPTY`), as the `workflow-entries` failure at ITM-731's gate did.
    ITM-1084 is registered for both.
- **The first task's reading is kept:** `entryView`'s signature has no graph parameter, and a graph kept per snapshot
  changes none.
- **The reading of MOD-spec-changes.md:88, "It keeps nothing", is kept.**
  - That line stands under *Data* and goes on with the files the module owns.
  - The graph is derived from an immutable snapshot and lives no longer than that object. No data is kept, as
    SPEC.md:1787-1789 calls derived state not stored.
- **It meets the Acceptance.** N open entries of one snapshot build one graph, counted by its reads on a snapshot that
  keeps none.
- **CI:** 20 of 20 checks passed on the head (run 39268628646).
- **Merge:** the parent of `05e56d50` is `sprint/team1/96` at `b366a072`, its head now.
- **Replayed in a clean worktree at the head:**
  - The 146 tests of `tests/spec-changes*.test.mjs` pass.
  - Counter-proof: with `05e56d50`'s `src/`, exactly TST-674001 fails.
