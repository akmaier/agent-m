---
id: ITM-465
title: architecture-ready counts an entry decided by its SPEC commit as decided
level: module
realises:
  - UC-022
  - THE FIRST ARCHITECTURE IS DESIGNED AS A WHOLE
  - STATUS IS DERIVED FROM THE RECORDS
modules:
  - MOD-approvals
builds_on:
  - ITM-437
tests:
  - unit
origin:
  - ITM-437, #389
  - SPEC queue 2026-10-12_decision-rows-before-approval-records, accepted in 8a5b8dd6
  - MOD-approvals, the precondition architecture-ready, as drafted in afab8296
---
# ITM-465 architecture-ready counts an entry decided by its SPEC commit as decided

**REGISTER**

## Outcome

MOD-approvals' precondition `architecture-ready`, as its file states it: its warning names every open SPEC change — an
entry that neither an approval record nor a decision row naming the commit that wrote it into the SPEC decides, as the
SPEC says since 8a5b8dd6. Today (ITM-437) it derives `open` from the approval records alone, and so names the 16 entries
of 2026-09-23 as open, whose decision rows name their SPEC commits.

The item waits for akmaier's acceptance of MOD-approvals' text drafted in afab8296; until that text is accepted, it does
not start.

## Acceptance

- Unit tests that name MOD-approvals state, before the code exists, on a fixture instance: an entry whose decision row
  names the commit that wrote it into the SPEC, with no approval record, not named open; an entry named by an approval
  record not named open, as before; an entry with neither named open in the warning.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/approvals/` and the tests that name MOD-approvals change.
