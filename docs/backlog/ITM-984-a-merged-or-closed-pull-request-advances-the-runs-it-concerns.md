---
id: ITM-984
title: A merged or closed pull request advances the runs it concerns
level: module
realises:
  - UC-043
  - A RUN CONTINUES WITHOUT A CLICK BETWEEN ITS JOBS
modules:
  - MOD-workflow-entries
builds_on:
  - ITM-983
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-043-9, verified against the accepted texts on main at ee5d1364
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-984 A merged or closed pull request advances the runs it concerns

**REGISTER**

## Outcome

MOD-workflow-entries.md:257-260, `onPullRequestClosed`: "run by the job workflow when a pull request of a product is merged
or closed: ... merged or closed, the next actions of the runs it concerns, as `onRecordsChanged` computes them." Not built
(`src/workflow-entries/product.mjs:3`); the job workflows already call it (`src/runtimes/workflow/github.yml:109`,
`gitlab.yml:83`), but `src/workflow-entries/main.mjs:14-16` names no such entry. This item builds the runs' part. Closing the issues it names and the GitLab
pipeline schedule are other use cases' and are left out.

## Acceptance

- Unit tests that name MOD-workflow-entries: the merge of an implementation job's pull request in a run starts the steps that
  waited for it; a closed, unmerged one starts nothing that depends on it.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/workflow-entries/` and the tests that name MOD-workflow-entries change.
