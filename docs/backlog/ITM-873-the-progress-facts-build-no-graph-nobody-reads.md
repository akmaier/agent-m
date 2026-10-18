---
id: ITM-873
title: The progress facts build no graph nobody reads
level: module
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
modules:
  - MOD-progress-measures
builds_on:
  - ITM-826
tests:
  - unit
origin:
  - ITM-735's measurement (sprint team1/84), by developer-sonnet-c
---
# ITM-873 The progress facts build no graph nobody reads

**REGISTER**

## Outcome

For the scope `all`, `allFacts` builds a whole trace graph per product (`src/progress-measures/facts.mjs:132`). Line 133
reads its test nodes, and line 135 returns it as `Facts.graph`. Whether anything reads `Facts.graph` is open; this lead is
from the code, not measured. At the start, every reader of `Facts.graph` is
searched by every name. The requests of the scope `all` are counted with and without the graph. If no reader needs it, the
tests the stages need are read without building the whole graph, as the module's text allows.

## Requirement

`src/main-page/home.mjs:48` calls `productFacts` with the scope `all` on a page load, so the item realises
`A PAGE LOAD READS THE REPOSITORY IN BATCHES` (SPEC.md:672) in the way ITM-826 did. That sentence counts the batches of the
files a page shows. It does not forbid reading a file the page does not show. Whether dropping an unread graph lies within
the sentence is named at the start.

## Acceptance

- The scope `all` builds no graph that no reader uses, and its count with a token falls by what the graph cost, pinned by a
  test.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

## Read at sprint team2/94's start decision (po-opus-b)

The draft `f461209f` is accepted: MOD-progress-measures' approval record `c86862b9252b` names its blob (`234d3b66`). The
sentence #904 was rejected on now reads, MOD-progress-measures.md:159 at blob `c86862b9`: "It builds no trace graph:
`graph` is `"unknown"` in both scopes, and a view that shows traces builds them with MOD-trace-graph's `traceGraph`
when it is drawn." So the accepted text changes the behaviour that TST-536015 (`tests/progress-measures-product-facts.test.mjs`)
and TST-826005 (`tests/progress-measures-batches.test.mjs`) assert: `graph.commit` becomes `"unknown"`. This item
names both tests, for their one changed expected value each. #904's head `c55d1a9a` is gated against this text once it is
retargeted to the sprint's branch.
