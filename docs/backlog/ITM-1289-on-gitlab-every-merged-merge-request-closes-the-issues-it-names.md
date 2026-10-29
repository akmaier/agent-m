---
id: ITM-1289
title: On GitLab every merged merge request closes the issues it names
level: module
realises:
  - UC-012
modules:
  - MOD-runtimes
  - MOD-workflow-entries
builds_on:
  - ITM-1259
tests:
  - unit
origin:
  - po-opus-c's gate of ITM-1259 (PR #1391), docs/gates/20261029-0247-development-release-testing-84f5.md, points 2 and 3
---
# ITM-1289 On GitLab every merged merge request closes the issues it names

**REGISTER**

## Outcome

MOD-runtimes.md:141 gives `onPullRequestClosed` for "a pull or merge request closed or merged". Since ITM-1259 GitLab's
job workflow runs it on the push pipeline of the default branch, as the rule after the records' rule
(`src/runtimes/workflow/gitlab.yml`). GitLab takes the first rule that matches, so a merge whose commit changes
`docs/jobs/` or `docs/gates/` runs `onRecordsChanged` and closes no issue; and a merge into a branch other than the
default branch starts no pipeline the entry reacts to, while on GitHub every target is. On GitLab, every merged merge
request runs `onPullRequestClosed`, also one that changes records and one into another branch.

## Acceptance

- A unit case of the generated GitLab workflow shows a merge commit that changes `docs/jobs/` running both entries, and
  a merge into a sprint branch running `onPullRequestClosed`; each fails on the workflow as it stands.
- Only `src/runtimes/`, `src/workflow-entries/` and their tests change.
