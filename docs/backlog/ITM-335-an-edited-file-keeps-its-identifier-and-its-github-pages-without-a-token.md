---
id: ITM-335
title: An edited file keeps its identifier, and its GitHub pages without a token
level: module
realises:
  - UC-008
  - UC-018
  - AN EDITED FILE KEEPS ITS IDENTIFIER
  - WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK
  - NO TEXT TRAVELS IN A URL
  - A GITLAB PRODUCT IS WRITTEN WITH A TOKEN
modules:
  - MOD-artifact-edits
builds_on:
  - ITM-219
  - ITM-310
tests:
  - unit
origin:
  - UC-018 3b, 4a, 4b, 6b
  - UC-008 3a, 3b
---
# ITM-335 An edited file keeps its identifier, and its GitHub pages without a token

**REGISTER**

## Outcome

MOD-artifact-edits, as its file states it:

- `saveFile`'s refusal `identifier changed`: the identifier the saved text declares, read by its kind's schema,
  differs from `openedId`, and nothing is written.
- `fallbackEditLinks(files, snapshot)` in `fallback.mjs`: one GitHub page per file — the editor of an existing file,
  the new-file page of a new one (ITM-310) —, the link carrying the path only and the text returned for the clipboard;
  `differs` when the default branch no longer holds what the edit started from; refused for GitLab.

The review pages (ITM-358) and MOD-spec-changes' `proposeSection` (ITM-341) call them. `saveReviewedFile` and
`keptRefusalText` in `docs/assets/dashboard/writes.mjs` are the model and stay. `saveGroupFile` and the refusal `not one
place` are UC-021's and not part of this item.

## Acceptance

- Unit tests that name MOD-artifact-edits state, before the code exists, on a fixture repository behind a Host of the
  tests' own: a use case and a module file saved under another identifier, each refused with both identifiers and
  nothing written; the same identifier saved; links that carry no text, the texts returned; `differs` once the branch
  moved; refused for GitLab.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/artifact-edits/` and the tests that name MOD-artifact-edits change.
