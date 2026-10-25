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
built_by:
  - 7d0efa0dc936796c6cf36f559db112edfc6597cd
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

## Built by ITM-1096 (read on sprint/team2/97 by developer-sonnet-f and po-opus-b, 2026-10-20)

This item was written against `main`, which did not hold the sprint yet. ITM-1096 (#1134, `2ab7cc1b` on
`sprint/team2/97`) already makes the participants page take a product's workflow from `productWorkflow`
(`src/settings-pages/participants.mjs:13`, `:281`). On that branch, `git grep model-catalogue -- src/settings-pages` finds
nothing; the same search finds `productWorkflow`, as the known positive. Its two pinning tests pass 22 of 22, and
system-uc-017 5 of 5. Nothing is left to build.

**Done (sprint team2/98, po-opus-b):** read against its Acceptance on `main` at `3436203a`: ITM-1096 (#1134) built it, and it reached `main` with team 2's sprint 97 (#1191): `src/settings-pages/participants.mjs:13`, `:281` take the workflow from `productWorkflow`. No pull request names it, since it predates the pull-request flow or was built by another item. No code changes.
