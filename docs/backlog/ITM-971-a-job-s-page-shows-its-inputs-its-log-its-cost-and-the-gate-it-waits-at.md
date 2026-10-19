---
id: ITM-971
title: A job's page shows its inputs, its log, its cost and the gate it waits at
level: module
realises:
  - UC-036
  - ONE DASHBOARD SHOWS EVERY JOB
  - NO COST IS GUESSED
  - A RECORD IS EVIDENCE, NOT A PROPOSAL
modules:
  - MOD-main-page
builds_on:
  - ITM-509
  - ITM-535
  - ITM-545
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-036-2, verified against the accepted texts on main at ee5d1364
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-971 A job's page shows its inputs, its log, its cost and the gate it waits at

**REGISTER**

## Outcome

MOD-main-page.md:96-97: "`job` (`params.id`) — one job: its inputs, … its log while it runs, its cost — or *unknown*
(`NO COST IS GUESSED`)". The route is not built (`src/main-page/index.mjs:2`). UC-036:88-94 (step 4), :141-144 (4a, 4b).
This item builds the route `job` with: the inputs from the record; the log through MOD-runtimes' `jobLog` — streamed
for `{ stream }`, linked for `{ address }`, and for `{ gone: true }` the sentence that the runtime keeps no log, with the
links the record holds; the cost through `jobCost` — the amount and its basis where known, else the usage and *price
unknown*, never a figure; for a job waiting at a gate, what the gate checks and its decider (and, for an agent or a
CI check, that it decides by itself). A row of `jobs` links its job's page. *Pass gate*/*Reject* are ITM-801's; commits,
pull request and CI runs are NEW-036-3 (a proposal in docs/measurements/2026-10-18_uc-036-049-gaps-and-proposals.md)'s; *Cancel* ITM-972's; *Retry* ITM-974's.

## Acceptance

- Over fixture records and a fake host and Bridge: the inputs shown; a Bridge job's log grows as the fake streams; a CI
  job's log is a link; a gone log says so; usage without a price shows the usage and *price unknown* and no amount;
  a waiting job names its gate and decider. Counter-proof: a planted cost of 0 for an unknown cost fails.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/main-page/` and the tests that name MOD-main-page change.
