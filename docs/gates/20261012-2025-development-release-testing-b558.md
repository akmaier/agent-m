---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 6afe14689cf5cfb49bff5366249b6af8b7f61dd0
  - https://github.com/akmaier/agent-m/pull/447
date: 2026-10-12 20:25 UTC
---
# Development → Release testing: ITM-465, architecture-ready counts an entry decided by its SPEC commit as decided

**REGISTER**

## Reason

ITM-465, pull request #447 by developer-sonnet-d into `sprint/team1/22`, head `6afe146`. The tests-only commits
`bc3c6a4`, `c2c9f1b` and `d8d88e8` were each red on the tests they hold (runs 38302335259, 38302828652, 38303085976),
and `6afe146` is green (run 38303722518, 2111 tests, 0 failures). The code changes only `src/approvals/strategies.mjs`;
the new test names MOD-approvals and its guards, and 10 faults are recorded, all killed. Over this repository, the 16
entries of 2026-09-23 are no longer named open, and each of their rows' commits changes `SPEC.md`, checked with git.

The points weighed:
- The existing test `tests/approvals-architecture.test.mjs`, of the same module, changes one expected result: an entry
  only a decision row names was open, and with its row naming its SPEC commit it is decided. That is exactly the
  behaviour ITM-465's Outcome reverses — "Today (ITM-437) it derives `open` from the approval records alone, and so
  names the 16 entries of 2026-09-23 as open" —, as the SPEC requires since 8a5b8dd6 and MOD-approvals' file since
  50591c1e; `docs/instructions/developers.md` rule 3 lets an existing expected result change where the item names it.
  The item's Acceptance line "no expected result changed", which I wrote, contradicts its own Outcome; the mistake is the
  item's, not the pull request's. That product-owner.md's check 3 says "never an expected result" without that exception
  is noted for the review.
- A row decides its entry when it names a commit, which is not checked to have changed `SPEC.md`: a snapshot holds no
  history. The accepted text has the row name "the commit that wrote it into the SPEC", and a decision row is a record,
  written by `acceptEntries` and `applyApproved` with that commit (`STATUS IS DERIVED FROM THE RECORDS`); reading the
  record as it states it meets the text. Verifying a row's commit against the history would be a check of its own,
  noted for the review. The rows' shape read from this repository's 111 rows, a row deciding only its own queue's
  entry, and the entry number read without padding follow the file.
