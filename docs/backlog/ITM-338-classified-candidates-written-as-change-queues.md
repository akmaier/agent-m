---
id: ITM-338
title: Classified candidates written as change queues
level: module
realises:
  - UC-005
  - UC-019
  - A CHANGE IS PROPOSED UNDER THE EXISTING NAME
  - A DUPLICATE ADDS A SOURCE, NOT A REQUIREMENT
  - A CONFLICT IS DECIDED BY A PERSON
  - A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST
  - A REQUIREMENT NAMES WHAT IT CONSTRAINS
  - A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN
  - A CI AGENT'S DRAFT ENTERS AS OPEN
  - AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT
modules:
  - MOD-spec-changes
builds_on:
  - ITM-337
  - ITM-303
  - ITM-307
  - ITM-302
tests:
  - unit
origin:
  - UC-005 step 8, 5b, 6a, 7b
  - UC-019 6b
---
# ITM-338 Classified candidates written as change queues

**REGISTER**

## Outcome

The writer `queue-entries` of `specStrategies`, as MOD-spec-changes' file states it, with the rationale's schema
`queue-rationale.schema.md`: classified candidates written as a new queue of the SPEC each belongs in — a candidate that
constrains the development process to a queue of the instance's SPEC, its class decided with `classifyCandidates`
(ITM-303) against that SPEC and its open queues, every other to one of the product's —, one commit per queue; one entry
per section they touch, its current text from `sectionText` (ITM-302): a `new` added to its section, a `change` under
its existing name, a `duplicate` as an added source, a `conflict` only as the person resolved it; each rationale with
its origin, its impact list (ITM-307), the version, participant, model, date and rounds; the commit with the job's
provenance lines; `SPEC.md` untouched.

## Acceptance

- Unit tests that name MOD-spec-changes state, before the code exists, with a fixture host: one candidate of each
  class written as said; an undecided conflict not written and a resolved one written as decided; a process candidate
  in the instance's queue; one entry per touched section with its rationale, impact list and provenance lines;
  `SPEC.md` byte-identical.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/spec-changes/` and the tests that name MOD-spec-changes change.
