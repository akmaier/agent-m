---
id: ITM-393
title: The sections a draft of requirements changes
level: module
realises:
  - UC-005
  - UC-019
  - A CHANGE IS PROPOSED UNDER THE EXISTING NAME
  - A DUPLICATE ADDS A SOURCE, NOT A REQUIREMENT
  - A CONFLICT IS DECIDED BY A PERSON
  - THE PERSON WHO PROMPTS IS A SOURCE
modules:
  - MOD-spec-changes
builds_on:
  - ITM-302
  - ITM-303
tests:
  - unit
origin:
  - UC-005 step 8
  - UC-019 steps 6 and 8
---
# ITM-393 The sections a draft of requirements changes

**REGISTER**

## Outcome

MOD-spec-changes' `entrySections(spec, draft, classes, source)`, as its file states it, in `propose.mjs`: the sections
of the SPEC that the draft's candidates change, each as the whole section's new text, composed by the classes — a `new`
added to its section, a `change` under its existing name, a `duplicate` as an added source of the existing requirement,
a `conflict` only as the person resolved it —; every requirement names `source`, the job's, with the passage it draws
on, and the source of a rule its candidate points to; every other byte unchanged. Pure. The writer `queue-entries`
(ITM-338) and the prompt route of requirements (ITM-398) call it.

## Acceptance

- Unit tests that name MOD-spec-changes state, before the code exists: one candidate of each class composed into its
  section; an undecided conflict left out; the job's source and a pointed-to source named; every other byte of the
  section unchanged.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/spec-changes/` and the tests that name MOD-spec-changes change.
