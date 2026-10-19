---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - fbc8a9a39a3e137a27c6e5193b86c2c3ee214fe8
  - https://github.com/akmaier/agent-m/pull/992
date: 2026-10-19 09:27 UTC
---
# Development → Release testing: ITM-960, passed — the Bridge answers the probes endpoint-models and partitions

**REGISTER**

## Reason

ITM-960 (MOD-bridge-jobs, MOD-endpoint-calls), pull request #992 into `sprint/team1/93`, passes on `fbc8a9a3`.

- **Two commits, one parent each, no merge, both with the trailer `developer-sonnet-d`.**
  - `bc3c0c18` holds only tests, in three test files.
  - `fbc8a9a3` holds the code, in `src/bridge-jobs/` and `src/endpoint-calls/`.
- **The red,** run 39228129135:
  - The item's job has `# fail 6`, `# todo 0`, `# cancelled 0`: TST-960101 to 105, and `tests/endpoint-calls.test.mjs` at
    file level on the missing export `listModels`.
  - The run's other failing job is TST-498005 alone, the known flake of ITM-949.
- **The code meets the accepted texts:**
  - `listModels` makes one `GET <baseUrl>/models` and gives `{ models }` or `{ diagnosis }` (MOD-endpoint-calls.md:101).
  - `endpoint-models` returns that unchanged, as MOD-bridge-jobs.md:108-115 says.
  - `partitions` runs `sinfo --noheader --format=%P|%a`, and a missing or failing command is `upstream-failed`.
- **CI:** 20 of 20 checks passed on the head.
- **Merge-tree:** `git merge-tree --write-tree` onto `sprint/team1/93` (`80c78936`) is clean.
- **Replayed in a clean worktree at the head,** with the Bridge installed:
  - `bridge-http`, `bridge-jobs-endpoint-test` and `endpoint-calls` pass 37 of 37.
  - Counter-proof: with `listModels` asking `/modelz`, 3 fail.
