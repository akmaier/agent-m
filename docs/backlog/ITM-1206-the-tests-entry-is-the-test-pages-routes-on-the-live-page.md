---
id: ITM-1206
title: The Tests entry is the test pages' routes on the live page
level: module
realises:
  - UC-026
  - UC-027
  - UC-028
  - UC-029
  - UC-030
modules:
  - MOD-site-frame
builds_on:
  - ITM-682
  - ITM-1099
  - ITM-758
  - ITM-760
  - ITM-764
  - ITM-765
tests:
  - unit
origin:
  - akmaier's request of 2026-10-25 to make the test pages active on the live page
---
# ITM-1206 The Tests entry is the test pages' routes on the live page

**REGISTER**

## Outcome

MOD-test-pages builds its routes `runs`, `schedule` and `generate` (ITM-758, ITM-760, ITM-761, ITM-763, ITM-764), and
`docs/index.html` loads the module (`data-views` names `test-pages`). The live app does not show them:

- `src/site/menu.mjs:13` opens the entry Tests on the view `tests` alone;
- `src/site/views.mjs` gives `tests` the file `tests-runs-view.mjs`, which does not exist and is not named in
  `docs/assets/dashboard/built.json`;
- `stageView` (`src/site/menu.mjs:21`) therefore finds no view, the menu shows Tests as *not built yet*, and `#tests` says
  so (`src/site-frame/dashboard-app.mjs:788`).

The same holds for MOD-trace-pages' route `trace`: the live app renders it only beneath other routes
(`renderSpecification`, `renderComponents`), never for its own fragment. So the links the test pages draw into it — the
tests browser (`key=tests`, UC-029) and the audit (`key=audit`, UC-030), the latter the link `embedRoute` puts into the
release panel when the route is not on the page (ITM-765) — lead nowhere.

This is the step ITM-682 took for `#release` and ITM-1099 for `#mail`: the live app renders the module's route for its own
fragment, the route becomes a built-in view, and the views whose files were never built go.

- The entry Tests opens MOD-test-pages' route `runs`; `#runs`, `#runs/<commit>`, `#schedule` and `#generate` render the
  module's routes of those names, with the context each route's `render` reads.
- `#trace/…` renders MOD-trace-pages' route `trace` with the parameters its fragment holds.
- The views `tests`, `tests-schedule`, `tests-generate`, `tests-browser` and `audit`, whose files do not exist, leave
  `src/site/views.mjs`.

## Acceptance

- A unit test naming MOD-site-frame: the live app's menu offers the entry Tests, and `#tests` renders the route `runs`;
  `#schedule`, `#generate` and `#trace` with `key=tests` and with `key=audit` each render their module's route.
  Counter-proof: without the change, each says *not built yet* or is not found.
- Release tests that pin the built views are changed by a participant other than the implementer, in a commit of its
  own, as at ITM-682 and ITM-1099, and run locally.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only MOD-site-frame's files (`src/site-frame/dashboard-app.mjs`, `src/site/views.mjs`, `src/site/menu.mjs`,
  `docs/assets/dashboard/built.json`, `docs/index.html`'s preloads as `src/site-frame/preloads.mjs` writes them) and
  tests change.
