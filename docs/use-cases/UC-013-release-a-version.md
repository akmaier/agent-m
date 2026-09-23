---
id: UC-013
title: Release a version
stage: release
actors:
  - Author
  - GitHub
realises:
  - CALENDAR VERSIONS
  - EVERY PRODUCT HAS ITS OWN VERSION LINE
  - A RELEASE IS TAGGED AND LOGGED
  - A VERSION IS NOT REWRITTEN
  - A PERSON'S OWN INPUT IS COMMITTED DIRECTLY
  - ONE CLICK PER DECISION
  - EVERY STEP EXPLAINS ITSELF
---
# UC-013 Release a version

**Goal.** The author marks a state of the product as a release that can be recovered, compared
and referred to later.

## Actors

- **Author** — decides when a state is a release and whether it is a minor or a patch step.
- **GitHub** — holds tag and changelog.

## Precondition

- The default branch contains the state to release.

## Main flow

1. The author chooses **Release** for a product.
2. Agent M shows the next version `YYYY.MINOR.PATCH` of that product's own line, preset to a minor
   step, and a changelog entry dated today, both editable.
3. The author presses **Release** — one click.
4. Agent M commits the changelog entry and sets the tag `vYYYY.MINOR.PATCH` on that commit.

A folded explanation says what a minor and a patch step mean here, and that a released version is
never changed afterwards.

```mermaid
sequenceDiagram
    actor A as Author
    participant M as Agent M
    participant G as GitHub
    A->>M: open Release
    M-->>A: next version and changelog entry
    A->>M: Release
    M->>G: commit changelog entry
    M->>G: tag vYYYY.MINOR.PATCH
```

## Alternative flows

- **2a. The year changed since the last release.** The version restarts at `YYYY.1.0`.
- **6a. The tag already exists.** The release stops; an existing tag is never moved. A correction
  becomes the next version.

## Postcondition

- The release is recoverable by its tag and described in the changelog.
- No other product's version changed.
