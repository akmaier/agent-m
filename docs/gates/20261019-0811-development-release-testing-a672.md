---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 0b154cac63cded735b8cad6639b24dc1c4fc4364
  - https://github.com/akmaier/agent-m/pull/984
date: 2026-10-19 08:11 UTC
---
# Development → Release testing: ITM-672, closing the tab with unsaved edits makes the browser ask first

**REGISTER**

## Reason

ITM-672 (MOD-site-frame, MOD-markdown-render, MOD-review-pages), pull request #984 into `sprint/team1/93`, passes on
`0b154cac`. Its texts are accepted: `314fcfee`, accepted with the others in `1c30ad0b`.

1. **Both commits carry the trailer** `developer-sonnet-c`, with no merge.
2. **The red is `da97f7cc`.** Run 39220091003 fails exactly:
   - TST-672001 and 672002;
   - TST-672020 for the reviewed file, the requirement and the SPEC entry, and TST-672021;
   - TST-672010 on the main and the review page.
   TST-672011, its counter-proof, passes on the base.
3. **The change follows the accepted texts:**
   - the Editor states `unsaved()` by the one rule `close` asks by (`src/markdown-render/editor.mjs`), with no copy of the
     baseline (nothing twice);
   - the review pages' route gives `unsaved`;
   - `startPage` has the browser ask on `beforeunload` while the route shown reports it, in the browser's own words.
4. **The Bridge's window is not covered, and that is accepted.** The accepted sentence speaks of "closing or reloading the
   tab", which "makes the browser ask". The Bridge's window is no tab of a browser. That differs from ITM-865, whose
   sentence about a route's failure named no tab.
5. **Counter-proof, replayed by me in a clean checkout of the head:**
   - the three files pass 24 of 24;
   - with `startPage`'s condition never true, TST-672010 fails on both pages.
   The counter-proof tables that plant in `editor.mjs` keep their strings and pass (developer's run).
6. **Green.** CI run 39220497892 passes all twenty jobs, and `git merge-tree --write-tree` merges the head into
   `sprint/team1/93` without a conflict (tree `62015156`).
