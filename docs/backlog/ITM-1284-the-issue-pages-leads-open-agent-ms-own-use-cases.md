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
- **The function it needs is named in MOD-maintenance-pages' Uses:** `MOD-site-frame.View`, whose `go` takes the empty
  `product`, which "names the instance itself" (MOD-site-frame.md:192).
- **Two existing expectations of MOD-maintenance-pages change, in the tests-only commit:**
  - `tests/maintenance-pages-move-1250.test.mjs:291`, the lead to UC-012;
  - `tests/maintenance-pages-fix-583.test.mjs:143`, the lead to UC-017.
  - Each changes to `["use-case", { id: …, product: "" }]`.
- **Tests of other modules this Outcome changes: none.**
  - The search was for the leads (`uc-012`, `uc-017`, `go("use-case"`, `id: "UC-01[27]"`) over `tests/`. Its known
    positive is `maintenance-pages-move-1250`.
  - `release-itm-1254-issue-move` and `system-uc-012-fix-a-bug` assert no `go` of a lead.
- It removes no test.
