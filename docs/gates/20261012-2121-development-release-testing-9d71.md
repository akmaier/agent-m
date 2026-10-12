---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - c547439bbc5a186510c1bac909a7a7896c9422a0
  - https://github.com/akmaier/agent-m/pull/458
date: 2026-10-12 21:21 UTC
---
# Development → Release testing: ITM-357, the SPEC change entries, and accepting them

**REGISTER**

## Reason

ITM-357, pull request #458 by developer-sonnet-d into `sprint/team1/23`, head `c547439`. The condition that does not
hold: the SPEC change entries have a route of their own, `specEntryRoute` in a new `src/review-pages/spec-entries.mjs`,
which draws their list, one entry and accepting them beside the review flow, where MOD-review-pages' file has the flow
"written once as a template method" — the list, one file, accepting —, in which "a kind takes part through its
descriptor", the SPEC change entries among the kinds, "and the flow calls the service the descriptor names for each
decision"; its Parts give `flow.mjs` the template method, `kinds.mjs` the five descriptors and `sections.mjs` a SPEC
entry's current text, rationale and impact list. The descriptor `SPEC_ENTRIES` with `accept: "queue"` is there, but the
flow does not run it. The rework takes the entries through `flow.mjs` with that descriptor, `acceptEntries` the service
it names for accepting, within `src/review-pages/`.

The rest was read too and stands for the rework: the tests-only commits `773114a` and `3f79f63` were red (run
38309411413), and the code is green (run 38309656268); ITM-440's test pins the list of routes, which a new kind's route
lengthens, and ITM-357's Outcome names that route, so the one changed expected result follows from it — a pin of the
whole list is tight, noted for the review; the fallback record composed with `approvalSchema` and `writeDocument`, as
MOD-spec-changes names no helper for it and ITM-355 does the same; `common.mjs`, helpers moved from `flow.mjs` within the
module, and `spec-entries.mjs`, both outside the module's Parts; the address `spec-entry/id=spec-<queue>-<NN>`.
