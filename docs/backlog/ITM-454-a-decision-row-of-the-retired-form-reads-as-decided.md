---
id: ITM-454
title: A decision row of the retired form reads as decided
level: module
realises:
  - UC-006
  - A SPECIFICATION CHANGE IS APPROVED BEFORE IT IS WRITTEN
  - THE GATE IS RECORDED
modules:
  - MOD-spec-changes
builds_on:
  - ITM-339
tests:
  - unit
origin:
  - ITM-340, #377
  - MOD-spec-changes, Data: the state of an entry
---
# ITM-454 A decision row of the retired form reads as decided

**REGISTER**

## Outcome

MOD-spec-changes' `queues` reads an entry as `in SPEC` when its queue's `entscheidungen.md` holds a row `uebernommen`
for it in the retired form — its time without `UTC`, its reference a bare commit SHA in place of `approval:<record>` —,
so that no page offers *Accept* for it (UC-006 steps 1 and 7). Today (ITM-234, ITM-339) such an entry reads `open`: the
16 entries of the queues `2026-09-23_agent-m-v1`, `2026-09-23b_quellen-und-bruecke` and
`2026-09-23c_review-auf-github` were accepted on 2026-09-23, before approval records were written, and their rows name
the commit that wrote their section. `acceptEntries` would now write nine of them over today's sections (#377).
Records and decision rows are never rewritten, so the reading is the code's.

The accepted texts give no way to build it: MOD-spec-changes' file derives `in SPEC` from "a decision row `uebernommen`
names its record" and `open` from "no approval record names its proposal", and these entries have no record. The item
needs a change of MOD-spec-changes' file that reads an entry with a decision row of the retired form as `in SPEC`, for
akmaier's acceptance; until then it cannot start. ITM-357, the review page of SPEC entries, builds on it.

## Acceptance

- Unit tests that name MOD-spec-changes state, before the code exists, on a fixture queue: an entry with a decision row
  of the retired form and no record reads `in SPEC`, in `queues` and in `entryView`; an entry whose row names its
  record reads `in SPEC` as before; an entry without a row reads as before.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/spec-changes/` and the tests that name MOD-spec-changes change.
