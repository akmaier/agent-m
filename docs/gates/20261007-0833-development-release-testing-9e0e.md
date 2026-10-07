---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 9b135c4533ae29a5f77d37b552219aeb9484492f
  - https://github.com/akmaier/agent-m/pull/152
date: 2026-10-07 08:33 UTC
---
# Development → Release testing: ITM-234

**REGISTER**

## Reason

ITM-234, the entries of the change queues: pull request #152 by developer-sonnet-d, on head `9b135c4`, branched from
`sprint/07` at `aed8a49`.
- The first commit, `bdb807b`, holds only `tests/spec-changes-queues.test.mjs`, and CI was red on it: that file failed,
  since `src/spec-changes/` did not exist yet.
- CI is green on the head (python and node).
- Only the item's scope changed: `src/spec-changes/index.mjs`, `queues.mjs` and the schemas of `index.md` and
  `entscheidungen.md`, among the module's Parts, using MOD-documents only through its interface; and the new test, whose
  header names MOD-spec-changes.
- The two new tests name `STATUS IS DERIVED FROM THE RECORDS`, UC-047 and MOD-spec-changes, and their seven counter-proofs
  are recorded in the pull request.
- The Acceptance holds: on a fixture snapshot, a queue with an open, an approved and an in-SPEC entry, its entry table
  found past an impact table, and two queues newest first.

Noted for the sprint's end, no reason by itself: on `main`, 16 decision rows of the three earliest queues
(`2026-09-23_agent-m-v1`, `2026-09-23b_quellen-und-bruecke`, `2026-09-23c_review-auf-github`) name a commit, not a record.
By the module file's definition of `in SPEC`, their entries read as open.
