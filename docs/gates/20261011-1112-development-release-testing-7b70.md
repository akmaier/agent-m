---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - bc0286805f6b95f82019bf237fa47c826bf5ab27
  - https://github.com/akmaier/agent-m/pull/341
date: 2026-10-11 11:12 UTC
---
# Development → Release testing: ITM-386

**REGISTER**

## Reason

ITM-386, pull request #341 by developer-sonnet-c into `sprint/team1/14`, on head `bc02868`, against the item and the
accepted files of MOD-job-runner, MOD-documents and MOD-test-document as they stand on the sprint's branch and on `main`.
All five points hold:
- The first commit, `a54cbd2`, holds only `tests/job-runner-check-fixes.test.mjs`, and CI was red on it (run
  38134254066): node failed on its three tests of new behaviour — 1261 tests, 3 failed. Its fourth test guards the swap to
  `artifactSchemaOf`, which changes no verdict, and fails on the planted faults recorded for it.
- CI is green on the head (run 38134419380): node 1265 tests, 0 failed; python passed.
- Only MOD-job-runner's folder — `builtins.mjs`, `prepare.mjs`, a comment of `index.mjs` — and the new test whose header
  names the module change; no existing test or expected result changes. The runner's own copy of the path patterns is
  gone; every interface it calls stands among its uses. The test's fixture declarations are not read as its own.
- The 4 new tests name what they guard and MOD-job-runner, and have 15 counter-proofs.
- The Acceptance holds: a use case and a backlog item judged by their schemas, a path no pattern matches not; an added test
  file without a declaration reported; an unknown branch sent back as a finding; a job of `write-tests` without a host
  blocked before it starts; the cases of #328 and #334 asserting what they asserted.

Noted, no condition of this gate: every file a branch adds under `tests/` is a test file by MOD-test-document's Data, so
an added fixture or helper — a JSON file among them — is reported as declaring none, which its participant cannot fix.
The code follows the accepted texts; the sprint record names the question for akmaier.
