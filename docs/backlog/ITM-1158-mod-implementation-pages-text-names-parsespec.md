---
id: ITM-1158
title: MOD-implementation-pages's text names `parseSpec`, which its backlog route imports
level: module
realises:
  - DEVELOP AGAINST INTERFACES
modules:
  - MOD-implementation-pages
builds_on:
  - ITM-1149
tests:
  - unit
origin:
  - ITM-1068's pull request #1219 (sprint team1/99), from developer-sonnet-a's probe
built_by:
  - 4008e93b20de09a9924a530c4bd278fe61eab2d9
---
# ITM-1158 MOD-implementation-pages's text names `parseSpec`, which its backlog route imports

**REGISTER**

## Outcome

`src/implementation-pages/backlog.mjs:24` imports MOD-spec-document's `parseSpec`. Where no facts of the commit are
stored, the backlog route takes the requirements from the SPEC with it (`:94`), since `Facts` carries no requirements.
MOD-implementation-pages' `uses:` names neither MOD-spec-document nor `parseSpec`, so ITM-1068's check (TST-106805) finds
the import. The text lacks a use, and no code is wrong.

## Not ready: a draft for akmaier

The draft adds `MOD-spec-document.parseSpec` to MOD-implementation-pages' `uses:` and to its Uses section, with what it is
used for. No code changes.

## Acceptance

- Once the draft is accepted, ITM-1068's check finds no import of MOD-implementation-pages that its uses do not name.

**The draft is on `main` as `4008e93b`** (MOD-implementation-pages, by developer-sonnet-b). The item is done once it is accepted.

**Done (sprint team1/99, po-opus):** akmaier accepted the draft (`197060d8`), and the accepted blob `49cf2cba` is the draft's. No code changes.
