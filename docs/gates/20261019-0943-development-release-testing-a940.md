---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 878d4c5b76f397492de363335c3113bb269a309d
  - https://github.com/akmaier/agent-m/pull/993
date: 2026-10-19 09:43 UTC
---
# Development → Release testing: ITM-940, passed — the stored overview, and a scope build that reads what buildInProgress takes

**REGISTER**

## Reason

ITM-940 (MOD-progress-measures), pull request #993 into `sprint/team1/93`, passes on `878d4c5b`. It was rejected on
`3fd919c4` (20261019-0923).

- **Four commits, one parent each, no merge, all with the trailer `developer-sonnet-b`.**
  - The two new commits are `0173f334`, which holds only tests, and `878d4c5b`, which holds only code
    (`src/progress-measures/facts.mjs`).
- **The second red,** run 39231072998 on `0173f334`: `# fail 4`, `# todo 0`, `# cancelled 0`, exactly:
  - TST-940008 and TST-940009, which are new: a step held back by a change queue, and by a gate;
  - TST-940001 and TST-940003, whose expectations now state what `build` reads, as ruled.
- **The rejection's cause is gone.**
  - `build` passes the change queues and the gate states to `itemStates` (`facts.mjs:167`).
  - The gate states need the workflow, so `build` also reads the declaration with its model and workflow, once, through
    `instanceAt`. That reading stands: it is part of what `buildInProgress` takes through `itemStates`
    (MOD-progress-measures.md:152-153).
  - It still reads no sprint, assignment, participant, module file, test, result, tag or information. TST-940001 pins the
    files it reads and its one `instanceAt`.
- **CI:** run 39231746840 passed on the head, 20 of 20.
- **Merge-tree:** `git merge-tree --write-tree` onto `sprint/team1/93` (`436e65ac`) is clean.
- **Replayed in a clean worktree at the head:**
  - `tests/progress-measures-product-facts.test.mjs` passes 24 of 24.
  - Counter-proof: with `gates: []` at `facts.mjs:167`, exactly TST-940009 fails.
