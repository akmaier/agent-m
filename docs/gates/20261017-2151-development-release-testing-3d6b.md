---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 452863d3d621ba09462d806cbe21c1af72383a25
  - https://github.com/akmaier/agent-m/pull/789
date: 2026-10-17 21:51 UTC
---
# Development → Release testing: ITM-749, the host sets a GitLab project's pipeline schedule

**REGISTER**

## Reason

This is ITM-749, pull request #789 into `sprint/team2/79`, at head `452863d3`.

**The tests came first.** The tests-only commit `476abfb9` was red in CI run 39072273097. CI run 39072404773 is green
on the head, and 15 of 15 tests pass in my clone.

**The scope holds.** Only `src/repository-hosts/gitlab.mjs`, `src/repository-hosts/index.mjs` and the new test
`tests/repository-hosts-pipeline-schedule.test.mjs` changed. The test names MOD-repository-hosts.

**Five planted faults were each caught by their test.**
- requests not marked as writes: TST-749008;
- 403 unmapped: TST-749006 and TST-749007;
- the variable SecretRefused check disabled: TST-749014;
- no DELETE of variables that were not given: TST-749005;
- the no-token check removed: TST-749012.

**The Acceptance holds:** the schedule is created once, an update adds no second schedule, the url is the pipeline
schedules page, a token without Maintainer is PermissionMissing, and GitHub is NotSupported.

**The readings agree with the accepted text.**
- Variables become exactly those given, because the PipelineSchedule is the whole schedule. Secrets stay project CI
  variables, so a deletion never touches one.
- A 404 of a write is PermissionMissing, because NotFound is not among this function's failures.
- The first match by description is the one updated.

**Open, for the sprint review:** NotSupported without a token is not in setPipelineSchedule's failures. It is
HostError's own example. `WebLinks.pipelineSchedules` is still unimplemented.
