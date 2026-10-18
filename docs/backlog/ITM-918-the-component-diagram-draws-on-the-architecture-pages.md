---
id: ITM-918
title: A Mermaid diagram draws in the page
level: module
realises:
  - UC-025
  - EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE
modules:
  - MOD-markdown-render
builds_on:
  - ITM-904
tests:
  - unit
origin:
  - ITM-904's findings (sprint team1/89), `tests/site-usability.test.mjs`
---
# ITM-918 A Mermaid diagram draws in the page

**REGISTER**

## Outcome

**A lead from ITM-904.** In the check's Electron, locally and on CI, `#arc` and `#module` show "Diagram error: Cannot read
properties of null (reading 'getAttribute')" (`src/trace-pages/flow.mjs:394`). The diagram's source block then stands in its
place, and that block is what is too wide at a phone's width. It has not been seen in a visible window.

**First task, the stop clause:** reproduce the error in a page as the live app draws it, and name its cause. If it occurs
only in the test's Electron, the item stops and the check's todo is read again.

## Acceptance

- `renderMermaid` draws its diagram while its element stands in the document, as MOD-markdown-render.md:59 promises ("one
  diagram, drawn"). A test draws a flowchart and a sequence diagram through the vendored Mermaid in the check's Electron and
  finds an `svg` and no `.unrendered` block, with a counter-proof (the element left detached).
- `#arc`, `#module` and `#uc/UC-001` draw their diagrams. Their width todos in `tests/site-usability.test.mjs` are removed,
  or name what remains.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**Stopped at its first task (sprint team1/90, developer-sonnet-e), and re-cut onto MOD-markdown-render.** The cause, traced
in the check's own harness with the real `docs/index.html`, `dashboard-app.mjs` and the vendored `mermaid.min.js` (probe
`ITM-918-probe.mjs`):
1. `src/trace-pages/flow.mjs:435` (`drawModules`) calls `renderMermaid`.
2. `src/markdown-render/mermaid.mjs:72` makes a `div`, sets its source and never attaches it.
3. `:79` calls `m.run({ nodes: [element] })` on the detached element.
4. Mermaid 12.0.0 looks its SVG up under `body` unless `securityLevel` is `sandbox` (`:66` uses strict). This step is read
   from the minified source.
5. `:92` returns the `.unrendered` block.
At the failure node, the same sources draw an `svg` once appended to `document.body`, and fail detached: flowcharts with
`getAttribute`, a sequence diagram with `getBBox`. By this measurement, every Mermaid diagram on the live pages fails in
Electron's Chromium. MOD-markdown-render's contract already promises a drawn diagram, so this is a defect, and no draft is
needed. The developer began the check before finishing the brief's reading; whoever builds the item reads in full first.

