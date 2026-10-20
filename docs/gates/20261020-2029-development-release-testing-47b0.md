---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - e1fc4d581df67c2c86535c5570cfbb2598ba42e8
  - https://github.com/akmaier/agent-m/pull/1229
date: 2026-10-20 20:29 UTC
---
# Development → Release testing: ITM-367, the component test of the started source-folder Bridge

**REGISTER**

## Reason

ITM-367, pull request #1229 into `sprint/team2/98`, passes on `e1fc4d58`. CI is green on 23 of 23 checks (run
39464573600).

1. **The gap the sprint record named is closed.** `tests/desktop-shell-bridge-jobs.test.mjs` starts one source-folder Bridge
   in Electron, as ITM-276's tests start it. Its three cases are level `component`, and each names MOD-desktop-shell,
   MOD-bridge-jobs and MOD-bridge-http.
   - **TST-367004:** a job handed over with the pairing token runs in the agent's working folder. Its results and its end
     record land on the served repository.
   - **TST-367005:** a job for an agent not offered is refused with 422, and that agent is not started.
   - **TST-367006:** without the token, nothing reaches the agent. The same hand-over with the token runs (known positive).
2. **They ran on CI and were not skipped.** In node (1) of run 39464573600 they are `ok 36` to `ok 38` (17:16:54-55
   UTC).
3. **Time.** node (1) ran 30 s, from 17:16:28 to 17:16:58, well under the 90 s mark of ITM-1150. The Bridge is started once
   for the three cases, and every wait is on a condition.
4. **Red evidence** for tests of built code: seven faults planted in `src/bridge-http/server.mjs`,
   `src/bridge-jobs/watch.mjs` and `src/desktop-shell/compose.mjs`, each failing the case named in the pull request, and
   restored.
   - The earlier red run, 39464069614, failed on a missing git identity in the fixture, not on a fault. `e1fc4d58` fixes
     the fixture alone.
5. **Not the implementer.** ITM-367 was built in team 2's sprint 34 (`dcc26e7a`, `607d247a`). developer-sonnet-h
   confirms having built none of it.
6. **Scope.** Two new test files: the test and its Electron helper, whose header names MOD-desktop-shell. No file in `src/`
   and no release test changes.
   - Pause, loopback and *Quit* are not tested again. The pull request names the tests that cover them: TST-276002 and
     TST-1055104.
7. **Agreement 94.** TST-935004 failed once in h's local full run, under parallel load, and passed alone. It is reported
   here the first time it flips, to both teams.

The branch does not hold the newest `sprint/team2/98`, and adds only new files, so it merges without a conflict.
