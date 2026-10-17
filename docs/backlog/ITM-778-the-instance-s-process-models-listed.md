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

**Reading.** The module's Uses give `readSetting` for a job's settings; this item reads with it the setting
`products` (MOD-browser-store's table), the products this browser manages, as the products whose declarations it reads.

## Acceptance

- The route lists the five shipped models and a fixture instance's own model, each with its kind and the products that
  declare it; a shipped model offers *Adapt* only.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
