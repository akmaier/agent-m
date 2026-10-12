---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - f50be9e703151ca9b68484c32f1b22680dde59e1
  - https://github.com/akmaier/agent-m/pull/472
date: 2026-10-12 23:10 UTC
---
# Development → Release testing: ITM-368, specification and design together, for reviewing, accepting and editing

**REGISTER**

## Reason

ITM-368, pull request #472 by developer-sonnet-e into `sprint/team1/25`, head `f50be9e`, an item of component tests:
one commit adds only `tests/specification-and-design-together.test.mjs`, level component, naming MOD-approvals,
MOD-spec-changes and MOD-artifact-edits and what it guards. Check 1 of `docs/instructions/product-owner.md` asks no red
first commit of an item that adds no behaviour; this one tests behaviour its three modules already have, written by a
Developer who implemented none of it. CI is green on `f50be9e` (run 38320533153); the file runs in about a quarter of
a second, reaching no network. Eleven faults planted in `accept.mjs`, `save.mjs`, `propose.mjs` and MOD-approvals'
`accept.mjs` are recorded, each of the ten tests failing under at least one. The Acceptance holds: each test states its
input, precondition and expected result and names its modules and guards; no existing test changes; only a test file
naming the three modules changes. No test contradicted the texts, so nothing is fixed in a module.

The readings weighed: `applyApproved` is `async` in the code where MOD-spec-changes' file shows it returning its result
plainly — a difference between the text and the code, noted for the review; `proposeSection` takes no clock; a record
committed by hand read as GitHub's page commits it; `saveEntry`, `requirementHistory` and `statusOf`, not built, are
not tested, as the item does not name them.
