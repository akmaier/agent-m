---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 1be6be7dc94b799992a2f10f7dc263ac4cc2bc19
  - https://github.com/akmaier/agent-m/pull/1003
date: 2026-10-19 09:58 UTC
---
# Development → Release testing: ITM-943, passed — the main page reads the stored overview

**REGISTER**

## Reason

ITM-943 (MOD-main-page), pull request #1003 into `sprint/team1/93`, passes on `1be6be7d`.

- **Two commits, one parent each, no merge, both with the trailer `developer-sonnet-b`.**
  - `2e17d95d` holds only tests, with the page's test harness.
  - `1be6be7d` holds the code: `src/main-page/home.mjs`.
- **The red,** run 39233032885, job node (14): `# fail 7`, `# cancelled 0`, `# todo 1`.
  - TST-943001, 002 and 004 are new.
  - TST-827006, 827007, 847002 and 847003 fail because their request counts rise by the one request for the overview. This
    is the item's output.
- **The code meets MOD-main-page and MOD-progress-measures.**
  - With a stored overview for the head, the card takes the shares and waits from it and reads only the scope `build`.
  - Without one, or when the host fails, it reads the scope `all` as before.
  - Until ITM-941 stores the overviews, the one extra request finds nothing. That is the same reading as ITM-907's gate
    (SPEC.md:672-675).
- **CI:** 20 of 20 checks passed on the head (run 39233586671).
- **Merge-tree:** `git merge-tree --write-tree` onto `sprint/team1/93` (`baa42634`) is clean.
- **Replayed in a clean worktree at the head:**
  - `tests/main-page-home.test.mjs` passes 39 of 39.
  - Counter-proof: with the scope always `all`, exactly TST-943002 fails.
