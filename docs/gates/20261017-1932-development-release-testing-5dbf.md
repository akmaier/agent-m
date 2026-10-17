---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - f5d0cc9e4b8e84af4991cd208f1fc67a1bf5d414
  - https://github.com/akmaier/agent-m/pull/755
date: 2026-10-17 19:32 UTC
---
# Development → Release testing: ITM-743, when a row runs and the secrets the schedule needs by name

**REGISTER**

## Reason

ITM-743, pull request #755 into `sprint/team2/76`, reworked once after the rejection on `bbb82b64`
(`20261017-1928-development-release-testing-4a73.md`); decided at head `f5d0cc9e`. The first commit `bf16f4a5` holds
only the tests and run 39062269630 is red on it; run 39062714495 is green on the head; the change is
`src/test-schedule/index.mjs` and its new test, whose TST-743003 expectation changed only within this pull request.

The rejection's condition no longer holds: `secretsNeeded` reads the rows from a `Document`'s sections, and the row
`paid` counts every endpoint and agent. Checked at the failure node: a list read with `readDocument(resourceSchema(), …)`
gives `ORACLE_KEY`, `LOCAL_KEY` (a free model endpoint) and `AGENT_KEY`, nothing for compute, and no value where a
value stood in the Secret cell. The Acceptance holds.

Left for later, not a condition: data the product calls as a paid service, which `paidServices` counts, is not taken by
`secretsNeeded`.
