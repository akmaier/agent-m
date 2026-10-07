---
id: ITM-256
title: The release panel
level: module
realises:
  - UC-013
  - ONE CLICK PER DECISION
  - EVERY STEP EXPLAINS ITSELF
  - A PERSON'S OWN INPUT IS COMMITTED DIRECTLY
  - A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED
modules:
  - MOD-test-pages
builds_on:
  - ITM-247
  - ITM-250
  - ITM-251
  - ITM-252
  - ITM-254
  - ITM-255
tests:
  - unit
origin:
  - UC-013
---
# ITM-256 The release panel

**REGISTER**

## Outcome

MOD-test-pages' `view` with its route `release`, as its file states it, in `src/test-pages/`: for the product it is
given, the next version of its own line preset to a minor step and the changelog entry dated today, both editable;
*Start release candidate*, one click, after which it names the candidate and its queued run; once the run has ended, as
its record gives it, every level with its result, every model-dependent check as a rate against the running version,
and the release test report, whose `## Requirements` names every requirement with the tests that guard it, with
*Accept and release*, which asks first for the reason of every failing test and every worse rate; each step with its
folded explanation (ITM-255); and what refuses a step, named. The route is also the address by which the notifications
lead to a release test report that waits (MOD-notifications). The audit drawn inside the panel (UC-030), the run on the
job list (UC-036), the frame's parts that are not built — `notice`, `confirmDecision`, `runPanel`, `embedRoute`,
`chosenProduct` — and the routes `schedule`, `runs` and `generate` are not part of this item. Nothing else of the module
is part of this item.

## Acceptance

- Unit tests that name MOD-test-pages state, before the code exists, with the hosts replaced by fakes, for UC-013's main
  flow and each of its alternative flows what the panel shows and what each click writes: the version and the entry
  before *Start release candidate*; the candidate and its run after it; the levels, the rates and the report once the run
  has ended; *Accept and release* in one click, after the reasons of the failing tests and worse rates; the year that
  changed (1a), the participant missing for the release tests (2a), a red level (3a), a worse rate (3b), a tag that
  exists (4a) and a default branch that moved on (4b).
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- The existing tests stay green, with no expected result changed.
- Only `src/test-pages/` and the tests that name MOD-test-pages change (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).
