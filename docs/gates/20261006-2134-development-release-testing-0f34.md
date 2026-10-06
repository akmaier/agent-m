---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 185ec4f1a51f71961b59c026267096055c08b558
  - https://github.com/akmaier/agent-m/pull/123
date: 2026-10-06 21:34 UTC
---
# Development → Release testing: ITM-215

**REGISTER**

## Reason

ITM-215, pull request #123 by developer-opus-b, on head `185ec4f`, against the item as `main` holds it since `60b7de4`.
All five points hold:
- The first commit, `5f90084`, holds only `tests/model-catalogue.test.mjs`, and CI was red on it: only that file failed,
  since its module did not exist yet.
- CI is green on the head, in a run made after #122 had merged into `sprint/05`.
- Only MOD-model-catalogue's folder — code, two schemas, `shipped.md`, five models and four practices — and the new test
  naming the module change.
- The 18 new tests have 18 counter-proofs.
- The Acceptance holds:
  - the five models in their two groups and the four practices;
  - every shipped model without an error;
  - a breaking definition for each rule of `modelFindings`;
  - no model or practice name in the code.

The readings of the book hold against the source register. Two of them infer what the book does not state, and go to the
review: Kanban's WIP limit 3, counted from Figure 7.2, and the roles per phase with their capabilities. The developer's
six gaps go into the Scrum Master's change request. A practice states its additions in words, so `workflowOf` cannot
add them in ITM-218.
