---
id: ITM-1203
title: An agent job's machine reaches only what it needs, and the key it holds has a spending limit
level: module
realises:
  - UC-010
  - A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET
modules:
  - MOD-runtimes
builds_on:
tests:
  - unit
origin:
  - docs/spec-freigaben/2026-10-24_the-agent-holds-no-write-token-and-no-other-key/01-runtimes.begruendung.md and 02-configuration-and-secrets.begruendung.md, "a spending limit on that key and a restricted network are the next steps, not part of this change"
---
# ITM-1203 An agent job's machine reaches only what it needs, and the key it holds has a spending limit

**REGISTER**

## Outcome

Since `a51d9b83` the hosted job workflow runs the agent on a machine of its own, which receives only the key of the
participant the job names; the person's token is read only on the writing machine (`A HOSTED JOB AUTHENTICATES ITS AGENT
WITH A CI SECRET`, accepted in `00eb2a0a` and `008672e7`). The approval's rationale names what that change leaves open:
the agent can still leak the one key it holds. It names the next steps:
- a spending limit on that key;
- a restricted network on the agent's machine.

No sentence of SPEC.md, no use case and no module file states either.

## Not ready: a SPEC change for akmaier first

Both are requirements the SPEC does not hold, so this item is built only after akmaier accepts them. A proposal states,
for each, what is limited and where it is checked: which addresses the agent's machine may reach, and whether the
spending limit is set on the endpoint's side, named by the dashboard, or checked by the job.

## Acceptance

- Once the requirements are accepted: the generated job workflow's agent job holds what they state, and the check they
  name passes, with a counter-proof.
- The first commit holds only the tests, and CI is red on it.
