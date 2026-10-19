---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - dafced1a62fa1328935e4ca27884664eb463fe04
  - https://github.com/akmaier/agent-m/pull/935
date: 2026-10-18 20:59 UTC
---
# Development → Release testing: ITM-512, the endpoints route says whether a model can use tools

**REGISTER**

## Reason

ITM-512 (MOD-settings-pages), as narrowed in 92.md, pull request #935 into `sprint/team1/92`, passes on `dafced1a`.
MOD-settings-pages is accepted at `0ceb9002` (`9afe4af4`).

1. **The participant trailer is present** on both commits: `developer-sonnet-a`.
2. **The red is `ec531b9e`.** It holds tests only, and run 39164632538 fails TST-512001 to 512004, 512006 and 512007.
   TST-512005 (a 401) and TST-512008 (the last test stays `{ at, outcome }`) pass on the base by design.
3. **The change** is `src/settings-pages/endpoints.mjs` only. `showResult` shows "✓ <model> is working, can use tools." or
   "… text only.", with the endpoint's message folded for text only. Both the direct path and the Bridge path use it.
   The words come from MOD-settings-pages.md:166-169 and UC-003 5a. The class and the summary's words are the
   developer's, since no text names them.
4. **A 400 that refuses tools counts as working and text only,** as `testEndpoint` returns it
   (`src/endpoint-calls/index.mjs:216`). TST-265001's constructed answer, text with no tool call, is read the same way.
5. **Counter-proof, replayed by me in a clean checkout of the head:**
   - the file passes 24 of 24;
   - with the fold never drawn, TST-512002, 512004 and 512007 fail.
6. **Green.** CI run 39164917247 passes all twenty jobs, and `git merge-tree --write-tree` merges the head into
   `sprint/team1/92` without a conflict (tree `23c5368b`).
7. **The two other parts** are ITM-998's and ITM-999's.
