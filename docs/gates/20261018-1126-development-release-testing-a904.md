---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 7fb0f7cf0fbfb331f57fc587c9a9fb04c6fb6812
  - https://github.com/akmaier/agent-m/pull/886
date: 2026-10-18 11:26 UTC
---
# Development → Release testing: ITM-904, the check that every page shares one look and works on a phone

**REGISTER**

## Reason

ITM-904 (MOD-site-frame, tests only), pull request #886 into `sprint/team1/89`, passes on `7fb0f7cf`.

1. **The check SPEC.md:936-942 names is built.** `tests/site-usability.test.mjs`, with its helpers in
   `tests/site-usability.d/`, draws each route at a phone's width and at a desktop's in the existing Electron 44.5.1 over the
   DevTools Protocol, under xvfb and openbox. That is the pattern of `tests/dashboard-backlog-layout.test.mjs:34-76`, and its
   known positive is run 39119288695, so the stop clause on the engine passed. It checks the three clauses: style sheets,
   target size and width.
2. **Red-first for an item of tests only is met by its counter-proofs.** The item adds no behaviour, so no red of its own
   code is due. The two red runs (`c7cc4f42`, `99cf973b`) were the test's own setup timing out, and they do not count as
   red. What shows that the checks can fail are the planted cases:
   - with `widthFindings`, `targetFindings` or `styleSheetFindings` emptied in `inspect.mjs`, TST-904127, 904128 and 904129
     fail;
   - a planted table wider than a phone, a 10 px button and an embedded style sheet are each found.
3. **Green.** CI on `7fb0f7cf` passes all twelve jobs. The saved node (6) log shows `# tests 613`, `# fail 0` and `# todo 5`.
   `git merge-tree --write-tree` merges the head into `sprint/team1/89` without a conflict (tree `ac8298e4`).
4. **The five todos are the findings of today, all at a phone's width, each named with its route** (`not ok 420`, 432, 450,
   495, 504):
   - `#uc/UC-001`: a Markdown table and a code run;
   - `#arc` and `#module`: the component diagram's source block;
   - `#backlog`: its tables and both charts;
   - `#roles`: its table.
   Every route passes at a desktop's width. No route fails the style-sheet or the target-size clause.
5. **The readings are accepted:**
   - "each route" means the routes the live entry page reaches today. `docs/index.html` still runs `dashboard-app.mjs`.
     When it switches to `start.mjs`, the check's route list follows, and TST-904001 says which routes it draws.
   - A table in a box that scrolls sideways is too wide: the sentence says "without scrolling sideways".
   - The target size is WCAG 2.2's 2.5.8, 24 × 24 CSS px, with its own exceptions for inline targets and spacing.
   - "the site's style sheets" are the sheets the page links. A `style` element inside a diagram's SVG belongs to the
     diagram.
6. **Fix items are registered** with this gate, one per module (SPEC.md:936-942's check names the findings): ITM-917,
   ITM-918, ITM-919 and ITM-920.
7. **No release test imports a file the item changes.** The item changes test files only.

**developer-sonnet-e's next item is ITM-905.**
