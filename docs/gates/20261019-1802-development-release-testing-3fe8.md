---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - b10950c72273532178422bca9f983a2d08d9a1f4
  - https://github.com/akmaier/agent-m/pull/1120
date: 2026-10-19 18:02 UTC
---
# Development → Release testing: ITM-956, a mail marked not an issue is kept in the browser's store

**REGISTER**

## Reason

ITM-956, pull request #1120 into `sprint/team2/97`, stacked on #1113, passes on `b10950c7`. CI is green on the head, on 20 of
20 jobs.

1. **Red first.** `e4938f71` holds only tests, and CI failed on it.
2. **The accepted text.** MOD-mail-handling.md:87-94: `decideMail`'s *Not an issue* writes the browser's mark. The
   `TypeError` "the mark is ITM-956's" (`intake.mjs:91-92`) is replaced by the write.
3. **The changed test** (agreement 95). TST-952017 in `tests/mail-handling-intake.test.mjs` pinned that `TypeError`. It is a
   unit test of ITM-952, not a release test, and it now states the mark written.
4. **Scope.** `src/mail-handling/intake.mjs` and the tests that name MOD-mail-handling. The rest of the diff is #1113's.
