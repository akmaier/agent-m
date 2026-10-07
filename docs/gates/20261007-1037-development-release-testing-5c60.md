---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - aafce9d73a514982f038d5d500774936607124fd
  - https://github.com/akmaier/agent-m/pull/156
date: 2026-10-07 10:37 UTC
---
# Development → Release testing: no Release tester; developer-sonnet-e

**REGISTER**

## Reason

A change of the instance's process at akmaier's instruction of 2026-10-07, into `main`, not into a sprint branch: "Since
when is a tester part of the scrum team? If you need a tester, sonnet is sufficient and if does not need to see more
context than the developers." Pull request #156 by scrum-master-session, on head `aafce9d`, branched from `main` at
`338f699`.
- CI is green on the head (python and node).
- It does what the instruction asks and nothing more:
  - `scrum-wip`'s phase Release testing is the Developers', and its role Release tester is gone (`ef33e2f`). The gate
    Release testing → Sprint review keeps "written by a participant other than the implementer".
  - The declaration names that commit as the model's version and drops the role and tester-opus's assignment; tester-opus
    stays a participant, with no role.
  - developer-sonnet-e, on claude-sonnet-5, joins the participants and the Developers, a row like developer-sonnet-d's,
    because developer-sonnet-a to -d each built part of UC-047 and ITM-238 needs one who built none of it (`RELEASE TESTS
    ARE NOT WRITTEN BY THE IMPLEMENTER`). ITM-238 names a Developer.
  - The Release tester's instructions become a section of the Developers', and the Product Owner's checks 1 and 3 name an
    item of release or system tests.
- Every changed expected result follows from it: the pinned expectation of Agent M's own declaration, and the line
  `release-sprint-02-b-process-model` breaks in Agent M's model, with the same planted fault and expected error.

From its merge on, ITM-238 goes to developer-sonnet-e instead of tester-opus, as the record of sprint 07 has it; the
sprint's review records that.
