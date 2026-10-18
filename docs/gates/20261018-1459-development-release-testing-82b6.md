---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - caf92c27dc160fdc94ae96d158b76d1549e7c0ef
  - https://github.com/akmaier/agent-m/pull/906
date: 2026-10-18 14:59 UTC
---
# Development → Release testing: ITM-906, architectureImpact reads each test's guards from one pass over the edges

**REGISTER**

## Reason

ITM-906, pull request #906 into `sprint/team2/93`, passes on `caf92c27`. It is the rework of TST-906002 after #874's two
rejections (`3829`, sprint 90). I checked it in a clone of my own.

1. **The commits.** `385ace38`, `1c0ba77c` and `3deef826` have the same patch ids as #874's `4f20b1c9`, `197cfd06` and
   `56414020`. `caf92c27` changes only `tests/trace-graph-architecture-impact.test.mjs`.
2. **Red first.** The first commit `385ace38` holds only tests and is red (run 39137748185). That run shows #874's
   TST-906002. For the reworked test, I put the sprint head's `derive.mjs` under the head's tests: TST-906002 fails
   there, 11 of 12 pass.
3. **Green.** Run 39138011019 is green on the head, on 12 of 12 jobs.
4. **Scope.** Only `src/trace-graph/derive.mjs` and a test file naming MOD-trace-graph changed.
5. **The rejections' condition holds.** I planted these faults in `derive.mjs` and replayed them:
   - variant C, `graph.edges.slice()` once and `copy.filter` for each test, which both rejections named: TST-906002
     fails, with `edgeReads` 9 against 3 and `arrayScans` 10 against 4;
   - variant H, a deep clone scanned by index for each test: it fails.
   The pull request records eleven variants, A to K.

**What the test does not catch, and why that is admissible.** A copy built field by field into new arrays and scanned by
index for each test passes. I replayed this: `graph.edges.map((e) => [e.via, e.from, e.to])`. The pull request names
this limit. A spy on the input sees the data only as it is read: once it is copied into values of its own, no spy on
`graph.edges` can count passes over it. The Acceptance asks for "a unit test [that] counts the passes over an edge list of
a spy, with a counter-proof". The test does that and fails on every variant both rejections named and on nine more
(agreement 90). The test patches `Array.prototype` methods only during the synchronous call and restores them in
`finally`, and each node test file runs in a process of its own. A planted fault is what the SPEC asks for (`A NEW
TEST IS SHOWN TO FAIL ON A PLANTED FAULT`), and the patch is a spy for that purpose, not a change of the code under test.

**Agreements 83 and 89.** The head contains the sprint head `b6507672`. On the head, with the Bridge packages and
LC_ALL=C, I ran every release test file and the tests of MOD-trace-graph, MOD-review-pages and MOD-trace-pages: 957
tests, 948 pass, 1 skipped, 7 todo, and 1 fails. The failure is the known TST-320321902.

**For the review:** the developer read SPEC.md's three named requirements, as `docs/instructions/developers.md`, point 3,
says, but not SPEC.md in full, as AGENTS.md:19 says. The two instructions differ.
