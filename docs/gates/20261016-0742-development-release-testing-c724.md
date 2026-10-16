---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - f2023194d29649ec62e60a238dc70a9501533856
  - https://github.com/akmaier/agent-m/pull/560
date: 2026-10-16 07:42 UTC
---
# Development → Release testing: ITM-526, The access test is not raced by git's own lock files

**REGISTER**

## Reason

ITM-526, pull request #560 into `sprint/team1/37`, at head `f2023194`. developer-sonnet-e made both commits.

1. **The red commit.** The first commit, `eb9603c1`, holds only test code and was red on CI (run 38868406926, node (1)
   and (5)) with the intended `ENOENT … maintenance.lock`, as the start decision asked.
   - `withVanishing` removes a planted file right after `readdirSync` lists it.
   - TST-526001 plants a vanishing `.git/objects/maintenance.lock` and requires the walk not to throw.
   - TST-526002 plants a vanishing `.git/objects/other.tmp`, which still throws.
2. **CI is green on the head**: ten of ten jobs, run 38868677256.
   - The first attempt failed node (1) in TST-371001, in `tests/system-uc-006-approve-spec-change.test.mjs`, a file this
     pull request does not touch, with "waited for acceptance result". The re-run passed.
   - That test waits by a count of turns, as ITM-357's did before ITM-467, so its failure is a time-out under load. It is
     registered as ITM-527.
   - Locally, only the known TST-367001 to TST-367003 fail.
3. **The changes stay in the item's scope.** Only `tests/bridge-jobs-access.test.mjs` changed: `stateOf` leaves out names
   ending in `.lock` under the clone's `/.git/`, and two tests of the walk are added. TST-472076 changes only how it
   measures, and its expected result stays. No file of `src/` changed.
4. **The tests and their counter-proofs.**
   - The red commit itself.
   - TST-526002, which shows that any other vanishing file still fails.
   - A planted write of `planted.txt` by `testAccess` into a clone's working tree, which fails TST-472076. It was
     reverted and not committed.
5. **The Acceptance holds.** Git's own locks are not measured; every other file is, as before.

The second flaky test in two runs is registered as ITM-527: UC-006's system test waits by time, not by turns. The
remaining test files that wait by a count of turns are named in it.
