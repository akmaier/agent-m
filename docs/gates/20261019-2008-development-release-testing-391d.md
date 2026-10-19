---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 4e9abed787adfa1d911d83152426601a42a4cec8
  - https://github.com/akmaier/agent-m/pull/1145
date: 2026-10-19 20:08 UTC
---
# Development → Release testing: ITM-1054, the Bridge offers a newer release and installs it only after the person's clicks

**REGISTER**

## Reason

ITM-1054, pull request #1145 into `sprint/team2/97`, passes on `4e9abed7`. CI is green on the head, on 20 of 20 jobs.

1. **Red first.** `737eb19b` holds only tests, and CI run 39312183548 failed on it.
2. **The accepted text.** MOD-desktop-shell.md:183-192: through electron-updater with `autoDownload` off and `autoInstallEvent`
   `manual`.
   - At start and once a day, the feed is read.
   - A release is offered only when the feed's detached signature holds against the built-in key.
   - *Download* and *Install and restart* are two clicks, the second after a decision that names the running jobs.
   - The *Updates* view names `bridge-updates`.
3. **The feed's read over `node:https`: accepted, on another reason than g's.**
   - g gave as reason that `tests/test_no_backend.py` scans `src/` for `fetch(`. That is not a reason: a channel chosen so that
     a scanner misses it would be a way around the guard.
   - The right reading: NO SERVER, which that test guards, is about "the built site", what a browser runs. `updates.mjs` runs
     only in the Bridge's Electron main process, never in a browser, as `bridge-http`'s `node:http` and `tunnels`' `node:net`
     do.
   - The detached signature, `<feed>.sig`, is something electron-updater does not fetch, so the shell reads the feed's bytes
     itself, from the instance's GitHub releases, as the text asks.
   - A browser-side `fetch` of the same address would have to be listed in that test. This is not one.
4. **The CI shard timeout: its cause verified here at the failure node.**
   - Run 39313645552 on `ed397e7e`: node (1) was cancelled after TST-276001 to 004 each waited 30 s for the window.
   - The Electron start's output in that log reads "App threw an error during load / Error [ERR_MODULE_NOT_FOUND]: Cannot find
     package 'electron-updater'".
   - The cause is `main.mjs:5`'s static `import electronUpdater from "electron-updater"`. The package lives under
     `src/bridge-build/node_modules`, which `src/desktop-shell/` does not resolve.
   - The fix, `createRequire` from `../bridge-build/package.json` inside the code that is only reached for a packaged app,
     removes exactly that. It is the pattern MOD-tunnels uses for `ssh2`.
   - g did not read the log (AGENTS.md §6a.3). The diagnosis stands now, and g is asked to read the failing test's log
     before the next fix of a red run.
5. **Other readings, accepted.**
   - The feed's address is the instance's latest release download, by the platform's name.
   - "Newer" compares calendar versions part by part.
   - The *Updates* link stands with the window's other views.
6. **Changed tests.** TST-1054007 and TST-1054008 are this item's own tests.
