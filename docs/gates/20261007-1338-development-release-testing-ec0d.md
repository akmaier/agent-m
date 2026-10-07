---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 0f07ada2dba7c879b866abfee4ace6d48608411f
  - https://github.com/akmaier/agent-m/pull/165
date: 2026-10-07 13:38 UTC
---
# Development → Release testing: developer-deepseek-a leaves the team

**REGISTER**

## Reason

A change of the instance's participants at akmaier's instruction of 2026-10-07, into `main`, not into a sprint branch:
"i think we need to remove deepseek from our team." Pull request #165 by scrum-master-session, on head `0f07ada`,
branched from `main` at `7c5edc4`.
- CI is green on the head (python and node).
- It does what the instruction asks and nothing more:
  - developer-deepseek-a's row leaves `docs/participants.md`;
  - its name leaves the role Developers in `docs/process.md`;
  - outside the gate records and the sprint records, no other file named it at the base.
- The one changed expected result follows from it. `tests/product-process.test.mjs` pins Agent M's own declaration,
  whose Developers are now developer-sonnet-a to -e. Its counter-proof is in the pull request: with `main`'s
  declaration, which still names developer-deepseek-a, the test fails.
- ITM-246, which the record of sprint 08 gave developer-deepseek-a, pushed nothing. It goes to developer-sonnet-e after
  ITM-243, still a Developer who implemented none of UC-047. The sprint's review records the switch.
