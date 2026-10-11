---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - b30c1705e7757eeac07dc65bc8afb1534fb4e28a
  - https://github.com/akmaier/agent-m/pull/337
date: 2026-10-11 10:53 UTC
---
# Development → Release testing: ITM-380

**REGISTER**

## Reason

ITM-380, pull request #337 by developer-sonnet-a into `sprint/team1/14`, on head `b30c170`, against the item and
MOD-test-document's accepted file as they stand at the sprint's commit `078aec0` and on `main`. All five points hold:
- The first commit, `c187234`, holds only `tests/test-document-test-files.test.mjs`, and CI was red on it (run
  38133197914): node failed on that file alone, `src/test-document/index.mjs` giving no `isTestFile` — 1239 tests, 1
  failed.
- CI is green on the head (run 38133314725): node 1242 tests, 0 failed; python passed.
- Only MOD-test-document's folder — `isTestFile` in `declarations.mjs`, and in `index.mjs` its export and header
  comment — and the new test whose header names the module change; no existing test or expected result changes.
- The 4 new tests name what they guard and MOD-test-document, and have 16 counter-proofs, each test at least two.
- The Acceptance holds: test files by folder and by name in JavaScript, Python and Go; a Markdown file under a test folder
  as a test file; code files and documents outside such folders, and names that only hold the word test, not.

Noted for the sprint's review, no condition of this gate: MOD-test-document's Parts name no part for `isTestFile`, built
in `declarations.mjs`; the module file's "such as" leaves the names of a test file by language open, built as the
dashboard's rule; and the same rule still stands in `src/release-evidence/report.mjs`, whose module file does not list
`isTestFile` among its uses, and which no item of this sprint changes.
