---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 2e6b93ee1b5a03bb0ba6bdf34ed6e1b8d6f19151
  - https://github.com/akmaier/agent-m/pull/1207
date: 2026-10-20 12:27 UTC
---
# Development → Release testing: ITM-1119, passed — the schedule counts the test declarations stored for the commit

**REGISTER**

## Reason

ITM-1119 (MOD-test-pages), pull request #1207 into `sprint/team1/97`, passes on `2e6b93ee`.

- **Three commits, all with the trailer `developer-sonnet-b`.**
  - `016fd034` holds only tests, in `tests/test-pages-schedule-stored-tests.test.mjs` and
    `tests/test-pages-generate.test.mjs` (level `unit`).
  - `90b40738` changes `src/test-pages/schedule.mjs` and `generate.mjs`.
    - The schedule counts from `storedFacts(snapshot).tests` and reads no test file.
    - Without stored facts, it tells `readMany` every test file first.
    - `generate` asks `traceGraph` with the commit.
  - `2e6b93ee` merges `sprint/team1/97` (`d5132684`). `git show --cc` prints nothing.
- **The red,** run 39421284772 on `016fd034`, with `# fail 2` and `# cancelled 0` in each:
  - job 118622564205: exactly tests 187 and 188;
  - job 118622564263: exactly tests 292 and 293.

  Job 118622564317 fails the known 48 and 49, which #1206 fixed.
- **CI:** 20 of 20 checks passed on the head (run 39421669921).
- **Merge:** `git merge-tree --write-tree` is clean with #1204's head and with #1205's head.
- **Replayed in a clean worktree,** together with #1204: 228 tests pass. With the base's `src/test-pages/`, the four new
  tests fail, as recorded in #1204's record.
