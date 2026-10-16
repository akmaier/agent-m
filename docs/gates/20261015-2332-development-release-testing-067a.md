---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - a23d012b0526e44f92c9fd389176024df471158a
  - https://github.com/akmaier/agent-m/pull/534
date: 2026-10-15 23:32 UTC
---
# Development → Release testing: ITM-502, A queue entry's origin names a conversation, never its message

**REGISTER**

## Reason

ITM-502, pull request #534 into `sprint/team1/30`, head `a23d012b`. developer-sonnet-d made both commits.

1. The tests-only commit `8719d5a4` holds only `tests/spec-changes-queue-entries.test.mjs`, and CI was red on it (run
   38822496141, node (5)).
2. CI is green on the head, ten of ten jobs. Locally, the tests of MOD-spec-changes, MOD-documents, the specification
   tests, UC-019's release tests and UC-022's system test give no failures.
3. The changes stay in the item's scope:
   - `src/spec-changes/propose.mjs` is the item's module.
   - In `tests/spec-changes-queue-entries.test.mjs`, TST-473003's expected result changed, and the item names that
     test. The accepted MOD-spec-changes file changes the origin it asserts: a conversation, never a message.
   - TST-473208 is new.
4. Both tests name their requirements and MOD-spec-changes, and state their values in their own text. Their
   counter-proofs are recorded in #534.
5. The Acceptance holds:
   - The rationale names a conversation in the prompt bar on the page, and no word of the instruction.
   - The queue's `index.md` holds no instruction.
   - Planted instructions are found.
   - `provenanceLines` is called without `instruction`.

The developer noted a gap: the module file gives no wording for an origin without a page. The code then writes
"a conversation in the prompt bar". That reading is within the accepted text, since there is no page to name, and it
is noted for the review.
