---
id: ITM-1197
title: The backlog page derives the states from the pull requests productFacts gives, with no base filter of its own
level: module
realises:
  - UC-032
modules:
  - MOD-implementation-pages
builds_on:
  - ITM-1196
tests:
  - unit
origin:
  - akmaier, 2026-10-23, the reopened items; ITM-210 and ITM-707, read with #727
---
# ITM-1197 The backlog page derives the states from the pull requests productFacts gives, with no base filter of its own

**REGISTER**

## Outcome

`src/implementation-pages/backlog.mjs:94-99`, `pullRequestsOf`, keeps only the pull requests into the default branch or a
sprint branch, and hands those to MOD-work-plans' `itemStates`.
- #727 (ITM-707) is merged into `item/ITM-574-batched-page-load`, so the page shows ITM-707 as not done.
- `productFacts` hands MOD-work-plans every pull request (MOD-progress-measures).
- No text of MOD-implementation-pages gives that filter. MOD-work-plans.md:125-128 says `done` is "its pull request is
  merged".

## Acceptance

- The page derives the states from the pull requests the facts give, with no filter by base.
- A case: an item whose pull request is merged into an item branch is shown done. Counter-proof: today's filter fails it.
- The first commit holds only the tests, and CI is red on it.
