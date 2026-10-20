---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: rejected
on:
  - cc968b4598944742d4549909588e34fbb6f20171
  - https://github.com/akmaier/agent-m/pull/1187
date: 2026-10-19 23:57 UTC
---
# Development → Release testing: ITM-1148, a cost an endpoint reports reaches the job's record from the tab

**REGISTER**

## Reason

ITM-1148, pull request #1187 into `sprint/team2/97`, is rejected on `cc968b45`. This is its first rejection. CI is green,
and the red commit `679f055b` failed.

**A cost summed over only some of the exchanges is a guessed cost.**
- SPEC.md:1812, NO COST IS GUESSED: "A job shows a cost only when its runtime reports one … In every other case the cost
  is shown as unknown."
- `usageOf` (`src/runtimes/tab.mjs`) now sums the costs of the exchanges that report one, where they share a currency.
- A job of two exchanges, of which one reports 0.42 EUR and the other reports only its tokens, then shows 0.42 EUR as
  known and reported. Its runtime reported no cost for the second exchange.
- f's tests cover one exchange, and two that both report. They do not cover two of which only one reports.

**What changes.** The job's cost is reported only when every exchange that reports usage reports a cost, in one currency.
Otherwise `cost` is null, and `jobCost` gives the tokens at the declared price, or unknown. A test covers the mixed case.
Mixed currencies stay null, as f has it.

**Noted, outside this item:** MOD-endpoint-calls' own `usageOf` and `addUsage` still give `cost: null`. ITM-1148 asked to
read first whether the endpoint exchange states a reported cost. f's pull request should say what it found there.
