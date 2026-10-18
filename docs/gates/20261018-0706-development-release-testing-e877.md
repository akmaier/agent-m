---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 9910633af619125aedb4bb803b7682d0acb1be3f
  - https://github.com/akmaier/agent-m/pull/854
date: 2026-10-18 07:06 UTC
---
# Development → Release testing: ITM-877, Review all opens each difference at its first change

**REGISTER**

## Reason

ITM-877 (MOD-review-pages), pull request #854 into `sprint/team1/87`, passes on `9910633a`.

1. **Red first.** `57d4e339` holds only `tests/review-pages-first-change-centred.test.mjs`. Run 39105870110 is red on
   exactly TST-877001 to 877004. TST-877005 (the difference's box scrolls, `docs/assets/style.css:68`) and TST-877006 (a
   first change near the top gives `scrollTop` 0) pass on the base, as known positives.
2. **The change** is only in `src/review-pages/flow.mjs`:
   - each difference shows the whole file (`showDifference(…, { context: Infinity })`, MOD-markdown-render.md:73), as
     read in `7e42507a`;
   - `centreFirstChange` sets each box's `scrollTop` so that the first changed line's middle stands at the box's middle,
     never below 0;
   - it is called after the section is appended to the page, on Review all and on a file's page.
   This is the sentence akmaier accepted in MOD-review-pages.md (`<k>/<id>`, `<k>/all`): "in a box of its own that
   scrolls, opened with its first change in the middle of the box".
3. **Green.** Run 39106149070 on `9910633a` passes all twelve jobs. `git merge-tree --write-tree` merges the head into the
   current `sprint/team1/87` without a conflict (tree `ef961361`).
4. **The Acceptance holds.**
   - I replayed a counter-proof in a clean checkout of the head: without the two calls of `centreFirstChange`, 3 of 6
     fail. Restored, `src/` is clean.
   - The developer's four counter-proofs each fail their tests: centring on the line's top, no lower bound of 0, centring
     on the last change, and no call.
5. **Release tests (agreement 83).** I ran on the head every release test that loads the review pages or the live app,
   with the item's file, the sprint's other review-pages tests and the Bridge packages installed as CI does: 230 tests, 225
   pass, 0 fail, 5 todo.

**For the release review.** The centring needs the box's geometry, so it acts only once the box stands in the page. In the
tests a fixture DOM gives that geometry. That the live page shows it centred is checked when akmaier looks at the page.
`const shortBody =(body)` lost a space, which is cosmetic.

**developer-sonnet-d's next item is ITM-879. Then developer-sonnet-e takes ITM-878.**
