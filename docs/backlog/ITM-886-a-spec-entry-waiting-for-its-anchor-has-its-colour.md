---
id: ITM-886
title: A SPEC entry waiting for its anchor has its colour
level: module
realises:
  - UC-006
modules:
  - MOD-site-frame
builds_on:
  - ITM-874
tests:
  - unit
origin:
  - developer-sonnet-d's finding on ITM-874's pull request #845 (sprint team1/87)
---
# ITM-886 A SPEC entry waiting for its anchor has its colour

**REGISTER**

## Outcome

A SPEC entry in the state "waiting for its anchor" (`src/spec-changes/queues.mjs:207`) has no colour rule.
`docs/assets/style.css:26-30` colours open, accepted, applied, approved, changed, stale and superseded only. A rule for it
cannot go into `docs/assets/style.css`, a file outside every module (`CODE OUTSIDE THE ARCHITECTURE IS MOVED INTO IT`).
MOD-site-frame.md:85 names that file as taken over: "what of it the views' routes still need moves into `look.css`". So
this item belongs to MOD-site-frame's moving job. It moves the status rules into `look.css`, and the new state gets its
colour there.

## Acceptance

- The badge of an entry waiting for its anchor carries a class that `look.css` colours, distinct from accepted. A test
  checks it, with a counter-proof.
- The status rules the routes use come from `look.css`, as MOD-site-frame.md:85 states.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
