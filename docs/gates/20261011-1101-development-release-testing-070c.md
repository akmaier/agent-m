---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 2602aac8704da1c8a2cc17a6aacd2147186bde99
  - https://github.com/akmaier/agent-m/pull/339
date: 2026-10-11 11:01 UTC
---
# Development → Release testing: ITM-381

**REGISTER**

## Reason

ITM-381, pull request #339 by developer-sonnet-b into `sprint/team1/14`, on head `2602aac`, against the item and
MOD-group-document's accepted file as they stand at the sprint's commit `078aec0` and on `main`. All five points hold:
- The first commit, `7103d89`, holds only `tests/group-document-moves.test.mjs` and
  `tests/group-document-hierarchy.test.mjs`, and CI was red on it (run 38133405792): node failed on exactly their 11 tests
  — 1249 tests, 11 failed.
- CI is green on the head (run 38133791246): node 1257 tests, 0 failed; python 441 tests, OK. On the code commit
  `31fe1c8` python failed: `tests/test_no_backend.py` read `import(` in a typedef comment of `index.mjs` as a
  channel; `2602aac` changes that comment only.
- Only MOD-group-document's folder — the new `moves.mjs` with `applyMoves`, as the module file's Parts and the start
  decision place it, the new `hierarchy.mjs`, and `index.mjs` — and the two new tests whose headers name the module
  change; no existing test or expected result changes.
- The 11 new tests name what they guard and MOD-group-document, and have 36 counter-proofs, each test at least two.
- The Acceptance holds: on the example group file, each kind of move applied; each refusal with its reason; the given tree
  unchanged; a member named twice, a group titled by an identifier and an unknown member as `hierarchy` reports them.

Noted for the sprint's review, no condition of this gate: `applyMoves` refuses more than the four moves the module file
names — a group moved into itself, a group without a title, a text that is no identifier, a move of no kind, a rename to
an identifier —, which the file neither names nor excludes; `lift` is built from UC-021 2b, the file naming it only; a
created group and a placed member stand at line 0; and `test_no_backend.py` still reads `import(` in comments.
