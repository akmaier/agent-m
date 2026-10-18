---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 460e348ba018ff348211efd1b1596efbff59aa29
  - https://github.com/akmaier/agent-m/pull/911
date: 2026-10-18 16:43 UTC
---
# Development → Release testing: ITM-935, a window opens only once its page shows the address

**REGISTER**

## Reason

ITM-935 (MOD-site-frame, test code only), pull request #911 into `sprint/team1/91`, passes on `460e348b`.

1. **The participant trailer is present** on every commit: `developer-sonnet-e` on `e50cb809`, `ced65705`, and the merges
   `98dd920f` and `460e348b`. `git show --cc` is empty for both merges.
2. **The red is `e50cb809`.** It holds only `tests/site-usability-boot-entry.test.mjs` and
   `tests/site-usability-boot-window.test.mjs`, and TST-935001 and 935004 fail on it.
3. **The change** is only `tests/site-usability.d/browser.mjs`, in the one shared helper, as ruled in 91.md:
   - `ENTRY` (`browser.mjs:100`) tolerates `ERR_ABORTED` from a superseded first load and still quits on any other
     failure;
   - `openWindow` (`browser.mjs:177`) returns only once `location.href` equals the address it opened.
4. **Counter-proofs, replayed by me in a clean checkout of the head:**
   - the entry test and the shard test pass 11 of 11 on the head;
   - with the `ERR_ABORTED` condition removed, so that every load failure quits, the entry test fails 1 of 3.
   The developer's local runs are 20 of 20.
5. **ITM-936's diagram test.** `tests/markdown-render-918-diagram-drawn.test.mjs:60` opens its window with `openWindow` on
   `/__blank`, and `:62` then imports `/src/markdown-render/index.mjs` against that page. With `browser.mjs:177`, the import
   runs only after the page has committed its address, which is the cause developer-sonnet-d named for ITM-936. The
   developer's copy of the 918 test under a held server answer passes 12 of 12 on the head and fails 6 of 6 on the base.
   That is accepted: **ITM-936 is done by ITM-935.**
6. **Green.** CI run 39145435971 on `460e348b` passes all twelve jobs on the first attempt. `git merge-tree --write-tree`
   merges the head into `sprint/team1/91` without a conflict (tree `04dfefd7`).
