---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - f1ff8a84dfe7c6f1121e6cb8939522f409d1ae22
  - https://github.com/akmaier/agent-m/pull/343
date: 2026-10-11 11:18 UTC
---
# Development → Release testing: ITM-382

**REGISTER**

## Reason

ITM-382, pull request #343 by developer-sonnet-b into `sprint/team1/14`, on head `f1ff8a8`, against the item and
MOD-trace-graph's accepted file as they stand on the sprint's branch and on `main`. All five points hold:
- The first commit, `26d1a24`, holds only test files — the new `tests/trace-graph-facts.test.mjs` and the two existing
  tests adapted —, and CI was red on it (run 38134551085): node failed on its 10 new tests and on the one existing case whose
  expected `sources` the item changes — 1271 tests, 11 failed.
- CI is green on the head (run 38134798648): node 1271 tests, 0 failed; python passed.
- In scope: `build.mjs`, `derive.mjs` and the comments and typedefs of `index.mjs` in MOD-trace-graph's folder; the new
  test, whose header names the module; and `tests/trace-graph-documents.test.mjs` and `tests/trace-graph-guards.test.mjs`,
  which name MOD-trace-graph. Those compare a node and an edge through two projections of the fields they asserted before,
  every expected value as it stood; the one expected result that changes is `tracesTo`'s `sources`, `[]` before and the
  requirement's source now, which the item's Outcome and Acceptance name.
- The 10 new tests name what they guard and MOD-trace-graph, and have 25 counter-proofs.
- The Acceptance holds: each new fact on the nodes of its kind and `null` on the others; a `uses` edge's interface; a
  group's node; every path in `files`; a Markdown link and an autolink in `links`; a reference by position in
  `positions`; a requirement's sources on its node and in `tracesTo`, with no `source` edge; ITM-305's cases asserting
  what they asserted.

Noted for the sprint's review, no condition of this gate: the Product Owner's check 3 says an existing test changes "never
an expected result", while the Developers' rule allows one "your item names"; this pull request changes exactly the one its
item names. A `uses` edge's `to` stays as the module file writes it, its interface after the first dot; links are read
from the five kinds of document only, not from `SPEC.md`, the test files or the group files, which ITM-306's
self-sufficiency check reads; and a module without `provides` or an item without `tests` has `[]`, not `null`.
