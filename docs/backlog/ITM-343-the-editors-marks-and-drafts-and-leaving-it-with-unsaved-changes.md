---
id: ITM-343
title: The editor's marks and drafts, and leaving it with unsaved changes
level: module
realises:
  - UC-018
  - UC-019
  - EDITS ARE PREPARED ON THE DASHBOARD
  - A REFUSED SAVE KEEPS THE EDIT
  - A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT
modules:
  - MOD-markdown-render
builds_on:
  - ITM-220
  - ITM-342
tests:
  - unit
origin:
  - UC-018 steps 2 and 3, 3c, 7a
  - UC-019 step 8
---
# ITM-343 The editor's marks and drafts, and leaving it with unsaved changes

**REGISTER**

## Outcome

The `Editor` of `openEditor`, as MOD-markdown-render's file states it: `setMarks(findings)` shows marks beside their
lines without blocking *Save*; `showDraft(draft, against)` puts a participant's draft into the editor as its difference
against the current text (ITM-342); `close()` ends the editor; leaving with unsaved changes asks first, and leaving
after a save does not; the preview draws diagrams (ITM-342). The review pages' editors (ITM-358, ITM-359) and the prompt
pages (ITM-363) call it. `wireCommon` and `showNewer` in `docs/assets/dashboard/review-views.mjs` are the model and
stay.

## Acceptance

- Unit tests that name MOD-markdown-render state, before the code exists, in the small DOM of
  `tests/markdown-render.test.mjs`: marks set after opening are shown beside their lines, and *Save* is still offered;
  a draft shown against the current text marks its changed lines, and the editor then holds the draft; leaving after
  an edit asks, and leaving after a save or without an edit does not; after `close`, no editor remains.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/markdown-render/` and the tests that name MOD-markdown-render change.
