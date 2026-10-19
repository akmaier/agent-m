---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 4fc6132d375f6d1081f38675e57c601e6176d82e
  - https://github.com/akmaier/agent-m/pull/951
date: 2026-10-19 05:51 UTC
---
# Development → Release testing: ITM-352, a CI agent's route in the schema's form, and the place preset tested

**REGISTER**

## Reason

ITM-352 (MOD-settings-pages), pull request #951 into `sprint/team1/93`, passes on `4fc6132d`.

1. **The participant trailer is present** on both commits: `developer-sonnet-d`.
2. **The red is `610e335e`.** It holds tests only, and run 39206021890 fails exactly TST-375001 and 375004 (node (8)) and
   TST-352001, 352006 and 352007 (node (4)). Node (7)'s TST-938007 timed out and passed on its rerun; it lies outside the
   item and is a recorded finding. TST-352005, the place preset, passes on the base by design.
3. **The change** is `src/settings-pages/participants.mjs` only.
   - `routeOf` writes `ci hosted secret <NAME>` or `ci runner:<label> secret <NAME>` (MOD-participant-list.md:56).
   - A *Runner label* field appears for a self-hosted runner, and *Save* waits for it.
   - *Change* reads both forms. An old self-hosted route reads as the label `self-hosted`, as `settings.mjs` reads it.
4. **The changed lines of existing tests are the item's own output** (`d995c09b`): TST-352001's and TST-375001's expected
   route, and TST-375004's added label. `release-uc-017` is unchanged.
5. **Counter-proof, replayed by me in a clean checkout of the head:**
   - the two files pass 52 of 52;
   - with a hosted runner written in the old form, three participants tests and TST-375001 fail.
6. **Green.** CI run 39206317094 passes all twenty jobs, and `git merge-tree --write-tree` merges the head into
   `sprint/team1/93` without a conflict (tree `ca8cdcf1`).
7. **The hold.** `heldItems` counts ITM-352 as held against team 2's closed sprints 16 and 24, through ITM-269 (93.md).
   SPEC.md:1672-1674 releases that hold, since team 2's change was merged on 2026-10-09, and ITM-352 started before it
   appeared.
8. **Ahead, at the sprint's merge.** `git merge-tree` of the head with `sprint/team1/92` conflicts in `participants.mjs`,
   where ITM-999 (#940) changed the same form. When sprint 92 reaches `main` and `main` is merged into `sprint/team1/93`,
   developer-sonnet-d resolves it. The end gate reads that merge's `--cc`.
