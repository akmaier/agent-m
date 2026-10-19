---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - d3c707f11bc2d55bcbc248d215a8da474d9e8505
  - https://github.com/akmaier/agent-m/pull/1019
date: 2026-10-19 10:52 UTC
---
# Development → Release testing: ITM-1070, passed — productFacts asks no live state and takes no bridges

**REGISTER**

## Reason

ITM-1070 (MOD-progress-measures, with its callers), pull request #1019 into `sprint/team1/93`, passes on `d3c707f1`.

- **Two commits, one parent each, no merge, both with the trailer `developer-sonnet-c`.**
  - `2fe6a0c6` holds only tests, in three test files.
  - `d3c707f1` holds the code.
- **The red,** run 39239999247: `# fail 7` and `# fail 2`, `# cancelled 0`. The failures are the existing scope tests and
  TST-1070001: the old `productFacts` reads the options as `bridges` and loses the scope. The 4 todo are known findings of
  other items.
- **The code meets MOD-progress-measures as akmaier accepted it at `62ba5138`.**
  - `productFacts(host, instance, instanceAt, now, options?)` takes no `bridges` and asks no live state.
  - Its four callers (`prompt-bar/hand-over.mjs`, `workflow-entries/product.mjs`, `workflow-entries/instance.mjs`,
    `main-page/home.mjs`) pass none. They change because the interface they call changes, so their modules join the item,
    as MOD-browser-store joined ITM-1073.
  - The item's Acceptance still stated the text before the acceptance. It is brought in line with the accepted text.
- **CI:** run 39240221817 passed 20 of 20 on the head.
- **Merge-tree:** `git merge-tree --write-tree` onto `sprint/team1/93` (`0bf10b70`) is clean.
- **Replayed in a clean worktree at the head:**
  - The three changed test files pass 36 of 36.
  - Counter-proof: with `2fe6a0c6`'s `facts.mjs`, `progress-measures-product-facts` fails 7.
