---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - a32e0e26d2f68debbfb89b83b2ef00bd0be573fd
  - https://github.com/akmaier/agent-m/pull/964
date: 2026-10-19 06:58 UTC
---
# Development → Release testing: ITM-1010, a closed sprint holds no item through another sprint's pull request

**REGISTER**

## Reason

ITM-1010 (MOD-work-plans), pull request #964 into `sprint/team1/93`, passes on `a32e0e26`.

1. **The participant trailer is present** on both commits: `developer-sonnet-a`.
2. **The red is `ad16310b`.** It holds tests only, and run 39212144508 fails exactly TST-1010001. The four todos are the
   recorded layout findings.
3. **The change** is `src/work-plans/sprints.mjs`.
   - A closed sprint holds an item only through a merged pull request whose base reaches the sprint's own `branch`.
   - `reachesDefaultBranch` shares that walk.
4. **The reading is accepted, on SPEC.md:1672-1674:** "held by that sprint until its change is merged into the default
   branch". A sprint's change of an item is a pull request into that sprint's branch. MOD-work-plans.md:124-126's
   "without a merged pull request" is read the same way. That is no added word, since the sentence speaks of the sprint's
   own items, and TST-473182 already pins it.
5. **Run on the repository's real records** with fresh pull requests (`held.mjs`):
   - with the head's code, team 2's sprints 16, 24 and 41 hold nothing;
   - with the base's code, they hold ITM-269 (16, 24) and ITM-352 (41), the known positive.
   With the head's code, `conflicts` finds ITM-1021 and ITM-566 free.
6. **Counter-proof, replayed by me in a clean checkout of the head:**
   - the file passes 20 of 20;
   - with the base's `sprints.mjs`, TST-1010001 fails.
7. **Green.** CI run 39212686971 passes all twenty jobs, and `git merge-tree --write-tree` merges the head into
   `sprint/team1/93` without a conflict (tree `8cb13f53`).
