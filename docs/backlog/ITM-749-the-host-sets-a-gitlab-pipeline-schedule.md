---
id: ITM-749
title: The host sets a GitLab project's pipeline schedule
level: module
realises:
  - UC-027
  - GITLAB PRODUCTS ARE SUPPORTED
  - NO SECRET IN THE REPOSITORY
modules:
  - MOD-repository-hosts
builds_on:
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
  - ITM-476's repository-host prerequisite setPipelineSchedule, separated from it as ITM-635 was
---
# ITM-749 The host sets a GitLab project's pipeline schedule

**REGISTER**

## Outcome

MOD-repository-hosts' `setPipelineSchedule(schedule)`, as its file states it. On a GitLab server it creates the
project's pipeline schedule with its description, or updates the one that has it, so that saving again never adds a
second one. Its variables hold no credential. On GitHub it throws `NotSupported`. UC-027 3a uses it after the
schedule's merge, through MOD-test-schedule's `applyPipelineSchedule` (ITM-746). ITM-476 consumes it unchanged.

## Acceptance

- Against a fixture GitLab server: the schedule is created once. A second call with the same description updates it,
  and no second schedule exists. The returned `url` is the project's pipeline schedules.
- A token without *Maintainer* is `PermissionMissing`. GitHub throws `NotSupported`.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/repository-hosts/` and the tests that name MOD-repository-hosts change.
