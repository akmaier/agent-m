---
id: ITM-1018
title: A drawn diagram follows the page's dark colour scheme
level: unit
realises:
  - EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE
modules:
  - MOD-markdown-render
builds_on:
  - ITM-686
tests:
  - unit
origin:
  - ITM-686's pull request #945 (sprint team1/93), from developer-sonnet-a's finding
---
# ITM-1018 A drawn diagram follows the page's dark colour scheme

**REGISTER**

## Outcome

`src/markdown-render/mermaid.mjs:73` initialises Mermaid without a theme. The old app used the dark theme under
`prefers-color-scheme: dark`, so with ITM-686 the live page's diagrams lose it. CI tests the light scheme only.

**First task:** read what MOD-markdown-render.md says of a diagram's colours. If it says nothing, the item stops for a
draft for akmaier.

## Acceptance

- Under `prefers-color-scheme: dark`, a drawn diagram uses the dark theme, and under light the default. A test checks
  both, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
