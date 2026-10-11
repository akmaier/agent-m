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
  origin — and its index row, into that queue or a new one. A second edit of the same section in that queue replaces
  its entry; a rename is proposed as the old name withdrawn and the new one added (ITM-302); the target is never
  touched; when the section changed meanwhile, it refuses and returns the newer text; `alsoReplacing` names other open
  entries that replace the same section; without a token on GitHub it writes nothing and returns `fallbackEditLinks`'
  pages (ITM-335); on GitLab it fails with `TokenRequired`.

The requirement editor (ITM-359) calls it. `requirementHistory` and editing an entry of another queue in place are not
part of this item.

## Acceptance

- Unit tests that name MOD-spec-changes state, before the code exists, on a fixture repository behind a Host of the
  tests' own: the day's first edit opens a new queue in one commit; an edit of another section joins that queue; a
  second edit of the same section replaces its entry; a queue with an entry in the SPEC is not the open one; a rename
  proposed as withdrawn and added, with the impact list of the old name; a section changed meanwhile refused with the
  newer text; an open entry of another queue on the same section named in `alsoReplacing`; without a token, pages
  returned and nothing written; GitLab without a token failing with `TokenRequired`; `SPEC.md` byte-identical after
  every case.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/spec-changes/` and the tests that name MOD-spec-changes change.
