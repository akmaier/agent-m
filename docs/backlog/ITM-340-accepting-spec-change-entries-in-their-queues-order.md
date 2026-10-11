---
id: ITM-340
title: Accepting SPEC change entries in their queue's order
level: module
realises:
  - UC-006
  - A SPECIFICATION CHANGE IS APPROVED BEFORE IT IS WRITTEN
  - THE APPROVED TEXT IS TAKEN VERBATIM
  - AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL
  - A QUEUE IS ACCEPTED IN ITS ORDER
  - A STALE APPROVAL IS NOT APPLIED
  - WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE
  - A REQUIREMENT HAS A REGISTERED SOURCE
  - ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON
  - THE GATE IS RECORDED
  - THE REPLACED TEXT STAYS REACHABLE
modules:
  - MOD-spec-changes
builds_on:
  - ITM-302
  - ITM-315
  - ITM-339
tests:
  - unit
origin:
  - UC-006 steps 4 to 7, 4c, 4d, 5a
---
# ITM-340 Accepting SPEC change entries in their queue's order

**REGISTER**

## Outcome

MOD-spec-changes' `acceptEntries` and `applyApproved`, as its file states them, in `accept.mjs`:

- `acceptEntries` writes one commit under the person's account: for each entry, in its queue's index order, the
  approval record, the target's section replaced by the proposal byte for byte (ITM-302), and the decision row. An
  entry whose anchor another entry creates goes only with or after that entry. Nothing is written while an entry is
  stale, or while a requirement of a proposal names no linked source (ITM-315); each such entry is named.
- `applyApproved` makes the same checks and computes the same bytes for every `spec` record that no decision row names
  yet; it returns the files and writes nothing itself. The instance's workflow entry calls it (ITM-364).

One function computes the bytes for both. The SPEC-entry pages (ITM-357) call `acceptEntries`. `planAcceptance` in
`docs/assets/review-core.mjs` and `applyApprovals` in `docs/assets/review-core/apply-approvals.mjs` are the model and
stay.

## Acceptance

- Unit tests that name MOD-spec-changes state, before the code exists, on a fixture repository behind a Host of the
  tests' own: entries 05 and 06, 06's anchor created by 05, accepted together in one commit, in index order, each with
  record, section and decision row; 06 alone refused, naming 05; a stale entry: nothing written, named; a requirement
  naming no linked source: nothing written, named; `applyApproved` returning byte for byte what `acceptEntries`
  commits for the same records; a record whose anchor is not its entry's refused.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/spec-changes/` and the tests that name MOD-spec-changes change.
