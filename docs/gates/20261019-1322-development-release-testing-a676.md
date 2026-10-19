---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 33433730e640a2b1f5e6fe5311a3c13e50be2fe8
  - https://github.com/akmaier/agent-m/pull/1068
date: 2026-10-19 13:22 UTC
---
# Development → Release testing: ITM-676, passed — an entry whose anchor is missing names no existing requirement as added

**REGISTER**

## Reason

ITM-676 (MOD-spec-changes), pull request #1068 into `sprint/team1/95`, passes on `33433730`.

- **Two commits, one parent each, no merge, both with the trailer `developer-sonnet-c`.**
  - `e90347ea` holds only tests: `tests/spec-changes-impact-elsewhere.test.mjs` (level `unit`), TST-676001 and
    TST-676002.
  - `33433730` changes only `src/spec-changes/accept.mjs` and `propose.mjs`, which MOD-spec-changes names
    (MOD-spec-changes.md:78-80).
    - `impactOf` takes the requirements the whole target holds when no section holds now.
    - A name the target holds is then "changed" when its source, rule or check differs, and not named otherwise.
    - `entryView`, `proposeSection` and `saveEntry` pass it.
- **The red,** run 39258385310, job 118079371324: `# fail 2`, `# cancelled 0`, exactly TST-676001 and TST-676002.
- **It meets the Acceptance.** A requirement the target holds is named as changed or not at all, never as added.
- **The readings named in the pull request hold:**
  - "added" means held nowhere in the target;
  - a missing section withdraws nothing;
  - the same list goes into the rationale written by `proposeSection`.

  The item said its reading of `waiting for its anchor` (MOD-spec-changes.md:121) is read at the start. The test file's
  header states it.
- **CI:** 20 of 20 checks passed on the head (run 39258774585).
- **Merge-tree:** `git merge-tree --write-tree` onto `sprint/team1/95` (`42e46da5`) is clean, and so is it with #1067's head.
- **Replayed in a clean worktree at the head:**
  - The two tests pass, as do the 143 tests of `tests/spec-changes*.test.mjs`.
  - Counter-proof: with `e90347ea`'s `accept.mjs`, exactly TST-676001 and TST-676002 fail.
