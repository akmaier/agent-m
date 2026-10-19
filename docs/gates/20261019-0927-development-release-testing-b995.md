---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 0857fd35117429e8962a3e543393169900439a8a
  - https://github.com/akmaier/agent-m/pull/994
date: 2026-10-19 09:27 UTC
---
# Development → Release testing: ITM-995, passed — the Bridge client probes partitions and served models

**REGISTER**

## Reason

ITM-995 (MOD-bridge-client), pull request #994 into `sprint/team1/93`, passes on `0857fd35`.

- **Two commits, one parent each, no merge, both with the trailer `developer-sonnet-d`.**
  - `f75bd5c9` holds only tests. In it, TST-324004's FAULTS target moves from the removed list of two kinds to
    `route.path.replace("{kind}", kind)`. That file is a unit test.
  - `0857fd35` holds the code: `src/bridge-client/index.mjs`.
- **The red,** run 39229286207: `# fail 3`, `# todo 0`, `# cancelled 0`, exactly TST-995001 to 003.
- **The code meets the accepted text:** `probe` takes its kinds from the protocol, and a kind the protocol lacks is a
  `TypeError` with no request sent (MOD-bridge-client).
- **CI:** 20 of 20 checks passed on the head.
- **Merge-tree:** `git merge-tree --write-tree` is clean onto `sprint/team1/93` (`80c78936`) and onto #992's head `fbc8a9a3`.
- **Replayed in a clean worktree at the head:**
  - `bridge-client` and `bridge-client-324` pass 16 of 16.
  - Counter-proof: with every kind sent to `endpoint-test`, `bridge-client` fails 2.
