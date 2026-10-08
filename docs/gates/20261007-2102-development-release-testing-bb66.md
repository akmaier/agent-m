---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - a937ac782fda975230f43db4a027fba7964ecd8a
  - https://github.com/akmaier/agent-m/pull/201
date: 2026-10-07 21:02 UTC
---
# Development → Release testing: ITM-256

**REGISTER**

## Reason

ITM-256, the release panel: pull request #201 by developer-sonnet-d, on head `a937ac7`, branched from `sprint/12` with
ITM-254 merged.
- The first commit, `1e71722`, holds only `tests/test-pages-release.test.mjs`, and CI was red on it (run 37685616030), on
  exactly that file.
- CI is green on the head (run 37686207391). `a937ac7` changes only how the new test waits for a settled page.
- Only `src/test-pages/index.mjs` and `release.mjs`, among the module's Parts, and the new test, whose header names
  MOD-test-pages, changed.
- The six new tests name what they guard and the module, with their counter-proofs recorded. Run on the head with a fault
  planted, each of two of my own turns its test red: the worse rates not asked for, and an explanation dropped.
- The Acceptance holds for UC-013's main flow and for 1a, 2a, 3a, 3b, 4a and 4b: what the panel shows and what each click
  writes, with each step's folded explanation.

Noted, no reason by themselves; they go to the review:
- `blobSha` of MOD-text-tools is used, though MOD-test-pages' file does not list it. `acceptAndRelease` needs the
  report's blob, and `releaseReport` returns only its text.
- Opening a waiting report from a notification's address needs `reportsAwaitingAcceptance`, which is ITM-239's.
