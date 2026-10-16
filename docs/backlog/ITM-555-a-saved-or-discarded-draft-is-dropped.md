---
id: ITM-555
title: A saved or discarded draft is dropped, and a route without a subject of its own takes the frame's default
level: module
realises:
  - UC-019
  - UC-049
modules:
  - MOD-prompt-bar
  - MOD-site-frame
  - MOD-review-pages
builds_on:
  - ITM-507
tests:
  - unit
origin:
  - ITM-507's gate (#602): Save and Discard leave the draft in the tab, since no interface drops it; the review pages keep a copy of the frame's default subject, since a route cannot give none for some of its parameters
  - architecture drafts for akmaier: MOD-prompt-bar provides dropDraft; MOD-site-frame's Route.subject may give null
---
# ITM-555 A saved or discarded draft is dropped, and a route without a subject of its own takes the frame's default

**REGISTER**

## Outcome

- **Dropping the draft.** MOD-prompt-bar's `dropDraft(store, subject)` drops the conversation's latest draft where it
  was drafted on that subject. The review pages' route `draft` calls it once *Save* has saved, and on *Discard*. A
  `ConversationDraft` is then "kept in the tab until the person saves or discards it", as MOD-prompt-bar states.
- **The frame's default subject.** MOD-site-frame's frame gives its default subject where a route's `subject` gives
  `null`. The review pages' routes give `null` where they now build a local copy of that default
  (`src/review-pages/subjects.mjs`), and the copy is removed (AGENTS.md §2, "Nothing twice").

It waits for akmaier's acceptance of the two drafts.

No existing test's expected result changes beyond ITM-507's own tests of the default subject, which then expect the
frame's default with its menu label.

## Acceptance

- **Save and Discard.** After *Save*, and after *Discard*, `latestDraft` for the subject gives `null`, and the route
  says that there is no draft.
- **The default subject.** A route whose `subject` gives `null` has the frame's default, menu label included.
- **No copy left.** No copy of the default subject remains in `src/review-pages/`.
- **Tests first.** The first commit holds only the tests, and CI is red on it. No stub is committed.
- **Expected values in the tests.** Each test states its expected values in its own text.
