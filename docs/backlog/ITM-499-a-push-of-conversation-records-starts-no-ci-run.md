---
id: ITM-499
title: A push of conversation records starts no CI run
level: module
realises:
  - UC-049
  - A JOB RECORD STARTS NO CI RUN
modules:
  - MOD-test-schedule
builds_on:
tests:
  - unit
origin:
  - the architecture of the prompt bar, accepted by akmaier at 7e893c63 (110d2499)
  - MOD-test-schedule, Data: the generated CI configuration
---
# ITM-499 A push of conversation records starts no CI run

**REGISTER**

## Outcome

The CI configuration MOD-test-schedule generates starts nothing on a push to the default branch that changes only files
under `docs/jobs/` or `docs/conversations/`.

## Acceptance

- The generated file ignores both folders for GitHub and GitLab; a push that also changes another file starts the
  run.
