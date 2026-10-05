# 5. Process models and practices: the process model is declared before implementation starts

**The change.** `THE PROCESS MODEL IS DECLARED PER PRODUCT` says when: "before its implementation starts". Every other
requirement of the section is carried over byte for byte.

**Why.** PO decision, 2026-10-05: the software process "should be configured in exactly this step" — the step that
implements the architecture (UC-024) —, since the process "determines HOW things are implemented". Before that, the
product's requirements, use cases and architecture are worked out the same way whatever the process; the model first
matters when the work of assembling the software is planned — an implementation plan or a backlog — and done. Read
without a time, "each managed product declares exactly one process model" asked for a model from the moment a product
was added.

**Impact list.** The requirement is named by UC-002, UC-024 and UC-045 — UC-002 and UC-024 are revised in the same push,
UC-002 moving from the setup to the implementation —, and by the frozen backlog item
`tests/fixtures/sprint-02-running/docs/backlog/ITM-030-declaration-and-workflow.md`, a test fixture that stays as it is.
Its check, `tests/test_model_declared.py`, is unchanged.
