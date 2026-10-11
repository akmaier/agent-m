---
id: ITM-342
title: Diagrams drawn, front matter as a table, and a difference shown
level: module
realises:
  - UC-006
  - UC-008
  - UC-018
  - DIAGRAMS ARE MERMAID IN MARKDOWN
  - THE PROSE IS AUTHORITATIVE, THE DIAGRAM IS THE OVERVIEW
  - NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT
  - A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT
  - NO SERVER
modules:
  - MOD-markdown-render
builds_on:
  - ITM-220
tests:
  - unit
origin:
  - UC-008 steps 2, 2a
  - UC-006 step 2
  - UC-018 step 2
---
# ITM-342 Diagrams drawn, front matter as a table, and a difference shown

**REGISTER**

## Outcome

MOD-markdown-render, as its file and ARC-049 state them:

- `renderMermaid(source)` draws with the vendored diagram library at security level `strict`, its SVG sanitised; the
  library is loaded only when a page holds a diagram; a diagram that does not parse is shown with the parser's message
  beside its source.
- `renderArtifact` draws every `mermaid` block with it, and shows the front matter as a table unless it is hidden.
- `showDifference(before, after, { context })` shows two texts line by line, added and removed lines marked, with
  `context` lines around each change.
- The library file comes with its licence file and its line in `vendor/README.md`.

The review pages (ITM-355, ITM-357) and the editor's preview (ITM-343) call them. `renderMermaid` and `diffHtml` in
`docs/assets/dashboard-app.mjs` and `docs/assets/vendor/` are the model and stay. `linkFor`'s links for identifiers are
not part of this item.

## Acceptance

- Unit tests that name MOD-markdown-render state, before the code exists, in the small DOM of
  `tests/markdown-render.test.mjs`, where a test may stand in for the library's drawing that Node cannot do: a text
  with a `mermaid` block has it drawn at `strict`, and a text without one loads no library; a diagram that does not
  parse shows the message beside its source; front matter shown as a table, and hidden on request; `showDifference`
  marking one changed line with its context; a script inside a diagram's source never reaching the page.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/markdown-render/` and the tests that name MOD-markdown-render change.
