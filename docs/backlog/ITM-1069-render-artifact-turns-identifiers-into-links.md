---
id: ITM-1069
title: renderArtifact turns the identifiers a caller resolves into links, as its text says
level: unit
realises:
  - DEVELOP AGAINST INTERFACES
modules:
  - MOD-markdown-render
builds_on:
tests:
  - unit
origin:
  - ITM-1014's first task (sprint team1/93), from developer-sonnet-c's finding
built_by:
  - 43347a8a5cedc3bb70221037650e023b13876f87
---
# ITM-1069 renderArtifact turns the identifiers a caller resolves into links, as its text says

**REGISTER**

## Outcome

MOD-markdown-render.md:54-57 gives `renderArtifact` an option `linkFor`: "every identifier the caller's `linkFor` resolves
turned into a link to its view". `src/markdown-render/render.mjs:48` takes only `frontMatter`, and no caller passes
`linkFor`. So the text states a feature that is not built.

**First task:** read which pages show identifiers that UC texts ask to be links. If none needs it, the item stops for a
draft for akmaier that takes `linkFor` out of the text.

## Acceptance

- `renderArtifact` links each identifier `linkFor` resolves, leaves the rest as text, and links nothing without `linkFor`.
  A test checks it, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**Done at sprint team1/93 (po-opus).** akmaier accepted the draft `43347a8a` at `c12fec0f`, so MOD-markdown-render's
`renderArtifact` no longer has `linkFor`. The text now states what `src/markdown-render/render.mjs` does, and nothing is left
to build. The option `frontMatter` is already tested: TST-342002's counter-proof changes its default.

