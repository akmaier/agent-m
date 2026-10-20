---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 830b82e8042dc97866cb857e2aecc159ed8f7b46
  - https://github.com/akmaier/agent-m/pull/1173
date: 2026-10-19 22:44 UTC
---
# Development → Release testing: ITM-1127, the settings page's subject names each setting and whether it is stored (second gate)

**REGISTER**

## Reason

ITM-1127, pull request #1173 into `sprint/team2/97`, passes on `830b82e8`, after its rejection on `4455c6da`. CI is green,
on 20 of 20 jobs.

1. **The rejection's points are met.**
   - g's `f05708f2` names the mailbox by what its route stores: "Mailbox password" for IMAP, "Mailbox sign-in" for
     Microsoft, and "Mailbox: not set" without one. It adds TST-1127003 to 005, red first at `9b56e2f4`, whose CI failed.
   - I repeated a planted fault: the Microsoft route named "Mailbox password" fails 2 tests.
   - h, who did not implement ITM-1127, changed TST-513023 in `88ef9cf3`. Its given is now its world's Microsoft sign-in,
     and it asks for "Mailbox sign-in" to be said stored, as UC-049 3c words it. h removed the todo mark in `830b82e8`.
     No `src/` change is in h's commits.
2. **g's reading, judged.** A Microsoft mailbox counts as stored once its connection records an account.
   - The sign-in library's keys are found only through the export, asynchronously (`src/settings-pages/settings.mjs:354`),
     while a subject's text is built synchronously.
   - Clearing `mailbox` also removes those keys (MOD-browser-store.md:115), so the account and the keys go together.
   - Whether a sign-in still works or has expired is not asked by ITM-1127.
   - Accepted as named.
