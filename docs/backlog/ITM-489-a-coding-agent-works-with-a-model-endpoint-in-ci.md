---
id: ITM-489
title: A coding agent works with a model endpoint in CI
level: module
realises:
  - UC-049
  - A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET
modules:
  - MOD-agent-processes
builds_on:
tests:
  - unit
origin:
  - the architecture of the prompt bar, accepted by akmaier at 7e893c63 (110d2499)
  - MOD-agent-processes, Data: the column Endpoint; Interfaces: agentDriver
---
# ITM-489 A coding agent works with a model endpoint in CI

**REGISTER**

## Outcome

MOD-agent-processes' register gains the column Endpoint — how an agent is made to work with a model endpoint of the
kind OpenAI-compatible or Anthropic, or `—` —, and `agentDriver` takes `endpoint`, starting the agent with that endpoint
and its key from `keyVariable`; an agent whose Endpoint is `—` refuses it with `EndpointUnsupported` before it
starts.

## Acceptance

- Each row's Endpoint is read from the vendor's documentation and named in the pull request.
- A fixture agent is started with the endpoint's options and the key variable only; one with `—` throws
  `EndpointUnsupported` and starts nothing.
