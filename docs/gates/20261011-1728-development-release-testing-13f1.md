---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 3b1ff306c5c26c67bf01e7ec04c85ddcb387b5bd
  - https://github.com/akmaier/agent-m/pull/388
date: 2026-10-11 17:28 UTC
---
# Development → Release testing: ITM-317

**REGISTER**

## Reason

ITM-317, pull request #388 by developer-sonnet-c into `sprint/team1/17`, on head `3b1ff30`, against the item and
MOD-job-ledger's accepted file as they stand on the sprint's branch. All five points hold:
- The first commit, `da7d4a7`, holds only `tests/job-ledger-append.test.mjs`, and CI was red on it (run 38158804167):
  node failed on exactly its 5 tests. The item's branch was rebuilt once before this pair, to state red first a case
  that faults planted on the earlier code had shown; check 1 reads the commits that are merged, and of those the first
  holds tests only and was red.
- CI is green on the head (run 38159534082): node 1599 tests, 0 failed; python 441 tests, OK.
- Only MOD-job-ledger's folder — `appendToRecord` and `takeJob` in `index.mjs`, `## Rounds` as an appended section of
  `job.schema.md` — and the new test whose header names the module change; no existing test or expected result changes,
  and the 293 job records of this repository read as before.
- The 5 new tests name what they guard in their file's header — among them `A JOB IS RECORDED IN ITS PRODUCT
  REPOSITORY` and `A RECORD IS EVIDENCE, NOT A PROPOSAL` — and MOD-job-ledger, with 52 planted faults recorded.
- The Acceptance holds, with the host replaced by a fake: each kind of part appended and read back as the same part, the
  bytes before it unchanged; an End with two rounds read back with them; `RecordEnded` and `NotWaiting`; a job taken on
  the head read; on a moved head, taken on the new head or reported as taken by the participant that did.

Noted for the sprint's review, no condition of this gate: two job records, JOB-20261010-0250-p19refill293 and
JOB-20261010-0026-p19settings, have an End with no valid state; and MOD-documents' `appendSection` trims trailing blank
lines against its comment's promise of every byte, which the ledger works around.
