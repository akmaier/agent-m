---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - dc1a4d723329403abf68c702e2f04405e58d89c8
  - https://github.com/akmaier/agent-m/pull/1184
date: 2026-10-19 23:57 UTC
---
# Development → Release testing: ITM-1033, a Bridge starts its agent's sprint close when the sprint ends

**REGISTER**

## Reason

ITM-1033, pull request #1184 into `sprint/team2/97`, passes on `dc1a4d72`. CI is green, on 20 of 20 jobs.

1. **Red first.** `c7653b3c` holds only `tests/bridge-jobs-sprint-close.test.mjs`, and its CI failed.
2. **The fix follows MOD-bridge-jobs.md:127-130:** a close, once, when `sprintsToClose` names the sprint.
   - The earlier red on `927ef80c` came from reading the clone's local `main`, which fetches and the Bridge's own pushes do
     not move. A second round therefore saw no close and queued another. h verified this at the failure node.
   - `dc1a4d72` reads the head the clone fetched.
   - I put `927ef80c`'s `src/bridge-jobs` back, and 2 of 3 tests fail. On the head, 3 of 3 pass.
3. **The long shard** (node (6), 2 min 9 s) is not this change: TST-904001 of `site-usability` took 106.6 s. It is ITM-1150.
4. **Not to be merged yet.** `src/bridge-jobs` imports five interfaces its module's uses do not name, `newJobId` among them.
   Draft `3f71e653` names them, and the merge waits for an approval record that names its blob.
