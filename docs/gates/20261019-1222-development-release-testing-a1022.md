---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 4abc979aef7deaacfb43a8d1e6b357617b781f83
  - https://github.com/akmaier/agent-m/pull/1049
date: 2026-10-19 12:22 UTC
---
# Development → Release testing: ITM-1022, passed — a job's page shows its commits, its pull request and its CI runs

**REGISTER**

## Reason

ITM-1022 (MOD-runtimes, MOD-main-page), pull request #1049 into `sprint/team1/93`, passes on `4abc979a`.

- **Two commits, one parent each, no merge, both with the trailer `developer-sonnet-c`.**
  - `199568d1` holds only tests.
  - `4abc979a` holds the code: `src/runtimes/trail.mjs` and `index.mjs`, and `src/main-page/jobs.mjs`.
- **The red,** run 39250778988, each job with `# cancelled 0`:
  - `# fail 1`: `tests/runtimes-job-trail.test.mjs` as a whole, on the missing `jobTrail`;
  - `# fail 3`: TST-1022004 to 006.
- **The code meets MOD-runtimes.md:211-214 (`jobTrail`) and MOD-main-page's use of it.** The page draws the commits, the pull
  request and the CI runs, or says there are none, and a trail it cannot read is named.
- **The readings stand:**
  - the branch is named after the job;
  - the commits are those dated from the record's start;
  - the pull request is the newest of the branch;
  - a missing branch gives no commits.
- **A draft is needed for MOD-runtimes' parts.** `src/runtimes/trail.mjs` is new and is named in no part of MOD-runtimes.
  Neither is `src/runtimes/retry.mjs`, which ITM-973 added; my gate of #1006 missed that. developer-sonnet-c writes one draft
  that names both files among the parts, for akmaier.
- **CI:** run 39251004018 passed 20 of 20 on the head.
- **Merge-tree:** `git merge-tree --write-tree` onto `sprint/team1/93` (`7d3afa07`) is clean.
- **Replayed in a clean worktree at the head:**
  - `runtimes-job-trail`, `main-page-job-trail` and `main-page-job` pass 14 of 14.
  - Counter-proof: with the start date ignored, 1 test fails.
