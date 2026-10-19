---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 3559f75d13387b8f5466013e4d5f24c133f7027f
  - https://github.com/akmaier/agent-m/pull/1028
date: 2026-10-19 11:13 UTC
---
# Development → Release testing: ITM-1019, passed — the CI agent's form draws no Workflow field

**REGISTER**

## Reason

ITM-1019 (MOD-settings-pages), pull request #1028 into `sprint/team1/93`, passes on `3559f75d`.

- **Two commits, one parent each, no merge, both with the trailer `developer-sonnet-b`.**
  - `5da7119d` holds only tests. It also takes the Workflow input out of the CI fixtures, in a unit test and a system test.
    Neither is a release test.
  - `3559f75d` holds the code: `src/settings-pages/participants.mjs`.
- **The red,** run 39242276696, job 118025708590: `# fail 1`, `# todo 0`, `# cancelled 0`, exactly "every control of a CI
  agent's form changes the saved row, and no Workflow field is drawn".
- **The code meets UC-017 step 3 as akmaier accepted it at `2f384b79`:** "which model, and where it runs". The Workflow field
  and its state are gone.
- **The earlier route form `workflow <file> on …` is still read when a row is edited.** 93.md asked only that the field go,
  so reading that form is no part of this item.
- **CI:** 20 of 20 checks passed on the head (run 39242626797).
- **Merge-tree:** `git merge-tree --write-tree` onto `sprint/team1/93` (`738fe3ef`) is clean.
- **Replayed in a clean worktree at the head:**
  - `settings-pages-participants` and `system-uc-017-configure-participants` pass 20 of 20.
  - Counter-proof: with `5da7119d`'s `participants.mjs`, exactly the new test fails.
