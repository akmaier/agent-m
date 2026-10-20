---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - b9e9e28413356b90d227f0aa6495f63909aaf66e
  - https://github.com/akmaier/agent-m/pull/1204
date: 2026-10-20 12:27 UTC
---
# Development → Release testing: ITM-1118, passed — onMainChanged names the stored facts in its summary and its workflow

**REGISTER**

## Reason

ITM-1118 (MOD-workflow-entries), pull request #1204 into `sprint/team1/97`, passes on `b9e9e284`.

- **Three commits, all with the trailer `developer-sonnet-b`.**
  - `7b327d63` holds only tests, in `tests/workflow-entries-main-changed.test.mjs` (level `unit`).
  - `864c0468` changes `src/workflow-entries/instance.mjs` and `.github/workflows/main-changed.yml`. The workflow is named
    in MOD-workflow-entries' parts (MOD-workflow-entries.md:115).
  - `b9e9e284` merges `sprint/team1/97` (`d5132684`). `git show --cc` prints nothing.
- **The red,** run 39420341462 on `7b327d63`:
  - job 118619423664: `# fail 3`, `# cancelled 0`, exactly tests 341, 342 and 344;
  - job 118619423915 fails the plan page's tests 48 and 49 (the clash of #1201 and #1202), which #1206 fixed.
- **CI:** 20 of 20 checks passed on the head (run 39421693396).
- **Merge:** `git merge-tree --write-tree` is clean with #1207's head and with #1205's head.
- **Replayed in a clean worktree, with #1207's head merged in:**
  - The 228 tests of `tests/workflow-entries*`, `tests/test-pages*` and `tests/progress-measures*` pass.
  - Counter-proof: with `d5132684`'s `src/workflow-entries/`, `src/test-pages/` and workflow, exactly the seven new tests
    of ITM-1118 and ITM-1119 fail.
