---
id: ITM-676
title: An entry whose anchor is missing names no existing requirement as added
level: module
realises:
  - OPEN PROPOSALS ARE SHOWN IN THE BROWSER
modules:
  - MOD-spec-changes
builds_on:
tests:
  - unit
origin:
  - ITM-648's gate on pull request #715 (docs/gates/20261017-0930-development-release-testing-91e4.md), from developer-sonnet-d's finding
---
# ITM-676 An entry whose anchor is missing names no existing requirement as added

**REGISTER**

## Outcome

`entryView`'s impact names a requirement "added" when the entry's anchor is not in the target, even if the target
already holds that requirement elsewhere. TST-472516's fixture shows it. A requirement the target holds is "changed",
or unchanged, wherever its section stands. Which reading of the anchor's absence its accepted text gives ("waiting for
its anchor") is read at the start.

## Acceptance

- An entry whose anchor is missing names a requirement the target already holds as changed or not at all, never as added.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
