---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - d5b3fc43fa8f3de9d8e718856becb50adf6c8516
  - https://github.com/akmaier/agent-m/pull/1128
date: 2026-10-19 19:07 UTC
---
# Development → Release testing: ITM-1055, quitting the Bridge names the jobs still running

**REGISTER**

## Reason

ITM-1055, pull request #1128 into `sprint/team2/97`, passes on `d5b3fc43`, after its rejection on `62bd22fc`. CI is green on
the head, on 20 of 20 jobs.

1. **Red first.** The new tests went alone first, at `9247b7f6`, and its CI failed.
2. **The rejection's first point is met.**
   - With a job running, the tray's *Quit* shows the window and sends `quit-requested`, which runs the window's own `quit()`
     and its decision.
   - With none running, it quits at once.
   - It is tested through `tests/desktop-shell.d/entry.mjs`.
3. **The rejection's second point is met.**
   - `tests/mod-desktop-shell-quit-jobs.test.mjs` runs the real entry and composition with two fixture agents.
   - After the confirmed quit, both records end `cancelled` ("the Bridge was quit"), and nothing more is written.
   - i planted 8 + 3 faults.
4. **A defect the test found, accepted as in scope.**
   - `main.mjs` handed `compose` the instance as `owner/repository`, where the watcher reads it by repository address. So a
     Bridge started from the app took no job.
   - The one-line fix, `instance: repositoryAddress(config.instance)`, uses the helper `testAccess` already uses.
   - It is MOD-desktop-shell's own file, within the item's paths, and needed for the Acceptance's two records.
5. **Scope.** `src/desktop-shell/` and its tests.
