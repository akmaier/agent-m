---
id: ITM-1112
title: MOD-job-ledger's text names `parseFinding`, which its code imports
level: module
realises:
  - DEVELOP AGAINST INTERFACES
modules:
  - MOD-job-ledger
builds_on:
tests:
  - unit
origin:
  - developer-sonnet-g's probe for ITM-1068 (sprint team2/97), on main at b1e4e7f4
---
# ITM-1112 MOD-job-ledger's text names `parseFinding`, which its code imports

**REGISTER**

## Outcome

`src/job-ledger/index.mjs:24` imports `parseFinding` of MOD-text-tools, which MOD-job-ledger's `uses:` does not name. The import is the module's own work: it reads a finding written in a job record back into its parts. So the text
lacks a use, and no code is wrong.

## Not ready: a draft for akmaier

The draft is `aedaf5cf`, on `main` and reviewed. The item is built once an approval record names its blob.

The draft adds the use to MOD-job-ledger's `uses:` and its Uses section, with what it is used for. No code changes.

## Acceptance

- Once the draft is accepted, the check of ITM-1068 finds no import of MOD-job-ledger that its uses do not name.
