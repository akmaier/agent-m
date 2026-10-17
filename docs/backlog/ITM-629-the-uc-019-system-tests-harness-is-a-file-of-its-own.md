---
id: ITM-629
title: The UC-019 system tests' harness is a file of its own
level: system
realises:
  - UC-019
modules:
  - MOD-review-pages
  - MOD-prompt-bar
builds_on:
  - ITM-570
tests:
  - system
origin:
  - ITM-570's gate (docs/gates/20261017-0050-development-release-testing-91a0.md)
---
# ITM-629 The UC-019 system tests' harness is a file of its own

**REGISTER**

## Outcome

`tests/system-uc-019-change-by-prompt.test.mjs` takes its harness from
`tests/system-uc-019-change-requirements-by-prompt.test.mjs`, so that file's tests run again with it. The harness moves
to a helper of its own under `tests/`, and both files import it, as ITM-623 did for the review pages (sprint 56's
agreement).
- The counter-proof table of `tests/release-uc-019-change-requirements-by-prompt.test.mjs` copies a fixed list of files.
  The helper joins that list, as ITM-623's did.
- The `Module:` lines of the system file and of `tests/release-uc-019-change-by-prompt.test.mjs` gain MOD-prompt-bar,
  whose hand-over they exercise since ITM-570.

**The grep of the moved path** (sprint 58's agreement). A grep of `tests` for
`system-uc-019-change-requirements-by-prompt.test.mjs` finds these files, each listed with what it does:
- **They import the harness, and import the helper instead:**
  - `tests/system-uc-019-change-by-prompt.test.mjs:29`;
  - `tests/release-uc-019-change-by-prompt.test.mjs:24`;
  - `tests/release-uc-019-change-requirements-by-prompt.test.mjs:27`.
- **They name the file as the evidence of a test, and stay**, since the test file stays:
  - `tests/system-uc-019-change-by-prompt.test.mjs:36` (`REQUIREMENTS`);
  - `tests/release-uc-019-change-by-prompt.test.mjs:31` (`SYSTEM_REQUIREMENTS`).
- **It copies a list of files:** `tests/release-uc-019-change-requirements-by-prompt.test.mjs:641`, the counter-proof
  table's list, which gains the helper.
- **Comments, which follow the move:** `:13`, `:15`, `:19`.

It is a refactoring of the tests: no expected result changes. The golden master is the list of the test names and
results before and after, less the repeated runs.

## Acceptance

- No test file imports another for its harness.
- Every test passes with the same expected values, each runs once per file that declares it, and the UC-019 table gives
  its 29 receipts.
