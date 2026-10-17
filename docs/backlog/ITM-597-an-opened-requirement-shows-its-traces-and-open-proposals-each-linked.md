---
id: ITM-597
title: An opened requirement shows its traces and open proposals, each linked
level: module
realises:
  - UC-020
  - A REQUIREMENT SHOWS WHAT TRACES TO IT
  - OPEN PROPOSALS ARE SHOWN IN THE BROWSER
modules:
  - MOD-trace-pages
  - MOD-trace-graph
builds_on:
  - ITM-594
tests:
  - unit
  - component
  - system
origin:
  - the coverage of UC-001 to UC-020 (docs/measurements/2026-10-16_coverage-uc-001-020.md), at akmaier's request of 2026-10-16
---
# ITM-597 An opened requirement shows its traces and open proposals, each linked

**REGISTER**

## Outcome

UC-020 step 5 (traces and proposals), step 6 (links), 2b, 5a, 5b and 5c. `tracesTo`, `statuses`, `queues` and `linkedVersion` are built, but the view does not call them.

**The readings, settled on 2026-10-17 during sprint team1/63. It waits for ITM-594's merge,** since both change
`flow.mjs`.
- **MOD-trace-graph joins the modules.** `tracesTo` (`src/trace-graph/derive.mjs:22-26`) fills only `sources` and
  `tests`. Its comment leaves the other lists "to a later item that reads the others".
  - MOD-trace-graph's file (`tracesTo`, Interfaces) states their rule: every use case, decision, module, test and item
    that names the requirement, and a module also through its tests that guard it.
  - So this item builds them there, from the module's own text.
  - It copies nothing from the old `docs/assets/traceability/graph.mjs:186-200`.
- **Uses:** `MOD-trace-graph.traceGraph` and `tracesTo`, `MOD-approvals.statuses`, `MOD-spec-changes.queues` and
  `MOD-source-register.linkedVersion`, all in MOD-trace-pages' Uses and built.
- **5c, "accepting one makes the other stale":** a note the view writes when two of the `queues` entries touch the one
  requirement. MOD-spec-changes' `stale` state is another fact, of a record whose blob changed, and is not reused for it.
- **At a tag,** open proposals are hidden (UC-020 1a).
- **Reachable:** the live `#spec`.

## Acceptance

- The opened requirement lists, each as a link: its sources with version and part, its use cases with their review status, the decisions, modules and tests that name it, and its open proposals.
- *none*, *none yet*, unknown names and stale proposals are shown as the use case says.
- Its tests in `tests/trace-pages-specification.test.mjs` guard `A REQUIREMENT SHOWS WHAT TRACES TO IT` and `OPEN PROPOSALS ARE SHOWN IN THE BROWSER` by name (queue `2026-10-17c`).
- The first commit holds only the tests, and CI is red on it. No stub is committed.
