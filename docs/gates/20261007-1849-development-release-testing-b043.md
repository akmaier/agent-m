---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 34e32f0727bfe7e3125e3e92156ccfe2fbc9ee20
  - https://github.com/akmaier/agent-m/pull/193
date: 2026-10-07 18:49 UTC
---
# Development → Release testing: ITM-248, its second attempt

**REGISTER**

## Reason

ITM-248, the declarations of the tests: pull request #193 by developer-sonnet-b, on head `34e32f0`, branched from
`sprint/12` at `a0bc752`.
- The first commit, `443233b`, holds only `tests/test-document-declarations.test.mjs`, and CI was red on it (run
  37667355882). The node job failed on exactly that file, whose module did not exist yet, beside the suite's known todo
  marks.
- CI is green on the head (run 37669075098): node 892 tests, 0 fail, 11 todo; python 396, OK.
- Only `src/test-document/` — `index.mjs` and `declarations.mjs`, among the module's Parts — and the new test, whose
  header names MOD-test-document, changed.
- The ten new tests name what they guard and the module, and each has its counter-proof recorded.
- The Acceptance as corrected for this sprint holds:
  - a declaration in each comment marker MOD-test-document's file names, and one under a Markdown heading, is read with
    every key;
  - a missing key is read as `null`;
  - a declaration ends at the first line not of its form, and not at a following line whose value holds ` · `, which is
    read whole as one `key: value`, with the lines after it;
  - a file without a declaration yields none.
- The reason of the first rejection (`20261007-1317-…-a439.md`, #162) is met. Run on the head with #162's code planted,
  which splits a following line at ` · `, the test of that line fails with `expect` and `runs` null, as that gate
  recorded. Three more recorded faults, each planted and run, turn their test red: a non-form line skipped, a missing
  key read as `""`, and the marker ` *` dropped.

Noted, no reason by itself: `TestDeclaration` types `level` and `guards` with `null`, which MOD-test-document's
Interfaces do not; the pull request names it, as the start decision of sprint 12 expects.
