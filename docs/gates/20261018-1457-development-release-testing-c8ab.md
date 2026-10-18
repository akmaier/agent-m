---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: rejected
on:
  - c55d1a9af997b0be4aede50f88f408c466c14284
  - https://github.com/akmaier/agent-m/pull/904
date: 2026-10-18 14:57 UTC
---
# Development → Release testing: ITM-873, the progress facts build no graph nobody reads

**REGISTER**

## Reason

ITM-873, pull request #904 into `sprint/team2/93`, is rejected on `c55d1a9a`, on one condition: the change contradicts
MOD-progress-measures' accepted text.
- `productFacts` with the scope `all` "reads everything once: … what the repository says about it, the trace graph, …"
  (MOD-progress-measures.md:150-151, accepted).
- On the head, `allFacts` (`src/progress-measures/facts.mjs`) builds no trace graph, and `graph` is `"unknown"` in both
  scopes.
- The `Facts` type (`graph: Graph | "unknown"`, :119) allows `"unknown"` for a fact the scope does not read. It does not
  allow it for one the text says the scope `all` reads.
- For the same reason, the expected values of TST-536015 and TST-826005 changed (`graph.commit` → `"unknown"`), though
  the item does not name them and no accepted text changes that behaviour (`docs/instructions/product-owner.md`, check 3).

The fault is partly the item's. ITM-873's Outcome says the tests are read "without building the whole graph, as the
module's text allows". The text does not allow it. The developer named the gap in the pull request and built it
anyway, which agreement 79 rules out.

What holds:
- The red commit `9606a38d` is red (run 39137363942), and the head is green (run 39137670008).
- The developer's search holds. On the sprint head, `graph: more.graph` (`facts.mjs:201`) and the two test reads of
  `graph.commit` are the only uses of `Facts.graph`, and the same search finds no reader under `src/` on the head.
- Without a token, the count falls from 1,259 to 1,009 requests on the developer's fixture.

So the change needs a module text that drops the trace graph from the scope `all`. A draft for akmaier follows. The
item passes once that text is accepted and the change is gated against it.
