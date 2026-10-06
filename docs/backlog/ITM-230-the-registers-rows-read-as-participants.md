---
id: ITM-230
title: The register's rows read as participants
level: module
realises:
  - UC-002
  - PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE
modules:
  - MOD-participant-list
builds_on:
  - ITM-216
tests:
  - unit
origin:
  - UC-002
---
# ITM-230 The register's rows read as participants

**REGISTER**

## Outcome

MOD-participant-list's reader of the instance's register, `participantsOf`, as its file states it once akmaier accepts
part 1 of the change request in sprint 06's record, in `src/participant-list/`: the rows of `docs/participants.md`, read
with `participantSchema`, as `Participant`s, the values `eligible` takes. The item waits for that decision.

## Acceptance

- Unit tests that name MOD-participant-list state, before the code exists:
  - this instance's register read into participants: a person without a model and a place, and a CLI agent with its
    model and its place;
  - a fixture row with a context and a price, read into numbers and a currency;
  - `eligible` given the participants read.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- The existing tests stay green, with no expected result changed.
- Only `src/participant-list/` and the tests that name MOD-participant-list change (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).
