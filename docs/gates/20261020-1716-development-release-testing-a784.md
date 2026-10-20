---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 9b4fa2be4b805b39c577006310b847687a465a8f
  - https://github.com/akmaier/agent-m/pull/1227
date: 2026-10-20 17:16 UTC
---
# Development → Release testing: ITM-784, passed — the board pulls an item only below the work-in-progress limit

**REGISTER**

## Reason

ITM-784 (MOD-implementation-pages), pull request #1227 into `sprint/team1/100`, passes on `9b4fa2be`.

- **Four commits, all with the trailer `developer-sonnet-e`.**
  - `792c87c2` holds only tests: `tests/implementation-pages-board.test.mjs`.
  - `2f7681bf` holds only tests. Its selectors read tag names, and "waiting for review" is matched without case.
  - `42955ec5` changes:
    - `backlog.mjs`, with the route `board`;
    - `implement.mjs`, where `item=` ticks only that item;
    - `index.mjs`.
    - `assignmentOf` moves from `implement.mjs` to `backlog.mjs` to avoid an import cycle, inside the module.
    - The participant list's `participantSchema` and `participantsOf`, which it now imports there, are among
      MOD-implementation-pages' uses (MOD-implementation-pages.md:78-79).
  - `9b4fa2be` merges `sprint/team1/100` (`525466af`). `git show --cc` shows its one resolution: the import line from
    MOD-work-plans keeps both sides, `endSprint` (ITM-783) and `startable` (this item).
- **The red.** The first run on `792c87c2` was cancelled, so the Product Owner reran it.
  - Run 39462756624, job 118771749165: `# fail 5`, `# cancelled 0`, exactly tests 42 to 46.
  - `2f7681bf` is red on the same five (run 39463084315).
- **sonnet-e's readings are kept:**
  - the columns Backlog, Doing, Review and Done;
  - Review as in progress with a pull request;
  - *Pull* as a link to `#implement/item=<id>`, or a disabled button with `startable`'s reasons;
  - the limit per team.
- **CI:** 23 of 23 checks passed on the head (run 39463925236).
- **Replayed in a clean worktree at the head,** with the Bridge's packages installed as CI installs them and a temporary
  folder of its own:
  - The 113 tests of `tests/implementation-pages*`, `tests/dashboard-backlog*` and `tests/trace-graph-import*` pass,
    TST-106805 among them.
  - `test_progress_derived` is OK.
  - The release tests that touch the backlog or MOD-implementation-pages pass: 11 files with 141 tests.
  - Counter-proof: with the sprint branch's `src/implementation-pages/`, the five board tests fail.
