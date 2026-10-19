---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - eb8925ab0150ead76206ca426aeed1a54c82824a
  - https://github.com/akmaier/agent-m/pull/1070
date: 2026-10-19 13:32 UTC
---
# Development → Release testing: ITM-925, passed — a source version's identifier names one version

**REGISTER**

## Reason

ITM-925 (MOD-source-register), pull request #1070 into `sprint/team1/95`, passes on `eb8925ab`.

- **Two commits, one parent each, no merge, both with the trailer `developer-sonnet-d`.**
  - `29beff28` holds only tests (level `unit`):
    - TST-925001 in `tests/source-register-version-fetch.test.mjs`;
    - TST-925002 in `tests/source-register-version-commit.test.mjs`.
  - `eb8925ab` changes only `src/source-register/index.mjs` (MOD-source-register.md:67).
    - `versionCommits` throws `VersionExists { version }` when the identifier is an existing version's and the bytes
      differ.
    - The check follows the `SameBytes` loop, so `SameBytes` keeps precedence.
- **The red,** run 39259894441 on `29beff28`, with `# fail 1` and `# cancelled 0` in each failing job:
  - job 118084490991: exactly test 174, TST-925001;
  - job 118084491095: exactly test 201, TST-925002.
- **It meets the Acceptance and MOD-source-register.md:158.** The refusal names the identifier, and no plan is returned,
  so nothing is recorded. Each test has its known positive or counter-proof:
  - a new identifier is recorded;
  - equal bytes stay `SameBytes`.
- **sonnet-d's reading is kept:** for a repository source, other bytes are another commit, as `SameBytes` already reads a
  commit.
- **CI:** 20 of 20 checks passed on the head (run 39260216170).
- **Merge-tree:** `git merge-tree --write-tree` onto `sprint/team1/95` (`7baa6b53`) is clean.
- **Replayed in a clean worktree at the head:**
  - The 176 tests of `tests/source-register*.test.mjs` and `tests/workflow-entries*.test.mjs` pass.
  - Counter-proof: with `29beff28`'s `index.mjs`, exactly TST-925001 and TST-925002 fail.
