---
id: ITM-1298
title: The issue route reads the backlog through MOD-work-plans
level: module
realises:
  - A BACKLOG ITEM NAMES THE MODULES IT CHANGES
modules:
  - MOD-work-plans
  - MOD-issue-handling
  - MOD-maintenance-pages
builds_on:
  - ITM-1255
tests:
  - unit
origin:
  - developer-opus-f's stop on ITM-1255, sprint 112 (docs/backlog/sprints/team1/112.md, "ITM-1255's stop")
---
# ITM-1298 The issue route reads the backlog through MOD-work-plans

**REGISTER**

## Outcome

MOD-issue-handling and MOD-maintenance-pages each hold their own copies of rules of the backlog that MOD-work-plans
holds:
- **The module files read:** `src/issue-handling/backlog.mjs:19`, `:58`; `src/maintenance-pages/issues.mjs:235`, `:253`.
- **A list field split:** `listOf` (`backlog.mjs:29`) and `namesOf` (`issues.mjs:239`).
- **The item's file and identifier:** `backlog.mjs:20`; `issues.mjs:236-237`, `:263` (`BACKLOG_ITEM`, `backlogItems`).

MOD-work-plans' interface offers none of these (MOD-work-plans.md, `provides:`). MOD-issue-handling's Uses name only
`MOD-work-plans.saveItems` (MOD-issue-handling.md:29), and MOD-maintenance-pages' only `MOD-work-plans.backlogFindings`
(MOD-maintenance-pages.md:62). DEVELOP AGAINST INTERFACES and A MODULE INTERFACE IS MINIMAL leave no way to share them
without a change of those module files.

## Not ready: a draft for akmaier

A draft of MOD-work-plans.md, MOD-issue-handling.md and MOD-maintenance-pages.md gives MOD-work-plans the function or
functions the other two need: the backlog's items, the architecture's module files, and a list field as a list. It names
them in the Uses of the other two. This item is built once the draft is accepted.

## Acceptance

- Once the draft is accepted: the two modules read these through MOD-work-plans' interface, and their own copies go. The
  existing tests of the three modules pass unchanged.
- Only the folders of the three modules and the tests that name them change.
