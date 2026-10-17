---
id: ITM-744
title: The CI configuration generated from a schedule
level: module
realises:
  - UC-027
  - THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE
  - A JOB RECORD STARTS NO CI RUN
  - COMMIT TESTS CALL NO PAID SERVICE
  - A RELEASE RUNS EVERY TEST AT EVERY LEVEL
  - GITLAB PRODUCTS ARE SUPPORTED
  - NO SECRET IN THE REPOSITORY
modules:
  - MOD-test-schedule
builds_on:
  - ITM-742
  - ITM-743
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
  - ITM-476's "missing accepted scheduling interfaces used by the generated configuration", separated from it as ITM-635 was
---
# ITM-744 The CI configuration generated from a schedule

**REGISTER**

## Outcome

MOD-test-schedule's `ciConfiguration(schedule, target, resources, participants)`, with `generate.mjs` and
`templates/`, as its file states it under Data:
- `.github/workflows/agent-m-tests.yml`, or `.gitlab/agent-m-tests.yml` with its include entry;
- one job per ticked row and occasion;
- nothing for a push that changes only `docs/jobs/` or `docs/conversations/`;
- nightly as a schedule on GitHub, and on GitLab as the returned `pipelineSchedule`;
- the release candidate on a tag `v*-rc.*`, running every row;
- on demand as a manual start naming its rows;
- the job `agent m done` on every pull request, with `onDoneCheck` at `instanceCommit`;
- the step that hands the JUnit XML report to `onTestsFinished`;
- the secrets by name.

`InvalidSchedule` is thrown for a schedule with an error finding. ITM-476 consumes this function unchanged, and its
adoption on Agent M's own repository stays with it. The workflow entries it names are MOD-workflow-entries' and are not
built here: the configuration only names them.

## Acceptance

- For the default and for a changed fixture schedule, on GitHub and on GitLab, the generated text triggers exactly the
  ticked rows per occasion, as the tests state in their own text.
- A push that touches only `docs/jobs/` starts nothing, and one that also touches code starts the commit rows.
- The row `paid` never runs on a commit or a pull request.
- No secret value from a fixture store appears in the files.
- `InvalidSchedule` names the findings.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/test-schedule/` and the tests that name MOD-test-schedule change.
