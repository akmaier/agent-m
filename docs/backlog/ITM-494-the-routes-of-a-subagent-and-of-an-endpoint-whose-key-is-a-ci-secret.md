---
id: ITM-494
title: The routes of a subagent and of an endpoint whose key is a CI secret
level: module
realises:
  - UC-017
  - UC-049
  - A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET
modules:
  - MOD-runtimes
builds_on:
  - ITM-483
  - ITM-489
  - ITM-493
tests:
  - unit
origin:
  - the architecture of the prompt bar, accepted by akmaier at 7e893c63 (110d2499)
  - MOD-runtimes, Interfaces: routesFor
---
# ITM-494 The routes of a subagent and of an endpoint whose key is a CI secret

**REGISTER**

## Outcome

`routesFor` offers a subagent the routes of the participant `reachedThrough` names, its job's input naming the
subagent; and a model endpoint whose route names the CI secret of its key also the server's runners, where opencode works
with that endpoint (MOD-agent-processes' Endpoint).

## Acceptance

- Fixture participants give the routes the module file states, a self-hosted runner still refused for a public
  repository.
