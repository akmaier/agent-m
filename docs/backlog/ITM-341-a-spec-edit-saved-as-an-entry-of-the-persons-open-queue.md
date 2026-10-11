---
id: ITM-341
title: A SPEC edit saved as an entry of the person's open queue
level: module
realises:
  - UC-018
  - A SPEC EDIT IS SAVED AS A PROPOSAL
  - A PERSON'S EDITS COLLECT IN ONE OPEN QUEUE
  - A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE
  - A REFUSED SAVE KEEPS THE EDIT
  - A RENAMED REQUIREMENT IS WITHDRAWN AND ADDED
  - A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST
  - THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
  - WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK
  - A GITLAB PRODUCT IS WRITTEN WITH A TOKEN
modules:
  - MOD-spec-changes
builds_on:
  - ITM-302
  - ITM-307
  - ITM-309
  - ITM-335
  - ITM-339
  - ITM-338
tests:
  - unit
origin:
  - UC-018 steps 5 and 6, 3a, 3d, 4a, 4b, 5a, 6a
---
# ITM-341 A SPEC edit saved as an entry of the person's open queue

**REGISTER**

## Outcome

MOD-spec-changes' `openQueueOf` and `proposeSection`, as its file states them, in `propose.mjs`, with the rationale's
schema that the writer `queue-entries` defines (ITM-338):

- `openQueueOf` gives the person's newest queue of the day, by the author of the commit that created its index
  (ITM-309), that has no entry in the SPEC yet.
- `proposeSection` writes one commit: the entry, its rationale — the change, the *Why*, the impact list (ITM-307), the
  origin — and its index row, into that queue or a new one; `trailers` end the commit's message, a job's provenance
  lines when a person saves a change by prompt, none for the person's own edit. A second edit of the same section in
  that queue replaces its entry; a rename is proposed as the old name withdrawn and the new one added (ITM-302); the
  target is never touched; when the section changed meanwhile, it refuses and returns the newer text; `alsoReplacing`
  names other open entries that replace the same section; without a token on GitHub it writes nothing and returns
  `fallbackEditLinks`' pages (ITM-335); on GitLab it fails with `TokenRequired`.

The requirement editor (ITM-359) and the prompt route of requirements (ITM-398) call it. `requirementHistory` and saving
an open entry in place (ITM-394) are not part of this item.

## Acceptance

- Unit tests that name MOD-spec-changes state, before the code exists, with a fixture host: the newest open queue of the
  day found and a new one made without it; an entry with its rationale, impact list and index row in one commit; a
  second edit of a section replacing its entry; a rename as withdrawal and addition; a changed section refused with its
  text; trailers at the end of the message; GitHub's pages without a token; `TokenRequired` on GitLab.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/spec-changes/` and the tests that name MOD-spec-changes change.
