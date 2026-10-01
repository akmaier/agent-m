---
id: MOD-process-model
title: Reads and validates process models, the instance's participants and a product's declaration, derives the workflow, and decides gates and the Definition of Done
realises:
  - THE PROCESS MODEL IS DECLARED PER PRODUCT
  - THE MODEL DETERMINES THE PHASES AND THE GATES
  - AGENT M CARRIES THE BOOK'S CATALOGUE
  - A PROCESS REQUIREMENT ADDS TO THE MODEL
  - A PROCESS MODEL ORGANISES PEOPLE AND AGENTS
  - A PRACTICE IS NOT A MODEL
  - A GATE NAMES WHAT IT CHECKS
  - A GATE NAMES WHO DECIDES IT
  - A GATE IS NOT DECIDED BY THE PARTICIPANT WHOSE WORK IT CHECKS
  - PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE
  - A PARTICIPANT HAS ONE OF FIVE TYPES
  - A PARTICIPANT DECLARES ITS CAPABILITIES
  - A ROLE NAMES THE CAPABILITIES IT NEEDS
  - A PARTICIPANT DECLARES WHERE IT PROCESSES DATA
  - A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED
  - A PRODUCT DECLARES ITS DEFINITION OF DONE
  - THE DEFAULT DEFINITION OF DONE IS THE JOB RULES
  - A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS
  - AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST
  - A REFACTORING JOB BEGINS WITHOUT A FAILING TEST
  - A REFACTORING JOB CHANGES NO EXPECTED RESULT
  - AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES
  - A PHASE OR A TIME BOX MAY HAVE A BRANCH OF ITS OWN
  - WORK MERGES INTO THE DEFAULT BRANCH UNLESS A BRANCH IS SET
  - UC-002
  - UC-017
  - UC-031
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
  - gateDecision
  - definitionOfDone
  - doneCheck
---
# MOD-process-model Process models, participants, a product's declaration; gates and the Definition of Done

## Responsibility

Kernel. How a product is developed, read from data (ARC-019): process model definitions — the shipped
catalogue and the instance's own —, the instance's participant register, and each product's declaration
with roles, practices, branches and Definition of Done. It validates a definition, says who may hold a
role, derives the workflow with the gates and artifacts that process requirements add, decides whether a
gate has passed, and checks a pull request against the Definition of Done. It knows no model by name: the
catalogue is data. Where a linked source forbids a participant's processing place is given to it as a
restriction; it reads no source itself.

## Interfaces

- `parseModel(text) -> model` — a definition file (ARC-019): kind of work, phases, transitions, verification pairs, gates with their deciders, roles, flow control, measure.
- `validateModel(model) -> [error]` — each error beside its field: unknown phase in a transition or pair, a phase no transition reaches, a gate without artifacts, condition or decider, a role without capabilities, a phase without a role, a gate checking an artifact no earlier phase produces, pulled work without exactly one of time box and WIP limit, a measure that does not fit the kind.
- `parseParticipants(text) -> [participant]` — `docs/participants.md` of the instance: name, one of the five types, capabilities, processing place, route; a row carrying a key value is an error.
- `parseDeclaration(text) -> declaration` — a product's `docs/process.md`: model and version, role assignment, practices, branches per phase or time box, Definition of Done, sprint-close assignee.
- `assignable(role, participants, restrictions) -> [{ participant, ok, missing, placeWarnings }]` — who may hold a role: every capability it needs, the person/agent rule, and the places the restrictions forbid.
- `deriveWorkflow(model, practices, processRequirements) -> workflow` — phases, transitions, gates with deciders, and branches; gates and artifacts added by accepted process requirements marked with requirement and source; a practice adds and never replaces.
- `gateDecision(gate, records, workParticipant) -> { passed, by } | { waiting, deciders }` — passed only by a record of the gate's decider (role holder, agent or named CI check), never by the participant whose work it checks.
- `definitionOfDone(declaration) -> [condition]` — the product's conditions; the job rules when none are declared.
- `doneCheck({ conditions, job, commits, runs, changedFiles, headers, gates }) -> { ok } | { failed: [condition] }` — the step CI runs on a job's pull request: the first commit tests only and red (or, for refactoring, green throughout with no changed expectation), every changed file naming one of the job's modules, every gate before the merge recorded, and the product's own conditions; each failed condition named.

## Testing

Unit tests over definition fixtures: each of the five catalogue models must pass validation, and one
broken definition per rule must be refused (`tests/test_model_validation.py`); the plan count and the
workflow of each model against expected tables; gate decisions with a record by the decider, by someone
else and by the working participant. `doneCheck` is tested with constructed commit lists and CI results —
a refactoring with an edited expectation, a file outside the job's modules —, each case with its expected
verdict. No seams beyond the data passed in; no model.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; revised on 2026-10-01 by Claude (claude-opus-5-5) against commit d0e5631081876203e719a2508d673d904e7768db — the leaner architecture of the architecture review, as the PO approved it (UC-023): takes over the Definition of Done check; plan and progress moved to MOD-work-items; open until accepted.*
