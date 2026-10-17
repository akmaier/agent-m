---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 3739d8755bc77ebfb9545ab69f5cb82ed7a01459
  - https://github.com/akmaier/agent-m/pull/746
date: 2026-10-17 19:48 UTC
---
# Development → Release testing: ITM-702, a local run of the node tests runs no file of the groups fixture

**REGISTER**

## Reason

ITM-702, pull request #746 into `sprint/team2/77`, at head `3739d875`, declared as refactoring and decided on the
Acceptance narrowed at the start of sprint 77 (`5c80cee7`). developer-sonnet-i wrote it.

- **Green on every commit.** CI run 39061115496 on the one commit is green, 10 of 10.
- **Scope.** `tests/test_groups.py` (header MOD-group-document; only how two tests prepare the fixture product changed,
  through `build_product`), and the fixture's `export.test.js` renamed to `export.test.js.fixture` with its content kept.
- **No expected result changed.** The expected values of both tests are as before; the first assertion now runs on the
  built copy.
- **The new base.** The run was made on `94022823`. The head merges onto `5c80cee7` without conflict, and none of the
  files the change depends on changed between the bases.
- **Acceptance at the failure node**, merged locally, on Node 25. Node's test discovery under `tests/` runs
  `fixtures/groups/repo/tests/export.test.js` on the base (3945 tests, 33 fail). On the merge it runs no file below
  `tests/fixtures/groups/` (3944 tests, 32 fail, and the other 32 failures are unchanged). Node 25 takes the literal
  `node --test tests/` as a module path, so discovery was run from inside `tests/`.
- **Both readers find the fixture.** `test_groups.py` gives 28 passed and 1 skipped, the same as on the base, and
  `artifacts-checks.test.mjs` passes 11 of 11.
