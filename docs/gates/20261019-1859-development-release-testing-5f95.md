---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - f78134cd7da15d77ce8f925fed3ef07b274592a0
  - https://github.com/akmaier/agent-m/pull/1135
date: 2026-10-19 18:59 UTC
---
# Development → Release testing: ITM-967, a reply is sent from the replies page only on the click on the mail shown, and a mail can be left unanswered

**REGISTER**

## Reason

ITM-967, pull request #1135 into `sprint/team2/97`, passes on `f78134cd`. CI is green on the head, on 20 of 20 jobs. The head's
full SHA is the one the pull request shows. h's report gave it wrongly.

1. **Red first.** `bd3f5217` holds only tests, and CI failed on it.
2. **The accepted text.** MOD-maintenance-pages.md:117-123: *Send* with its confirmation repeating recipient and subject, and
   *No reply*. h planted 8 faults, the Acceptance's required one among them.
3. **Changed tests.**
   - The replies tests' fixtures move to the shared helper `tests/maintenance-pages-world.mjs`.
   - TST-966002, ITM-966's unit test, now states *Send* for a drafted mail, and none for a missing, unsendable or undrafted
     one. It is not a release test, and it states what this item adds.
4. **Scope.** `src/maintenance-pages/replies.mjs` and its tests.
