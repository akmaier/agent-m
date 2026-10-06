---
id: ITM-229
title: What each model of the catalogue is for
level: module
realises:
  - UC-002
  - AGENT M CARRIES THE BOOK'S CATALOGUE
modules:
  - MOD-model-catalogue
builds_on:
  - ITM-215
tests:
  - unit
origin:
  - UC-002
---
# ITM-229 What each model of the catalogue is for

**REGISTER**

## Outcome

MOD-model-catalogue's `## About` and `Model.about`, as its file states them, in `src/model-catalogue/`, for UC-002 step
2:
- the model schema's optional section `## About`, before `## Phases`, with its lines `manages:`, `accepts:`, `example:`
  and `chapter:`;
- every shipped model's `## About`: the risk it manages well, the risk it accepts, an example project it suits, and its
  chapter, taken from the book as the instance's source register holds it (`docs/sources/SRC-vibe-coding/2026-10-05/`,
  chapters 6 and 7), never from memory. Where the book states one of them for no model, the model's file says so, and the
  pull request names it;
- `Model.about`, read from that section, and `null` for a model without one.

## Acceptance

- Unit tests that name MOD-model-catalogue state, before the code changes:
  - every shipped model's `## About` read into `Model.about` with its four lines;
  - a model without `## About` read with `about` `null`.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- An existing test whose expected `Model` now carries `about` changes with it, named in the pull request with the
  expected result it changes. Every other test stays green with no expected result changed.
- Only `src/model-catalogue/` and the tests that name MOD-model-catalogue change (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).
