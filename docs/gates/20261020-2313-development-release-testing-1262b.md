---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 8c1c1bd149b8515565883c061d72feaa97967a97
  - https://github.com/akmaier/agent-m/pull/1262
date: 2026-10-20 23:13 UTC
---
# Development → Release testing: ITM-767, an opened test shows its declaration, counter-proof and history

**REGISTER**

## Reason

Pull request #1262 into `sprint/team1/102` does not pass on `8c1c1bd1`. The fix for the rejection on `f71fcfb7`
(`docs/gates/20261020-2256-development-release-testing-1262.md`) finds the commit, but it reads a file's text at the same
commit again on every widening.

1. **The texts are read again: a failure, fixed here.**
   - `removedAt` (`src/trace-pages/test-detail.mjs`, `41eebd01`) reads the history to a limit of 30, then 60, then 120,
     and so on. On each round it calls `host.readFileAt(declaration.path, commits.map(...))` for every commit of that
     round, so the commits of every earlier round are read again.
   - On TST-767010's history of more than 42 commits, the file's text at the 30 newest commits is read twice.
   - `A PAGE LOAD READS THE REPOSITORY IN BATCHES` (SPEC.md:672-675) reads: "a file whose blob the page has read already is
     not read again". A file's text at a commit is that blob.
   - **The way back:**
     - first, a commit that holds only tests: over a counting fake, a removal more than 30 commits back reads the file's
       text at each commit once, and its CI is red;
     - then the fix: each round reads the texts of only the commits not read before.
   - `readHistory` is read again on each round. Its `options` give a `limit` and no offset (MOD-repository-hosts.md:192),
     and a history is no file's blob, so that stays.
2. **The rest of the change answers the rejection.** The reds were read from the raw logs by the Scrum Master:
   - `627b8e9a`: TST-767010 names the commit 42 file-commits back; job 118934565803, "# fail 1", "# cancelled 0";
   - `bceafdc7`: job 118935343423, "# fail 1";
   - `507f83b6`: TST-767011, a history that never shows the removal says so and the page ends; job 118936446337,
     "# fail 2".
   The merge `8c1c1bd1` has an empty `git show --cc`, and `git merge-tree` with `sprint/team1/102` at `394d4940` is clean.
3. **5b** stays with ITM-1168.
