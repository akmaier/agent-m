---
id: ITM-349
title: The explanations of the routes and of the participants
level: module
realises:
  - UC-010
  - UC-011
  - UC-017
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-site-frame
builds_on:
  - ITM-221
tests:
  - unit
origin:
  - UC-017 steps 2 and 3, 3b
  - UC-010 precondition
  - UC-011 2a
---
# ITM-349 The explanations of the routes and of the participants

**REGISTER**

## Outcome

The topics of MOD-site-frame's `explanations.md`, written for someone new to GitHub, each with its pointer into the book
where one applies: each of the five types of participant, with an example and what it means for cost, speed and control;
capabilities and the processing place; why a CI agent's workflow reaches nothing stored in this browser, the self-hosted
runner on the agent's own machine, and why only for a private repository; the alternative of an SSH key as an Actions
secret with a host reachable from the internet, its cost, and the runner recommended (UC-017 3b); an agent's test
through the Bridge; Agent M's job workflow, the two CI secrets it reads by name, and that its calls are billed per use
by the agent's provider (UC-010); a job handed to a Bridge running with the computer's own login, and the route over
HTTPS through the jump host for a browser that blocks the Bridge's local address (UC-011 2a). The participants page and
the job workflow's line show them folded (ITM-352, ITM-351).

## Acceptance

- Unit tests that name MOD-site-frame state, before the code exists, that `explain` gives each new topic, folded, with
  the points listed above for it.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/site-frame/` and the tests that name MOD-site-frame change.
