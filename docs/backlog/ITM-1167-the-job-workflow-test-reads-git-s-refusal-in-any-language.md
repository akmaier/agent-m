---
id: ITM-1167
title: The job-workflow test reads git's refusal in any language
level: unit
realises:
  - NO SECRET IN THE REPOSITORY
modules:
  - MOD-workflow-entries
builds_on:
tests:
  - unit
origin:
  - the gate of #1255 (team 2's sprint 100); a local failure on a German-language machine
---
# ITM-1167 The job-workflow test reads git's refusal in any language

**REGISTER**

## Outcome

`onRecordsChanged — no secret value in any commit` (`tests/workflow-entries-job-workflow.test.mjs:315-327`) asserts that
no gate record was written. It does so by matching git's English refusal: `/does not exist|exists on disk, but not/`
(`:327`).
- On a machine whose git speaks German, git says "Pfad '…' existiert nicht in 'main'", and the test fails on `main`. With
  `LC_ALL=C` it passes.
- So the test depends on the language of the machine, not on what was written.

## Acceptance

- The test decides "not written" by git's exit status, or runs git with `LC_ALL=C`. It does not match git's words.
- It passes under a German and an English locale.
- A counter-proof writes the gate record, and the test then fails.
