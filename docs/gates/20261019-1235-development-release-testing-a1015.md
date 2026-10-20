---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 02c38a391eab030ad3ba5ad3c2f564ac70fbc22f
  - https://github.com/akmaier/agent-m/pull/1052
date: 2026-10-19 12:35 UTC
---
# Development → Release testing: ITM-1015, passed — the main page's cards and its list of jobs read the kept products through one function

**REGISTER**

## Reason

ITM-1015 (MOD-main-page), pull request #1052 into `sprint/team1/93`, passes on `02c38a39`.

- **A refactoring, as its Acceptance declares.** "It is declared as refactoring: CI is green on every commit."
  - `1d9e22d3` adds TST-1015001, which states the list's sources as they were. It is green on the old code (run
    39252590776).
  - `02c38a39` holds the refactoring and TST-1015002. It is green (run 39252679442).
  - Both commits have one parent and the trailer `developer-sonnet-b`. No expected result changes.
- **The code.** `sourcesOf` in `jobs.mjs` is the one reader of the kept products, and `home.mjs`'s own copy is gone.
- **The reading stands.** MOD-main-page.md:76-79 counts `sourcesOf` among "the parts of reading jobs that the cards share"
  with the list, so the cards may use it without a draft.
- **CI:** 20 of 20 checks passed on the head.
- **Merge-tree:** `git merge-tree --write-tree` onto `sprint/team1/93` (`b3e0fc72`) is clean.
- **Replayed in a clean worktree at the head:**
  - `main-page-sources`, `main-page-home` and `main-page-jobs` pass 54 of 54.
  - Counter-proof: with a kept product equal to the instance no longer skipped, TST-1015001 fails.
