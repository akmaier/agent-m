---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - cdfa64c0c7559ed155a37e571c287c37ce60dbff
  - https://github.com/akmaier/agent-m/pull/1064
date: 2026-10-19 13:22 UTC
---
# Development → Release testing: ITM-994, test_mail_import and test_mail_privacy guard a person's decision on a mail and a full run on test mails

**REGISTER**

## Reason

ITM-994, pull request #1064 into `sprint/team2/96`, passes on `cdfa64c0`. CI is green on the head, on 20 of 20 jobs.

1. **Scope.** Only `tests/test_mail_import.py` and `.md`, and `tests/test_mail_privacy.py` and `.md`, change.
   `test_mail_import.py` keeps its MOD-mail-records cases and adds a MOD-mail-handling header for the new ones.
2. **The red is planted faults**, as the Acceptance asks of tests over built code (as at ITM-959). There are 17, each caught,
   and the pull request tables them. One case proves the checker itself on a known positive (AGENTS.md §6a.2).
3. **Run here** (agreements 83 and 89). Both files pass on the head, and the measured rate is reported, not gated. With the
   `PersonFound` refusal in `decideMail` disabled (intake.mjs:108), `test_mail_privacy` fails in two cases. Restored after.
4. **The writer.** developer-sonnet-f implemented neither ITM-952 nor ITM-954 (`RELEASE TESTS ARE NOT WRITTEN BY THE
   IMPLEMENTER`).
5. **Readings.**
   - `decideMail` is built with three parameters, where the accepted text has four, the fourth being `store`. The tests pass
     `{}` and leave `not-an-issue` to ITM-956. That gap lies in ITM-952's build, not here; ITM-956 closes it.
   - The writes MOD-mail-handling does not make (backlog items, proposals, records) are planted in the tests' world, so
     the privacy check sees every write.
