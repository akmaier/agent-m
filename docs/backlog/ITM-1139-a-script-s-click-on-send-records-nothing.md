---
id: ITM-1139
title: A script's click on Send records nothing
level: module
realises:
  - THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
  - UC-049
modules:
  - MOD-prompt-bar
builds_on:
tests:
  - unit
origin:
  - developer-sonnet-i's release tests of UC-049 (ITM-513, pull request #1162, head 3d20fdc1), an observation without a test
---
# ITM-1139 A script's click on Send records nothing

**REGISTER**

## Outcome

SPEC.md:986: "The dashboard writes to a repository only as the direct result of a person's action on it". With recording
on, *Send* commits the conversation's record (`src/prompt-bar/bar.mjs:298-304`). Only *Hand over* checks that its click is
a person's (`isTrusted`), so a script's click on *Send* writes. *Send* takes the same check as *Hand over*.

## Acceptance

- With recording on, a script's click on *Send* (`isTrusted` false) sends nothing and commits nothing. Counter-proof: a
  person's click sends and records.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
