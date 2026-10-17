---
id: ITM-746
title: A schedule proposed in one pull request, and the nightly pipeline schedule on GitLab
level: module
realises:
  - UC-027
  - THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE
  - GITLAB PRODUCTS ARE SUPPORTED
  - CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI
modules:
  - MOD-test-schedule
builds_on:
  - ITM-744
  - ITM-749
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
  - ITM-476's "Schedule proposals use [openPullRequest]; GitLab nightly scheduling uses [setPipelineSchedule]", separated from it as ITM-635 was
---
# ITM-746 A schedule proposed in one pull request, and the nightly pipeline schedule on GitLab

**REGISTER**

## Outcome

MOD-test-schedule's `proposeSchedule(host, schedule, context)` and `applyPipelineSchedule(host, schedule)`, in
`propose.mjs`, as its file states them.
- **`proposeSchedule`** writes one branch from the head that was read and makes one commit on it. The commit holds the
  schedule file, the generated file and, on GitLab, `.gitlab-ci.yml` with its include entry. It then opens one pull
  request that holds them, and that pull request says when a foreign configuration stays beside Agent M's (UC-027 1a).
  A schedule with an error finding writes nothing.
- **`applyPipelineSchedule`** sets the nightly pipeline schedule through the host's `setPipelineSchedule` (ITM-749)
  after the merge. On GitHub it gives `null`.

The host's `createBranch`, `commitFiles` and `openPullRequest` are built.

## Acceptance

- With a fake host:
  - one branch, one commit holding exactly the files named, and one pull request;
  - `InvalidSchedule` with nothing written;
  - `Moved` passed on;
  - on GitLab, the pipeline schedule set once at the declared time, and saving again updates it instead of adding a
    second one;
  - `null` on GitHub.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/test-schedule/` and the tests that name MOD-test-schedule change.
