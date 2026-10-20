---
id: ITM-768
title: The audit view of a release
level: module
realises:
  - UC-030
  - THE AUDIT VIEW LISTS EVERY REQUIREMENT OF THE RELEASE
  - A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED
  - THE TRACEABILITY MATRIX IS DERIVED
  - THE GATE IS RECORDED
  - AN APPROVAL NAMES THE EXACT TEXT
modules:
  - MOD-trace-pages
builds_on:
  - ITM-756
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-768 The audit view of a release

**REGISTER**

## Outcome

MOD-trace-pages' descriptor `audit` (UC-030 steps 1 to 4, 2a to 2d, 1a). It offers release tags only. For the chosen
tag, it reads:
- the product at the tag's commit;
- the product's gate records through MOD-product-process' `gateStates`, under the model its `docs/process.md`
  declared at the tag;
- the instance's `SPEC.md`.

It hands these to `auditRows`. It shows:
- the summary at the top, each number opening the rows it counts, with the limitations first (2b);
- the filters: normative sources, one source, one level, only gaps;
- each row's detail, linked to the test, its run on the server and the approval commit.

**A reading of 2a.** Where the report is not accepted, every row reads *evidence not accepted*. MOD-trace-pages' Uses do
not name `acceptAndRelease`, so the offer to accept is a link to MOD-test-pages' route `release`, where *Accept*
stands.

## Acceptance

- On a fixture repository at a tag, the tests state the summary, a row of each kind, each filter, 2a with its link, 2c
  counted and 1a.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/trace-pages/` and the tests that name MOD-trace-pages change.

## Cut at its gate

The two numbers that cannot open their rows from `auditRows`' rows, worse and by the implementer, are ITM-1163.
