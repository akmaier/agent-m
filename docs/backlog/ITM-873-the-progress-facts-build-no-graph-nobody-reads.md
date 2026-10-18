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
