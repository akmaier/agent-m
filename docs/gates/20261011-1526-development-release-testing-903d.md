---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 90aa2f15da32033f02fdf17c45ece7500bd0066e
  - https://github.com/akmaier/agent-m/pull/374
date: 2026-10-11 15:26 UTC
---
# Development → Release testing: ITM-334

**REGISTER**

## Reason

ITM-334, pull request #374 by developer-sonnet-c into `sprint/team1/16`, on head `90aa2f1`, against the item and
MOD-approvals' accepted file as they stand on the sprint's branch. All five points hold:
- The first commit, `2022b7e`, holds only `tests/approvals-last-accepted.test.mjs`, and CI was red on it (run
  38150832874): node failed on exactly its 5 tests — 1445 tests, 5 failed.
- CI is green on the head (run 38150969285): node 1445 tests, 0 failed; python 441 tests, OK.
- Only MOD-approvals' folder — `lastAcceptedText` in `status.mjs`, the export and header of `index.mjs` — and the new test
  whose header names the module change; no existing test or expected result changes.
- The 5 new tests name what they guard — `A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT`, `STATUS IS DERIVED
  FROM THE RECORDS` and, for the fifth, `AN APPROVAL NAMES THE EXACT TEXT` — and MOD-approvals, with 26 faults planted
  on the draft first.
- The Acceptance holds, on a fixture history: two records of one use case give the newer one's text; a file renamed
  after its record is still found; no record gives `null`; `TokenRefused` is passed on.

The fifth test, beyond the Acceptance, stays: a record whose file did not hold the text it names, at the commit that added
it, is `NotFound` and answered with no other text. Noted for the sprint's review, no condition of this gate: "most recent"
read as the latest date of the commits that added the records, as the model does, two records of one instant not told
apart; the text read at the commit that added the record in place of the file's own history; `HostError` taken from
MOD-repository-hosts, whose uses entry does not name it; and the import cycle with `index.mjs`, as in `accept.mjs`.
