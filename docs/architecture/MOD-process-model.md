---
id: MOD-process-model
title: Reads and validates process model definitions, participants and a product's declaration, and derives its workflow
realises:
  - THE PROCESS MODEL IS DECLARED PER PRODUCT
  - THE CATALOGUE IS DATA
  - THE MODEL DETERMINES THE PHASES AND THE GATES
  - AGENT M CARRIES THE BOOK'S CATALOGUE
  - A PROCESS REQUIREMENT ADDS TO THE MODEL
  - A PROCESS MODEL ORGANISES PEOPLE AND AGENTS
  - A PRACTICE IS NOT A MODEL
  - A GATE NAMES WHAT IT CHECKS
  - A GATE NAMES WHO DECIDES IT
  - A ROLE NAMES THE CAPABILITIES IT NEEDS
  - PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE
  - A PARTICIPANT HAS ONE OF FIVE TYPES
  - A PARTICIPANT DECLARES ITS CAPABILITIES
  - A PARTICIPANT DECLARES WHERE IT PROCESSES DATA
  - A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED
  - A PLAN COVERS THE WHOLE SPECIFICATION
  - PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE
  - A PRODUCT DECLARES ITS DEFINITION OF DONE
  - THE DEFAULT DEFINITION OF DONE IS THE JOB RULES
  - A PHASE OR A TIME BOX MAY HAVE A BRANCH OF ITS OWN
  - WORK MERGES INTO THE DEFAULT BRANCH UNLESS A BRANCH IS SET
  - A GATE IS NOT DECIDED BY THE PARTICIPANT WHOSE WORK IT CHECKS
  - CLOSING A SPRINT CAN BE ASSIGNED TO A PARTICIPANT
  - AN AGENT'S RETROSPECTIVE CHANGES NO PROCESS BY ITSELF
  - UC-002
  - UC-017
  - UC-031
  - UC-035
follows:
  - ARC-003
  - ARC-006
  - ARC-019
uses: []
provides:
  - parseModel
  - validateModel
  - parseParticipants
  - parseDeclaration
  - assignable
  - deriveWorkflow
  - derivePlan
  - gateDecision
  - definitionOfDone
  - progress
---
# MOD-process-model Reads and validates process model definitions, participants and a product's declaration, and derives its workflow

## Responsibility

Everything about how a product is developed, read from data: process model definitions (shipped
catalogue and the instance's own), the instance's participant register, and each product's
declaration with roles, practices, branches and Definition of Done. It validates, derives the
workflow and plan, decides whether a gate has passed, and computes progress. Pure core.

**Current state.** No code exists. The shipped catalogue (waterfall, V-model, reuse-oriented, Scrum,
Kanban, and the practices) is data to be written in the format of ARC-019.

## Interfaces

- `parseModel(text) -> model` — a definition file (ARC-019): kind of work, phases, transitions, verification pairs, gates, roles, flow control, measure.
- `validateModel(model) -> [error]` — each error beside its field: unknown phase in a transition or pair, a phase no transition reaches, a gate without artifacts, condition or decider, a role without capabilities, a phase without a role, a gate checking an artifact no earlier phase produces, pulled work without exactly one of time box and WIP limit, a measure that does not fit the kind.
- `parseParticipants(text) -> [participant]` — `docs/participants.md` of the instance: name, one of the five types, capabilities, processing place, route; a row carrying a key value is an error.
- `parseDeclaration(text) -> declaration` — a product's `docs/process.md`: model and version, role assignment, practices, branches per phase or time box, Definition of Done, sprint-close assignee.
- `assignable(role, participants, restrictions) -> [{ participant, ok, missing, placeWarnings }]` — who may hold a role: every capability it needs, the person/agent rule, and where a linked source forbids the participant's processing place.
- `deriveWorkflow(model, practices, processRequirements) -> workflow` — phases, transitions, gates with deciders and branches; gates and artifacts added by accepted process requirements are marked with requirement and source; a practice adds and never replaces.
- `derivePlan(workflow, acceptedRequirements) -> [entry]` — for a planned model, one entry per requirement per phase (N × P).
- `gateDecision(gate, records, jobParticipant) -> { passed, by } | { waiting, deciders }` — passed only by a record of the gate's decider (role holder, agent or named CI check), never by the participant whose work it checks.
- `definitionOfDone(declaration) -> [condition]` — the product's conditions, the job rules when none are declared.
- `progress(workflow, snapshot) -> view data` — plan entries per phase, remaining items per time box, or items per state over time, as the model's measure names; gates passed, pending, not reached.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; open until accepted.*
