---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 7e8eb0e9e6ad51d301e60ba85b3e336e081f7e0e
  - https://github.com/akmaier/agent-m/pull/872
date: 2026-10-18 09:29 UTC
---
# Development → Release testing: ITM-888, a test declaration carries its title

**REGISTER**

## Reason

ITM-888 builds MOD-test-document's `TestDeclaration.title`. Its pull request #872 into `sprint/team2/90` passes on
`7e8eb0e9`. CI was red on the tests-only commit `c31be789` (the new tests and the whole-declaration tests failed), and
is 12 of 12 green on the merge with `9f170206`, the head of the sprint's branch.

- **The accepted text.** `statuses` of MOD-approvals, run on the trees of `main` and of the head, gives
  `docs/architecture/MOD-test-document.md` at blob `a0dfc9a9` the status accepted (record `831c98f5`).
- **Scope.** `src/test-document/declarations.mjs` and `src/test-document/index.mjs` (the module's folder), and
  `tests/test-document-declarations.test.mjs`, whose header names MOD-test-document. Nothing else changes.
- **The Acceptance holds.** A JavaScript string-literal title (`"…"` and `'…'`); a Python `def` name, where a string
  literal on the same line takes precedence; `null` at the end of the file, after a blank line and on a line with
  neither; a manual heading's title and `null` for a heading without one; a function's name. Expected values are literal.
- **Existing assertions.** The whole-declaration assertions gained only `title` — `null` where the next line is blank,
  `//` or ` */`, and the heading's own text for TST-003. No other expected value changed.
- **Readers.** Every reader of `testDeclarations` (git grep) reads fields by name. None spreads or serialises a whole
  declaration. Their unit tests (317) and the Python tests that call it (12) pass on the head.
- **Replayed** five counter-proofs on the head. Each fails at least one new test and passes again when restored. The
  faults were: the literal ignored, the name ignored, the heading title dropped, a blank line skipped, the name before
  the literal.
- All 62 release test files ran on the head with `LC_ALL=C`, after the npm install, `release-sprint-02-d-traceability`
  among them: 338 pass, 7 todo. The one failure, TST-320321902, fails the same way on `main` under Node 25.
