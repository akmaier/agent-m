---
id: ITM-891
title: The done check counts the gate records of its own pull request
level: module
realises:
  - THE DEFAULT DEFINITION OF DONE IS THE JOB RULES
  - THE GATE IS RECORDED
  - UC-034
modules:
  - MOD-product-process
builds_on:
tests:
  - unit
origin:
  - found by po-opus-b at sprint 89's start decision
---
# ITM-891 The done check counts the gate records of its own pull request

**REGISTER**

## Outcome

SPEC.md:1807-1811: a pull request is done when, among the rest, "every gate the workflow places before the merge is
recorded". `doneCheck` (MOD-product-process.md:189-193) is given "the product's gate records"; a record's `on` names
"`<path>@<blob>` per artifact, or the commit" (:116). The path, on `main`:
- `src/product-process/done.mjs:126-136` hands all of `gates` to `gateStates`;
- `src/product-process/gates.mjs:65-72`, `decidingRecord`, takes the newest record of the gate, its decider and role,
  whatever it was decided on;
- so the newest record of another pull request decides this one's gate. Sprint 87's call (`docs/backlog/sprints/team2/
  87.md:60-66`): #834 with its own record (`20261018-0149`, naming `/pull/834`) gives no finding; with all 918 records,
  "the gate Development → Release testing is not recorded as passed: rejected", from #835's record (`20261018-0151`).

The fix: `doneCheck` counts a gate record only when its `on` names one of the pull request's commits
(`facts.commits[].sha`) or the pull request itself (its address); the other records are not this pull request's gates.

## Acceptance

- A unit test naming MOD-product-process: a pull request with its own passing record and a newer rejecting record of
  another pull request's commit is done at that gate; with only the other's record, the gate is not recorded. Expected
  values literal, in the manner of the existing `doneCheck` tests.
- The existing tests of `doneCheck` stay green with no expected result changed.
- The first commit holds only the test, and CI is red on it. No stub is committed.
- Only `src/product-process/` and the tests that name MOD-product-process change.
