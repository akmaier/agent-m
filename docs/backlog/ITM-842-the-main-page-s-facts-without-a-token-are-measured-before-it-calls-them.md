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

- The main page's requests without a token are stated and pinned by a test on a fixture with a realistic number of
  test files. They are no more than the old page's on the same files, measured by the same test, or akmaier is asked
  through a draft.

**Decided at ITM-827's start (sprint team1/78, 2026-10-17, po-opus).** ITM-827 builds the `home` route without switching
the live page, so its no-token cost reaches no reader before ITM-684. The scope `all` without a token costs 3,330 requests
against the old page's 1,006. `productFacts` offers only the scopes `all` and `work`, so reading only what `stageShares`
needs would be a change of `MOD-progress-measures.md`. This item is therefore a draft for akmaier first. ITM-684 builds on
it, so the live page is not switched before the no-token count is settled.

**Its draft for akmaier is on `main`** (sprint team1/93, written by developer-sonnet-b).
- **The draft:** MOD-main-page's `home` says that the build's rows are the same whether the stage bar comes from a stored
  overview or from the scope `all`.
- **Which scope gives the stage table is settled by the accepted texts:** a stored overview, else `all`. The premise above,
  that `productFacts` offers only `all` and `work`, is out of date. `work` gives no share for Requirements, Tests and
  Release.
- **Measured on a fixture of `main`'s size, without a token:**

  | Load | Requests |
  |---|---|
  | the old page | 1,171 |
  | the route `home`, own card | 4,088 (54 with a token) |
  | `work` | 2,556 |

  So a fixed 1,006 is no benchmark, and the Acceptance compares against the old page on the same files. TST-827007 and
  TST-847003 pin 1,012 on a fixture with one test file.
- **Open, for akmaier or team 2:** how narrowly MOD-progress-measures.md:152-154 reads `build`'s "what `buildInProgress`
  takes and nothing else". Read narrowly, it leaves out the queues, gate records and workflow that `itemStates` uses, and
  the build's rows then differ from `all`'s. The draft's sentence chooses that they are the same.
- **The draft rests on ITM-940,** which builds the stored overview. Today the sentence describes nothing built.
- A product's card has no stored overview, since `onMainChanged` runs only in the instance. It falls back to `all`.

**Decided (team 2's sprint 99, po-opus-b).** akmaier accepted draft `d571344d` (option 3) in `50a5e84d`.
- MOD-main-page.md now says the following, and the Acceptance's alternative ("or akmaier is asked through a draft") is
  settled by it: "Without a token and without facts stored for the head (`storedFacts`), that reading costs one request
  per test file of the default branch … that cost is accepted".
- **The test:** `tests/main-page-no-token-requests.test.mjs` on developer-sonnet-f's branch `item/ITM-842-no-token-requests`
  (`7289c6f2`) pins that formula. It does not pin "no more than the old page".
- **The ~9 requests** it could not attribute are named, before the gate.
