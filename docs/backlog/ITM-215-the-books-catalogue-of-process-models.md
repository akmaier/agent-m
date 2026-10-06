---
id: ITM-215
title: The book's catalogue of process models
level: module
realises:
  - UC-002
  - AGENT M CARRIES THE BOOK'S CATALOGUE
  - THE CATALOGUE IS DATA
  - THE MODEL DETERMINES THE PHASES AND THE GATES
  - A GATE NAMES WHAT IT CHECKS
  - A GATE NAMES WHO DECIDES IT
  - A PRACTICE IS NOT A MODEL
  - A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED
  - A PROCESS MODEL ORGANISES PEOPLE AND AGENTS
modules:
  - MOD-model-catalogue
builds_on:
  - ITM-213
tests:
  - unit
origin:
  - UC-002
---
# ITM-215 The book's catalogue of process models

**REGISTER**

## Outcome

MOD-model-catalogue's interface, as its file states it, for UC-002: `Model`, `catalogue`, `modelSchema` and
`modelFindings`, and the shipped catalogue as data — the models `waterfall`, `v-model`, `reuse-oriented`, `scrum` and
`kanban`, the practices `devops`, `prototyping`, `incremental-delivery` and `scaling-layers` — in `src/model-catalogue/`.
Their phases, transitions, verification pairs, gates, roles and flow control are taken from the book, as the instance's
source register holds it (`docs/sources/SRC-vibe-coding/2026-10-05/`, chapters 6, 7 and 14), never from memory; each file
names the chapter it follows. `docs/assets/process-model.mjs` is the model for reading and validating a definition.
`planGrid` and `modelDiagram` are not part of this item.

## Acceptance

- Unit tests that name MOD-model-catalogue state, before the code exists, that the catalogue holds exactly the five models in their two groups and the four practices; that every shipped
model passes `modelFindings` without an error; and, for each rule `modelFindings` enforces, a definition that breaks it —
a transition or a verification pair naming a phase the model lacks, a gate without artifacts, condition or decider, a role
without capabilities, a phase without a role, no declaration of planned or pulled work — named as an error.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- The existing tests stay green, with no expected result changed.
- Only `src/model-catalogue/` and the tests that name MOD-model-catalogue change (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).
