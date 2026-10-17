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
