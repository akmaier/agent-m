---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 110f49a5dfd096850d3f1bd696515287f04e1dcd
  - https://github.com/akmaier/agent-m/pull/968
date: 2026-10-19 07:15 UTC
---
# Development → Release testing: ITM-1013, the renderer's tests take their DOM from a helper

**REGISTER**

## Reason

ITM-1013 (MOD-markdown-render), pull request #968 into `sprint/team1/93`, passes on `110f49a5` as refactoring.

1. **Every commit is green and carries its participant's trailer:**
   - `41d4bc30`, developer-sonnet-a (run 39213772923);
   - `110f49a5`, developer-sonnet-b, who built none of ITM-1013 (run 39214145847).
2. **The move is verbatim.** Of the 196 non-empty lines that leave `tests/markdown-render.test.mjs`, all but one stand
   unchanged in `tests/markdown-render-dom.mjs`. The one is a header comment.
3. **The release file is changed by a participant who built none of the item.** `markdown-render-release-20.test.mjs:19`
   imports the helper instead of the test file.
4. **The release file's count falls from 12 to 3, and that is accepted.** The nine that left are `markdown-render.test.mjs`'s
   own tests, which the import ran a second time. They still run in their own file. That second run is what sprint 56's
   agreement forbids.
5. **Green.** `git merge-tree --write-tree` merges the head into `sprint/team1/93` without a conflict (tree `7142bf81`).
