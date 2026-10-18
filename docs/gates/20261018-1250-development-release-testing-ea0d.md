---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: rejected
on:
  - b83dcd076946a1dec823f88b6dde0f9389dcf9fe
  - https://github.com/akmaier/agent-m/pull/894
date: 2026-10-18 12:50 UTC
---
# Development → Release testing: ITM-913, statuses gives the status of a release test report

**REGISTER**

## Reason

ITM-913, pull request #894 into `sprint/team2/92`, is rejected on `b83dcd07`. The change makes `statuses` list a
release test report for every caller, but it does not keep MOD-approvals' own callers of `statuses` correct for such a
report. I replayed this in a clone of my own (`gate894.mjs` in the Product Owner's scratchpad), with a snapshot that
holds `docs/tests/releases/v2026.1.0.md` and a use case:
- `acceptanceBlockers` (`src/accept.mjs:42-47`) returns `[]` for the report on the sprint head `7e4501f5`. On the head it
  throws "TypeError: MOD-documents: not a schema loadSchema returned". The cause: `READ_BY` (`:29`) has no
  `release-report`. MOD-approvals.md:125-128 gives the blockers of a reviewed file and no error. A release test report
  names no requirement or use case, so its result is `[]`.
- `acceptShown` with the report now fails with that error, not with the TypeError of a path that is no use case,
  decision or module.
- The precondition `architecture-ready` (`src/approvals/strategies.mjs:150`) treats every reviewed file that is not a
  use case as an architecture. With a release test report and no architecture, it would refuse a first architecture.

The callers outside MOD-approvals filter by kind (`strategies.mjs:31, :44`, `review-pages/jobs.mjs:476`) or look up a
path they were given (`file-drafts.mjs:23`, `progress-measures/facts.mjs:180`). This repository holds no report, so the
current tests do not see the change. ITM-910 will show reports on the review pages, which call `acceptanceBlockers`
(`review-pages/flow.mjs:326, :502`).

What holds:
- The first commit, `616e7c11`, holds only the test file, and CI run 39128404909 is red on it. CI run 39128704692 is green
  on the head.
- Only `src/approvals/status.mjs` and one new test file naming MOD-approvals changed.
- TST-913001 and TST-913002 guard the item's Acceptance, and their counter-proofs are recorded.
- `tests/approvals-*.test.mjs` pass on the head: 42 of 42.

The condition for the rework: MOD-approvals' own uses of `statuses` give for a release test report what its accepted text
says, each with a test. `acceptanceBlockers` gives `[]`, and `architecture-ready` does not count a report as an
architecture.
