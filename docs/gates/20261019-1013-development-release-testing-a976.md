---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 745c78224128e6c5211c72f2a2f9f83bc295c547
  - https://github.com/akmaier/agent-m/pull/1007
date: 2026-10-19 10:13 UTC
---
# Development → Release testing: ITM-976, passed — a run is read from its record

**REGISTER**

## Reason

ITM-976 (MOD-run-planner), pull request #1007 into `sprint/team1/93`, passes on `745c7822`.

- **Two commits, one parent each, no merge, both with the trailer `developer-sonnet-a`.**
  - `d4bccce0` holds only tests: `tests/run-planner-run-of.test.mjs`.
  - `745c7822` holds the code: `src/run-planner/run.mjs` and `index.mjs`.
- **The red,** run 39235127362, job 118002235640: `# fail 5`, exactly the five `runOf` tests, with `# cancelled 0`. The one
  todo is a known finding of another item.
- **The code meets MOD-run-planner.md:84-90.**
  - `runOf(record, jobs)` gives the run's selection, its jobs, and the limits of its newest `## Limits raised` part, or of
    its parameters.
  - It throws `NotARun` for a record of another kind.
- **The readings of `state` stand:**
  - `finished` for an end `done`, and `stopped` for `cancelled`;
  - `held by a limit` when the rows' cost reaches the cost limit in force;
  - `waiting at a gate` when a row waits at one;
  - else `running`.
  A hold by the rounds limit is `nextActions`'s, since a job row carries no findings.
- **CI:** run 39235452780 passed 20 of 20 on the head.
- **Merge-tree:** `git merge-tree --write-tree` onto `sprint/team1/93` (`b24eee6b`) is clean.
- **Replayed in a clean worktree at the head:**
  - The test file passes 5 of 5.
  - Counter-proof: without the kind check, exactly "runOf throws NotARun for a record of another kind" fails.
