---
id: ITM-599
title: The gaps view shows the derived matrix and its gaps at the chosen version
level: module
realises:
  - UC-020
modules:
  - MOD-trace-pages
builds_on:
  - ITM-594
tests:
  - unit
  - component
  - system
  - release
origin:
  - the coverage of UC-001 to UC-020 (docs/measurements/2026-10-16_coverage-uc-001-020.md), at akmaier's request of 2026-10-16
---
# ITM-599 The gaps view shows the derived matrix and its gaps at the chosen version

**REGISTER**

## Outcome

UC-020 steps 7, 7a and 7b. `coverageGaps` is built (ITM-308); the view is not.

**The reading of 2026-10-17 (sprint team1/63): it waits for ITM-594's merge,** since both change `flow.mjs` and
`views.mjs`.
- **`coverageGaps`** of MOD-trace-graph is built (`src/trace-graph/derive.mjs:150`), and MOD-trace-pages' Uses names it.
  The view adds the `gaps` descriptor. It copies nothing from the old `docs/assets/traceability/graph.mjs:218`.
- **Reached** through MOD-site-frame's route `trace/gaps`. The live page renders only `specification`, under `#spec`, so
  it reaches `gaps` once `docs/index.html` starts the site through `start.mjs`.
  - That change is a pull request between jobs (SPEC.md, `WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS`).
  - It waits until the module-built site holds what the live page shows, and this view is one of those things.
  - So "the real host" for this item is the frame's route, on a product's real repository host.

**Settled at sprint team1/68's start. Selectable.**
- **The module whose files it changes:** MOD-trace-pages.
  - `views.mjs` gains the descriptor `gaps`; `descriptorFor("gaps")` gives null today.
  - `flow.mjs` gains the table of the gaps at the version shown, with "*Gaps* says so" when there are none (7a). An older
    version shows what existed at its commit (7b).
  - No topic is added.
- **The grep, full output read:**
  - `grep -rn gaps src/trace-pages tests/trace-pages-*` finds only the component diagram's gaps (`diagram.mjs`,
    `tests/trace-pages-diagram-gaps.test.mjs`), which are UC-025's and stay.
  - `coverageGaps` is called in `flow.mjs:140` for the unknown names of an opened requirement, in
    `spec-changes/strategies.mjs:59` and in `review-pages/jobs.mjs:112`. Those stay.
- **The rule is MOD-trace-graph's `coverageGaps`**, in MOD-trace-pages' Uses. The view computes no gap itself, and copies
  nothing from the old `docs/assets/traceability/graph.mjs`.
- **Reads, against the token budget** (sprint 66). The view builds the version's graph once, as ITM-597's opening does:
  on this repository at most 17 GraphQL batches with a token (1633 paths at 100, ITM-607's gate), and raw reads outside
  the API without one. It is kept for the version.
- **The measurement asked, in a form the developer can make** (sprint 67): a committed test that counts `readMany` calls
  on a fixture snapshot. Opening the gaps view twice at one version reads the graph once.
- **Reachable** through MOD-site-frame's route `trace` with `key=gaps`. The live page reaches it once the live
  dashboard's code is in the architecture (queue `2026-10-17d`).
- **Sprint 64:** the developer runs the modules' tests and their callers', release tests included, on a draft, and lists
  every changed one before the tests-only commit.
- **Sprint 65:** DOM assertions compare a boolean or a string.
- **Sprint 66:** no refusal is worked around.
- **Sprint 67:** each shell command does one action, and a module header it touches loses its item history.

## Acceptance

- The view shows the matrix and the gaps at the version shown.
- *Gaps* says when there are none.
- An older version shows what existed at its commit.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**Rests on queue `2026-10-17d` (2026-10-17, po-opus).**
- akmaier rejected the path this item counts on: code no module owns, changed by a pull request between jobs.
- Under the draft of queue `2026-10-17d`, the module whose file names that code as taken over changes it in its own
  implementation job, moving it into the module or removing it. A workflow or a page whose place the platform fixes
  is named in that module's parts.
- For this item only its reachability reading changes, and it does not wait. The live page reaches `gaps` once the
  live dashboard's code is moved into MOD-site-frame by its own items, not by a pull request between jobs.
