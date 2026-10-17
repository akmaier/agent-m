---
id: ITM-812
title: The process page groups the catalogue's models by their kind
level: module
realises:
  - UC-002
  - THE CATALOGUE IS DATA
modules:
  - MOD-implementation-pages
builds_on:
tests:
  - unit
origin:
  - ITM-776, which cannot be built green while process.mjs names the shipped models
---
# ITM-812 The process page groups the catalogue's models by their kind

**REGISTER**

## Outcome

UC-002 step 2 shows the book's models in two groups, *plan-driven* and *agile*. `src/implementation-pages/process.mjs:52-55`
builds these groups from a list of model names in code (`GROUPS`), and `:164` finds the instance's own models by their
absence from that list. `THE CATALOGUE IS DATA` allows no model name in code, so ITM-776's release test would stay red.

This item builds the groups from what `catalogue` returns: a shipped model of `kind: planned` under *Plan-driven*, one of
`kind: pulled` under *Agile*, each in the order of `shipped.md`; an instance's model, by its path under
`docs/process-models/`, under *This instance*. No model or practice name stays in a code file of the module.

## Acceptance

- With the shipped catalogue the page shows the same groups, models and order as before; a fixture model of each kind
  added as data appears in its group without a change to code; an instance's model appears under *This instance*.
- No name of a shipped model or practice appears in `src/implementation-pages/`.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
