---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - e044f69cb05bcd38fd36d2719df093ea511965ed
  - https://github.com/akmaier/agent-m/pull/329
date: 2026-10-11 08:23 UTC
---
# Development → Release testing: ITM-298

**REGISTER**

## Reason

ITM-298, pull request #329 by developer-sonnet-d into `sprint/team1/13`, on head `e044f69`, against the item and
MOD-identifiers' accepted file as they stand at the sprint's commit `8a12001` and on `main`. All five points hold:
- The first commit, `4c55d1d`, holds only `tests/identifiers-written-and-positions.test.mjs`, and CI was red on it (run
  38123879649): node failed on that file alone, `src/identifiers/index.mjs` giving no `identifiersIn` — 1208 tests, 1
  failed.
- CI is green on the head (run 38124181178): node 1213 tests, 0 failed; python passed.
- Only MOD-identifiers' folder — `identifiersIn` in `scheme.mjs`, the new `positions.mjs`, the exports and
  `pagesAddress` in `index.mjs` — and the new test whose header names the module change; no existing test or expected
  result changes. The code uses only MOD-text-tools' `finding`, as the module file's uses state.
- The 6 new tests name what they guard and MOD-identifiers, and have 23 counter-proofs, each test at least two.
- The Acceptance holds: every kind of the scheme found with its line, and a name in prose not taken for a requirement; a
  step, a section and a line number reported, a book's chapter with its sections not; `pagesAddress` for `owner/name`,
  and a `TypeError` for eight strings that are not of that form.

Noted for the sprint's review, no condition of this gate: the seven readings the pull request names where MOD-identifiers'
text leaves one open — among them that a section of an outside work other than a book, a law or a standard, is reported,
since the text alone cannot tell it from a part of the product's artifact.
