---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - b62d1a077c5e510133a0e7dbf76a7c51bfb2bdd6
  - https://github.com/akmaier/agent-m/pull/1059
date: 2026-10-19 13:01 UTC
---
# Development → Release testing: ITM-675, passed — an entry replaces the sections up to its until

**REGISTER**

## Reason

ITM-675 (MOD-spec-changes), pull request #1059 into `sprint/team1/94`, passes on `b62d1a07`.

- **Two commits, one parent each, no merge, both with the trailer `developer-sonnet-c`.**
  - `4a2f9c05` holds only tests: `tests/spec-changes-entry-span.test.mjs`.
  - `b62d1a07` holds the code: `src/spec-changes/` only.
- **The red,** run 39255751736, job node (11) 118070483989, read from the job's own log: `# fail 2`, `# todo 0`,
  `# cancelled 0`, exactly TST-675001 and 003. TST-675002 guards.
- **The code meets MOD-spec-changes.md:127 and :138** (`until` on an entry and on `proposeSection`).
  - The entry's view, its acceptance, the proposal and the save use the whole span from the anchor up to `until`, not
    including it.
  - The item's assumption that `acceptEntries` already read `until` was wrong, as sonnet-c found.
- **The readings stand:**
  - with no `until`, or no later heading, the span is the anchor's section;
  - the blob shown and recorded is the span's.
- **CI:** run 39256142428 passed 20 of 20 on the head.
- **Merge-tree:** `git merge-tree --write-tree` onto `sprint/team1/94` (`1b3c1b1c`) is clean.
- **Replayed in a clean worktree at the head:**
  - The span test and the batched spec-changes tests pass 8 of 8.
  - Counter-proof: with `4a2f9c05`'s `accept.mjs`, exactly TST-675001 and 003 fail.
