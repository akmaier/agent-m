---
id: ITM-842
title: The main page's facts without a token are measured before it calls them
level: module
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
  - UC-046
modules:
  - MOD-main-page
builds_on:
  - ITM-826
tests:
  - unit
origin:
  - ITM-826's draft stop (sprint team1/77), from developer-sonnet-e's count
---
# ITM-842 The main page's facts without a token are measured before it calls them

**REGISTER**

## Outcome

Without a token, `productFacts` with the scope `all` makes 3,330 requests on this repository, where the old main page made
1,006. GitHub's raw host takes no batch, and the scope `all` builds the trace graph and the test declarations, which the
old page never built: about 1,280 single reads. No token budget is spent without a token, but the page loads more slowly.

The stage table needs the graph and the tests only for the Tests stage, which has no share until ITM-809. At ITM-827's
start, the main page's call is decided against MOD-main-page's and MOD-progress-measures' texts, and both counts are
stated: with a token and without.

## Acceptance

- The main page's requests without a token are stated and pinned by a test, and are no more than the old page's
  1,006, or akmaier is asked through a draft.

**Decided at ITM-827's start (sprint team1/78, 2026-10-17, po-opus).** ITM-827 builds the `home` route without switching
the live page, so its no-token cost reaches no reader before ITM-684. The scope `all` without a token costs 3,330 requests
against the old page's 1,006. `productFacts` offers only the scopes `all` and `work`, so reading only what `stageShares`
needs would be a change of `MOD-progress-measures.md`. This item is therefore a draft for akmaier first. ITM-684 builds on
it, so the live page is not switched before the no-token count is settled.
