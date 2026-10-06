---
id: ITM-220
title: Markdown rendered, and the editor of a form's section
level: module
realises:
  - UC-002
  - EVERY STEP EXPLAINS ITSELF
  - EDITS ARE PREPARED ON THE DASHBOARD
modules:
  - MOD-markdown-render
builds_on:
  - ITM-212
tests:
  - unit
origin:
  - UC-002
---
# ITM-220 Markdown rendered, and the editor of a form's section

**REGISTER**

## Outcome

MOD-markdown-render's `renderArtifact` and `openEditor`, as its file states them, for what UC-002's page needs, in
`src/markdown-render/`, with the rendering of `docs/assets/dashboard-app.mjs` as the model:
- `renderArtifact`: Markdown rendered to sanitised HTML. A Mermaid block is shown as its source with the reason, as the
  file says of a part that cannot be rendered: no page of UC-002 holds a diagram, so `renderMermaid` and the diagram
  library are not part of this item.
- `openEditor`, in which MOD-site-frame's `schemaForm` edits a section (ITM-221): the Markdown beside its live preview,
  the caller's marks beside their lines, *Save* calling the caller's `save`, and on a refusal the edit kept with the newer
  version and the difference beside it. `showDifference` is not part of this item.
- marked and DOMPurify, the libraries ARC-049 decides for Markdown and sanitising, vendored in `src/markdown-render/vendor/`
  with their licence files and the `README.md` the module's file names. `tests/test_no_backend.py` treats that folder as
  vendored once a change between jobs lists it.

## Acceptance

- Unit tests that name MOD-markdown-render state, before the code exists, headings, lists, emphasis, links, tables and code rendered; a script, an event attribute and a `javascript:` link
removed by the sanitiser; an image shown as a link; a Mermaid block shown as its source with the reason; the same text
giving the same HTML; and in the editor, the preview following an edit, a mark beside its line, *Save* calling `save`, and
a refusal keeping the edit with the newer version and the difference.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- The existing tests stay green, with no expected result changed.
- Only `src/markdown-render/` and the tests that name MOD-markdown-render change (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).
