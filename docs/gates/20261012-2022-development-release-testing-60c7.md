---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 6258f08ef2200e7b6c1c395e4ee7b05e0df99d89
  - https://github.com/akmaier/agent-m/pull/448
date: 2026-10-12 20:22 UTC
---
# Development → Release testing: ITM-408, a model endpoint asked through a Bridge

**REGISTER**

## Reason

ITM-408, pull request #448 by developer-sonnet-b into `sprint/team1/22`, head `6258f08`. The tests-only commit was red
on its five tests alone (run 38302842601), and `6258f08` is green (run 38303382679, 2113 tests, 0 failures). The code
changes only `src/bridge-jobs/handlers.mjs`; the new test names MOD-bridge-jobs and its guards, and 15 faults are
recorded; no existing expected result changes. The Acceptance holds: with a controlled model server, an endpoint ask done
with text and usage, a refused key failed with its reason, the key in no log line and no file after the ask.

The readings weighed: a body that carries an endpoint is an endpoint ask, as MOD-bridge-jobs' `POST /v1/ask` with
`{ endpoint, input }` states it; an invalid configuration or an input that is no text is `invalid-request`; the
configuration and its key live only in the call, kept in no clone, record, log, file or command, as the Outcome asks. A
failed ask's reason carries the endpoint's own words with the key, where the endpoint quotes it whole, replaced by
`[key]`, so that the answer, which goes back to the page that sent the key, does not carry it either. A provider that
quotes part of a key, masked or not, is not caught by the whole key's replacement; noted for the review.
