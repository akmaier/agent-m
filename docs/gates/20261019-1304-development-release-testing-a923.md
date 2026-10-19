---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 2c848283a87c687a8e260a8aab9a63d1e1783e9c
  - https://github.com/akmaier/agent-m/pull/1060
date: 2026-10-19 13:04 UTC
---
# Development → Release testing: ITM-923, passed — the main page's brand link names what it shows

**REGISTER**

## Reason

ITM-923 (MOD-main-page), pull request #1060 into `sprint/team1/94`, passes on `2c848283`.

- **Two commits, one parent each, no merge, both with the trailer `developer-sonnet-b`.**
  - `876d279e` holds only tests, in `tests/site-accessibility.test.mjs` (level `system`) and its helper
    `tests/site-usability.d/routes.mjs`.
    - It removes the todo mark of TST-905033, the brand link's `label-content-name-mismatch`.
    - It adds the counter-proof TST-905112: a planted link whose `aria-label` lacks its visible text is found.
  - `2c848283` changes only `index.html`, which MOD-main-page names as the main page (MOD-main-page.md:79). The brand
    link's `aria-label` now begins with its visible text.
- **The red,** run 39255772299, job 118070552842: `# fail 1`, `# cancelled 0`, exactly TST-905033. The 31 todo are known
  findings.
- **It realises SPEC.md:945,** WCAG 2.2 level AA for every page.
- **CI:** 20 of 20 checks passed on the head (run 39256305202).
- **Merge-tree:** `git merge-tree --write-tree` onto `sprint/team1/94` (`71f5ddb5`) is clean.
- **Replayed in a clean worktree at the head,** with a temporary folder of its own because of the stale Electron lock:
  - TST-905033 and TST-905112 pass.
  - Counter-proof: with `876d279e`'s `index.html`, exactly TST-905033 fails.
