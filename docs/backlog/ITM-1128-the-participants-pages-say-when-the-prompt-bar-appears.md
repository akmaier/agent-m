---
id: ITM-1128
title: The participants page and the endpoint configuration say that the prompt bar appears once a participant is reachable
level: module
realises:
  - UC-049
modules:
  - MOD-settings-pages
builds_on:
tests:
  - unit
origin:
  - developer-sonnet-i's release tests of UC-049 (ITM-513, pull request #1162, head 3d20fdc1)
---
# ITM-1128 The participants page and the endpoint configuration say that the prompt bar appears once a participant is reachable

**REGISTER**

## Outcome

UC-049 1a: "No participant is offered. The prompt bar is not shown. The participants page and the endpoint
configuration" say that it appears once a participant is configured and reachable. Neither says it.

## Acceptance

- TST-513025 passes and its `todo` is removed.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
