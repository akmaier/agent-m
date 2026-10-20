---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 9297a555136695766f09cd1b756fa4072c03ba94
  - https://github.com/akmaier/agent-m/pull/1094
date: 2026-10-19 15:11 UTC
---
# Development → Release testing: ITM-1077, this browser's identifier is a setting of the catalogue, a line of the settings page with Clear

**REGISTER**

## Reason

ITM-1077, pull request #1094 into `sprint/team2/96`, passes on `9297a555`. CI is green on the head, on 20 of 20 jobs.

1. **Red first.** `bb7f691d` holds only the tests, and CI failed on it.
2. **The accepted text.**
   - MOD-browser-store at `4c942dfe`, :76 and :83-84: `browser` is in `LITERAL_KEYS`, not secret.
   - MOD-settings-pages at `3dadc3c7`, :137-139: the line "Browser identifier" shows the value with *Clear*, and *not set*
     otherwise. That is the reading ITM-1044 takes.
3. **Scope.** The item named `src/browser-store/catalogue.mjs`, and the head also changes `src/browser-store/index.mjs`.
   - `listSettings` needs the key's description to list it as not secret (MOD-browser-store.md, `listSettings`).
   - That is inside MOD-browser-store, one of the item's modules, and no file outside its two modules changes. So the
     item's narrower path list gives way to its modules.
4. **Counter-proofs.** There are 5. i ran the 108 files that pin the changed returns; only the 4 known base failures
   remain.
