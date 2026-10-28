---
id: ITM-816
title: MOD-approvals' Uses name the hosts' failure
level: module
realises:
  - DEVELOP AGAINST INTERFACES
modules:
  - MOD-approvals
builds_on:
tests:
  - unit
origin:
  - ITM-718's pull request #754 (sprint team1/75), from developer-sonnet-a's finding 2
---
# ITM-816 MOD-approvals' Uses name the hosts' failure

**REGISTER**

## Outcome

`src/approvals/status.mjs:19` imports `HostError` from MOD-repository-hosts' index. MOD-approvals' file does not name
`MOD-repository-hosts.HostError` among its Uses. The import predates ITM-718. ITM-718 throws one more `HostError("NotFound")`
with it, a failure `lastAcceptedText` already names.

`A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES` and `DEVELOP AGAINST INTERFACES` ask that what a module uses is
named. So a draft of `docs/architecture/MOD-approvals.md` adds `MOD-repository-hosts.HostError` to its Uses, for akmaier.
Once it is accepted, the import stands as it is.

## Acceptance

- MOD-approvals' accepted file names `MOD-repository-hosts.HostError`, and no import of `src/approvals/` reaches past the
  interfaces its file names.
