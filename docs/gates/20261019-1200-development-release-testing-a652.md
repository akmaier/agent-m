---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - dbaf3eb5510c590ae59891ee05184d6c24d10e07
  - https://github.com/akmaier/agent-m/pull/1042
date: 2026-10-19 12:00 UTC
---
# Development → Release testing: ITM-652, passed — one file is read at many commits in batches

**REGISTER**

## Reason

ITM-652 (MOD-repository-hosts), pull request #1042 into `sprint/team1/93`, passes on `dbaf3eb5`.

- **Two commits, one parent each, no merge, both with the trailer `developer-sonnet-d`.**
  - `9dc338fc` holds only tests: `tests/repository-hosts-read-file-at.test.mjs`.
  - `dbaf3eb5` holds the code: `src/repository-hosts/` only.
- **The red,** run 39248196350, job 118045189726: `# fail 8`, `# todo 0`, `# cancelled 0`, exactly TST-652001 to 008.
- **The code.**
  - With a token, `readFileAt` reads 100 commits per request of the batch query, which `readFiles` now shares. A commit
    without the file gives `null`, and a truncated or binary file is read on its own.
  - Without a token, and on GitLab, each commit is one raw read.
  - A clone is read locally. A wrong argument is a `TypeError`, and no commits give an empty map.
  - `readHistory` with `changes: false` was already built and tested, so no test is added for it.
- **CI:** run 39248433880 passed on the head, 20 of 20.
- **Merge-tree:** `git merge-tree --write-tree` onto `sprint/team1/93` (`59642136`) is clean.
- **Replayed in a clean worktree at the head:**
  - `repository-hosts-read-file-at` and `repository-hosts` pass 26 of 26.
  - Counter-proof, for the GitLab path sonnet-d did not plant: with `9dc338fc`'s `gitlab.mjs`, exactly the GitLab test
    fails.
