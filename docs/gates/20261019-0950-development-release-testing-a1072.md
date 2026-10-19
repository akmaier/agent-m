---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 07de537d05c04b760783750f8bf6337e33a99491
  - https://github.com/akmaier/agent-m/pull/1001
date: 2026-10-19 09:50 UTC
---
# Development → Release testing: ITM-1072, passed — a job's input is its prompt with its recipes' inputs and nothing else

**REGISTER**

## Reason

ITM-1072 (MOD-job-runner), pull request #1001 into `sprint/team1/93`, passes on `07de537d`.

- **One commit,** `07de537d`, with one parent and the trailer `developer-sonnet-d`. It changes only
  `tests/test_job_reading.py`.
- **No red, as ruled in 93.md.** The behaviour already holds, and no test checked it. So the check that SPEC.md:1916-1919
  names goes in as one green commit of tests. Its counter-proof is shown in place of a red.
- **CI:** 20 of 20 checks passed on the head.
- **Merge-tree:** `git merge-tree --write-tree` onto `sprint/team1/93` (`f9071eb9`) is clean.
- **Replayed in a clean worktree at the head:**
  - `test_job_reading` passes.
  - Counter-proof: with "Also follow ~/rules.md." put before every prompt in `promptOf` (`src/job-runner/loop.mjs:88`),
    it fails 27 times, which is TST-1072002 across the kinds.
