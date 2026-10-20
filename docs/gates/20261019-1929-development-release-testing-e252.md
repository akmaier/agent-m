---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 3607a8aea881770907a112f7794b525d11298d23
  - https://github.com/akmaier/agent-m/pull/1139
date: 2026-10-19 19:29 UTC
---
# Development → Release testing: ITM-510, a page of mail gives the prompt bar only what the mailbox allows

**REGISTER**

## Reason

ITM-510, pull request #1139 into `sprint/team2/97`, passes on `3607a8ae`. CI is green on the head, on 20 of 20 jobs.

1. **Red first.** `53d85fb2` holds only tests, and CI failed on it.
2. **The accepted text.** MOD-maintenance-pages.md:128-131: the subject's `withhold` names each name, address, phone number or
   account of the mail's people found with `personHits`, and a passage of the mail's own text.
3. **h's readings, accepted.**
   - A passage of the mail's own text is a run of at least 20 characters.
   - On the `replies` routes, the mail's people come from MOD-personal-data's `peopleIn`. The `mail` route takes them from
     `readNewMail`'s `proposable`.
4. **The use not named in the text, now drafted.**
   - `peopleIn` was not among MOD-maintenance-pages' Uses. The draft `f1541662` adds it, for the mails `repliesDue` gives, and
     is on `main` for akmaier after review.
   - As team 1 did with ITM-1037 (`b0eb9847`), the item passes with its draft on `main`. The draft's acceptance decides the
     text, not this code.
5. **Scope.** `src/maintenance-pages/` and its tests.
