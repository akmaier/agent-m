---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 9b962f83964f650316704b330da84cc9cb5918a2
  - https://github.com/akmaier/agent-m/pull/932
date: 2026-10-18 20:44 UTC
---
# Development → Release testing: ITM-951, a fetched legal text's + New version explains the fetch run

**REGISTER**

## Reason

ITM-951 (MOD-settings-pages), pull request #932 into `sprint/team1/92`, passes on `9b962f83`.

1. **The participant trailer is present** on both commits: `developer-sonnet-c`.
2. **The first task found the gap.**
   - `src/settings-pages/library.mjs:409` drew `explain("source-new-version")` only inside the panel.
   - `:413` attached `fetchRun ? result : panel`, so a fetched legal text never showed the explanation.
3. **The red is `a1aa6e6e`.** It holds tests only, and run 39164168937 fails TST-951001 and 951002 there.
4. **The change** is one line of `library.mjs:413`: for a fetched legal text, the explanation stands before the result.
   This satisfies `EVERY STEP EXPLAINS ITSELF` (SPEC.md:1070), with the topic as ITM-915 wrote it.
5. **The tests stand in the existing `tests/settings-pages-library-legal-text-version.test.mjs`.** That file is about a
   fetched legal text's new version, the same concern, and its Guards now name `EVERY STEP EXPLAINS ITSELF`.
6. **Counter-proof, replayed by me in a clean checkout of the head:**
   - the file passes 4 of 4;
   - with the line put back, TST-951001 and 951002 fail.
7. **Green.** CI run 39164417227 passes all twenty jobs, and `git merge-tree --write-tree` merges the head into
   `sprint/team1/92` without a conflict (tree `4a130811`).
