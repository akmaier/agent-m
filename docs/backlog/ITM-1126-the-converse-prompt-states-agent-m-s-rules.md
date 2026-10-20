---
id: ITM-1126
title: The prompt of the kind converse states that everything drafted is a proposal and a SPEC change a queue entry
level: module
realises:
  - UC-049
  - A GENERATED ARTIFACT IS A PROPOSAL
  - A SPEC EDIT IS SAVED AS A PROPOSAL
modules:
  - MOD-job-catalogue
builds_on:
tests:
  - unit
origin:
  - developer-sonnet-i's release tests of UC-049 (ITM-513, pull request #1162, head 3d20fdc1)
---
# ITM-1126 The prompt of the kind converse states that everything drafted is a proposal and a SPEC change a queue entry

**REGISTER**

## Outcome

UC-049 step 3: the system prompt holds "Agent M's rules for what the participant drafts — everything is a proposal; a
change of the SPEC is saved as a queue entry". The definition of the kind `converse`
(`src/job-catalogue/kinds/converse/kind.md`) says neither. They are added to the kind's single definition (`ONE
DEFINITION, THREE DRIVERS`).

## Acceptance

- TST-513002 passes and its `todo` is removed.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
