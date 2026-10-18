---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 918b8866f37aa55509b8749975d69b2bdf961095
  - https://github.com/akmaier/agent-m/pull/914
date: 2026-10-18 16:03 UTC
---
# Development → Release testing: ITM-927, the look and accessibility checks see a diagram that failed

**REGISTER**

## Reason

ITM-927 (MOD-site-frame, test code only), pull request #914 into `sprint/team1/91`, passes on `918b8866`. It is read as a
check (91.md, `f4cd81e4`).

1. **The participant trailer is present:** `developer-sonnet-e`.
2. **The change** is test code only.
   - `unrenderedFindings()` in `tests/site-usability.d/inspect.mjs` names each `.unrendered` block with its reason.
   - Both checks measure it for each route and width. Their tests are appended, so no identifier moves.
   - `browser.mjs` is untouched, so there is no overlap with ITM-935.
3. **Red is met by its counter-proofs,** since no route holds a failed diagram since ITM-918:
   - a planted failed diagram is named "a block that did not render: \"Diagram error: planted\"";
   - with the selector planted to `.unrendered-x`, TST-904167 and TST-905105 fail.
4. **The live positive I required is measured** (`ITM-927-pre918-usability.log`, recorded in the pull request). It used
   `src/markdown-render/mermaid.mjs` from before ITM-918 (`0cf673ab^`), uncommitted, then restored. The finder named the real
   failures:
   - `#uc/UC-001`: "Diagram error: Cannot read properties of null (reading 'getBBox')";
   - `#arc` and `#module`: "… (reading 'getAttribute')".
   I read both messages in the log.
5. **Green.** CI on `918b8866` passes all twelve jobs. node (6) passed on its rerun, job 117721110377, after ITM-935's
   "/ is loaded" flake. `git merge-tree --write-tree` merges the head into `sprint/team1/91` without a conflict (tree
   `cc33d65c`).
6. **Local runs:**
   - `site-usability`: 167 tests, 0 failed, 3 todo;
   - `site-accessibility`: 108 tests, 0 failed, 32 todo;
   - the boot tests: 15 of 15.
   No existing test changes its result. No release test imports what the item changes.
