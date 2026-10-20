---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 1af371d86863f4d9950497bfbb8b556b15846f72
  - https://github.com/akmaier/agent-m/pull/1149
date: 2026-10-19 20:08 UTC
---
# Development → Release testing: ITM-964, the route mail proposes issues through a participant, and rewrites report data checked by three others

**REGISTER**

## Reason

ITM-964, pull request #1149 into `sprint/team2/97`, passes on `1af371d8`. CI is green on the head, on 20 of 20 jobs. **It
merges only once akmaier accepts the draft `740567ed`** (MOD-maintenance-pages' uses `settingsSchemas`, `readDocument` and
`participantsOf`), as #1139 waited for `f1541662`.

1. **Red first.** `59dcb359` holds only tests, and CI failed on it. h planted 13 faults.
2. **The review's note is done.**
   - The participant register is read with `readRegister(participantSchema(), …).document`, in the route `mail` and in
     `replies.mjs`.
   - `readDocument` is used only for `docs/settings.md`, with `settingsSchemas`, as the draft says.
3. **h's four readings** are named in the pull request, and accepted.
4. **Scope.** `src/maintenance-pages/` and its tests. The sprint branch is merged in.
