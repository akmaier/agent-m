---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 949e1194dbd87171169fcf6e07a1d63d05a0ce9f
  - https://github.com/akmaier/agent-m/pull/946
date: 2026-10-19 05:36 UTC
---
# Development → Release testing: ITM-893, an import refuses a token of the other kind of server

**REGISTER**

## Reason

ITM-893 (MOD-settings-pages), pull request #946 into `sprint/team1/93`, passes on `949e1194`.

1. **The participant trailer is present** on both commits: `developer-sonnet-c`.
2. **The red is `d743e832`.** It holds tests only, and run 39204659804 fails exactly TST-893001 to 893003, 893005 and
   893006 (node (7)), and TST-870003, which the item names (node (8)).
3. **The change** is in `src/settings-pages/settings.mjs` and `products.mjs`.
   - `refuseWrongTokens` reads the file with `readExport`, connects each token key, and refuses before `importSettings`.
   - The step from a key back to its address stands once, as `tokenKeyAddress` beside `tokenSettingKey`.
     `repositoryAddress` calls it.
4. **Counter-proof, replayed by me in a clean checkout of the head:**
   - the two files pass 12 of 12;
   - with the refusal not called, TST-893001 to 893003, 893005, 893006 and TST-870003 fail.
5. **Green.** CI run on `949e1194` passes all twenty jobs, and `git merge-tree --write-tree` merges the head into
   `sprint/team1/93` without a conflict (tree `18231965`).
6. **Readings, accepted:**
   - "the file holds" means every token in it;
   - a key with no readable address is stored as pasted (MOD-settings-pages); its finding waits for a four-digit item.
