---
id: ITM-680
title: The review views of the live page are the review pages' routes
level: module
realises:
  - EVERY CODE FILE BELONGS TO A MODULE
  - UC-006
  - UC-008
modules:
  - MOD-review-pages
  - MOD-site-frame
  - MOD-trace-pages
  - MOD-settings-pages
  - MOD-prompt-bar
  - MOD-job-runner
  - MOD-runtimes
builds_on:
  - ITM-574
tests:
  - unit
origin:
  - the plan of moving the code outside the architecture into it (sprint team1/70), under `CODE OUTSIDE THE ARCHITECTURE IS MOVED INTO IT` and `docs/measurements/2026-10-17_code-outside-every-module.md`
---
# ITM-680 The review views of the live page are the review pages' routes

**REGISTER**

## Outcome

The live app, MOD-site-frame's since ITM-574, shows `uc`, `arc`, `review`, `spec`, `requirement` and `requirements`
through MOD-review-pages' routes, and *How acceptance works* as the fold of the topic `accepting`. Then
`docs/assets/dashboard/review-views.mjs`, `spec-changes-view.mjs`, `reads.mjs`, `writes.mjs`,
`requirement-prompt-view.mjs` and `how-view.mjs` go, with the tests of only them. The live addresses (`#uc/UC-001`,
`#spec/<queue>/<nn>`) keep leading where they led, through the app's dispatch, until the final switch.

It waits for akmaier's acceptance of the module-file draft committed with the plan, which names these files as taken over in the module's Parts.

## Acceptance

- Every file the module's file names as taken over for this item is moved into the module or removed, as that line says, and no other file outside the module changes.
- The live dashboard keeps working: the release tests of its pages pass on the item's head.
- A test of only a removed file goes with it, and the requirement it guarded is kept by a test of the module, named in the pull request.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
