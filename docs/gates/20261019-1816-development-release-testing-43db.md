---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 8ec702791970323e6ac55da6ec35107c9f8f1e35
  - https://github.com/akmaier/agent-m/pull/1121
date: 2026-10-19 18:16 UTC
---
# Development → Release testing: ITM-1053, the jump host is set in the Bridge's window

**REGISTER**

## Reason

ITM-1053, pull request #1121 into `sprint/team2/97`, passes on `8ec70279`, after its rejection on `bef93f30`. CI is green on
the head, on 20 of 20 jobs. The first run's one failure was node (0)'s known flaky Electron test "#backlog in a browser",
which passed when the job was run again.

1. **The rejection's point is met.**
   - `tests/mod-desktop-shell-jump-host-entry.test.mjs` drives the real `main.mjs` through `tests/desktop-shell.d/entry.mjs`.
   - `save-jump-host` keeps the jump host in `settings.json` and restarts the Bridge.
   - An empty hostname, an empty user, or port 70000 is refused as `InvalidSettings`, and restarts nothing.
   - `jump-host.test.mjs` no longer copies the dispatch.
2. **No red run for the new test, accepted.**
   - Its tests-only commit `cc3248a4` passed CI, because `main.mjs`'s branch was built in the first round. The pull request
     says so.
   - The rejection asked for "a planted fault as its counter-proof". i planted 5 in that branch, each caught.
   - The item's own red-first stands from the first round (`6a95e9b3`).
3. **The rest is as accepted at the first gate.** The sprint branch is merged in.
