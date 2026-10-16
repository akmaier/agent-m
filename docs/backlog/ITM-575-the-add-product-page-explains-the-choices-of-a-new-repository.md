---
id: ITM-575
title: The add-product page explains the choices of a new repository
level: module
realises:
  - UC-001
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-settings-pages
  - MOD-site-frame
builds_on:
tests:
  - unit
  - system
origin:
  - the coverage of UC-001 to UC-020 (docs/measurements/2026-10-16_coverage-uc-001-020.md), at akmaier's request of 2026-10-16
---
# ITM-575 The add-product page explains the choices of a new repository

**REGISTER**

## Outcome

UC-001 2a: "links GitHub's page for a new repository, with a folded explanation of the choices there". The notice and the link are built (`src/settings-pages/products.mjs:162-168`). The notice carries no `explain`, and `src/site-frame/explanations.md` holds no topic for it.

## Acceptance

- The notice of a missing repository carries a folded explanation of the choices on the server's new-repository page, from a topic of `explanations.md`. The frame's topic check finds that topic.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
