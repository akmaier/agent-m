---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - c132e7de816eaf32129e28a335ed986a1eac32e5
  - https://github.com/akmaier/agent-m/pull/486
date: 2026-10-13 00:33 UTC
---
# Development → Release testing: ITM-471, the spec-with-queues test classes a restated requirement of the SPEC

**REGISTER**

## Reason

ITM-471, pull request #486 by developer-sonnet-e, reworked once on the condition of the rejection `e143757`, with
`c132e7d` on `b5b389c`. CI is green on `c132e7d` (run 38327574462). The condition holds:
- the candidate states A DECIDED RULE's rule under its own name;
- the title names "a restated rule and a restated requirement of the SPEC";
- the recorded counter-proof plants the part of `spec-with-queues` without the SPEC's requirements, in
  `src/spec-changes/strategies.mjs`, and the test fails.

Only that test's candidate, given line and title change in `tests/spec-changes-requirement-recipes.test.mjs`, and no
expected result. The Developer reports the test green with ITM-450's `d16b148` merged in locally, so it holds before
ITM-450 and after it. The Acceptance holds. The node job took 1m54s of its two minutes; that limit is with akmaier.
