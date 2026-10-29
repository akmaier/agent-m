---
id: ITM-1284
title: The issue page's leads open Agent M's own use cases
level: module
realises:
  - UC-033
  - UC-012
modules:
  - MOD-maintenance-pages
builds_on:
  - ITM-1254
tests:
  - component
origin:
  - developer-sonnet-l's release tests of ITM-1254 (PR #1389), open question 1
---
# ITM-1284 The issue page's leads open Agent M's own use cases

**REGISTER**

## Outcome

UC-033 1a says "Agent M links to UC-012, step 2", and UC-012 5b leads to UC-017: both are use cases of Agent M. The
issue page calls `context.go("use-case", { id: "UC-012" })` and `context.go("use-case", { id: "UC-017" })`
(`src/maintenance-pages/issues.mjs:393`). The frame adds the chosen product to a `go` that names none
(`src/site-frame/index.mjs:367-370`), so on a product's page each lead opens the product's own use case of that number.
The empty product names the instance itself (`tests/site-frame-go-instance.test.mjs`); each lead goes to the instance's
use case.

## Acceptance

- On a product's issue page, each lead's fragment names no product and the use case's identifier; a case fails on the
  lead without `product: ""`.
- Only `src/maintenance-pages/` and its tests change.
