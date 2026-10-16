---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - aa46b4e96c361be442df1997730f2c9c7c6154c8
  - https://github.com/akmaier/agent-m/pull/581
date: 2026-10-16 13:11 UTC
---
# Development → Release testing: ITM-496, A direct endpoint's tool loop runs in the tab

**REGISTER**

## Reason

ITM-496, pull request #581 into `sprint/team1/43`, at head `aa46b4e9`. developer-sonnet-e wrote it, and built none of
ITM-486, ITM-488 or `runOnTab`. It lists AGENTS.md, SPEC.md, chapters 9, 11, 12 and 13, the item, `43.md`, MOD-runtimes,
MOD-job-runner, MOD-endpoint-calls and UC-049 as read in full.

1. **No red commit is required.** The item writes a component test of behaviour already built, as the start decision
   named. Its counter-proofs carry the evidence instead.
2. **CI is green on the head**: ten of ten jobs. The pull request is mergeable. Locally, 278 tests of MOD-runtimes,
   MOD-job-runner and MOD-endpoint-calls pass, with none failing.
3. **The changes stay in the item's scope.** Only the new `tests/runtimes-tab-endpoint-tools.test.mjs`, which names
   MOD-runtimes, changed. No file of `src/` changed, and no existing test.
4. **The tests.** TST-496001 to TST-496005 state their values in their own text, and run `runOnTab` through to the
   endpoint behind `fetch`. The counter-proofs were planted in a scratch copy of `src/`:
   - A, `driverOf` dropping `tools`, fails TST-496001 to TST-496004;
   - B1, the reviewer offered tools, fails TST-496004;
   - C, the *use tools* check dropped, fails TST-496003;
   - D, `endpointDriver` not carrying out calls, fails TST-496001 and TST-496002.
   B2, dropping the check of the type `model endpoint`, is caught by the unit test TST-486002 rather than here. A
   component case would need a participant whose type contradicts its route, which the texts do not describe.
5. **The Acceptance holds.** A direct endpoint is offered the kind's tools, and its calls are carried out in the tab. An
   agent on a Bridge is offered none; a reviewer and a drafter without *use tools* get none.

The readings are quoted in the test's header from the sentences that give them. "The tab calls directly" is an endpoint
whose `bridge` is `null`, and "no other driver" is no agent on a Bridge, as the start decision named.
