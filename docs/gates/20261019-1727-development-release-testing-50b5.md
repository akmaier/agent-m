---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 2c54ef37570d54d71bb8f4e458dab85fe75b8a3d
  - https://github.com/akmaier/agent-m/pull/1112
date: 2026-10-19 17:27 UTC
---
# Development → Release testing: ITM-1023, a commit a job made after its cancel is flagged, and its revert offered

**REGISTER**

## Reason

ITM-1023, pull request #1112 into `sprint/team2/97`, passes on `2c54ef37`. CI is green on the head, on 20 of 20 jobs.

1. **Red first.** `1863204f` holds only tests, and CI failed on it.
2. **The accepted text.** MOD-runtimes' `liveState` reports `writtenAfterCancel`, and `revertAfterCancel` (MOD-runtimes.md,
   Interfaces) is MOD-main-page's *Revert* beside such a commit (MOD-main-page.md:119-122).
   - `trail.mjs` reads the branch named after the job with `readHistory` (`changes: false`), and reverts with
     `readFileAt` and `commitFiles`.
   - `liveState` of a job that ended cancelled reports those commits, and gives `reachable: false` with the host's reason
     where it cannot read.
3. **Readings accepted.**
   - "After" is strictly later than the end's `at`.
   - A missing branch reports none.
   - "From before the first of them" is the parent of the oldest commit given.
   - One *Revert* covers every flagged commit, which is what `revertAfterCancel(record, product, commits, head)` takes.
4. **Callers** (agreements 92 and 95). `liveState` changes its answer only for a job that ended `cancelled`. Before,
   `writtenAfterCancel` was always empty, and no test pinned the empty list for a cancelled job. The merge test of all
   seven open pull requests passes, but for the 4 known local failures.
5. **Scope.** `src/runtimes/` and `src/main-page/jobs.mjs`, the item's two modules, and their tests.
