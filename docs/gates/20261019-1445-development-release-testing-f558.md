---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 054eb5b6c0cad0b9406f91ecac79fdf0cbe37f41
  - https://github.com/akmaier/agent-m/pull/1091
date: 2026-10-19 14:45 UTC
---
# Development → Release testing: ITM-1038, test_mail_privacy guards the rewriting of report data, the three checkers and the mailbox's places

**REGISTER**

## Reason

ITM-1038, pull request #1091 into `sprint/team2/96`, passes on `054eb5b6`. CI is green on the head, on 20 of 20 jobs.

1. **Tests only.** Only `tests/test_mail_privacy.py` and `.md` change: 23 cases. The red evidence is 13 faults planted in
   `src/personal-data/`, each restored and checked with `diff -r`, as the Acceptance asks of release tests over built code.
   `test_mail_privacy` passes on the merge, 11 tests with 39 subtests.
2. **The writer.** developer-sonnet-i implemented neither ITM-838 (h) nor ITM-839 (f).
3. **i's open points, ruled.**
   - **An IP address or a home path** (SPEC.md:2152-2155). `Hit` has no kind for an IP, and a path is refused only when it
     holds the account. The SPEC's check is a fixture log rewritten by a fixture participant, and the counter-proof is "a
     rewriting that keeps one is refused". The refusal can come from the three checking participants, which find what
     the deterministic forms do not (MOD-personal-data.md:97). A fixture checker that reports the IP is that case. So no
     text change is needed, and no question goes to akmaier.
   - **Written only after three checkers** (SPEC.md:2157-2160), while the runner calls the writer `return-draft` at once,
     which writes no file. What is written, and when, is the route `mail`'s flow: ITM-964 (MOD-maintenance-pages), open.
   - **No mail-flow caller of `pseudonymisationOf`.** MOD-issue-handling and MOD-maintenance-pages name it. The mail flow is
     ITM-964 too. No new item.
