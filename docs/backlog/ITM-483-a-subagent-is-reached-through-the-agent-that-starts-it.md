---
id: ITM-483
title: A subagent is reached through the agent that starts it
level: module
realises:
  - UC-017
  - UC-049
  - A PARTICIPANT DECLARES ITS CAPABILITIES
  - A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET
modules:
  - MOD-participant-list
builds_on:
tests:
  - unit
origin:
  - the architecture of the prompt bar, accepted by akmaier at 7e893c63 (110d2499)
  - MOD-participant-list, Data: Route; Interfaces: reachedThrough, eligible
---
# ITM-483 A subagent is reached through the agent that starts it

**REGISTER**

## Outcome

The participant list reads the routes its module file adds: `through <participant>` for a subagent that another CLI
agent of the register starts, and a model endpoint's route with ` secret <NAME>`, the CI secret of its key.
`reachedThrough` names the participant a subagent is reached through, `null` for every other route; `eligible` leaves out
a subagent whose `through` names no CLI agent of the register, or itself, with that reason.

## Acceptance

- A register with a subagent, an endpoint with a CI secret and every earlier route is read without a finding; a
  subagent through an unknown participant or through itself is left out by `eligible`, the reason named.
- `reachedThrough` gives the starting agent's name for a subagent and `null` for every other route.
