---
id: ITM-255
title: The explanations of adding a product and of a release
level: module
realises:
  - UC-001
  - UC-013
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-site-frame
builds_on:
tests:
  - unit
origin:
  - UC-001
  - UC-013
---
# ITM-255 The explanations of adding a product and of a release

**REGISTER**

## Outcome

Topics of MOD-site-frame's `explanations.md`, as its file states the file, in `src/site-frame/`, each shown folded by
`explain` (`EVERY STEP EXPLAINS ITSELF`), written for someone new to GitHub:
- for the steps of adding a product (UC-001), which the view `add-product` names (ITM-207): what a repository is, why
  the product gets a key of its own, what the commit contains, how to undo it, and why the product list lives in this
  browser only — the gate of ITM-207 found no such topic, so each *What is this?* was empty;
- for the release panel (UC-013), which the route `release` names (ITM-256): what each level checks, why release tests
  run with a participant other than the one that implemented the behaviour, and why a released version is never changed
  afterwards.

Each topic has a slug of its own, which those views name. Nothing else of the module is part of this item.

## Acceptance

- Unit tests that name MOD-site-frame state, before the topics exist, that `explain` gives each of these topics with the
  text that says what UC-001 and UC-013 ask of it.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  file it guards, and the test failing on it — is recorded in the pull request.
- The existing tests stay green, with no expected result changed.
- Only `src/site-frame/` and the tests that name MOD-site-frame change (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).
