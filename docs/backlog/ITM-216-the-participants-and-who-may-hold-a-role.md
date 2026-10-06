---
id: ITM-216
title: The participants and who may hold a role
level: module
realises:
  - UC-002
  - PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE
  - A PARTICIPANT HAS ONE OF FIVE TYPES
  - A PARTICIPANT DECLARES ITS CAPABILITIES
  - A PARTICIPANT DECLARES WHERE IT PROCESSES DATA
  - A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL
  - A ROLE NAMES THE CAPABILITIES IT NEEDS
modules:
  - MOD-participant-list
builds_on:
  - ITM-213
tests:
  - unit
origin:
  - UC-002
---
# ITM-216 The participants and who may hold a role

**REGISTER**

## Outcome

MOD-participant-list's interface, as its file states it, for UC-002: `Participant`, `Capability`, `Need`,
`Eligibility`, `participantSchema` and `eligible`, in `src/participant-list/`, read from the instance's register
`docs/participants.md`. `differs` is not part of this item.

The item starts once MOD-documents' `documentFindings` is built. That item follows akmaier's decision on MOD-documents'
two changes (ITM-213), and the register's entries are named as errors through it.

## Acceptance

- Unit tests that name MOD-participant-list state, before the code exists, the instance's register read into participants with their type, capabilities, processing place and model; an
entry of a type outside the five, or a language-model participant without its model, named as an error; and `eligible`
offering for a role exactly the participants with every capability it needs, each with where it processes data.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- The existing tests stay green, with no expected result changed.
- Only `src/participant-list/` and the tests that name MOD-participant-list change (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).
