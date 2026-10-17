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
  - MOD-site-frame
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

**Settled at sprint team1/65's start**, in addition to the readings above:
- **ITM-594 is merged** (#686), so nothing holds it.
- **The graph is read when a requirement is opened, not when the tree is drawn.** `traceGraph(snapshot)` takes the
  version's snapshot as its `TextSource`, which reads through `readMany` in batches (MOD-trace-graph, Interfaces). It
  is built once per drawn version and kept for every later opening. So drawing `#spec` costs no more requests than it
  does today, which is the concern of ITM-574.
- **Measurement** (sprint 59): the pull request states the requests of drawing `#spec` and of opening one requirement,
  counted by the fetch spy on the base and on the head. Drawing must not grow.
- **The expected results that change** (sprint 64): the developer runs MOD-trace-pages' and MOD-trace-graph's tests,
  release tests included, on a draft of the change, and lists every test whose expected result changes before the
  tests-only commit. Among the tests that will change are the `tracesTo` tests, whose lists are empty today
  (`tests/trace-graph-*.test.mjs`).
- **The SPEC queue `2026-10-17c`** names `tests/trace-pages-specification.test.mjs` as the Check of the two
  requirements, and the item's tests there guard them by name.

## Acceptance

- The opened requirement lists, each as a link: its sources with version and part, its use cases with their review status, the decisions, modules and tests that name it, and its open proposals.
- *none*, *none yet*, unknown names and stale proposals are shown as the use case says.
- Its tests in `tests/trace-pages-specification.test.mjs` guard `A REQUIREMENT SHOWS WHAT TRACES TO IT` and `OPEN PROPOSALS ARE SHOWN IN THE BROWSER` by name (queue `2026-10-17c`).
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**Correction (2026-10-17, po-opus, at the gate on #690, `docs/gates/20261017-0533-development-release-testing-7f40.md`).**
- The open proposals and 5c are cut from this item into ITM-648, because the rule of what an entry changes is
  MOD-spec-changes' `entryView`.
- MOD-site-frame joins this item's modules: the folded notes of 2b and 5a are `explain` topics, not a fold of the
  view's own.
