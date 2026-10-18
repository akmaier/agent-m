---
id: ITM-880
title: The page loads analysed for a trace computed once per commit and read from git
level: system
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
  - THE TRACEABILITY MATRIX IS DERIVED
  - UC-008
  - UC-020
  - UC-023
  - UC-046
modules:
  - MOD-review-pages
  - MOD-main-page
  - MOD-trace-graph
  - MOD-trace-pages
  - MOD-repository-hosts
builds_on:
tests:
  - system
origin:
  - akmaier's request of 2026-10-18 to analyse the page loads and precompute the trace once per commit
---
# ITM-880 The page loads analysed for a trace computed once per commit and read from git

**REGISTER**

## Outcome

akmaier: "Add an item to the backlog to analyse the page load functionality. All of this does an online search via git
calls. As we work in commits, we don't need to do the full trace at every page load, but only once with every commit; the
result can be precomputed and read from git. This should enable much faster page loads compared to what we have right now
on spec, use case, main page, as well as spec page and their corresponding review all pages."

This item is an analysis. It changes no code. It delivers a MEASUREMENT and, if the measurement supports it, a draft for
akmaier of the texts a precomputed trace needs.

**1. Measure what a page load does now**, in the manner of `docs/measurements/2026-10-17_dashboard-load-requests.md` (the
live `docs/assets/dashboard-app.mjs` through `tests/app-harness.mjs`, over a counting fake host with every file of a named
commit). Measure these pages, each with and without a token:
- the main page;
- the SPEC page `#spec`;
- the use case pages;
- the architecture pages;
- each kind's *Review all* (`<k>/all`).

For each page, record:
- the requests it sends;
- the bytes it reads;
- the time from the call to settled;
- how much of that goes to `traceGraph`, `graphFindings`, the statuses and the test declarations, against reading the
  files themselves.

**2. Name what depends only on the commit.** For each result a page computes, state whether it is a function of the commit's
tree alone, or also of something outside it:
- the token;
- the pull requests;
- the runtimes;
- the open queue of SPEC changes;
- the viewer.

Only results of the first kind can be computed once per commit.

**3. Weigh where in the repository a once-per-commit result lives and who writes it.** akmaier's direction: the result is
"precomputed and read from git". For each place, state the gain against step 1's numbers, and what CI costs within the
two-minute limit per job. The places to compare:
- a file committed by CI on each commit to `main`;
- a file on a separate branch, named by the commit it was computed from.

**4. Check the design against the SPEC as a whole.** akmaier's ruling of 2026-10-18: "There is no violation of spec: a
precomputed state, is part of the repo, not the dashboard." The precomputed result is part of the repository, so the
dashboard derives what it shows from the repository and stores no status of its own; this item does not draft a SPEC change
for it. State what a page shows when the precomputed result is missing, or names a commit other than the one shown, and keep
`A PAGE LOAD READS THE REPOSITORY IN BATCHES` for every file still read. Check the design against the design principles of
AGENTS.md §2 and the book's chapters 10 and 12.

## Acceptance

- A MEASUREMENT under `docs/measurements/` gives step 1's numbers for every page named, with its method and a known
  positive for each count (AGENTS.md §6a.2), on a named commit.
- The measurement states, for each computed result, whether it depends on the commit alone (step 2).
- The measurement compares the places of step 3 by gain and cost, and recommends one, or none if the gain is small.
- For the recommendation, the module texts it changes are drafted for akmaier's acceptance (step 4), never committed as
  accepted.
- The build items the recommendation needs are registered, each building on this item.
