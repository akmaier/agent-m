---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - aa3b7a0c2c6fcf7f8511977a81a0d898a7f40aa9
  - https://github.com/akmaier/agent-m/pull/1122
date: 2026-10-19 18:02 UTC
---
# Development → Release testing: ITM-963, the route mail reads the mailbox, lists the undecided mails and proposes issues

**REGISTER**

## Reason

ITM-963, pull request #1122 into `sprint/team2/97`, stacked on #1120, passes on `aa3b7a0c`. CI is green on the head, on 20 of
20 jobs.

1. **Red first.** `6e38ba71` holds only tests, and CI failed on it.
2. **The accepted text.** MOD-maintenance-pages.md:112-116 at blob `f2155115`, and `mail.mjs` (:91).
3. **Readings accepted.**
   - The route's subject for the prompt bar holds only `MAIL-` identifiers, and refuses *propose-edit* and *hand-over*. A
     mail's text never goes to a participant through the bar (`MAIL STAYS IN THE MAILBOX`).
   - The folded explanations are built inside `mail.mjs`, as the page's own.
   - The page is not yet in the live dashboard's views. Wiring it in is MOD-site-frame's, and is registered as ITM-1099, the
     same step as ITM-682. It needs no change to this item.
4. **Scope.** `src/maintenance-pages/` and its test. The rest of the diff is #1113's and #1120's.
