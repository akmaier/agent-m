---
id: ITM-1141
title: The participants page derives a product's roles through productWorkflow, not through the model catalogue
level: module
realises:
  - DEVELOP AGAINST INTERFACES
  - A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES
modules:
  - MOD-settings-pages
builds_on:
tests:
  - unit
origin:
  - po-opus-b's run of MOD-trace-graph's moduleRows over main at f9a793f7, for ITM-1068's draft
---
# ITM-1141 The participants page derives a product's roles through productWorkflow, not through the model catalogue

**REGISTER**

## Outcome

`src/settings-pages/participants.mjs:12` imports `catalogue` and `modelSchema` of MOD-model-catalogue, which
MOD-settings-pages' `uses:` does not name. moduleRows lists it as a gap: "an import between modules that the importing
module's file does not name". The file uses them to build a product's workflow by hand
(`participants.mjs:280-289`, `:298`): the model from the catalogue, its practices read, and `workflowOf` twice.
MOD-settings-pages.md:276-277 names the way it takes: "MOD-product-process.declarationSchema, productWorkflow — the
products and roles that use a participant, each product's roles from its declared workflow". So the code goes around
the interface its text names. It takes `productWorkflow`, and the imports of MOD-model-catalogue go.

Read `productWorkflow`'s text first (MOD-product-process). If it cannot give the roles as the page shows them, stop and
name the gap, which is then a draft for akmaier (AGENTS.md §6a.6).

## Acceptance

- The participants page shows the same products and roles as before, derived through `productWorkflow`. A test pins
  them over a fixture product.
- moduleRows lists no import of MOD-settings-pages that its uses do not name.
- It is declared as refactoring: no expected result changes, and CI is green on every commit.
