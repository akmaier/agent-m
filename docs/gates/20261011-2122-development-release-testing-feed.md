---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - b62d66f0d8e9b84ff1e487d06b1afa2dbb6960bd
  - https://github.com/akmaier/agent-m/pull/430
date: 2026-10-11 21:22 UTC
---
# Development → Release testing: ITM-326, the agents of a Bridge's computer, listed, tested and asked

**REGISTER**

## Reason

ITM-326, pull request #430 by developer-sonnet-b into `sprint/team1/21`, head `b62d66f`. The condition that does not
hold: only the item's scope changes (check 3). `b62d66f` changes an expected result of an existing test,
TST-276002 in `tests/desktop-shell.test.mjs` — 404 to 422 —, a test whose header names MOD-desktop-shell, not
MOD-bridge-jobs, and which ITM-326 does not name. It is no change between jobs either: that requirement covers a test
"whose header names no module of the architecture", and this one names one.

TST-276002 tests that pausing refuses new work and that resuming restores the server's own refusal; it sends its new
work to `POST /v1/probes/agent`, which no handler served until now, so the refusal it expects is `not-found`. Now that
MOD-bridge-jobs' file gives that route its handler, the route the test sends to is a matter of how it prepares its
fixture, which an item of MOD-desktop-shell may change — a route no handler serves, its expected 404 unchanged. That is
the way through, before the rework, which then leaves `tests/desktop-shell.test.mjs` alone.

The rest was read too and stands for the rework: the tests-only commit `925100e` was red, and the code makes the new
tests green; `endpoint-models` and `partitions` are "not part of this item", as its Outcome says; the shapes of
`/v1/agents` and `/v1/ask`, asks held in memory and nothing of them on disk, and `server.mjs` not wired to pass the
offered agents, which the routes that hand over jobs (ITM-327) take up.
