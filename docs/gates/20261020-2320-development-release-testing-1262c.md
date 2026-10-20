---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 31c7de0b19a39cd495131faa788eaa196366ac51
  - https://github.com/akmaier/agent-m/pull/1262
date: 2026-10-20 23:20 UTC
---
# Development → Release testing: ITM-767, an opened test shows its declaration, counter-proof and history

**REGISTER**

## Reason

Pull request #1262 into `sprint/team1/102` passes on `31c7de0b`. CI is green on 23 of 23 checks (run 39513921222). The
rejections on `f71fcfb7` and `8c1c1bd1` are answered.

1. **Each commit's text is read once, tests first.**
   - `3510d44d` holds only tests: TST-767012. Over TST-767010's history of 42 commits, `readFileAt` is asked for 42
     commits, none twice. Job 118940439518 reads `not ok 316`, then "# fail 1" and "# cancelled 0".
   - `31c7de0b` is the fix. `removedAt` keeps the texts of earlier rounds and reads only the commits not read before.
     `readHistory` is read again per round, as the second rejection allowed.
2. **The earlier rounds** stand as recorded:
   - TST-767010 and 767011 were red first;
   - 5b is cut into ITM-1168;
   - the scope is `src/trace-pages/`, `src/repository-hosts/web-links.mjs` and their tests.
3. **The replay**, in a clean worktree at `31c7de0b`, with a private `TMPDIR`:
   - **The module tests:** `tests/trace-pages*`, `tests/repository-hosts*` and the gaps system test, 392 of 401 pass.
     - The 9 that fail are in `repository-hosts-clone` and `repository-hosts-contains-commit`. They fail with "git config
       user.name Seed Writer failed" under the replay's relative `TMPDIR`.
     - They fail the same way, 9 of 13, with those files and `src/` at the base `394d4940`.
     - The change touches neither, and CI passes them. So they are the replay's environment, not this change.
   - **The counter-proof:** with `src/` checked out at `394d4940`, `tests/trace-pages-test-detail.test.mjs` and
     `tests/repository-hosts-web-links-file.test.mjs` fail 15 of 15.
   - **All 72 release-test files:** 435 pass, 0 fail, 9 `todo`, as at the base.
4. **The merge.** `git merge-tree` with `sprint/team1/102` at `394d4940` is clean.
