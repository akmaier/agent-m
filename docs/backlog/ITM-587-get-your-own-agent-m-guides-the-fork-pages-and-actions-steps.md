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
  - ITM-950
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

**Stopped before its first test (sprint team1/92, developer-sonnet-a).** Steps 1 and 2 need `webLinks().fork` and
`.pagesSettings`. MOD-repository-hosts.md:146-151 states them, but `src/repository-hosts/web-links.mjs` does not build
them, so ITM-950 builds them first. Step 4 needs MOD-identifiers.pagesAddress, which MOD-settings-pages.md's Uses do not
name. That line is a draft for akmaier, on `main`. This item waits for ITM-950's merge and for akmaier's acceptance of
the draft.

