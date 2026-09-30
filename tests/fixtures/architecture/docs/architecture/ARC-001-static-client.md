---
id: ARC-001
title: The dashboard is a static client of the Git server's API
forced_by:
  - RULE ONE
  - UC-001
---
# ARC-001 The dashboard is a static client of the Git server's API

## Context

The product has no server of its own.

## Decision

The page reads and writes through the Git server's API.

## Alternatives

- A small server of our own — rejected: it would have to be operated.

## Consequences

Every write is a commit made with the person's own token.
