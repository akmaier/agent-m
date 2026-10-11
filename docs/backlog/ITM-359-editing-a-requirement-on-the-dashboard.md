---
id: ITM-359
title: Editing a requirement on the dashboard
level: module
realises:
  - UC-018
  - A SPEC EDIT IS SAVED AS A PROPOSAL
  - A PERSON'S EDITS COLLECT IN ONE OPEN QUEUE
  - A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST
  - A RENAMED REQUIREMENT IS WITHDRAWN AND ADDED
  - A REQUIREMENT HAS FOUR FIELDS
  - ONE STATEMENT PER REQUIREMENT
  - THE NAME IS THE ID AND IT SURVIVES
  - A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE
  - A REFUSED SAVE KEEPS THE EDIT
  - NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT
  - A SPECIFICATION CHANGE IS APPROVED BEFORE IT IS WRITTEN
  - WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK
  - A GITLAB PRODUCT IS WRITTEN WITH A TOKEN
modules:
  - MOD-review-pages
builds_on:
  - ITM-341
  - ITM-343
  - ITM-357
  - ITM-307
  - ITM-301
tests:
  - unit
origin:
  - UC-018 steps 1 to 7 for a requirement, 3a, 3c, 4a, 4b, 5a, 6a, 6b, 7a
---
# ITM-359 Editing a requirement on the dashboard

**REGISTER**

## Outcome

MOD-review-pages' routes `requirement/<name>/edit` and `requirements/new`, as its file states them: the editor (ITM-343)
opens on the requirement's SPEC section, its blob noted, or on four empty fields for a new one; it shows the marks of
`requirementFindings` (ITM-301) without blocking, a *Why* field, and the impact list (ITM-307); for a changed name the
page says that the name is the identifier, and the impact list shows what names the old one; *Save* goes through
`proposeSection` (ITM-341), links the commit, and opens the new entry in `spec-entry/…` (ITM-357); another open proposal
on the same section is named; a refused save keeps the edit beside the newer text; without a token, GitHub's pages open
per file; on GitLab without a token there is no *Save*. Editing an open entry in place (UC-006 3a, UC-018 1a) and a
control in the specification browser that leads to `requirements/new` are not part of this item.

## Acceptance

- Unit tests that name MOD-review-pages state, before the code exists: an edit saved as a new entry of the person's
  open queue, `SPEC.md` unchanged, the entry opened; a second edit of the same section replacing its entry; a rename
  proposed as withdrawn and added; marks for a missing check and for a conjunction, with *Save* still offered; changed
  meanwhile: nothing written, the edit kept; another open proposal named.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/review-pages/` and the tests that name MOD-review-pages change.
