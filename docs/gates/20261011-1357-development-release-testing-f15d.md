---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 89f429942cd1d0a6bcd746023d62c56cc770f9f4
  - https://github.com/akmaier/agent-m/pull/360
date: 2026-10-11 13:57 UTC
---
# Development → Release testing: ITM-299

**REGISTER**

## Reason

ITM-299, pull request #360 by developer-sonnet-a into `sprint/team1/15`, on head `89f4299`, against the item and
MOD-identifiers' accepted file as they stand on the sprint's branch. All five points hold:
- The first commit, `1261785`, holds only `tests/identifiers-next.test.mjs`, and CI was red on it (run 38144235920):
  node failed on that file alone, which cannot import `nextIdentifier` yet — 1364 tests, 1 failed. The second
  tests-only commit, `33190d8`, adds two cases before any code, red the same way (run 38144677360).
- CI is green on the head (run 38144871895): node 1380 tests, 0 failed; python 441 tests, OK.
- Only MOD-identifiers' folder — `nextIdentifier` in `scheme.mjs`, the export and header of `index.mjs` — and the new
  test whose header names the module change; no existing test or expected result changes.
- The 10 new tests name `EVERY ARTIFACT HAS AN IDENTIFIER` or `THE NAME IS THE ID AND IT SURVIVES`, and MOD-identifiers,
  with 50 counter-proofs.
- The Acceptance holds: `UC` after `UC-001`, `UC-022` and a withdrawn `UC-031` gives `UC-032`; a slug kind gives
  `<kind>-<slug>`; a used slug throws `IdentifierTaken`; a missing or broken slug throws `TypeError`.

The tests beyond the Acceptance stay: each guards a reading the pull request names. Noted for the sprint's review, no
condition of this gate: those readings — the first number 001, a `RangeError` past 999 of ARC, TST and ITM, which the
scheme gives exactly three digits, a `TypeError` for a kind outside the seven and for a history not given — and that the
six-digit test identifiers in this repository, such as TST-276001 and TST-342001, are no TST identifiers by
`kindOfIdentifier`, so `nextIdentifier` does not count them.
