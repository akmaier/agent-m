---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - c33843954031705077f910811fc55474be9c9510
  - https://github.com/akmaier/agent-m/pull/960
date: 2026-10-19 07:06 UTC
---
# Development → Release testing: ITM-1002, an agent that is not logged in is shown with its own login step

**REGISTER**

## Reason

ITM-1002, pull request #960 into `sprint/team2/95`, passes on `c3384395`, after its rejection on `fbaa8bb0`. CI is
green on the head, on 20 of 20 jobs.

1. **What the rejection asked is done.**
   - `4a4c47b7`, by developer-sonnet-f, gives every `Agent` record `login: row.login.login`, missing agents included. The
     typedef reads `login: string`, as MOD-agent-processes.md:61 does, and TST-1002003 is restored.
   - `c3384395`, by developer-sonnet-g, who is not the implementer, changes only `tests/test_bridge_agents.md`. TST-815001's
     expected records now carry each agent's `login`. The values `claude auth login`, `codex login` and
     `opencode auth login` equal the Login check column of `src/agent-processes/agents.md`.
2. **Red first.** `8b19d440` holds only the tests, and run 39211154626 failed on it, through TST-1002003.
3. **Run here.**
   - `test_bridge_agents` (release): 2 tests pass.
   - The MOD-agent-processes node tests pass except TST-321001. TST-321001 fails the same way on the sprint head
     (`/private` in the macOS temporary path); it is one of the known local failures and is untouched here.
   - Planted: `login` dropped from a missing agent's record. TST-1002003 fails, and `test_bridge_agents` fails in 3
     subtests. Restored afterwards.
4. **Scope.** `src/agent-processes/index.mjs`, its new test and `tests/test_bridge_agents.md` changed. All three name
   MOD-agent-processes.
5. **Callers** (agreement 92). The change adds a field and removes none. `test_bridge_agents` was the reader that pinned the
   whole record, and it is updated.
