---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - f771e2a744384a9cf1c8c7c96b571d23031b2cc5
  - https://github.com/akmaier/agent-m/pull/940
date: 2026-10-18 21:11 UTC
---
# Development → Release testing: ITM-999, the participants route offers and keeps a subagent's CLI agent

**REGISTER**

## Reason

ITM-999 (MOD-settings-pages), pull request #940 into `sprint/team1/92`, passes on `f771e2a7`. MOD-settings-pages is
accepted at `0ceb9002`, which names MOD-participant-list.participantsOf and reachedThrough.

1. **The participant trailer is present** on both commits: `developer-sonnet-c`.
2. **The red is `9a10d241`.** It holds tests only, and run 39166166131 fails TST-999001 to 999003 on node (4). That run's
   node (15) failure is the flaky library test recorded in 92.md, which ITM-999 does not touch.
3. **The change** is `src/settings-pages/participants.mjs` only.
   - It reads `reachedThrough` from MOD-participant-list.
   - A CLI or sandboxed agent's form offers how it is reached (its Bridge, or through a CLI agent other than itself).
   - `routeOf` writes `through <name>`, and the form reads it back on *Change* (MOD-settings-pages.md:172-173).
4. **Counter-proof, replayed by me in a clean checkout of the head:**
   - the file passes 29 of 29;
   - with the route's `through` part not read back, "Change keeps a subagent's route through its CLI agent instead of
     blanking it" fails.
   The developer's other counter-proof, every participant offered as a starter, failed TST-999001 to 999003.
5. **Green.** CI run 39166437166 passes all twenty jobs, and `git merge-tree --write-tree` merges the head into
   `sprint/team1/92` without a conflict (tree `31c986a9`).
