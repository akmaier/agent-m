---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: rejected
on:
  - 56414020b04b8fd19af67206d0fc6bacf51ca38f
  - https://github.com/akmaier/agent-m/pull/874
date: 2026-10-18 09:47 UTC
---
# Development → Release testing: ITM-906, architectureImpact reads each test's guards from one pass over the edges, reworked

**REGISTER**

## Reason

ITM-906, pull request #874 into `sprint/team2/90`, reworked on the condition of the first rejection
(`20261018-0941-development-release-testing-e653.md`), is rejected on `56414020` on the same condition. This is the second
rejection, so it is final within the sprint. TST-906002 now counts every read of an index of `graph.edges` through a Proxy.
I replayed both variants named in the first rejection on the head:
- The per-test indexed loop over `graph.edges` now fails TST-906002 (10 passes against 4), as the per-test
  `graph.edges.filter` does.
- The copy variant still passes all 12 tests of `tests/trace-graph-architecture-impact.test.mjs`. It takes
  `const copy = graph.edges.slice()` once and then runs `copy.filter((edge) => edge.via === "guards" && edge.from === id)`
  for each test. The proxy sees the one copy and none of the per-test scans of it. The number of passes over the edges
  still grows with the number of tests, so the test does not hold the Acceptance.

What holds:
- The head merges `origin/sprint/team2/90` at `9a7edee2`, which is the sprint's head. CI run 39116414919 is green, 12 of
  12, on the merge with `9a7edee2`.
- The code is unchanged since `197cfd06`, so the real-repository comparison and the times of the first record still apply.
- Agreement 83, on the head with LC_ALL=C: the 360 test files whose imports reach `derive.mjs` or the changed test, and
  `tests/release-sprint-02-d-traceability.test.mjs`: 3,248 tests, 3,235 pass, 2 fail, 1 skipped, 10 todo. The two failures
  (TST-321001, TST-320321902) fail the same way on the sprint head and come from this machine's temporary folder.
- Counter-proofs replayed: dropping `unique` fails TST-906001; the per-test `graph.edges.filter` fails TST-906002;
  lower-casing each guard fails TST-906001 and TST-554002 to TST-554009.
