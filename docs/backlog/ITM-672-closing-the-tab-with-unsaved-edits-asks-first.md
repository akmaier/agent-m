---
id: ITM-672
title: Closing the tab with unsaved edits asks first
level: module
realises:
  - UC-018
modules:
  - MOD-site-frame
  - MOD-markdown-render
  - MOD-review-pages
builds_on:
  - ITM-603
tests:
  - unit
origin:
  - ITM-603's gate on pull request #712 (docs/gates/20261017-0907-development-release-testing-c71d.md), from developer-sonnet-e's finding
---
# ITM-672 Closing the tab with unsaved edits asks first

**REGISTER**

## Outcome

UC-018 7a asks before unsaved changes are discarded. Closing or reloading the tab discards them too, and ITM-603
covers only a change of the address. A browser asks before unloading only through `beforeunload`, which cannot show a
page's own dialog, and `Route.leave` asks with one. The start reads against MOD-site-frame's accepted `Route` whether
the frame can learn that the route shown holds unsaved changes without asking. If it cannot, the item waits for a draft
of `Route`.

## Acceptance

- Closing or reloading the tab while an editor holds unsaved changes makes the browser ask first.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**The drafts for akmaier are on `main`** (sprint team1/92, written by developer-sonnet-a and developer-sonnet-b).
- MOD-site-frame's `Route` gains `unsaved`, and while the route shown reports it true, closing or reloading the tab makes
  the browser ask first.
- MOD-markdown-render's Editor gains `unsaved()`, read by `close` from the same rule (`src/markdown-render/editor.mjs:106`),
  so that no route copies it.
- MOD-review-pages' editor route passes `editor.unsaved()` through, which is code only.
- The item builds also `src/markdown-render/index.mjs:4`'s list of the Editor's methods.
- It waits for the acceptance, and for team 2's ITM-608, which holds MOD-review-pages back.

