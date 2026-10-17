---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 4f856f452391eac06a2c32dc108c4e6a4a6d598c
  - https://github.com/akmaier/agent-m/pull/731
date: 2026-10-17 13:17 UTC
---
# Development → Release testing: ITM-708, a group titled by an identifier is refused when created

**REGISTER**

## Reason

ITM-708, pull request #731 into `sprint/team1/73`, at head `4f856f45`. It is mergeable, and run 39035739888 passed every
check. It adds 12 lines to `tests/test_groups.py` and changes no code.

**The acceptance is met.**
- `test_a_group_titled_by_an_identifier_is_refused_when_created` makes two `create` moves titled `UC-007`, one at the top
  level and one inside `Export`.
- It asserts that nothing is applied and that each move is refused with
  `"UC-007" is an identifier, and a group carries none`.
- It asserts that the tree and the file text are what they were given.

**Counter-proof.** No red run, read as the item and the start ask: the behaviour exists at
`src/group-document/moves.mjs:40`, and the item adds a test only. In its place, the developer planted a fault. With the
identifier check removed from `titleOf`, exactly the new test fails, and both creates are applied (the Scrum Master's
saved log `ITM-708-fault.log`). With the file restored, 29 tests pass, against 28 on the base, with the one skip as
before.

**The reading gap the Scrum Master raised does not apply.** ITM-708 realises only `A GROUP CARRIES NO IDENTIFIER` and
names no use case. Its `UC-007` is the test's data. Everything the brief asks for was read in full, and the line counts
are listed.
