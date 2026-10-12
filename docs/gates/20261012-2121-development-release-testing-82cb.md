---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 04f4f2f2371a157db99fb5d9eb992fd41b9939ca
  - https://github.com/akmaier/agent-m/pull/459
date: 2026-10-12 21:21 UTC
---
# Development → Release testing: ITM-461, a resource's pin read, its check planned, and a newer state found

**REGISTER**

## Reason

ITM-461, pull request #459 by developer-sonnet-b into `sprint/team1/23`, head `04f4f2f`. The first commit `369cad1`
holds only `tests/resource-list-pin.test.mjs`, and CI was red on it (run 38309421537): its six tests fail, and no other
test does. CI is green on `04f4f2f` (run 38309668451, 2170 tests, 0 failures). The code changes only
`src/resource-list/`; the test, with fake readers and no request, names MOD-resource-list and its guards, and 28 faults
are recorded, all killed. The Acceptance holds.

The readings weighed: `readPin` reads upstream only for a repository, data and a model, the kinds the file names readers
for, and `NothingToRead` for the others; a Hub reader's plain failure named `HubNotAnswering`, as the file asks a Hub
that does not answer to be named; `checkPlan`'s probes and `NoCheckRoute` for a route the plan cannot use; any state that
differs from the pin counted newer, the pin itself never moved.

`pins.mjs` is not among MOD-resource-list's Parts — `index.mjs`, the interface; `resources.schema.md`; `rules.mjs`;
`strategies.mjs` —, which name no file for these functions but the interface itself. It is the fourth file of this
kind, after `errors.mjs`, `sign-in.mjs` and `access.mjs`; noted for the review and for akmaier, with the pattern that a
Developer stops at the item's edge where the Parts name no file for its code.
