---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: rejected
on:
  - e490f3f99e39ba97aca8d53a30aad167b2363651
  - https://github.com/akmaier/agent-m/pull/1081
date: 2026-10-19 14:18 UTC
---
# Development → Release testing: ITM-761, Run on this commit

**REGISTER**

## Reason

ITM-761, pull request #1081 into `sprint/team2/96`, is rejected on `e490f3f9`. This is its first rejection.

**Progress only on a click.** UC-028-run-and-review-the-tests-of-a-commit.md:66-68: Agent M "starts the run on that commit … and shows its progress. 7. The run
commits its result record to the branch `test-results`; the view updates." The item's Outcome: "shows its progress through
`liveState`; the view updates when the record arrives."
- The head reads `liveState` only when the person presses *Check progress*, with no timer. So the view does not update
  when the record arrives. It updates when the person asks.
- That reading adds a step the use case does not have (AGENTS.md §6a.7). The text allows the update without any change:
  `liveState` is a use MOD-test-pages names.
- **Wanted:**
  - while the route is shown, the panel reads `liveState` again at an interval, and redraws the page once the job has
    ended, so that the new record shows;
  - it stops when the job ends or the route is left;
  - a test with a fake clock and a counter-proof.

**Accepted as it stands.** Red first (`b86204da`, red on CI). The scope, `runs.mjs` and `index.mjs`. The readings: tab-route
participants not offered; the panel once a participant and a name are given; 5b by `webLinks().actions`. The 12
counter-proofs.

**Order.** #1082 merges first. #1081 then merges the sprint branch in, keeping both routes and both strategy sets in
`src/test-pages/index.mjs`, before it is gated again.
