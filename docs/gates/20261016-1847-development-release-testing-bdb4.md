---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 1186627ec65ade81a2070da130c8683b0a576999
  - https://github.com/akmaier/agent-m/pull/616
date: 2026-10-16 18:47 UTC
---
# Development → Release testing: ITM-539, A hand-over run's endpoint failure is diagnosed by its status

**REGISTER**

## Reason

ITM-539, pull request #616 into `sprint/team1/49`, at head `1186627e`. developer-sonnet-c wrote it. The gate before
(`6fd3`, on `343fdc6a`) was rejected for one reason: where the endpoint works, the run still said it was not reachable.
Two commits follow `343fdc6a`, and nothing was rewritten.

1. **The new tests-only commit is red.** `1ed28311` was pushed alone. Run 38949085379 failed exactly TST-539004 on node
   (1). Its agent's last line quotes the task, and its endpoint answers 200. The test asserts:
   - "exit code 1" and the last line, with the task shown as `[the task]`, in the summary and in the End record;
   - none of "not reachable", "key refused", "model unknown", "self-hosted runner", "Bridge" or "routes";
   - exactly one request to the endpoint.
2. **CI is green on the head**: run 38949761516, ten of ten jobs, on its first attempt.
3. **The fix.** `src/workflow-entries/product.mjs:160` now names, where the probe works, "the agent failed (exit code N)
   working with the endpoint <address> (<model>): <last line>". The import of `diagnoseEndpoint` is removed. The path of
   an endpoint that does not work is unchanged, and `hidden()` still wraps the reason.
4. **Each fault is caught.**
   - `diagnoseEndpoint` brought back for a working endpoint fails only TST-539004.
   - A key passed as `null` fails only TST-539001.
   - Without `hidden()`, TST-539002 and TST-539004 fail.

   Restored, the tests pass 11 of 11. The network spy saw nothing leave, ITM-018 passes, and the listing of
   `/private/tmp/claude-501/` was the same before and after the work.
5. **The Acceptance holds, with the reading settled in the item.**
   - 401, 404 and no connection give "key refused", "model unknown" and "not reachable", with the routes that would work.
   - A working endpoint gives the agent's failure, with its exit code and last line, and no routes.

The checks carried over from `6fd3` still hold.
