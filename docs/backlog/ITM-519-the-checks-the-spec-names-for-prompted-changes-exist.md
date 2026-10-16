---
id: ITM-519
title: The checks the SPEC names for prompted changes exist
level: system
realises:
  - A PROMPTED USE-CASE CHANGE SEES ITS NEIGHBOURS
  - NO USE CASE IS LEFT OUT OF A PROMPT SILENTLY
  - A CI AGENT'S DRAFT ENTERS AS OPEN
  - AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT
  - A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
  - A RECORDED CONVERSATION IS KEPT WHERE IT WAS HELD
  - THE PAGE NAMES WHERE IT SENDS
modules:
  - MOD-job-runner
builds_on:
tests:
  - unit
origin:
  - docs/backlog/sprints/team1/28.md
---
# ITM-519 The checks the SPEC names for prompted changes exist

**REGISTER**

## Outcome

SPEC.md names checks that do not exist in `tests/`: `tests/test_prompted_change_context.py` (`A PROMPTED USE-CASE CHANGE
SEES ITS NEIGHBOURS`, `NO USE CASE IS LEFT OUT OF A PROMPT SILENTLY`, `A CI AGENT'S DRAFT ENTERS AS OPEN`),
`tests/test_artifact_provenance.py` (`AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT`) and
`tests/test_conversation_not_recorded.py` (`A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON`, `A
RECORDED CONVERSATION IS KEPT WHERE IT WAS HELD`). `tests/test_destination_disclosure.py`, which the SPEC names for `THE
PAGE NAMES WHERE IT SENDS`, covers only the GitHub token's destination, and the run panel's test headers still guard the
withdrawn name. Found by ITM-480's developer and the Product Owner's gates in Sprint 28.

## Acceptance

- Each named check exists and checks what its requirement's *Check* line says, with that line's counter-proof; where it
  needs behaviour not yet built — the conversation of the prompt bar —, it is written with the items that build it
  (ITM-503, ITM-504, ITM-513) and named here as waiting for them.
- `tests/test_destination_disclosure.py` checks a participant with its processing place, and no test header guards a
  withdrawn requirement.

## Intake Decision

Registration only, by scrum-master-opus from Sprint 28's review; it waits for the Product Owner's selection, which may cut
it by module.
