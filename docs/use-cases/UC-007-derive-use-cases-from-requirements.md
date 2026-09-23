---
id: UC-007
title: Derive use cases from requirements
stage: 3 use cases
actors:
  - Author
  - Model endpoint
  - GitHub
realises:
  - A USE CASE REALISES NAMED REQUIREMENTS
  - A USE CASE HAS ACTOR, PRECONDITION, FLOW AND POSTCONDITION
  - DIAGRAMS ARE MERMAID IN MARKDOWN
  - ARTIFACTS ARE MARKDOWN
  - EVERY ARTIFACT NAMES ITS ORIGIN
  - A GENERATED ARTIFACT IS A PROPOSAL
  - ONE USE CASE, ONE FILE
---
# UC-007 Derive use cases from requirements

**Goal.** Agent M drafts use cases that realise the product's accepted requirements, each in its
own file, for review in UC-008.

## Actors

- **Author** — starts the stage and chooses what it covers.
- **Model endpoint** — drafts the use cases.
- **GitHub** — receives the proposal.

## Precondition

- The product has accepted requirements.
- A runtime is available (UC-003, UC-010 or UC-011).

## Main flow

1. The author selects the requirements the stage should cover, by default all that no use case
   realises yet.
2. Agent M states the destination and the content to be sent, and the author confirms.
3. Agent M sends the requirements with the use-case prompt from the single definition.
4. The endpoint returns use cases, each with actors, precondition, main flow, alternative flows,
   postcondition, a Mermaid diagram, and the names of the requirements it realises.
5. Agent M checks every realised name against the product's requirements and assigns
   identifiers `UC-<nnn>`.
6. Agent M proposes one file per use case under `docs/use-cases/` as a pull request.
7. The author merges; the use cases appear on the dashboard as open.

```mermaid
sequenceDiagram
    actor A as Author
    participant M as Agent M
    participant E as Model endpoint
    participant G as GitHub
    A->>M: select requirements
    M-->>A: destination and content
    A->>M: confirm
    M->>E: requirements with use-case prompt
    E-->>M: drafted use cases
    M->>M: check realised names, assign UC ids
    M->>G: pull request, one file per use case
    A->>G: merge
```

## Alternative flows

- **4a. A drafted use case names a requirement that does not exist.** Agent M removes the name
  and marks the use case for review; it does not invent a requirement.
- **4b. A drafted use case realises no requirement.** It is proposed anyway and marked; it may
  point to a requirement that was never written down.
- **6a. A use case with the same goal already exists.** Agent M proposes a change to that file
  instead of a new identifier.

## Postcondition

- Each proposed use case is one Markdown file naming the requirements it realises.
- None of them counts as accepted until UC-008.
