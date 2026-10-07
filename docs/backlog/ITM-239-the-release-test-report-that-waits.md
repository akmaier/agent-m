---
id: ITM-239
title: The release test report that waits
level: module
realises:
  - UC-047
  - A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE
modules:
  - MOD-release-evidence
  - MOD-job-ledger
  - MOD-progress-measures
  - MOD-notifications
builds_on:
  - ITM-235
  - ITM-247
  - ITM-252
tests:
  - unit
origin:
  - UC-047
---
# ITM-239 The release test report that waits

**REGISTER**

## Outcome

MOD-release-evidence's `reportsAwaitingAcceptance`, MOD-job-ledger's `recordsNewestFirst`, and the release test report
in MOD-progress-measures' `waitingForAcceptance`, as their files state them. Of UC-013's items it builds on those whose
interfaces it uses: the tags (ITM-247) and the job records (ITM-252); it calls none of ITM-254's functions. A
candidate's run is the record of kind `run-tests` whose parameters name the candidate — its version and tag —, as
MOD-release-evidence's file states it; `startReleaseCandidate` (ITM-254) writes them so. A candidate can be started once
UC-013's release panel is built (ITM-254, ITM-256), and its run ends once a route runs it (UC-010, UC-011); until then no
report comes to wait in a repository, and the tests state it on a fixture snapshot.

`waitingForAcceptance` then reads, through its host, the tags of every repository MOD-notifications checks
(`reportsAwaitingAcceptance`). The existing tests that run those checks give a fake host without `listTags`, or a fake
GitHub that answers the tags with 404, and they fail on it: their fakes answer the tags as MOD-repository-hosts'
`listTags`, GitHub and a GitLab server do for a repository without any, with an empty list. These tests name
MOD-notifications or MOD-progress-measures, so the item names MOD-notifications too; MOD-notifications' folder does not
change.

## Acceptance

- Unit tests that name these modules state, before the code exists, on a fixture snapshot: a report that waits once its
  candidate's complete run has ended, none before, and none once the report is accepted.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- The existing tests stay green, with no expected result changed; a test's fake host or server that is now asked for the
  tags answers as for a repository without any.
- Only the folders of MOD-release-evidence, MOD-job-ledger and MOD-progress-measures and the tests that name one of the
  four modules change; MOD-notifications' folder does not (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).
