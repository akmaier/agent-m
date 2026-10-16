---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 7c98c2ff73c301fffc9840dff345c9e2279531ef
  - https://github.com/akmaier/agent-m/pull/574
date: 2026-10-16 11:55 UTC
---
# Development → Release testing: ITM-488, A model endpoint works in a tool loop

**REGISTER**

## Reason

ITM-488, pull request #574 into `sprint/team1/41`, at head `7c98c2ff`. developer-sonnet-a made both commits. It lists
AGENTS.md, SPEC.md, chapters 9, 11, 12 and 13, the item, `41.md`, UC-049 and MOD-endpoint-calls as read in full. It read
MOD-job-runner in the parts MOD-endpoint-calls uses (ToolUse, DriverInput, `driverPrompt`, Usage) and says so.

1. **The red commit.** The tests-only commit `7b56e8ed` was pushed alone, and CI was red on it (run 38896107484, node
   (1)). Exactly TST-488001 to TST-488011 failed on behaviour, since the driver ignored `tools`. The controls TST-488012 to
   TST-488014 send no tools and pass before and after.
2. **CI is green on the head**: ten of ten jobs. The pull request is mergeable.
   - Locally, 126 of 128 tests of MOD-endpoint-calls and its use cases pass.
   - The rest are the known `imapflow` and Node 26 failures, which fail on the base the same way.
3. **The changes stay in the item's scope.** Only `src/endpoint-calls/index.mjs` and one new test file naming
   MOD-endpoint-calls changed. No existing test changed.
4. **The new tests.** TST-488001 to TST-488014 state their values in their own text. Twelve planted-fault counter-proofs
   are recorded in #574. TST-488013 — a `ToolUse` without definitions — has no separating fault, since both paths send the
   same single request. That is the value the start decision named.
5. **The Acceptance holds, with the values named.**
   - Calls are carried out in order, one `tool` turn each.
   - The limit counts across answers, and a call beyond it is answered `refused: the limit of <n> tool calls is reached`.
   - Then one request follows without tools.
   - The usage is summed per field over what was reported, or `null`.
   - A cancel is checked before each request and each call.
   - A failed request ends `send` and is not repeated.

**The developer's readings hold.**
- A `ToolUse` without definitions counts as no tools, as named.
- The first request always offers the definitions.
- `minutes` and `cost` stay `null`, since no endpoint reports them.
- A throw of `tools.call` is not caught. MOD-job-runner's `Strategies` says a tool's strategy returns a refusal and throws
  only for a failure of its own, which the driver passes on, as it passes on every failure of its route.
