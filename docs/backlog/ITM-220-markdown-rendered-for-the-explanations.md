---
id: ITM-220
title: Markdown rendered for the explanations
level: module
realises:
  - UC-002
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-markdown-render
builds_on:
  - ITM-212
tests:
  - unit
origin:
  - UC-002
---
# ITM-220 Markdown rendered for the explanations

**REGISTER**

## Outcome

MOD-markdown-render's `renderArtifact`, as its file states it, for what the explanations of UC-002 need:
Markdown rendered to sanitised HTML, in `src/markdown-render/`, with the rendering of `docs/assets/dashboard-app.mjs` as
the model. Mermaid diagrams, the editor and the difference are not part of this item.

## Acceptance

- Unit tests that name MOD-markdown-render state, before the code exists, headings, lists, emphasis, links and code rendered; a script, an event attribute and a `javascript:` link removed
by the sanitiser; and the same text giving the same HTML.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- The existing tests stay green, with no expected result changed.
- Only `src/markdown-render/` and the tests that name MOD-markdown-render change (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).
