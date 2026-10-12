---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 750a39f6c6dcf8fecff5b68ff6c04c3a811fee12
  - https://github.com/akmaier/agent-m/pull/450
date: 2026-10-12 20:45 UTC
---
# Development → Release testing: ITM-454, an entry whose decision row names its SPEC commit reads as decided

**REGISTER**

## Reason

ITM-454, pull request #450 by developer-sonnet-a into `sprint/team1/23`, head `750a39f`. The first commit `ed18931`
holds only `tests/spec-changes-retired-row.test.mjs`, and CI was red on it (run 38305248512): five tests fail, and no
other test does. CI is green on `750a39f` (run 38305610727, its second attempt after the runner cancelled the first;
2124 tests, 0 failures). The code changes only `src/spec-changes/queues.mjs`; the new test names MOD-spec-changes and its
guards, and 11 faults are recorded. The Acceptance holds: an entry whose decision row names the commit that wrote it into
the SPEC, with no record, reads `in SPEC` in `queues` and `entryView`; one whose row names its record as before; one
with neither, `open`. Over this repository all 113 entries of the 47 queues read `in SPEC`, the 16 of 2026-09-23 among
them, each with the commit its row names.

The readings weighed: a row decides by its commit when its decision is `uebernommen` and its fourth cell is a commit
as git writes it, 7 to 40 lower-case hexadecimal digits, the form `queue-decisions.schema.md` gives such rows; an entry
decided by its commit has no record, and `acceptEntries` and `applyApproved` already refuse an entry whose decision is
set. A row that decides an entry decides it although a record of an earlier text exists: MOD-spec-changes' state rule,
accepted in 50591c1e, lists `in SPEC` — "a decision row `uebernommen` names its record, or names the commit that wrote
it into the SPEC" — beside `stale` without an order between them, and a decision row records what was written into the
SPEC, which a record of an earlier text does not undo. That the rule names no order is noted for the review.
