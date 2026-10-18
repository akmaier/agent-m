---
id: ITM-778
title: The instance's process models are listed
level: module
realises:
  - UC-031
  - THE CATALOGUE IS DATA
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-implementation-pages
  - MOD-site-frame
builds_on:
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-778 The instance's process models are listed

**REGISTER**

## Outcome

UC-031 step 1 and 2b. MOD-implementation-pages states the routes `models` and `models/<name>` and builds neither
(`src/implementation-pages/index.mjs`). This item builds `models`: the shipped catalogue and the instance's own models
from MOD-model-catalogue's `catalogue`, each with its kind of work, the products of this browser that declare it (the
products from `readSetting`, each declaration read with `readSnapshot`), and its findings. A shipped model offers
*Adapt* and never an edit in place, with the explanation UC-031 2b gives; an instance's model offers *Edit*; the page
offers *+ New model*. Each part carries a folded *What is this?*. The buttons lead to `models/<name>`, which ITM-779
builds.

**The explanations.** Each *What is this?* is `MOD-site-frame.explain` of a topic of MOD-site-frame's
`explanations.md`, which holds `process-model` but neither the parts of this page nor UC-031 2b's explanation of
*Adapt*. This item writes those topics into that file, so it changes MOD-site-frame too.

**Reading.** The module's Uses give `readSetting` for a job's settings; this item reads with it the setting
`products` (MOD-browser-store's table), the products this browser manages, as the products whose declarations it reads.

## Acceptance

- The route lists the five shipped models and a fixture instance's own model, each with its kind and the products that
  declare it; a shipped model offers *Adapt* only.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

## Settled at sprint team2/89's start, 2026-10-18 (po-opus-b): (a), answered by the texts

The question sprint 84 left for akmaier (`docs/backlog/sprints/team2/84.md:118-120`): may MOD-implementation-pages connect
each product of this browser (`parseAddress` and `connect`), or does the page show only the chosen product? Neither is
needed. MOD-implementation-pages uses `MOD-site-frame.chosenProduct` (MOD-implementation-pages.md:10, :199), and
`chosenProduct(context: { store, fragment })` gives "the product the address's fragment or the selector names, among the
products this browser keeps, connected with its own token to its own server only" (MOD-site-frame.md:154-156), with its
`host` (`ProductContext`). It parses the address itself (`src/site-frame/routing.mjs:57-62`).

**The reading:** for each address of `readSetting(store, "products")`, the route calls `chosenProduct` with the fragment
`#models/product=<address>` and reads the declaration with that product's `host` (`repositoryInfo`, `readSnapshot`,
both in the Uses); an address that cannot be connected is shown with its reason. The known positive is the same call on
the main page: `src/main-page/jobs.mjs:36` calls `chosenProduct` with the fragment `#jobs/product=<address>` and takes
its `host`; and
`tests/site-frame-chosen-product.test.mjs` with several products.

The item is buildable as it stands. While team 1's sprint 87 runs, ITM-878 changes MOD-site-frame, whose
`explanations.md` this item writes, so the item is held.
