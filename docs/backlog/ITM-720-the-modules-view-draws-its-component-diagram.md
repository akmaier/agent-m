---
id: ITM-720
title: The modules view draws its component diagram
level: module
realises:
  - UC-025
  - MODULE GAPS ARE REPORTED, NOT FORBIDDEN
modules:
  - MOD-trace-pages
builds_on:
tests:
  - unit
origin:
  - ITM-680's stop at its gate rework (sprint team1/73)
---
# ITM-720 The modules view draws its component diagram

**REGISTER**

## Outcome

UC-025 step 5 reads: "Agent M draws the component diagram from the modules' declared uses as Mermaid". The old review
view drew it on `#arc` by importing `src/trace-pages/diagram.mjs` itself, from a file that belonged to no module.
ITM-680 moved that call into the app, which lies in MOD-site-frame's folder. There it breaks
`DEVELOP AGAINST INTERFACES` (SPEC.md:1211): "A module uses another module only through that module's interface, never
through its implementation".

MOD-trace-pages' text describes the `modules` view (`docs/architecture/MOD-trace-pages.md:113`), with the component
diagram among its extras. `src/trace-pages/views.mjs` holds only `specification` and `gaps`, so no interface draws the
diagram yet. This item builds the `modules` view in MOD-trace-pages, as its text describes it, behind `view`. It uses the
interfaces its Uses already name: MOD-trace-graph's `moduleRows` and `coverageGaps`, and MOD-markdown-render's
`renderMermaid`. So it needs no draft.

**The slice.** If the draft shows the view's table and its row pages are more than this sprint holds, the developer
stops. The component diagram with the table's rows is the slice, and the rest is split off.

## Acceptance

- The route `trace` with the view `modules` draws the table and the component diagram of the product's modules: one box
  per module in its subsystem's box, one arrow per use. A module that uses an interface no module provides shows the
  arrow as UC-025 5a describes.
- The diagram's text equals what `componentDiagram` gives today on the same product.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**Narrowed at its stop (sprint team1/73, 2026-10-17, po-opus): the component diagram only.**
- MOD-trace-graph's `moduleRows` is stated and not built (`src/trace-graph/index.mjs`'s header). ITM-692 builds it, so
  the table, the gaps and the row pages cannot be derived through the interface yet. They are ITM-721.
- This item builds the `modules` descriptor and its drawing through `renderMermaid`, from `traceGraph`'s MOD nodes and
  their `follows` and `uses` edges. It changes MOD-trace-pages only, and leaves `componentDiagram` as it is.
- The developer's probe on this repository's 54 modules gave the same text as `componentDiagram` over each module file,
  23126 characters each. The acceptance's equality is pinned by a test on a fixture.
- **Versions** are "branch" in the module's table, so the view offers the default branch only. That reading is
  accepted.
- The acceptance's table and its UC-025 5a arrow move to ITM-721 and ITM-210. What remains is the diagram, its
  equality with `componentDiagram`, and tests first.
