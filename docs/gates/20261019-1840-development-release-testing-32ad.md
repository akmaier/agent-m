---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 352495887f092aea1d5653c707402a7b7e78e129
  - https://github.com/akmaier/agent-m/pull/1130
date: 2026-10-19 18:40 UTC
---
# Development → Release testing: ITM-966, the replies page lists the issues to answer, shows an issue's mails with their drafts, and drafts the replies

**REGISTER**

## Reason

ITM-966, pull request #1130 into `sprint/team2/97`, passes on `35249588`. CI is green on the head, on 20 of 20 jobs.

1. **Red first.** `e8fb0c62` holds only tests, and CI failed on it.
2. **h's readings, accepted.**
   - **No *Send*.** Sending is ITM-967's: "A reply is sent from the replies page only on the click on the mail shown". The
     item's own text offers no *Send* for a mail not found.
   - A mail that already has a draft is not sent to the participant again.
   - The start record names the issue and the product, not mails (`NO PERSONAL DATA FROM A MAIL ENTERS A REPOSITORY`).
   - The explanations are built in `replies.mjs`, as `mail.mjs` builds its own.
   - The route is not yet in the live dashboard's menu. That is MOD-site-frame's, and is registered as ITM-1103, the same
     step as ITM-1099.
3. **Scope.** `src/maintenance-pages/` and its tests.
