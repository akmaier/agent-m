---
id: ITM-603
title: Leaving an edit route with unsaved changes asks first
level: module
realises:
  - UC-018
modules:
  - MOD-site-frame
  - MOD-markdown-render
  - MOD-review-pages
builds_on:
tests:
  - unit
origin:
  - the coverage of UC-001 to UC-020 (docs/measurements/2026-10-16_coverage-uc-001-020.md), at akmaier's request of 2026-10-16
---
# ITM-603 Leaving an edit route with unsaved changes asks first

**REGISTER**

## Outcome

UC-018 7a: "The dashboard asks before discarding them". MOD-markdown-render's `Editor.close()` asks (TST-343005), but no route calls it when the address changes.

**Who calls `close()` on a route change, read at sprint team1/56.** No text says.
- MOD-markdown-render's editor "asks first" when it is left, and `close()` asks (`src/markdown-render/editor.mjs:106`).
- The frame shows the next route on every `hashchange` (`src/site-frame/index.mjs:283`), so the route is replaced before
  anything could ask. A `hashchange` cannot be cancelled once it has happened.

So the frame has to ask the route shown before it shows another one. That needs a draft, committed on `main` for
akmaier:
- **MOD-site-frame.** `Route` gains `leave?: () -> boolean`. Before the frame shows another route on a change of the
  address, it asks the route shown, and `false` keeps that route and puts its address back.
- **MOD-markdown-render.** `Editor.close() -> boolean` asks first when the text holds unsaved changes, and says whether
  the editor closed.
- **MOD-review-pages.** The edit routes' `leave` closes their editor through `close`.

Each decision names its principle:
- *One responsibility:* the frame routes, the route knows its editor, and the editor knows its unsaved text.
- *No special first case:* `leave` is optional for every route, as `subject` is.

**Existing tests.** `tests/markdown-render-343.test.mjs:119-148` calls `close()` and ignores what it returns, so it
holds. No frame test asserts a route's replacement against a `leave`.

**Ready to be selected** once akmaier accepts the draft.

## Acceptance

- Leaving an edit route with unsaved changes calls the editor's `close()`, which asks.
- When the person declines, the changes stay.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
