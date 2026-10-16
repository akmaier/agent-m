---
id: ITM-587
title: Get your own Agent M guides the fork, Pages and Actions steps
level: module
realises:
  - UC-014
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-settings-pages
  - MOD-site-frame
builds_on:
tests:
  - unit
  - system
  - release
origin:
  - the coverage of UC-001 to UC-020 (docs/measurements/2026-10-16_coverage-uc-001-020.md), at akmaier's request of 2026-10-16
---
# ITM-587 Get your own Agent M guides the fork, Pages and Actions steps

**REGISTER**

## Outcome

UC-014 steps 1 to 5, from "A guided page opens; it asks for the person's GitHub name" to "Step 4 · Open your dashboard", with *Later* and the licence's folded explanation. This is MOD-settings-pages' route `get-your-own`. It is not built: `get-your-own-view.mjs` does not exist.

## Acceptance

- With the owner known, each step opens its exact GitHub page.
- The Actions step offers *Later*.
- Every step carries its folded explanation.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
