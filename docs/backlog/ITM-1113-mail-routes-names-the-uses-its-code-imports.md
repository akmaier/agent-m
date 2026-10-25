---
id: ITM-1113
title: MOD-mail-routes's text names `instanceOfPagesAddress` and `pagesAddress`, which its code imports
level: module
realises:
  - DEVELOP AGAINST INTERFACES
modules:
  - MOD-mail-routes
builds_on:
tests:
  - unit
origin:
  - developer-sonnet-g's probe for ITM-1068 (sprint team2/97), on main at b1e4e7f4
built_by:
  - 66ae731737c9ee95c1f7d4444a258cf891ef184b
---
# ITM-1113 MOD-mail-routes's text names `instanceOfPagesAddress` and `pagesAddress`, which its code imports

**REGISTER**

## Outcome

`src/mail-routes/graph-route.mjs:13` imports `instanceOfPagesAddress` and `pagesAddress` of MOD-identifiers, which MOD-mail-routes's `uses:` does not name. The import is the module's own work: it the instance's Pages address, to which Microsoft's sign-in window returns. So the text
lacks a use, and no code is wrong.

## Not ready: a draft for akmaier

The draft is `66ae7317`, on `main` and reviewed. The item is built once an approval record names its blob.

The draft adds the use to MOD-mail-routes's `uses:` and its Uses section, with what it is used for. No code changes.

## Acceptance

- Once the draft is accepted, the check of ITM-1068 finds no import of MOD-mail-routes that its uses do not name.

**Done (sprint team1/100's start, po-opus):** the draft is accepted, and ITM-1068's check over the repository (TST-106805) finds no import this item names, on `main` at `e14efb7f`. No code changes.
