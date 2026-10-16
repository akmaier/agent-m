---
id: ITM-502
title: A queue entry's origin names a conversation, never its message
level: module
realises:
  - UC-019
  - A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
modules:
  - MOD-spec-changes
builds_on:
tests:
  - unit
origin:
  - the architecture of the prompt bar, accepted by akmaier at 7e893c63 (110d2499)
  - MOD-spec-changes, Data: `NN-<slug>.begruendung.md`
---
# ITM-502 A queue entry's origin names a conversation, never its message

**REGISTER**

## Outcome

The rationale of a drafted queue entry names as its origin a conversation in the prompt bar on the page it names, never
a message of it. The queue's `index.md` names no message either, since `A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY
WHEN RECORDING IS ON` allows no message's text in any commit. `provenanceLines` is called without `instruction`, which
it ignores.

The existing test whose expected result the accepted texts change, named here:

- TST-473003 (`tests/spec-changes-queue-entries.test.mjs`): the rationale's origin names the conversation's page, not
  the instruction.

No release test asserts the instruction in a rationale or an index: the release and system tests of UC-019 read only
the entries and the commit messages.

## Acceptance

- A drafted entry's rationale holds the page and no instruction; a counter-proof plants the instruction and the test
  finds it.
- The queue's `index.md` holds no instruction; the same counter-proof finds one planted there.
- Each test states its expected values in its own text (`A TEST DOES NOT TAKE ITS EXPECTED RESULT FROM A DOCUMENT`); a
  further existing test that the change turns red is not changed here: the Developer stops and names it.
