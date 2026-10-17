---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: rejected
on:
  - 0e19ed77da8af11994ac74baa643b98a839444c6
  - https://github.com/akmaier/agent-m/pull/748
date: 2026-10-17 19:14 UTC
---
# Development → Release testing: ITM-814, the release test of a mail's identifier, its thread and a decided mail

## Reason

ITM-814 is an item of release tests: its one commit adds only `tests/test_mail_import.py` and its data file
`tests/test_mail_import.md`, CI is green on it (run 39061375435), each test names its requirement and MOD-mail-records,
the identifiers were checked against hashlib, and every counter-proof is recorded in the pull request. But its Acceptance,
"each test names the requirement it guards, the module it exercises and its level `release`", does not hold:
TST-814004 has level `system`, guards UC-038, and asserts a flow of UC-038 steps 2-3 that the test itself assembles from
`mailId`, `listedMailIds`, `undecided` and `threadMatch`, since no dashboard view reaches MOD-mail-records.
