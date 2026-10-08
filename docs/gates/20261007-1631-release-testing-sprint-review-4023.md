---
gate: Release testing → Sprint review
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 515622dbda5830950b81415fe3c0c806a6e1ef27
date: 2026-10-07 16:31 UTC
---
# Release testing → Sprint review: sprint 10

**REGISTER**

## Reason

Sprint 10, ended by the Product Owner (`01bcad4`), on `sprint/10` at `515622d`.

**No release test in this sprint.** No selected item is done, so no behaviour of the sprint is owed a release test:
- ITM-246, ITM-247, ITM-252 and ITM-237 were rejected at their gates (#181, #182, #183, #185);
- ITM-239 and ITM-271 did not start.

ITM-246, the one item of release tests, is not merged. `sprint/10` holds no item's work: its one merge, #176, brought
`main` in at `be126d9` (`20261007-1536-development-release-testing-2b7f.md`).

**Green on the sprint branch.** Run 37652385872, on `sprint/10` merged into `main`, passes:
- node: 862 tests, 0 fail, 11 todo;
- python: 396, OK.
