---
id: ITM-519
title: The checks the SPEC names for prompted changes exist
level: system
realises:
  - A PROMPTED USE-CASE CHANGE SEES ITS NEIGHBOURS
  - NO USE CASE IS LEFT OUT OF A PROMPT SILENTLY
  - A CI AGENT'S DRAFT ENTERS AS OPEN
  - AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT
modules:
  - MOD-job-runner
builds_on:
tests:
  - system
origin:
  - docs/backlog/sprints/team1/28.md
---
# ITM-519 The checks the SPEC names for prompted changes exist

**REGISTER**

## Outcome

SPEC.md names two checks that do not exist in `tests/`. This item writes them:
- **`tests/test_prompted_change_context.py`**, for `A PROMPTED USE-CASE CHANGE SEES ITS NEIGHBOURS`, `NO USE CASE IS LEFT
  OUT OF A PROMPT SILENTLY` and `A CI AGENT'S DRAFT ENTERS AS OPEN`;
- **`tests/test_artifact_provenance.py`**, for `AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT`.
Each checks what its requirement's *Check:* line says, with that line's counter-proof, against the behaviour already built:
the change kinds' recipes, `prepareJob`'s fit, the writers `open-files` and `queue-entries`, and `provenanceLines`.

The rest of what Sprint 28's review found is cut off:
- `tests/test_conversation_not_recorded.py` needs the prompt bar's conversation, so it is written with ITM-513.
- `tests/test_destination_disclosure.py` and the test headers that still guard the withdrawn name are ITM-528.

What no file states, and what is built:
- **The level.** These are system checks, as the other SPEC checks in Python are. They ask MOD-job-runner and the writers
  through node (`tests/jsrun.py`), as `tests/test_job_reading.py` does, with fixture repositories, a fixture CI agent and
  a stand-in driver. Nothing reaches the network.
- **The prompted change context.**
  - A job of `change-use-case` on a fixture product is prepared with `prepareJob`. Its parts hold the use case, every
    requirement it realises and every other use case of the product.
  - The same job for a drafter whose context cannot hold them is refused before anything is sent: the driver is never
    called, and the finding names what does not fit.
  - A CI agent's draft of `change-use-case` and of `change-requirements` is written by the writers as an open use case
    and as a queue entry, and `SPEC.md` stays byte-identical.
  - Counter-proof: neither is shown as accepted — no approval record names it.
- **The provenance.**
  - The commit a writer makes names the Agent M version, the participant and the model in its message, and the
    artifact's own text names none of them.
  - Counter-proof: a provenance line planted in the artifact's text is found.
- **Each expected value** stands in the check's own text (`A TEST DOES NOT TAKE ITS EXPECTED RESULT FROM A DOCUMENT`).

No existing test's expected result changes: the two files are new.

## Acceptance

- Both checks exist, check what their *Check:* lines say, and each counter-proof is shown failing on a planted fault,
  recorded in the pull request.
- They are written by a Developer who implemented none of the behaviour they check. Since they add no behaviour, the
  first commit need not be red.
- Only the two new files and, if needed, `tests/jsrun.py`'s list of modules it loads change.
