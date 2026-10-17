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

**Settled at sprint team1/69's start. Selectable.**
- **The modules whose files it changes:**
  - MOD-site-frame: `index.mjs`. Before it shows another route on a `hashchange` (`:305` for the review and main
    pages), it asks the route shown through its optional `leave()`. `false` keeps the route and puts its address back.
  - MOD-markdown-render: `editor.mjs:105`, where `close()` returns whether the editor closed, and asks first when the
    text holds unsaved changes.
  - MOD-review-pages: its edit routes give `leave` that calls their editor's `close`.
  - All three texts are accepted (`b43da779`). No topic is added.
- **The grep, full output read:**
  - `grep -n hashchange src/site-frame/index.mjs` finds :305 and :370. :370 is the Bridge's window, whose routes have no
    editor. It gets the same call, since `leave` is optional for every route (no special first case).
  - `grep -n "close()" src/markdown-render/editor.mjs src/review-pages/*.mjs` finds the editor's definition alone, so no
    route calls `close` today.
  - `tests/markdown-render-343.test.mjs:119-148` calls `close()` and ignores its result, and it holds.
- **Reads, against the token budget:** none.
- **No error is added.**
- **Reachable:** the review pages' edit routes, live.
- **Sprint 68:** no release test is among the tests it is known to change. If the draft run finds one, the developer stops
  and reports it, and a separate item by another participant changes it first.
- **Sprint 64:** the developer's draft run over the modules' tests and their callers' lists every changed test before the
  tests-only commit.
- **Sprints 65 to 67:** DOM assertions compare booleans or strings, each shell command does one action, no refusal is
  worked around, and a module header the item touches loses its item history.

## Acceptance

- Leaving an edit route with unsaved changes calls the editor's `close()`, which asks.
- When the person declines, the changes stay.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**The draft it waited for is accepted** (akmaier, `b43da779`): MOD-site-frame's `Route.leave`, MOD-markdown-render's `Editor.close() -> boolean` and MOD-review-pages' leave (accepted blobs 33dee99a46a0, 66f2f8040b32, fb1576acca0f). It is free of drafts; its readings are read at its start.
