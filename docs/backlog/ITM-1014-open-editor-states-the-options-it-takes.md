---
id: ITM-1014
title: openEditor's options are the ones its module file states
level: unit
realises:
  - DEVELOP AGAINST INTERFACES
modules:
  - MOD-markdown-render
builds_on:
tests:
  - unit
origin:
  - ITM-672's draft (sprint team1/92), from developer-sonnet-b's finding
---
# ITM-1014 openEditor's options are the ones its module file states

**REGISTER**

## Outcome

`src/markdown-render/editor.mjs` documents `openEditor` with an option `disabledReason` and no `linkFor`, while
MOD-markdown-render.md:62-63 lists `linkFor` and no `disabledReason`.

**First task:** read which options the callers pass. If the code is right, the item stops for a draft for akmaier.

## Acceptance

- `openEditor` takes the options its module file states, and a test names each, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
