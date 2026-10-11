---
id: ITM-408
title: A model endpoint asked through a Bridge
level: module
realises:
  - UC-003
  - UC-011
  - A RUNTIME IS INTERCHANGEABLE
  - A CREDENTIAL IS NEVER PLACED IN A URL
  - NO SECRET IN THE REPOSITORY
modules:
  - MOD-bridge-jobs
builds_on:
  - ITM-326
  - ITM-316
tests:
  - unit
origin:
  - UC-003 2a
---
# ITM-408 A model endpoint asked through a Bridge

**REGISTER**

## Outcome

MOD-bridge-jobs' `POST /v1/ask` with `{ endpoint, input }`, as its file states it: the endpoint's configuration mapped
to MOD-endpoint-calls' `EndpointConfig` and sent with `endpointDriver` in Node (ITM-316), answered like an agent's ask
with its text and usage, or `failed` with the endpoint's own failure; the configuration and its key exist only for that
request and are kept in no clone, record, log, file or command.

## Acceptance

- Unit tests that name MOD-bridge-jobs state, before the code exists, with a controlled model server: an endpoint ask
  done with text and usage; a refused key failed with its reason; the key in no log line and no file after the ask.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/bridge-jobs/` and the tests that name MOD-bridge-jobs change.
