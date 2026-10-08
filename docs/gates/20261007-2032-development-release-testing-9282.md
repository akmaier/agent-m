---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 81e5b8d7bf0c563d0ed5ce1efce5708b85bfdd85
  - https://github.com/akmaier/agent-m/pull/200
date: 2026-10-07 20:32 UTC
---
# Development → Release testing: ITM-254, its rework within sprint 12

**REGISTER**

## Reason

ITM-254, versions, release candidates and the release: pull request #200 by developer-sonnet-c, reworked once within
the sprint on the condition of its rejection on `482fc5c` (`20261007-2016-…-45b3.md`), now on head `81e5b8d`.
- The first commit, `692909a`, holds only `tests/release-evidence.test.mjs`, and CI was red on it (run 37679218036), on
  exactly that file.
- CI is green on the head (run 37682480729).
- Only `src/release-evidence/` and the new test, whose header names MOD-release-evidence, changed; the rework changes
  `report.mjs` and that test only. Its new calls, `listJobs` and `blobSha`, are among what the module's file uses.
- The new tests name what they guard and the module, with their counter-proofs recorded. Run on the head with the fault
  planted: `rateComparison` given no last release turns the worse-rate tests red, and the report left out of the
  release commit turns the 4b test red.
- The Acceptance holds, the condition of the rejection included. The report's `## Limitations` names a rate worse than
  the last release's, whose commit is read from that release's report in `at`. The release is one commit of the
  report, its approval record and the changelog entry, then the tag on the candidate's commit.

Noted, no reason by itself; it goes to the review: `releaseReport` dates the report by the clock, having no `today`. A
report shown on one day and accepted on another recomputes to another blob and is refused as `Moved`.
