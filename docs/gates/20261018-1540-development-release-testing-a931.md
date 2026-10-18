---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 20ab8a4add89e0d080014634724329fcc06532fb
  - https://github.com/akmaier/agent-m/pull/912
date: 2026-10-18 15:40 UTC
---
# Development → Release testing: ITM-931, the editor's preview that scrolls can be focused

**REGISTER**

## Reason

ITM-931 (MOD-markdown-render), pull request #912 into `sprint/team1/91`, passes on `20ab8a4a`.

1. **The participant trailer is present** (sprint 90's agreement). Both commits carry `Agent-M-Participant:
   developer-sonnet-d`.
2. **Red first.** `866b7033` holds only tests. Run 39140862079 is red on TST-931001 to 931003 and TST-905072.
   - `tests/markdown-render-931-preview-focus.test.mjs` checks `tabindex="0"` on open, after an input and after a draft is
     shown.
   - `tests/site-accessibility.test.mjs` gains TST-905072 to 905074: no `scrollable-region-focusable` on the three edit
     pages at both widths, with a known positive and a planted counter-proof. Their todo text drops "scroll", the item's own
     output under `d995c09b`.
3. **The change** is one line in `src/markdown-render/editor.mjs`: `preview.setAttribute("tabindex", "0")`. The reading that
   "can be focused" means `tabindex="0"` follows ITM-921's difference boxes.
4. **Green.** CI on `20ab8a4a` passes all twelve jobs. node (3) passed on a rerun, job 117716156667. Attempt 1 failed on the
   two `openWindow` flakes ITM-935 fixes (TST-918001 to 918006 and TST-904001 to 904133), in files this item does not touch.
   `git merge-tree --write-tree` merges the head into `sprint/team1/91` without a conflict (tree `d933f758`).
5. **The Acceptance holds.**
   - I replayed the counter-proof in a clean checkout of the head: without the line, TST-931001 to 931003 fail. Restored,
     `src/` is clean.
   - The developer's counter-proof fails TST-905072 too.
6. **Release tests (agreement 83).** I ran on the head, with the Bridge packages installed as CI does: the editor's tests,
   the markdown-render tests, `release-uc-018-edit-dashboard`, `release-sprint-01-dashboard-app` and
   `release-sprint-02-a-dashboard-app`. That was 96 tests, 93 pass, 0 fail, 3 todo.

**Overlap, noted:** ITM-935 touches the first lines of `before` in `site-accessibility.test.mjs`, and ITM-937 will rename
TST-905072 to 905074 to identifiers by route. Both come after this merge, within the same developer's module.
