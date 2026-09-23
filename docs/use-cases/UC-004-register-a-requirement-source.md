---
id: UC-004
title: Register a requirement source
stage: 1 sources
actors:
  - Author
realises:
  - THE SOURCE MODEL IS GENERIC
  - A SOURCE DECLARES ITS AUTHORITY
  - A LIVING SOURCE IS PINNED
  - THE SOURCE KIND IS ONE OF A CLOSED SET
  - EVERY ARTIFACT HAS AN IDENTIFIER
  - ARTIFACTS ARE MARKDOWN
---
# UC-004 Register a requirement source

**Goal.** The author records who or what may legitimately impose requirements on the product, and
with which authority — before any requirement is written.

## Actors

- **Author** — knows the stakeholders, standards and documents behind the product.

## Precondition

- The product is managed by Agent M (UC-001).

## Main flow

1. The author starts a new source.
2. Agent M asks for a name, a kind from the closed set (organisation, person, standard,
   regulation, document, system, measurement) and an authority (normative, advisory,
   informational).
3. The author enters them, plus a location and a contact where they exist.
4. If the source is maintained elsewhere, Agent M asks for the state that was read — a commit, a
   version, or a retrieval date.
5. Agent M assigns the identifier `SRC-<slug>`.
6. Agent M proposes the source as a Markdown file in the product repository.
7. The author accepts it by committing in GitHub.

```mermaid
sequenceDiagram
    actor A as Author
    participant M as Agent M
    participant G as GitHub
    A->>M: new source
    M-->>A: ask kind and authority
    A->>M: name, kind, authority, location
    M-->>A: ask pinned state (living source)
    A->>M: commit, version or date
    M->>G: proposal SRC-slug as Markdown
    A->>G: accept by commit
```

## Alternative flows

- **2a. The kind fits none of the seven.** The author picks the closest and explains in the
  description; the set is not extended ad hoc.
- **4a. The author cannot name a state.** The retrieval date is recorded; Agent M marks the source
  as pinned by date only.
- **5a. A source with the same slug exists.** Agent M proposes a different slug; a withdrawn
  identifier is never reused.

## Postcondition

- The source exists with identifier, kind, authority and, for a living source, a pinned state.
- Requirements can now name it (UC-005).
