---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 3e27e418aaa3e73b6e5865285c2dd14654ff206b
  - https://github.com/akmaier/agent-m/pull/696
date: 2026-10-17 06:17 UTC
---
# Development → Release testing: ITM-640, The frame's notices and decisions live in the parts its file names

**REGISTER**

## Reason

ITM-640, pull request #696 into `sprint/team1/66`, at head `3e27e418`, one commit. developer-sonnet-e wrote it. It is a
refactoring, so no red is asked (`A REFACTORING JOB BEGINS WITHOUT A FAILING TEST`).

**No expected result changed** (`A REFACTORING JOB CHANGES NO EXPECTED RESULT`).
- No test is added or changed. The diff is `src/site-frame/` alone: the new `notices.mjs` and `decision.mjs`, and
  `index.mjs`.
- The golden master: the base `4c4ef32e`'s node list and the head's, 3591 lines each, differ in 0 lines, and so do the
  Python lists.
  - One concurrent run showed four extra failures in `tests/bridge-jobs-agents.test.mjs`. That file imports no part of
    MOD-site-frame, passes 7 of 7 alone, and a second run equals the base. I read it as load on the machine.
- CI is green, ten of ten in run 39009174165 on the head, and the pull request is mergeable. ITM-018 and
  `test_no_backend` pass.

**The code, read in the diff.**
- `notice` and `confirmDecision` are moved unchanged in what they do. `index.mjs` re-exports both with `export … from`,
  and the header line names their files.
- `index.mjs:4, 258, 260, 353, 355, 369, 371` are the grep's full output, as the item read it.

**The ruling on `noticePlace()`: within the refactoring.**
- `notice` draws into the place a started page made. In `index.mjs` that place was a module-level `let notices`,
  assigned in `startSite` and `startBridge`.
- A binding imported from another file cannot be assigned, so moving `notice` alone would leave it unable to reach its
  place.
- `noticePlace()` makes the same `<section class="site-frame-notices">` at the same two points, and `notice` throws the
  same error when no page was started. The state moves with the function it belongs to, and nothing it does changes.
- `noticePlace` is private to the module. It is not in `provides`, and the Uses are unchanged.

**The developer's finding: no item.** 30 node and 2 Python tests fail locally on base and head alike, all of them
Bridge, desktop and mail tests. CI, which runs every level, passes them. They are the local machine's, and not this
change's.
