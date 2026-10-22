---
gate: Release testing → Sprint review
job:
decider: po-opus-c
role: Product Owner
decision: passed
on:
  - 4211fdd970273cfb060365029477753d3d7d0a53
  - https://github.com/akmaier/agent-m/pull/1314
date: 2026-10-22 23:10 UTC
---
# Release testing → Sprint review: sprint team2/104

**REGISTER**

## Reason

Sprint team2/104, pull request #1314 of `sprint/team2/104` into `main`, on head `4211fdd9`.

**No release test of a selected item is due.** None of ITM-1182, ITM-1183, ITM-1188, ITM-1189 or ITM-843 declares
`release`.

**Every merge is the head its gate passed.**

| Item | Pull request | Gated head | Merged head |
|---|---|---|---|
| ITM-1182 | #1309 | `2f9a0803` (`3d6d6422`) | `2f9a0803` |
| ITM-843 | #1313 | `6ef0075c` (`57c3da57`) | `6ef0075c` |
| ITM-1188 | #1311 | `1597b325` (`d944a8eb`) | `1597b325` |
| ITM-1189 | #1312 | `dce78987` (`d944a8eb`) | `dce78987` |
| ITM-1183 | #1310 | `a4320574` (`d944a8eb`, after `5273ba94` and `836e0741`) | `a4320574` |

- The first-parent line from `0dbec0e3`, which is on `main`, is these five merges and no direct commit.
- **No merge resolved a conflict.** `git show --cc` prints no change for any of the five.
- **The items were merged without updating their branches.** Only ITM-1188 starts after #1309, and ITM-1189 merges
  ITM-1188 in. Their own changes lie in different files:
  - ITM-1182: `src/bridge-build/check.mjs`;
  - ITM-843: `src/progress-measures/facts.mjs` and tests of MOD-main-page, MOD-progress-measures and
    MOD-workflow-entries;
  - ITM-1188: `src/runtimes/`;
  - ITM-1189: `src/workflow-entries/`;
  - ITM-1183: `.github/workflows/` and tests of MOD-test-schedule.
- The one place two items meet is ITM-843's `tests/workflow-entries-main-changed.test.mjs` beside ITM-1189's
  `src/workflow-entries/`. #1314's run is the first to run them together.

**Green on the sprint branch, all items together.** Run 39869666264, `pull_request` at `4211fdd9`, passes 28 of 28 jobs
on its first attempt, release files included. I read it from the run's full log archive (jobs API).
- Each of the 20 node shards ends `# fail 0` and `# cancelled 0`: 5,807 tests and 21 todos.
- **Every item's tests ran and passed:**
  - ITM-1182: "tunnelCheck — the test SSH server takes only a host key that …";
  - ITM-1188: "handOverJob — a model endpoint whose route names a CI secret …";
  - ITM-1189: TST-1189001 to 004;
  - ITM-843: "productFacts, scope all — the schedule is the product's save …", TST-843011 and 012, and "onMainChanged
    adds the graph of the pushed commit …";
  - ITM-1183: "tests.yml: a node shard with no restored cache creates apt's …".
- ITM-018's traceability case passes.
- **No unfinished items.** All five are merged, and 104.md's Unfinished items are empty.
