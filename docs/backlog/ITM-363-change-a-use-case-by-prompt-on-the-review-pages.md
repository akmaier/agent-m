---
id: ITM-363
title: Change a use case by prompt on the review pages
level: module
realises:
  - UC-019
  - A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT
  - A PROMPTED USE-CASE CHANGE SEES ITS NEIGHBOURS
  - NO USE CASE IS LEFT OUT OF A PROMPT SILENTLY
  - THE PAGE STATES WHAT IT SENDS WHERE
  - A PARTICIPANT DECLARES ITS CAPABILITIES
  - A PARTICIPANT DECLARES WHERE IT PROCESSES DATA
  - THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
  - ONE CLICK PER DECISION
  - EVERY STEP EXPLAINS ITSELF
  - THE ROUNDS ARE COUNTED AND SHOWN
modules:
  - MOD-review-pages
builds_on:
  - ITM-362
  - ITM-343
tests:
  - unit
origin:
  - UC-019 steps 1 to 9 for a use case, 3a, 4a, 5a, 6c, 7a, 7b, 8b, 8c
---
# ITM-363 Change a use case by prompt on the review pages

**REGISTER**

## Outcome

MOD-review-pages' route `use-case/<id>/prompt`, as its file states it: the instruction; the participants that can draft
text with their places, or, with none, the reason and the link to UC-017's page; the run panel of `change-use-case`,
nothing sent without *Run*; the draft in the editor as its difference against the current text (ITM-343), each of
several files on its own; the findings left, with the rounds, when the loop ended with some; an unusable answer named,
the raw answer folded, nothing written; *Discard*; and *Save*, one click, which lets the job's result go on through
`writeResult` and the writer `open-files` as the person left it. A job of a CI agent or of an agent on a Bridge is
queued on its route. The use case's page offers *Change by prompt*, which leads here. The prompt route of requirements,
*Refine*, restoring a changed `id` before the editor opens, and refusing a save when the use case changed while the
participant drafted (UC-019 9a) are not part of this item.

## Acceptance

- Unit tests that name MOD-review-pages state, before the code exists, with a fixture host and fixture drivers: the
  participants offered and the case of none; a context that does not fit, with nothing sent; the difference of a
  changed use case and of two; the findings left with the rounds; an unusable answer folded with nothing written;
  *Discard* and no *Run* writing nothing; *Save* writing once, through the kind's writer.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/review-pages/` and the tests that name MOD-review-pages change.
