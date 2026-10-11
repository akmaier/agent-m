---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - b2c917d799c7ff9b25926c4efa8d2a8b6582dd9b
  - https://github.com/akmaier/agent-m/pull/393
date: 2026-10-11 18:28 UTC
---
# Development → Release testing: ITM-349, the explanations of the routes and of the participants

**REGISTER**

## Reason

ITM-349, pull request #393 by developer-sonnet-b into `sprint/team1/18`, head `b2c917d`. The first commit `117b0f9`
holds only `tests/site-frame-participant-explanations.test.mjs`, and CI was red on it (run 38163416945): its 14 tests
fail, and no other test does. CI is green on `b2c917d` (run 38163608920, 1660 tests, 0 failures). The change is only
`src/site-frame/explanations.md`, twelve topics; the new test names MOD-site-frame and its guards, and 97 planted
faults are recorded, the one survivor of the first round pinned since. The Acceptance holds: `explain` gives each
new topic folded, with the points the Outcome lists for it.

One reading is corrected, not the result: the test file says no document gives the two CI secrets' names, but
MOD-runtimes (Data, the job workflow) names the token's secret `AGENT_M_TOKEN`, and the agent's key is read from the
secret the participant's route names. The Outcome's "the two CI secrets it reads by name" is met as the topic states
it — the workflow reads two secrets, the dashboard names each and never asks for a value —; naming
`AGENT_M_TOKEN` in the topic once ITM-322 builds the workflow is noted for the sprint review.
