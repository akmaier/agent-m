---
id: ITM-254
title: Versions, release candidates and the release
level: module
realises:
  - UC-013
  - CALENDAR VERSIONS
  - EVERY PRODUCT HAS ITS OWN VERSION LINE
  - A RELEASE IS TAGGED AND LOGGED
  - A VERSION IS NOT REWRITTEN
  - A RELEASE RUNS EVERY TEST AT EVERY LEVEL
  - THE RELEASE TEST REPORT IS ACCEPTED BY A PERSON
  - A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED
  - ACCEPTING THE RELEASE TEST REPORT RELEASES
modules:
  - MOD-release-evidence
builds_on:
  - ITM-247
  - ITM-248
  - ITM-249
  - ITM-250
  - ITM-251
  - ITM-252
  - ITM-253
tests:
  - unit
origin:
  - UC-013
---
# ITM-254 Versions, release candidates and the release

**REGISTER**

## Outcome

MOD-release-evidence's `nextVersion`, `startReleaseCandidate`, `releaseReport` and `acceptAndRelease`, as its file states
them, in `src/release-evidence/`: the next version of a product's own line; the release candidate `v<version>-rc.<N>`
tagged and its complete run queued as a job of kind `run-tests` that keeps the changelog entry the person chose; the
release test report of a candidate whose run has ended, complete only once every test has run on the candidate's commit;
and, on the person's one click, the report, its approval record with every known limitation and the changelog entry in
one commit, then the tag on the tested commit. Running the queued run on its route is UC-010's and UC-011's,
`reportsAwaitingAcceptance` is ITM-239's, and the audit of a release is UC-030's; none is part of this item. Nothing else
of the module is part of this item.

## Acceptance

- Unit tests that name MOD-release-evidence state, before the code exists, with the host and the snapshots replaced by
  fakes, for UC-013's steps and alternative flows:
  - the next version: a minor step by default, a patch step, `YYYY.1.0` in a new year (1a), from the product's own tags
    only;
  - the candidate: the next free `N`; its run queued with the candidate's version, tag and changelog entry, for every
    level of the product's schedule; `TagExists`; `NoRunner` naming the level; and, where only the implementer could run
    the release tests, that it says so (2a);
  - the report: its parts as the module's file gives them, its limitations first; incomplete while a test has not run on
    the candidate's commit;
  - the release: one commit of the report, its approval record and the changelog entry, then the tag on the candidate's
    commit, also when the default branch has moved on (4b); refused with `LimitationMissing`, naming each failing test and
    worse rate without its reason (3a, 3b), with `Incomplete`, and with `TagExists`, an existing tag not moved (4a).
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- The existing tests stay green, with no expected result changed.
- Only `src/release-evidence/` and the tests that name MOD-release-evidence change (`AN IMPLEMENTATION JOB CHANGES ONLY ITS
  MODULES`).
