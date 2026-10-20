---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 639f1b1ca331c78bee85500903dc01e2f1ff4f30
  - https://github.com/akmaier/agent-m/pull/1136
date: 2026-10-19 18:59 UTC
---
# Development → Release testing: ITM-968, the replies page asks a reporter, shows the answer, reopens or leaves an issue closed, and closes and replies

**REGISTER**

## Reason

ITM-968, pull request #1136 into `sprint/team2/97`, stacked on #1135, passes on `639f1b1c`. CI is green on the head, on 20 of
20 jobs.

1. **Red first.** `2a2a59d7` holds only tests, and CI failed on it. h planted 10 faults.
2. **The accepted text.** MOD-maintenance-pages.md:120-123: *Ask the reporter* with *Send and wait*, the label
   `waiting-for-reporter`, *Reopen* and *Leave closed*, and *Close and reply*.
3. **h's readings, accepted.**
   - "Arrived in a closed issue's thread" is a `mail-added` note after the closing note.
   - "New" is after the last `question-sent` note.
   - An open issue's draft is a question (*Send and wait*), and a closed issue's is a reply.
   - A participant drafting the question is ITM-1026's job, which builds on this item.
4. **Scope.** `src/maintenance-pages/replies.mjs` and its tests. The rest of the diff is #1135's.
