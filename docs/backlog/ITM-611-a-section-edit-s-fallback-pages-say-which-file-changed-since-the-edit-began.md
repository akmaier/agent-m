---
id: ITM-611
title: A section edit's fallback pages say which file changed since the edit began
level: module
realises:
  - UC-018
  - WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK
modules:
  - MOD-spec-changes
  - MOD-review-pages
builds_on:
  - ITM-592
tests:
  - unit
origin:
  - ITM-592's gate (docs/gates/20261016-2309-development-release-testing-df68.md): `proposeSection` computes `existing` from the snapshot it compares against, so `differs` is always false
---
# ITM-611 A section edit's fallback pages say which file changed since the edit began

**REGISTER**

## Outcome

Without a token, `proposeSection` and `saveEntry` return `fallbackEditLinks` for the entry's files. Each file's
`existing` is taken from the snapshot read at the save (`src/spec-changes/propose.mjs:386-388` and `:422-424`), which is
also the snapshot `fallbackEditLinks` compares against. So `differs` is always false, and UC-018 4a's "warns if one
already differs" never shows.

`existing` is to say whether the file existed when the edit began, as MOD-artifact-edits defines `differs`: "the file on
the default branch is no longer what the edit started from".

**The design, a draft for akmaier on `main`** (MOD-spec-changes, Interfaces, `proposeSection` and `saveEntry`).
- **What changes.** Both functions take `openedHead`, the commit the edit was opened on. A fallback page's `differs` says
  whether its file exists on the default branch otherwise than at `openedHead`.
- **The principles it rests on.**
  - *One responsibility.* The writer that builds the pages also knows where the edit began, so the caller passes that
    in and computes nothing.
  - *Nothing twice.* `fallbackEditLinks` keeps its definition of `differs` (MOD-artifact-edits). Only the input it is
    given changes.
  - *No special first case.* `openedHead` stands beside `openedBlob`, which already says what the edit started from.
- **The callers.** All in MOD-review-pages, each holding the snapshot it opened on, whose `commit` it passes:
  - `src/review-pages/edit.mjs:92`;
  - `src/review-pages/requirements-draft.mjs:73`;
  - `src/review-pages/entry-edit.mjs:71`.
- **Existing tests.**
  - Every test that calls the two functions gains `openedHead` in its input:
    - `tests/spec-changes-propose-section.test.mjs`, where TST-472992 asserts `differs` false at `:273`;
    - `tests/spec-changes-save-entry.test.mjs` (`:176`).
  - Their expected results hold, since their files exist alike at both commits.
- **Ready to be selected** once akmaier accepts the draft.

## Acceptance

- A file of the entry that appeared or disappeared on the default branch since the edit began is marked as differing.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
