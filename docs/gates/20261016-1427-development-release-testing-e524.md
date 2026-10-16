---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 5948d5f0cdea9ac89bd5e771d8df4194edd13763
  - https://github.com/akmaier/agent-m/pull/591
date: 2026-10-16 14:27 UTC
---
# Development → Release testing: ITM-544, The Bridge client lists, follows and cancels a Bridge's jobs

**REGISTER**

## Reason

ITM-544, pull request #591 into `sprint/team1/45`, at head `5948d5f0`. developer-sonnet-a wrote it, as `45.md` assigns.
It lists AGENTS.md, SPEC.md, chapters 9, 11, 12 and 13, the item, `45.md`, MOD-bridge-client, UC-036 and the client and
bridge-http code as read in full.

1. **The tests-only commit is red.** `c647f2a0` was pushed alone. Run 38914280589 failed exactly TST-544001–007, on
   node (0), and no other job failed. The red is a missing export. The stub run, with three empty functions, is recorded,
   and in it all seven tests fail on behaviour.
2. **CI is green on the head**: run 38915391044, ten of ten jobs.
3. **The changes stay in the item's scope.**
   - `src/bridge-client/index.mjs`, where `bridgeJobs`, `bridgeJobLog` and `cancelOnBridge` are added over the existing
     `apiRoute` and `call()`, with no new import and no changed function.
   - The new `tests/bridge-client-jobs-544.test.mjs`.
   - The tests of `handOver` and `ask` are unchanged.
   - Under a refusing fetch spy, 34 files make no call beyond loopback. Six files fail or skip locally, identically on
     the base.
4. **The tests name their requirement and module, and each fault is caught.** Each of the nine planted faults is caught,
   and each test states its values in its own text.
5. **The Acceptance holds.**
   - Each function sends exactly its route's request, with the token, and never with the token in a URL.
   - `from=0` is sent, and `{ confirmed }` comes back both true and false.
   - An unknown job is `BridgeFailed` with `not-found`.
   - A Bridge that does not answer gives the client's usual failures, and never `AskFailed`.

The readings are within the item's text:
- `bridgeJobs` gives the answer's `jobs`, and the other two give the answer unchanged.
- The identifier is percent-encoded, as the Bridge decodes it.
- The cancel has no body, since `bridgeApi` declares none.
- An answer without `jobs` gives `undefined`. The texts do not name that case, and no acceptance line asks for it.

A note for the retrospective: a path typo created a directory outside the scratchpad, and the developer then deleted
that directory. This is the third slip of this kind in the series.
