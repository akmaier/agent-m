---
id: MOD-test-records
title: Test evidence and release — result records, outcomes, flaky tests and rates per commit, the checks of a test battery, and an accepted release test report turned into a tagged release
realises:
  - A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS
  - A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT
  - A MODEL-DEPENDENT TEST IS MEASURED AS A RATE
  - RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER
  - EVERY TEST RUN LEAVES A RESULT RECORD
  - TEST RESULTS ARE KEPT IN THE REPOSITORY
  - A TEST THAT FLIPS ON THE SAME COMMIT IS FLAKY
  - A RELEASE RUNS EVERY TEST AT EVERY LEVEL
  - THE RELEASE TEST REPORT IS ACCEPTED BY A PERSON
  - ACCEPTING THE RELEASE TEST REPORT RELEASES
  - A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED
  - CALENDAR VERSIONS
  - EVERY PRODUCT HAS ITS OWN VERSION LINE
  - A RELEASE IS TAGGED AND LOGGED
  - UC-013
  - UC-026
  - UC-028
  - UC-029
  - UC-030
follows:
  - ARC-003
  - ARC-006
  - ARC-015
  - ARC-016
  - ARC-017
uses:
  - MOD-artifacts.headerTags
  - MOD-review-core.gitBlobSha
  - MOD-review-core.planAcceptance
  - MOD-traceability.auditRows
provides:
  - resultRecord
  - fromJUnit
  - commitOutcomes
  - rateComparison
  - batteryProblems
  - nextVersion
  - releaseReport
  - acceptRelease
---
# MOD-test-records Test evidence and release

## Responsibility

Feature. The evidence that tests ran and what they showed, and the release that rests on it (UC-013): the
result records on the append-only branch `test-results`, converted from a runner's report; the outcomes
per commit with flaky tests apart and model-dependent tests as rates; the checks a generated test battery
must pass; the next version of a product's own line; the release test report composed from the records and
the audit rows; and the one commit that accepts the report — with its approval record, the changelog
entry and any limitation recorded — and then sets the tag on the tested commit. The approval itself is the
approval engine's; the commits and the tag are made through the git host the shell passes in.

## Interfaces

- `resultRecord({ commit, levels, participant, date, outcomes, uncommittedChanges }) -> { path, text }` — `results/<commit>/<run>.md` on the branch `test-results`; a run with uncommitted changes is marked and does not count for the commit.
- `fromJUnit(xml, headers) -> outcomes` — the CI step's conversion of a runner's JUnit XML, joined with each test's `TST-` identifier and level from its header lines; without JUnit XML, the run's overall outcome with a note naming what is missing.
- `commitOutcomes(records, commit) -> { byLevel, byTest, notRun }` — per test passed, failed or flaky (both outcomes on one commit), per level *not run on this commit* where no record exists; model-dependent tests as a rate over the fixed number of runs.
- `rateComparison(current, lastRelease) -> { rate, previous, interval, worse }` — the release question "is this worse than what runs", never a threshold on one run.
- `batteryProblems(tests, jobRecords) -> [finding]` — a test without expected result, level or guarded identifier, a model-dependent test judged on one run, a commit-level test calling a paid service, a new test without counter-proof, a release test written by the implementer.
- `nextVersion(tags, today, step) -> "YYYY.MINOR.PATCH"` — of this product's own line; a new year restarts at `YYYY.1.0`.
- `releaseReport(outcomes, audit, candidate) -> text` — every test, level, outcome or rate, guarded identifiers, the commit; failures and worse rates first; refused while a test has not run on the candidate.
- `acceptRelease({ report, limitations, changelog, candidate, forge }) -> { commit, tag } | { refused }` — one commit with report, approval record and changelog entry, then the tag on the tested commit; a failing test or a worse rate without a recorded reason, a test that did not run, or an existing tag stops it, named.

## Testing

Unit tests over fixture result records and JUnit files: two outcomes of one deterministic test on one
commit are *flaky*, never *passed*; a level without a record reads *not run on this commit*; a red run
without a recorded limitation cannot be released (`tests/test_release_run.py`). Component tests for
`acceptRelease` with a fake git host that records commits and tags: after accepting a green report the
tag exists on the tested commit; rejecting sets none; an existing tag is never moved. The seams are the
git host and the clock. Model-dependent tests of a product are reported here as rates with a confidence
interval against the last release (`A MODEL-DEPENDENT TEST IS MEASURED AS A RATE`); the module itself
calls no model.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; revised on 2026-10-01 by Claude (claude-opus-5-5) against commit d0e5631081876203e719a2508d673d904e7768db — the leaner architecture of the architecture review, as the PO approved it (UC-023): takes over the release flow of MOD-release; the bridge's update feed went to MOD-bridge-app; open until accepted.*
