# 9. Human gates: a conversation record is evidence

**The change.** `A RECORD IS EVIDENCE, NOT A PROPOSAL` names conversation records beside approval, gate, job and test
result records; its name stays. The rest of the section is carried over byte for byte.

**Why.** akmaier's decision of 2026-10-15: the instance may switch on recording every conversation of the prompt bar in
git (entry 03). A conversation record states what was said; nobody accepts it. Without the change, a record Agent M
writes would count as a generated artifact (`A GENERATED ARTIFACT IS A PROPOSAL`) and be shown as open.

**Against the rest of the SPEC.** "Written once" is read as for a job record, which is appended part by part and never
rewritten: a conversation record grows message by message and is never rewritten. `STATUS IS DERIVED FROM THE RECORDS` is
unaffected; a conversation record needs no approval record.

**Impact list.** Use cases that realise it: UC-028, UC-036 — unchanged; UC-042 and UC-049 realise it with this queue.
Architecture: ARC-046, MOD-approvals, MOD-documents, MOD-product-process. Code: `src/documents/read-write.mjs`,
`src/job-ledger/job.schema.md`, `src/job-ledger/states.mjs`, `src/product-process/gate-record.schema.md`. Tests naming it:
`tests/documents-spaced-keys.test.mjs`, `tests/job-ledger-append.test.mjs`, `tests/job-ledger.test.mjs`,
`tests/job-runner-writer-notes.test.mjs`, `tests/product-process-gates.test.mjs`,
`tests/release-sprint-02-c-review-core.test.mjs`, `tests/review-core.d/gates.test.mjs`, and `tests/review-core.test.mjs`,
whose two cases on this requirement are marked TODO (findings G1 and G2) independently of this change.
