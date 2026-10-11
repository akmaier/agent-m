---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - af8b2f1af09470f4576e3fd106e2efe61e1bdde7
  - https://github.com/akmaier/agent-m/pull/377
date: 2026-10-11 16:00 UTC
---
# Development → Release testing: ITM-340

**REGISTER**

## Reason

ITM-340, pull request #377 by developer-sonnet-a into `sprint/team1/16`, on head `af8b2f1`, against the item and
MOD-spec-changes' accepted file as they stand on the sprint's branch. All five points hold:
- The first commit, `4c53906`, holds only `tests/spec-changes-accept.test.mjs`, and CI was red on it (run 38152572861):
  node failed on exactly its 20 cases. The second tests-only commit, `eb4cd96`, adds what the faults planted on the
  draft left unpinned, red on exactly its 24 cases (run 38153077888).
- CI is green on the head (run 38153227115): node 1491 tests, 0 failed; python 441 tests, OK.
- Only MOD-spec-changes' folder — one planner for `acceptEntries` and `applyApproved` in `accept.mjs`, the exports and
  header of `index.mjs` — and the new test whose header names the module change; no existing test or expected result
  changes, and the model in `docs/assets/review-core.mjs` stays.
- The 24 new tests name what they guard — among them `A QUEUE IS ACCEPTED IN ITS ORDER`, `A STALE APPROVAL IS NOT
  APPLIED`, `AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL` and `A REQUIREMENT HAS A REGISTERED SOURCE` — and
  MOD-spec-changes, with 66 planted faults recorded.
- The Acceptance holds: entries 05 and 06, 06's anchor created by 05, accepted together in one commit, in index order,
  each with record, section and decision row; 06 alone refused, naming 05; a stale entry: nothing written, named; a
  requirement naming no linked source: nothing written, named; `applyApproved` returning byte for byte what
  `acceptEntries` commits for the same records; a record whose anchor is not its entry's refused.

Noted for the sprint's review, no condition of this gate: the readings the pull request names, among them a waiting
entry shown with the section blob `""`, entries checked against the target as the entries before them leave it, and the
decision row appended to the file's bytes; and its finding over this repository: the 16 entries of the queues
2026-09-23_agent-m-v1, 2026-09-23b_quellen-und-bruecke and 2026-09-23c_review-auf-github read `open`, as their decision
rows, of a retired form, name a commit and no record, so `acceptEntries` would write nine of them over today's
sections — no page offers *Accept* for them yet, and ITM-454 takes it up before the SPEC entries' page, ITM-357.
