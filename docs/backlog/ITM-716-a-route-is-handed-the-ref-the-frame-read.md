---
id: ITM-716
title: A route is handed the ref the frame read
level: module
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
modules:
  - MOD-site-frame
  - MOD-review-pages
builds_on:
  - ITM-680
tests:
  - unit
origin:
  - ITM-680's second draft stop (sprint team1/73), from developer-sonnet-d's data-flow path
---
# ITM-716 A route is handed the ref the frame read

**REGISTER**

## Outcome

Every route of MOD-review-pages starts with `readPlace` (`src/review-pages/common.mjs:123-133`). Through `defaultSnapshot`
(`:113-116`) it calls `host.repositoryInfo()`, a `GET /repos/<repo>`, for the default branch, and then reads the snapshot of that branch.
The frame has already read the snapshot of the ref it shows. With a token, `#uc`, `#arc` and `#review/uc` therefore make
one request more per load than the frame alone.

`repositoryInfo` also gives whether the person may write and the repository's visibility, which the module's text names
as its reasons to use it. So that read cannot simply go.

## The reading of the accepted text

The frame already hands a route the snapshot it read. `Route.reads` is given "the repository the route shows as the frame
has read it for the page" (MOD-site-frame.md:163), and the frame calls it before `render`.
- The routes of MOD-review-pages draw from that snapshot, and read no default branch of their own.
- They ask `repositoryInfo` only where they need what it gives: whether the person may write, or the repository's
  visibility.
- No member of `ViewContext` or `Route` changes.

## Acceptance

- With a token, `#uc`, `#arc` and `#review/uc` send their commit and tree once and their batches, and no `repositoryInfo`
  beyond those the page needs for writing or visibility. `load-per-view.test.mjs` counts it.
- Whether the person may write is still shown where the pages show it today.
