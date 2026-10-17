---
id: ITM-759
title: The schedule page saves, merges, and shows the drift and the last runs
level: module
realises:
  - UC-027
  - THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE
  - CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI
  - GITLAB PRODUCTS ARE SUPPORTED
  - THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
  - ONE CLICK PER DECISION
modules:
  - MOD-test-pages
builds_on:
  - ITM-758
  - ITM-745
  - ITM-746
  - ITM-748
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-759 The schedule page saves, merges, and shows the drift and the last runs

**REGISTER**

## Outcome

The rest of MOD-test-pages' route `schedule`:
- **Save** opens one pull request through `proposeSchedule` (step 5).
- **Its CI result**, and *Merge* once green through `mergePullRequest` (step 6). On GitLab, `applyPipelineSchedule`
  runs after the merge, and the page links the project's pipeline schedules (3a).
- **A red CI** is not merged (6a).
- **A foreign or hand-edited configuration** is shown against the schedule with `configurationDrift` (1a, 1b).
- **The last run per occasion** comes from `listCiRuns` by its event, and a nightly run that has not run shows its
  date beside the expected one, with the workflow's page (step 7, 7a).

## Acceptance

- With fake hosts, the tests state for GitHub and for GitLab:
  - one click opens one pull request;
  - *Merge* is offered only on green;
  - the pipeline schedule is set after the merge on GitLab only;
  - the drift is listed;
  - a missed nightly run is named.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/test-pages/` and the tests that name MOD-test-pages change.
