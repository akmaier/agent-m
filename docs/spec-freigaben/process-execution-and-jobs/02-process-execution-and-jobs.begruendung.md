# 13. Process execution and jobs: a job runs on a connection that offers its participant's model, priced by that connection

**The change.**
- Adds `A JOB RUNS ON A CONNECTION THAT OFFERS ITS PARTICIPANT'S MODEL`, after `A JOB GOES ONLY TO A HOLDER OF ITS ROLE`:
  a job handed to an agent runs on a connection that offers the agent's model, with that model. Its place is the group
  `13. Process execution and jobs`, beside the requirement on whom a job goes to.
- `NO COST IS GUESSED`: a cost is computed from usage where the connection the job runs on declares a price for its
  model, where before the participant declared it.

Every other byte of the section is carried over.

**Why.** akmaier agreed on 2026-11-09 that "Place, capabilities, context, price and route leave the list", that the connections
in the browser's settings each declare "its processing place, its capabilities and the models it offers with their
context (and price where declared)", and that "a member's job runs on a connection that offers the member's model, and
the agent is started with that model" (the design quoted in full in `process-models-and-practices/01`).

`A JOB GOES ONLY TO A HOLDER OF ITS ROLE` says who does a job; nothing yet says where it runs, once the participant no
longer names a route. The new requirement says it by the one fact the list keeps of an agent, its model, and makes the
model a participant names the model its job runs with — what the model-comparison rules `NO REVIEWER IS THE DRAFTER` and
`NO CHECKER IS THE REWRITER` compare. No requirement of the SPEC gives this already (*Nothing the SPEC already says*):
`A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE` restricts the routes by resources, not by model. A price, like a
context, belongs to a model as one connection serves it.

**Impact list.**
- `A JOB RUNS ON A CONNECTION THAT OFFERS ITS PARTICIPANT'S MODEL`: new; `tests/test_job_assignment.py` gains the case
  its check names. Realised by UC-011 and UC-034, drafted beside `process-models-and-practices/01`; MOD-participant-list
  (a member joined with the connections that offer its model) and MOD-agent-processes (the agent started with that
  model) are drafted beside it.
- `NO COST IS GUESSED`, changed: named by UC-017, UC-036, UC-043 and UC-049, ARC-046, MOD-main-page,
  MOD-participant-list, MOD-work-plans, ITM-037, and the headers of `tests/test_job_cost.py`, `tests/job-ledger.test.mjs`
  and the tests of the endpoint driver, the agent processes and the main page. UC-017 no longer realises it; UC-003 and
  UC-044, where a price is now declared, do. The check is unchanged.
- It names the connection that `process-models-and-practices/01` defines (`A CONNECTION NAMES THE MODELS IT OFFERS`), and
  is accepted together with that entry or after it.

**Origin.** github.com/akmaier, the design agreed on 2026-11-09 in a conversation with Claude Code.
