---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - dd9c0f9d2cc5754bb73416a483282a6d63d2f42b
  - https://github.com/akmaier/agent-m/pull/748
date: 2026-10-17 19:17 UTC
---
# Development → Release testing: ITM-814, the release test of a mail's identifier, its thread and a decided mail

## Reason

The rework on dd9c0f9d meets the condition of the rejection on 0e19ed77: TST-814004 (level `system`) and its case are
removed, and TST-814001..003 each name their requirement, MOD-mail-records and level `release`. ITM-814 is an item of
release tests; only `tests/test_mail_import.py` (loader) and its data file `tests/test_mail_import.md` change; CI run
39061689717 is green on the head; each test's counter-proof is recorded in the pull request; the case identifiers match
hashlib; the cases cover the item's Acceptance; the author implemented none of `src/mail-records/`.
