---
id: UC-009
title: Inspect traceability coverage
stage: 3 use cases
actors:
  - Reviewer
realises:
  - THE TRACEABILITY MATRIX IS DERIVED
  - UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN
  - A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION
  - THE NAME IS THE ID AND IT SURVIVES
---
# UC-009 Inspect traceability coverage

**Goal.** The reviewer sees, at any moment, which requirements no use case realises and which use
cases realise no requirement.

## Actors

- **Reviewer** — anyone reading the dashboard.

## Precondition

- The product has requirements and use cases on its default branch.

## Main flow

1. The reviewer opens the coverage view.
2. Agent M computes the matrix from the artifacts: every requirement name against every use case
   that names it.
3. Agent M lists requirements realised by no use case.
4. Agent M lists use cases that realise no requirement, and names that match no requirement.
5. The reviewer follows a line to the requirement or use case it concerns.

```mermaid
sequenceDiagram
    actor R as Reviewer
    participant D as Dashboard
    participant G as GitHub
    R->>D: open coverage
    D->>G: read requirements and use cases
    D->>D: compute matrix
    D-->>R: unrealised requirements
    D-->>R: use cases without requirement, unknown names
```

## Alternative flows

- **3a. Every requirement is realised.** The list says so; the view does not hide.
- **4a. A use case names a requirement that was withdrawn.** It appears under unknown names with
  the note that the name was withdrawn, not renamed.

## Postcondition

- Nothing is written; coverage is a view, never a stored document.
- Gaps are shown but block nothing.
