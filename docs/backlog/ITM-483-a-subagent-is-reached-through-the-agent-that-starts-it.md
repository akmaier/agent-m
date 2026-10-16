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

What the module file leaves unstated, and what is built:
- **The route.** `through <participant>` is the whole route: the word `through`, one space, and a participant's name,
  compared exactly with the register's names.
- **Who may start a subagent.** Only a participant whose type is `CLI agent`, as the file's Route row says: "another CLI
  agent of the register".
- **The register `eligible` checks against.** It is the participants it is given; it reads nothing else. A subagent is
  left out when its `through` names itself, or a given participant that is no CLI agent, or none of those given.
  - The reasons, stated in the tests: `reached through itself`, and `reached through <name>, which is no CLI agent of the
    register`.
  - MOD-job-runner's `prepareJob` calls `eligible` with the drafter alone, so a subagent drafter is left out there until
    the item that routes a subagent (ITM-494) hands it the register. That is noted for ITM-494, not built here.
- **The endpoint's ` secret <NAME>`.** The register's Route column is free text, so it needs no reading here. A register
  holding it is read without a finding, as today.

No existing test's expected result changes, release tests included. No register of the tests or of the instance holds a
route `through`, and every existing call of `eligible` keeps its result.

## Acceptance

- A register with a subagent, an endpoint with a CI secret and every earlier route is read without a finding; a
  subagent through an unknown participant or through itself is left out by `eligible`, the reason named.
- `reachedThrough` gives the starting agent's name for a subagent and `null` for every other route.
- The first commit holds only the tests, and CI is red on it. If it fails only because a function does not exist yet, the
  Developer runs it once locally against an uncommitted stub and lists the tests that fail on behaviour.
- Each test states its expected values in its own text (`A TEST DOES NOT TAKE ITS EXPECTED RESULT FROM A DOCUMENT`); an
  existing test that the change turns red is not changed here: the Developer stops and names it.
