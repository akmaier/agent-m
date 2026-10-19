---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: rejected
on:
  - fbaa8bb01a9008a3b46f76db593619d89eee1189
  - https://github.com/akmaier/agent-m/pull/960
date: 2026-10-19 06:57 UTC
---
# Development → Release testing: ITM-1002, an agent that is not logged in is shown with its own login step

**REGISTER**

## Reason

ITM-1002, pull request #960 into `sprint/team2/95`, is rejected on `fbaa8bb0`. This is its first rejection.

1. **The head contradicts the accepted text.** MOD-agent-processes.md:61 types `Agent` as `{ …, loggedIn: boolean | null,
   login: string, … }`. The head's typedef says `login?: string`, "set for an installed agent that is not logged in". That
   reading adds *only*, a word the text does not contain (AGENTS.md §6a.7). The sentence after the type says when the
   window shows the step, not when the record carries it.
2. **§6a.6 does not lead to the conditional reading.** No text needs to change for the unconditional reading.
   `tests/test_bridge_agents.md` is a test's data, not the SPEC, a use case or the architecture. Its TST-815001 pins
   records without `login` because it was written before the draft (`94130c6b`, 2026-10-17; the draft is `3d7b6767`,
   2026-10-18). Checked here: on `af482a4c`, `test_bridge_agents` fails in 3 subtests, exactly as f reports. No question
   for akmaier.
3. **Nothing would be built.** With the conditional reading, the head adds two tests that were green before any code, and
   a comment. The red run 39211154626 on `8b19d440` was red only for TST-1002003, which the head withdraws.
4. **Who caused it.** The cause is the Product Owner's item, not the developer. The item quoted :61 but did not name the
   release test that reads `installedAgents`' return (agreement 92).

## What passes it

- The head goes back to the unconditional reading: `af482a4c`'s `login: row.login.login` on every installed record, and on
  a missing agent's record. The typedef follows :61, and TST-1002003 returns, so the red run on `8b19d440` stands.
- A participant other than developer-sonnet-f updates `tests/test_bridge_agents.md` in its own commit on this branch, so
  that TST-815001's expected records carry each agent's `login` from `agents.md`. It changes nothing else
  (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`). The scope stays MOD-agent-processes: the file's header names it.
- `test_bridge_agents` is run at the gate, since sprint-branch CI leaves release tests out (agreements 83 and 89). So are
  the four planted faults already reported.
