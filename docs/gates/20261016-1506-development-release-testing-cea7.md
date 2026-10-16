---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - b8c7c068e5ffe2a9d84827dabf406ac5eca80f20
  - https://github.com/akmaier/agent-m/pull/593
date: 2026-10-16 15:06 UTC
---
# Development → Release testing: ITM-545, A Bridge job's live state, its log and its cancel

**REGISTER**

## Reason

ITM-545, pull request #593 into `sprint/team1/46`, at head `b8c7c068`. developer-sonnet-c wrote it. The gate before
(`3ebc`, on `67d2675d`) was rejected for one reason: the log stream asked the Bridge again at once while a job was
quiet. ITM-545 now settles that reading. Two commits follow `67d2675d`, and nothing was rewritten.

1. **The tests-only commits are red.**
   - `b91cd7f9` was red, as recorded in `3ebc`.
   - `d6836f26` changes only `tests/runtimes-live-bridge.test.mjs` and was pushed alone. Run 38920550455 fails on it with
     exactly one test failing, TST-545010 (node (1)).
2. **CI is green on the head**: run 38920924373, ten of ten jobs. GitHub reports the pull request mergeable.
3. **The changes stay in the item's scope.** `b8c7c068` adds `QUIET_LOG_WAIT_MS = 1000` and one line to
   `followBridgeLog` (`src/runtimes/bridge.mjs`): after an answer that has not ended and brought no line, it waits that
   long. It also changes a header comment of the test file, which now quotes the item. No expected value changes.
   The rest is as recorded in `3ebc`.
4. **The tests state their values, and each fault is caught.** TST-545010 uses the `mock.timers` pattern of
   `tests/job-ledger-append.test.mjs`. After a quiet answer that has not ended there is one request, still one after 999
   ms, and the second at +1 ms. After an answer with a line, the third follows at once, with `from` 0, 0 and 1. Each of
   five planted faults fails exactly TST-545010:
   - no pause;
   - the pause also after lines;
   - 500 ms;
   - 2000 ms;
   - the pause only after lines.

   The 16 earlier faults are unchanged.
5. **The Acceptance holds**, with the reading on how often to ask. The developer's other readings stay as `3ebc` took
   them.
