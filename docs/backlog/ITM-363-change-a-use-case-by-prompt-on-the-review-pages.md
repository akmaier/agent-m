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
  - ITM-389
  - ITM-395
tests:
  - unit
origin:
  - UC-019 steps 1 to 9 for a use case, 3a, 4a, 5a, 6c, 7a, 7b, 8b, 8c, 9a
---
# ITM-363 Change a use case by prompt on the review pages

**REGISTER**

## Outcome

MOD-review-pages' route `use-case/<id>/prompt`, as its file states it: the instruction; the participants that can draft
text with their places, or, with none, the reason and the link to UC-017's page; the run panel of `change-use-case`,
nothing sent without *Run*; the draft in the editor as its difference against the current text (ITM-343), each of
several files on its own, a changed identifier the loop left restored first with `keptIdentifier` (UC-019 7a; ITM-395);
the findings left, with the rounds, when the loop ended with some; an unusable answer named, the raw answer folded,
nothing written; *Refine*, which runs the kind once more with the follow-up instruction on the draft as it stands
(ITM-389); *Discard*; and *Save*, one click, which saves the draft as an edit of UC-018 is saved — the use cases with
one `saveFile`, in one commit (UC-019 8b; ITM-395), only on the text the job read, refused with the draft kept when it
changed meanwhile (9a), GitHub's pages without a token, and the job's provenance lines as trailers. A job of a CI agent
or of an agent on a Bridge is queued on its route, and its draft arrives as an open file. The use case's page offers
*Change by prompt*, which leads here. The prompt route of requirements (ITM-398) is not part of this item.

## Acceptance

- Unit tests that name MOD-review-pages state, before the code exists, with a fixture host and fixture drivers: the
  participants offered and the case of none; a context that does not fit, with nothing sent; the difference of a changed
  use case and of two; a changed identifier restored before the editor opens; the findings left with the rounds; an
  unusable answer folded with nothing written; *Refine* sending the draft and the instruction; *Discard* and no *Run*
  writing nothing; *Save* writing two files in one commit with the provenance lines; a use case changed meanwhile
  refusing the save with the draft kept.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/review-pages/` and the tests that name MOD-review-pages change.
