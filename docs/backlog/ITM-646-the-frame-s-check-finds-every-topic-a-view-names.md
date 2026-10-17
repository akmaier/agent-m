---
id: ITM-646
title: The frame's check finds every topic a view names
level: module
realises:
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-site-frame
builds_on:
tests:
  - unit
origin:
  - ITM-643's gate on pull request #688 (docs/gates/20261017-0502-development-release-testing-b4e1.md), from developer-sonnet-e's finding
---
# ITM-646 The frame's check finds every topic a view names

**REGISTER**

## Outcome

MOD-site-frame's file (Parts, `explanations.md`): "A topic that a view or the Bridge's window names and the file does
not hold is a finding of the frame's own check, which compares the topics named with the file's, never a failure at run
time."

`src/site-frame/index.mjs:5` says that check is not built. `explain` returns an empty element for a missing topic, so a
mistyped topic shows nothing and no test notices.

How the check reads "the topics named" — the `explain("…")` calls of the views' files, or what a view declares — is read
at the start against MOD-site-frame's file.

## Acceptance

- The check lists every topic a view names that `explanations.md` does not hold, and lists none when all are held.
- Its counter-proof is a view naming a topic the file lacks, and it is listed.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
