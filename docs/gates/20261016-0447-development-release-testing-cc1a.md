---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 876eb45acc6bd0408f053ca23934c94a7a2ba6eb
  - https://github.com/akmaier/agent-m/pull/543
date: 2026-10-16 04:47 UTC
---
# Development → Release testing: ITM-516, A hold ends when the item's change is on the default branch

**REGISTER**

## Reason

ITM-516, pull request #543 into `sprint/team1/33`, at head `876eb45a`. developer-sonnet-b made both commits.

1. **The red commit.** The tests-only commit `72287ffb` holds only `tests/work-plans-sprints.test.mjs`, and CI was red on
   it (run 38852064869).
   - It failed at import, because `undecidedHeads` was not yet exported, so every test of the file was red, not only the
     new ones.
   - To see that the new tests fail for the behaviour, I gave the red commit's code a stub export,
     `undecidedHeads() { return []; }`. Then the new TST-516001 to TST-516003 and the changed TST-469001 fail, and the
     other 14 tests pass.
   - So the first commit is red for the item's behaviour, and the check holds.
2. **CI is green on the head**: ten of ten jobs, run 38852204731.
   - On the head, the tests of MOD-work-plans and of the implementation pages pass: 56 tests, none failing.
   - The developer ran 113 node tests and the Python checks `test_parallel_sprints`, `test_no_backend`,
     `test_time_box_selection` and `test_wip_limit`, all passing.
3. **The changes stay in the item's scope.**
   - `src/work-plans/sprints.mjs` and `index.mjs` are the item's module.
   - In `tests/work-plans-sprints.test.mjs`, TST-469001 changed as ITM-516 names it: its last case passes `onDefault` with
     the head commit instead of `{ defaultBranch: "trunk" }`, and its `expect:` line says so. TST-516001 to TST-516003
     are new.
   - `src/implementation-pages/roles.mjs` calls `heldItems` with four arguments and is unchanged.
4. **The new tests.** Each names its requirements and MOD-work-plans, and states its values in its own text. Six
   planted-fault counter-proofs are recorded in #543.
5. **The Acceptance holds.**
   - A head commit in `onDefault` ends the hold; a change in neither the chain nor `onDefault` stays held.
   - `undecidedHeads` names the heads of held items' merged pull requests, in order, each once.
   - The chain ends at `main`, and `{ defaultBranch }` is removed, as the start decision named.

**The gap the developer names.** `undecidedHeads` has no separate check that a chain reaches no `main`. That is sound: a
held item's merged pull request whose chain reached `main` would already have ended the hold, so the condition is implied,
and a code comment says why. With nothing to plant, no counter-proof is possible.

A non-`Set` fifth argument counts as an empty set. Nothing in the accepted file asks for that, and it keeps the
four-argument callers unchanged.
