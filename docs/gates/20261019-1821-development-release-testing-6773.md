---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 80849cb7206a546bf2cca4acc103e7b008c4545f
  - https://github.com/akmaier/agent-m/pull/1126
date: 2026-10-19 18:21 UTC
---
# Development → Release testing: ITM-992, the Settings page shows the mailbox set or not, and its Change opens the route mailbox

**REGISTER**

## Reason

ITM-992, pull request #1126 into `sprint/team2/97`, passes on `80849cb7`. CI is green on the head, on 20 of 20 jobs.

1. **Red first.** `4c043764` holds only the tests, and CI run 39300090772 failed on it.
2. **f's reading is right.**
   - *Connect a mailbox* (not set) and *Change* (set) open MOD-settings-pages' own route `mailbox` (MOD-settings-pages.md:205),
     as the item states (`context.go("mailbox", {})`).
   - 97.md said `mail`, which is MOD-maintenance-pages' UC-038 route. That was the Product Owner's mistake, corrected in this
     commit.
3. **Scope.** `src/settings-pages/settings.mjs` and its test. ITM-993 follows in the same file once this is merged.
