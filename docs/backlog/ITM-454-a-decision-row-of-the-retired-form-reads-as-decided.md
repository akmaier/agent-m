---
id: ITM-454
title: An entry whose decision row names its SPEC commit reads as decided
level: module
realises:
  - UC-006
  - A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN
  - STATUS IS DERIVED FROM THE RECORDS
  - THE GATE IS RECORDED
modules:
  - MOD-spec-changes
builds_on:
  - ITM-339
tests:
  - unit
origin:
  - ITM-340, #377
  - SPEC queue 2026-10-12_decision-rows-before-approval-records, accepted in 8a5b8dd6
  - MOD-spec-changes, Data: the state of an entry, as drafted in afab8296
---
# ITM-454 An entry whose decision row names its SPEC commit reads as decided

**REGISTER**

## Outcome

MOD-spec-changes' `queues` and `entryView` read an entry as `in SPEC` when its queue's `entscheidungen.md` holds a row
`uebernommen` that names the commit that wrote it into the SPEC, as well as when the row names its approval record; an
entry is `open` only while neither an approval record nor such a row decides it. The SPEC says so since 8a5b8dd6
(`A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN`, `STATUS IS DERIVED FROM THE RECORDS`): a SPEC change entry
"also counts as decided when its queue's decision row names the commit that wrote it into the SPEC". It concerns the 16
entries of the queues `2026-09-23_agent-m-v1`, `2026-09-23b_quellen-und-bruecke` and `2026-09-23c_review-auf-github`,
accepted before approval records were written, whose rows name that commit; today they read `open`, and
`acceptEntries` would write nine of them over today's sections (#377). Records and decision rows are never rewritten.
ITM-357, the review page of SPEC entries, builds on this item.

The item waits for akmaier's acceptance of MOD-spec-changes' text drafted in afab8296, which states the derived state
this way; until that text is accepted, it does not start.

## Acceptance

- Unit tests that name MOD-spec-changes state, before the code exists, on a fixture queue: an entry whose decision row
  names the commit that wrote it into the SPEC, with no approval record, reads `in SPEC` in `queues` and in `entryView`;
  an entry whose row names its record reads `in SPEC` as before; an entry without a row and without a record reads
  `open`.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/spec-changes/` and the tests that name MOD-spec-changes change.
