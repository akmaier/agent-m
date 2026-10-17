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

**Settled at sprint team1/71's start. Selectable.**
- **The modules whose files it changes:**
  - MOD-spec-changes: `propose.mjs`, where `proposeSection` and `saveEntry` take `openedHead`;
  - MOD-review-pages: its three callers, `edit.mjs`, `requirements-draft.mjs` and `entry-edit.mjs`. Each passes the
    commit of the snapshot it opened on.
  - The accepted text is `b43da779`.
- **The grep, full output read:** `grep -rln "proposeSection\|saveEntry" src tests`.
  - In `src`: those files, and `spec-changes/queues.mjs` and `index.mjs`.
  - The tests that call them gain `openedHead` in their input: `spec-changes-propose-section`, `spec-changes-save-entry`,
    `spec-changes-entry-view`, `review-pages-edit-requirement`, `review-pages-edit-entry`,
    `review-pages-fallback-pages-single-list`, `review-pages-conversation-draft`, `specification-and-design-together` and
    `system-uc-006-approve-spec-change`.
  - None of them is a release test.
- **Reads, against the token budget** (sprints 66 and 69): only a save without a token builds the fallback pages, and it
  reads the snapshot at `openedHead`. That is two requests per save, on a click and not on a page load.
  - **The measurement asked** (sprint 67): a committed test counting a fallback save's requests on base and head.
- **Error fields** (sprint 68): no error is added.
- **Sprints 68 and 70:** a release test among the changed tests stops the developer, who reports it, and the whole release
  file is run on the draft.
- **Sprints 64 to 67:** the draft run lists the changed tests; one action per shell command; DOM assertions compare
  booleans or strings; no refusal is worked around; a header the item touches loses its item history.

## Acceptance

- A file of the entry that appeared or disappeared on the default branch since the edit began is marked as differing.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**The draft it waited for is accepted** (akmaier, `b43da779`): MOD-spec-changes' `openedHead` of `proposeSection` and `saveEntry` (MOD-spec-changes, accepted blob bfbc5fce5845). It is free of drafts; its readings are read at its start.
