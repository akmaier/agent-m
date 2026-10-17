---
id: ITM-745
title: The committed configuration against the schedule
level: module
realises:
  - UC-027
  - THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE
modules:
  - MOD-test-schedule
builds_on:
  - ITM-744
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-745 The committed configuration against the schedule

**REGISTER**

## Outcome

MOD-test-schedule's `configurationDrift(files, schedule, target)`, as its file states it. UC-027 1b shows where a
configuration edited by hand differs from the one the schedule generates. UC-027 1a shows, for a configuration Agent M
did not generate, the triggers it has and which rows they run, as far as they can be read. On GitLab, a
`.gitlab-ci.yml` without the include entry is a difference. No item names this function.

## Acceptance

- The files `ciConfiguration` generates give no difference.
- One edited line gives one difference with its path.
- A GitLab `.gitlab-ci.yml` without the include entry gives a difference.
- A foreign workflow with `push` and `schedule` triggers is read as such.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/test-schedule/` and the tests that name MOD-test-schedule change.
