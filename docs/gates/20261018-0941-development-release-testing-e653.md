---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: rejected
on:
  - 197cfd067da2225d63746f5a9a2a061711732f3d
  - https://github.com/akmaier/agent-m/pull/874
date: 2026-10-18 09:41 UTC
---
# Development → Release testing: ITM-906, architectureImpact reads each test's guards from one pass over the edges

**REGISTER**

## Reason

ITM-906, pull request #874 into `sprint/team2/90`, is rejected on `197cfd06` on one condition: TST-906002 does not guard
the Acceptance "the number of passes over `graph.edges` does not grow with the number of tests". Its spy counts only
array-method calls and iterators taken from `graph.edges`. Replayed in a checkout of the head: the pre-change per-test
`filter`, run over `graph.edges.slice()` taken once, and a per-test indexed loop over `graph.edges` each pass all 12
tests of `tests/trace-graph-architecture-impact.test.mjs`, though both scan the edges once for each test. The test has to
count every read of an edge, whatever the iteration.

What holds:
- First commit `4f20b1c9` holds only the test file, red in run 39115299513; the head is green in run 39115401921. Both runs
  test the merge with `9f170206`; the sprint's branch is now at `9a7edee2` (ITM-888, ITM-889), which touches neither
  changed file and merges cleanly.
- Scope: `src/trace-graph/derive.mjs` (MOD-trace-graph, the item's module) and a test file whose new tests name it. No module
  text changes; `MOD-trace-graph.md` and the measurement's §3 describe the result the change keeps.
- The result is unchanged on the real repository: `architectureImpact` of the sprint head and of the head, on the graph of
  the head's 5,047 files (29,430 edges, 9,246 `guards`), for 356 calls (each of the 71 ARC and MOD files changed in prose,
  against its text 300 and 1,500 commits back, added, removed, and all at once; 88,105 tests and 272,227 guards listed):
  deep-equal, 0 differences. The comparison caught a planted dropped guard and reordered guards. A test on the real
  repository is not needed: its graph changes with each commit; the fixture of TST-906001 and this comparison suffice.
- Time, the measurement's method (`openDashboard` over `repoServer` with the 5,004 files of `dccd7cc3` and 578 earlier
  texts, a token, the harness' `blobShaOf` given a reverse map, 5 fresh processes each), architecture Review all: 16 calls
  of `architectureImpact` 2,220 ms (2,016–2,323) before, 76 ms (66–90) after; the page all done 4,737 ms (3,117–5,393)
  before, 2,658 ms (1,170–3,375) after; 279 requests and the same `<main>` in every run.
- Agreement 83, on the head with LC_ALL=C: the 360 test files whose imports reach `derive.mjs` or the changed test, and
  `tests/release-sprint-02-d-traceability.test.mjs`: 3,248 tests, 3,235 pass, 2 fail, 1 skipped, 10 todo. The two failures
  (TST-321001, TST-320321902) fail the same on the sprint head: this machine's `/private/var` temporary folder.
- Counter-proofs replayed: dropping `unique` fails TST-906001; the per-test `graph.edges.filter` fails TST-906002;
  lower-casing each guard fails TST-906001 and TST-554002 to TST-554009.
