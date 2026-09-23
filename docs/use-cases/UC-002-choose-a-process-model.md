---
id: UC-002
title: Choose a process model and profile
stage: setup
actors:
  - Author
realises:
  - THE PROCESS MODEL IS DECLARED PER PRODUCT
  - THE CATALOGUE IS DATA
  - THE MODEL DETERMINES THE STAGES AND THE GATES
  - A PROFILE ADDS, IT DOES NOT REPLACE
  - A GATE NAMES WHAT IT CHECKS
---
# UC-002 Choose a process model and profile

**Goal.** The author decides how the product is developed — which stages exist, in which order,
and where a person must approve before work continues.

## Actors

- **Author** — decides the process for the product.

## Precondition

- The product is managed by Agent M (UC-001).
- No process model is declared yet, or the author wants to change it.

## Main flow

1. Agent M shows the catalogue: waterfall, V-model, reuse-oriented, incremental/prototyping,
   agile, Kanban, Scrum, DevOps, disciplined agile delivery at scale.
2. For each model it shows the risk the model manages well and the risk it accepts.
3. The author selects one model.
4. Agent M shows the stages, their pairing for verification, and every gate with the artifacts it
   checks and the condition it requires.
5. The author optionally adds one or more profiles, for example IEC 62304 class B.
6. Agent M shows which artifacts and evidence each profile adds, on top of the model's own.
7. Agent M proposes the declaration as a change to the product repository.
8. The author merges it.

```mermaid
sequenceDiagram
    actor A as Author
    participant M as Agent M
    participant G as GitHub
    M-->>A: catalogue with managed and accepted risks
    A->>M: select model
    M-->>A: stages, pairings, gates
    A->>M: add profile (optional)
    M-->>A: added artifacts and evidence
    M->>G: pull request with declaration
    A->>G: merge
```

## Alternative flows

- **3a. The author brings a model of their own.** It is added as a data file in the catalogue's
  format; Agent M's code is not changed.
- **5a. Two profiles require the same artifact.** It is required once and shows both profiles as
  its reason.
- **7a. The product already has artifacts from an earlier model.** Agent M lists which of them
  the new model no longer requires; none are deleted.

## Postcondition

- The product declares exactly one process model and zero or more profiles.
- The workflow Agent M offers for the product follows from that declaration alone.
