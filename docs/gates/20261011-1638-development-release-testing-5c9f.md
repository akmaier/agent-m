---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - bac0a3d2366d0bdc439fd37a4583f022ab17b7d0
  - https://github.com/akmaier/agent-m/pull/379
date: 2026-10-11 16:38 UTC
---
# Development → Release testing: ITM-337

**REGISTER**

## Reason

ITM-337, pull request #379 by developer-sonnet-b into `sprint/team1/16`, on head `bac0a3d`, against the item and
MOD-spec-changes' accepted file as they stand on the sprint's branch. All five points hold:
- The first commit, `909a709`, holds only `tests/spec-changes-requirement-recipes.test.mjs`, and CI was red on it (run
  38155624165): node failed on exactly its 12 tests — 1503 tests, 12 failed.
- CI is green on the head (run 38155815581): node 1503 tests, 0 failed; python 441 tests, OK.
- Only MOD-spec-changes' folder — `specStrategies` in the new `strategies.mjs`, the export and header of `index.mjs`, a
  comment of `queues.mjs` — and the new test whose header names the module change; no existing test or expected result
  changes. The catalogue's kinds name the three recipes already.
- The 12 new tests name what they guard — `DERIVATION SEES THE EXISTING REQUIREMENTS` and `A PROMPTED REQUIREMENT CHANGE
  FOLLOWS THE DERIVATION RULES` — and MOD-spec-changes, with 71 faults planted on the draft first and again on the code.
- The Acceptance holds, with a fixture snapshot holding open queues: the chosen requirements, and without a choice those
  no use case realises; the named requirements with their sections; every requirement of the SPEC and of the open
  entries with its state, each carried as an artifact keyed by its name and its rule.

Reading 6 holds, as the Product Owner's to settle: "every open entry of every queue" is every entry that is not `in
SPEC` — `open`, `approved`, `stale` or `waiting for its anchor` —, each shown with its own state. `DERIVATION SEES THE
EXISTING REQUIREMENTS` asks for every requirement "in its open change queues", and the module file gives each one its
state, which a list of the state `open` alone would not need; an approved entry's requirement, which the workflow has
yet to write, stays in view. Noted for the sprint's review, no condition of this gate: the other readings the pull
request names, among them the parameter `requirements`, the failure `RequirementNotFound`, and a requirement an entry
restates listed twice; and that until ITM-454 the 16 entries decided on 2026-09-23 add 102 requirements of their old
wording to `spec-with-queues` over this repository.
