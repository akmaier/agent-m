---
id: ITM-1298
title: The issue route reads the backlog through MOD-work-plans
level: module
realises:
  - A BACKLOG ITEM NAMES THE MODULES IT CHANGES
modules:
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

MOD-work-plans' interface offers none of these (MOD-work-plans.md, `provides:`).

## The reading of the accepted text

The rules the copies keep are those of the artifacts' schemas, which MOD-documents owns, and both modules already use it.
- MOD-issue-handling's Uses name `MOD-documents.artifactSchemas`, `readDocument` and `Document`
  (MOD-issue-handling.md:26-28); MOD-maintenance-pages' name `artifactSchemas` and `readDocument`
  (MOD-maintenance-pages.md:31-33).
- `artifactSchemas` gives the schemas of an item and a module, with their path patterns, and `readDocument` reads a file
  of such a schema into a `Document`, its list fields read by the schema (MOD-documents.md:267-269, :307-308).
- So both modules read the items and module files through these, and their hand-written paths, list splits and
  identifier patterns go. MOD-work-plans gains nothing and does not change.

## Acceptance

- The two modules read the backlog's items and the module files through MOD-documents' `readDocument` and
  `artifactSchemas`, and keep no path rule, list split or item pattern of their own. The existing tests of both modules
  pass unchanged.
- Only the folders of the two modules and the tests that name them change.
