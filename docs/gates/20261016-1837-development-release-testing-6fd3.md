---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 343fdc6a4b99212981b03d3a719b75c90d230f7d
  - https://github.com/akmaier/agent-m/pull/616
date: 2026-10-16 18:37 UTC
---
# Development → Release testing: ITM-539, A hand-over run's endpoint failure is diagnosed by its status

**REGISTER**

## Reason

ITM-539, pull request #616 into `sprint/team1/49`, at head `343fdc6a`. developer-sonnet-c wrote it, as `49.md` assigns.

**Where the endpoint works, the run still says it is not reachable.** `src/workflow-entries/product.mjs:160` reads:

    const diagnosis = probe.works ? diagnoseEndpoint({ message: said }, endpoint, "node") : probe.diagnosis;

So when `testEndpoint` finds the endpoint working, the agent's last line still goes through `diagnoseEndpoint`. For a
line that names no status, that reads "not reachable". The summary then offers the routes that would work.

MOD-workflow-entries names the diagnosis and the routes for "an endpoint the run cannot reach". The item says "Where it
works, the failure is the agent's". A run whose endpoint answers did reach it. The summary misleads the person, and it
contradicts the module file.

TST-539004 asserts only that two other words are absent, so it does not catch this.

The item now settles it. Where the endpoint works, the reason names `AgentFailed`'s exit code and its last output, with
no "not reachable", no routes, and no `diagnoseEndpoint`.

The developer adds this as a new commit, with TST-539004 strengthened in a tests-only commit pushed first and red on
`343fdc6a`. The test asserts the exit code and last output, and that neither "not reachable" nor any route is named. A
planted fault that brings back the call of `diagnoseEndpoint` fails it.

**The other checks hold on this head and carry over:**
1. **Red first.** `6b027767` was pushed alone. In run 38947147181, exactly TST-539001–004 fail, on behaviour.
2. **CI is green** on `343fdc6a` on run 38948062308's second attempt.
   - The first attempt failed TST-276005 (`tests/desktop-shell.test.mjs`) by its own timeout of 120 seconds, in a file
     the pull request does not touch.
   - This is a new mode of the desktop shell's flakiness, after ITM-541 and ITM-557, and it becomes ITM-565.
3. **Scope.** Only `src/workflow-entries/product.mjs` and its hand-over test change.
   - `world()` routes every request through a refusing `fetch` spy, and no existing expected value changed.
   - TST-498006 is green.
   - A network spy over 9 files saw nothing leave.
   - ITM-018 passes.
4. **Counter-proofs.**
   - A key passed as `null` fails TST-539001.
   - Without `hidden()`, TST-539002 fails.
   - Ignoring the probe fails TST-539001–003.
5. **The other cases hold.**
   - 401 gives "key refused", and 404 gives "model unknown", with the echoed task hidden.
   - No connection gives "not reachable".
   - An agent's success makes no probe.
   - The one request carries the key and the model, and no task.
