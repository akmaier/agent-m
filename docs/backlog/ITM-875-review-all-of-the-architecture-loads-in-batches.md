---
id: ITM-875
title: Review all of the whole architecture reads only what it shows, in batches
level: module
realises:
  - UC-008
  - UC-023
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
modules:
  - MOD-review-pages
builds_on:
  - ITM-680
tests:
  - unit
origin:
  - akmaier's report of 2026-10-18 of a regression on the spec, use case and architecture pages, relayed by scrum-master-opus
---
# ITM-875 Review all of the whole architecture reads only what it shows, in batches

**REGISTER**

## Outcome

akmaier: "Review all — the whole architecture actually works, but it loads slow." The route is `decision/id=all`
(`kind.whole`, `src/review-pages/flow.mjs:202-213`). Since ITM-710 (`aba1a0d4`) Review all reads the files it shows in
one batch. Since `b3e8d5f1` (ITM-729) the impact list of each changed accepted file stands on Review all too. Since `c2e6e5c1`
(`bbf92700`) that list comes from the graph stored for the commit, `<commit>.json.gz` on the branch `trace-cache`, read
once per commit through MOD-trace-graph's `storedGraph`; the page builds no graph (`4f5613df`: the architecture's review
page reads the stored graph, not a batch of the graph's files).

**What the page reads is not yet counted.** The item's first task counts the requests of one load of
`#decision/id=all` with a token, on a recorded fixture and on this repository. The count is split by what each request
serves: the commit and tree, the batch of shown files, the last accepted texts, and the one read of the stored graph. The
same count is made for `#review/arc` at `caad73d3^` and at `aba1a0d4`. The count names which reads exceed
`A PAGE LOAD READS THE REPOSITORY IN BATCHES` (SPEC.md:672): "a file whose blob the page has read already is not read
again". If nothing exceeds it, the item stops and reports the measured times, since then it is not a regression of the
requests.

## Acceptance

- One load of Review all of the whole architecture reads its commit and tree once, and its texts in batches of at most
  a hundred, with no blob read twice. A test pins the count on its fixture, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
