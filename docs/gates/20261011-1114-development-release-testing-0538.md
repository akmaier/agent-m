---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - b353e598333125ca537a93556a88a6a455932c2c
  - https://github.com/akmaier/agent-m/pull/342
date: 2026-10-11 11:14 UTC
---
# Development → Release testing: ITM-303

**REGISTER**

## Reason

ITM-303, pull request #342 by developer-sonnet-d into `sprint/team1/14`, on head `b353e59`, against the item, the SPEC
and MOD-documents' accepted file as they stand on the sprint's branch and on `main`. All five points hold:
- The first commit, `44a805a`, holds only `tests/documents-classify-candidates.test.mjs`, and CI was red on it (run
  38134260885): node failed on that file alone, `src/documents/index.mjs` giving no `classifyCandidates` — 1258 tests,
  1 failed.
- CI is green on the head (run 38134516296): node 1265 tests, 0 failed; python passed.
- Only MOD-documents' folder — the new `candidates.mjs`, and in `index.mjs` the export, the types and its header — and
  the new test whose header names the module change; no existing test or expected result changes.
- The 4 new tests name what they guard and MOD-documents, and have 23 counter-proofs of 19 faults.
- The Acceptance holds: two candidates of one key merged naming both passages; an exact duplicate of an existing artifact
  classed by rule whatever its participant said; keys differing only in case, white space, quotation marks or dashes one
  key; every other class kept.

Noted, no condition of this gate: `EXACT DUPLICATES ARE FOUND WITHOUT A MODEL` makes a duplicate of a candidate whose name
or normalised rule text equals an existing requirement's, as the code does; `A CHANGE IS PROPOSED UNDER THE EXISTING NAME`
proposes a candidate that keeps an existing name and changes its rule as a change. The two binding sentences cannot both
hold for it; the sprint record names the question for akmaier. The class of merged candidates proposed in different
classes, merging along a chain, and what "normalised" admits go to the review.
