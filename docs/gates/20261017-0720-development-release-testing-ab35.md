---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - cf915604610edb377d59479b0ce56a8c01195bdd
  - https://github.com/akmaier/agent-m/pull/702
date: 2026-10-17 07:20 UTC
---
# Development → Release testing: ITM-607, A pull request's description names the item's modules

**REGISTER**

## Reason

ITM-607, pull request #702 into `sprint/team1/67`, at head `cf915604`. developer-sonnet-c wrote it.

**Red.** The tests-only commit `595d4e0c` was red in run 39012730010 (`failure` on `595d4e0c`). Node (2) has `# fail 6`
and `# todo 0`: TST-567001, changed as the item named, and TST-607001 to 607005. Nothing else failed.

**What holds.**
- CI is green, ten of ten in run 39013026480, and the pull request is mergeable.
- Six planted faults are caught.
- The draft run changed only TST-567001.
- The fetch spy, proved on a positive, saw no call, and ITM-018 passes.
- **The graph is built only when a pull request is opened, and once per write:** not when one exists, nor on a local
  host (TST-607005, 607002).

**The token budget** (sprint 66: "A start measures every path an item adds that reads the repository, against the
person's token budget, before the item is selected").
- **Whose token.** The writer runs in a job, in CI or on a Bridge. In CI it reads "the person's token from the CI secret
  `AGENT_M_TOKEN`" (`MOD-runtimes.md:116`). So it is the person's budget after all, spent by the job and not by the
  browser.
- **The count.** No fake server for the real adapter could be run, since the worktree's guard refused those scripts. The
  developer stopped and disguised nothing, as sprint 66's agreement asks.
  - What stands is counted from a measured input: `traceGraph` over this repository asks `readMany` for 1633 paths.
  - At `BATCH = 100` (`src/repository-hosts/github.mjs:19`), that is at most 17 GraphQL requests cold per pull request
    opened, beside the snapshot's two.
  - The batch count follows from the path count without judgement, so I accept it as the measurement.
- **Against the budget.** At most 19 requests per opened pull request, once per write, on a 5000-an-hour budget. This is
  not the per-click cost akmaier named, so it is accepted.
- **My start's "11 batches" is corrected here** to "at most 17". The 11 was ITM-597's warm count.
- **No counting test is required.** TST-607002 pins the one build per write, and a fixture's batch count would pin the
  adapter, which is MOD-repository-hosts' and not this item's.

**Readings taken.**
- **Modules are the `changes` targets only.** MOD-runtimes' Uses read "its `changes` edges", so a mention by `names` is
  not one.
- **The order** is steps, then items, each name's modules in their order, each module once.
- **An unknown name gives no module and no failure.** The description names what the graph holds, and the pull request
  is not refused for it.

**Findings** (sprint 63's agreement):
- **The whole graph is built to name two or three modules: no item.** MOD-runtimes' accepted Uses give `traceGraph` and no
  narrower interface. The cost is measured above and is once per write. A narrower interface would be a change of
  MOD-trace-graph's file with no requirement asking for it (YAGNI).
- **The lead that `implementation-inputs` may already have built the graph on the same host** is unmeasured. The bound
  above holds either way, so no item is registered for it.
