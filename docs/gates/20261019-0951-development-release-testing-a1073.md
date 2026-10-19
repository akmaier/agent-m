---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 6e253421375c411a79f375805226db09f1ce4d97
  - https://github.com/akmaier/agent-m/pull/1000
date: 2026-10-19 09:51 UTC
---
# Development → Release testing: ITM-1073, passed — the resources page keeps a resource's key in this browser

**REGISTER**

## Reason

ITM-1073 (MOD-settings-pages, and now MOD-browser-store), pull request #1000 into `sprint/team1/93`, passes on `6e253421`.

- **Four commits, one parent each, no merge, all with the trailer `developer-sonnet-c`.**
  - `e63380fc` and `05caafb4` hold only tests.
  - `ba117b41` holds the code.
  - `6e253421` changes `tests/test_settings_page.py`, a component test, to give the new setting its place. The test
    changes as this item's output.
- **The red,** each job with `# cancelled 0`:
  - run 39232160765 on `e63380fc`: `# fail 3`, exactly the three resources key tests;
  - run 39232327410 on `05caafb4`: `# fail 1`, the `browser-store` test, in one job, and the same 3 in another. The 32 todo
    are known findings of other items.
  - That `ba117b41` was pushed before `05caafb4`'s run ended changes nothing: both reds stand in CI's logs.
- **MOD-browser-store joins the item.**
  - MOD-browser-store.md:75 lists `resource-key:<name>`, and `writeSetting` refused it as unknown.
  - So the change to `src/browser-store/catalogue.mjs` and `index.mjs` makes that module's code follow its accepted text.
  - The item names the module now. The map shows no other team's held item on it.
- **The code meets MOD-settings-pages.md:200-201.** An entry whose secret is `browser` has a field for its key, stored as
  `resource-key:<name>` on the person's click, and the key appears nowhere else.
- **CI:** run 39232831532 passed 20 of 20 jobs on the head.
- **Merge-tree:** `git merge-tree --write-tree` onto `sprint/team1/93` (`1e244d5e`) is clean.
- **Replayed in a clean worktree at the head:**
  - `browser-store-resource-key` and `settings-pages-resources` pass 25 of 25, and `test_settings_page` passes.
  - Counter-proof: without `resource-key:` in the catalogue's key families, 2 fail.
