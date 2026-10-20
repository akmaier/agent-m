---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: rejected
on:
  - bef93f3093cfe1177b90c1d8b0d120c433b344d4
  - https://github.com/akmaier/agent-m/pull/1121
date: 2026-10-19 18:02 UTC
---
# Development → Release testing: ITM-1053, the jump host is set in the Bridge's window

**REGISTER**

## Reason

ITM-1053, pull request #1121 into `sprint/team2/97`, is rejected on `bef93f30`. This is its first rejection.

**The main process's new action is not under test.**
- The head adds to `src/desktop-shell/main.mjs` the action `save-jump-host`: `setJumpHost(config.dataFolder, value)`, then
  `restart()`.
- `tests/mod-desktop-shell-jump-host.test.mjs:52` stands in for that dispatch with code of its own
  (`if (action === "save-jump-host") { shell.setJumpHost(dataFolder, value); return {}; }`). So no test runs `main.mjs`'s
  branch, and a fault there, such as a wrong folder or no restart, passes.
- "It needs Electron" does not hold. `tests/desktop-shell.d/entry.mjs` (ITM-1004, ITM-1006) loads `main.mjs` with a
  constructed Electron. The pairing test and the icons test use it.

**Wanted.**
- A test through `tests/desktop-shell.d/entry.mjs` that sends `save-jump-host` to the real `main.mjs`, and finds the jump host
  in the data folder's `settings.json` and the Bridge restarted.
- Its counter-proof is a planted fault in that branch.
- The rest is accepted:
  - the window's form;
  - `settings.mjs`'s `setJumpHost`;
  - the `bridge-tunnels` topic kept beside the form;
  - red first, `6a95e9b3`.
