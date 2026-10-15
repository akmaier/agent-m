---
id: ITM-491
title: A hand-over to a Bridge carries its task
level: module
realises:
  - UC-049
  - A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
modules:
  - MOD-bridge-http
  - MOD-bridge-client
builds_on:
tests:
  - unit
origin:
  - the architecture of the prompt bar, accepted by akmaier at 7e893c63 (110d2499)
  - MOD-bridge-http, the wire of `POST /v1/jobs`; MOD-bridge-client, Interfaces: handOver
---
# ITM-491 A hand-over to a Bridge carries its task

**REGISTER**

## Outcome

`POST /v1/jobs` takes `{ product, record, commit, task? }`, as MOD-bridge-http's wire states, and MOD-bridge-client's
`handOver` sends `task` where it is given — for a job a conversation of the prompt bar handed over —, and only in that
request's body.

## Acceptance

- `handOver` with and without `task` sends exactly the wire's body to a fixture Bridge; the task stands in no URL.
- The wire's schema accepts both bodies and refuses a `task` that is not text.
