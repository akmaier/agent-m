---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 44fc3b38761b28acde9432b9878553e37efc3628
  - https://github.com/akmaier/agent-m/pull/169
date: 2026-10-07 14:16 UTC
---
# Development → Release testing: ITM-207, its second attempt

**REGISTER**

## Reason

ITM-207, the add-product page: pull request #169 by its developer, on head `44fc3b3`, branched from `sprint/08` at
`b63cb58`. What holds:
- The first commit, `8b9211c`, holds only `tests/settings-pages-add-product.test.mjs`. Both commits reached GitHub in
  one push, so CI ran on it through the throwaway pull request #170, and was red there: `src/settings-pages/` did not
  exist yet.
- CI is green on the head (python and node).
- Only `src/settings-pages/index.mjs` and `products.mjs`, and the new test, which names MOD-settings-pages, changed.
- The eleven new tests name what they guard and the module, and each has its counter-proof recorded.
- The first rejection's reasons (`20261007-0806-…-5aee.md`) are met:
  - Step A is shown done only after a check that proves the key reaches the product: a private repository it can write.
    A stored instance token alone does not make it done, and a failed check or a refused write repaints its paste
    field. A test with the instance's token stored states this, and a planted return of the old logic turns three
    tests red.
  - `render` has the three parameters of MOD-site-frame's `Route`, and the steps use ITM-255's topics.

Why it is rejected: check 5. UC-001 step 3 ("after the notice of UC-014, the author pastes the token") and 3c ("Step B
is the familiar notice, paste field and *Store and check*") do not hold.
- GitHub's Step A and GitLab's Step B store the product's key without any notice before the paste field. Neither the
  route nor its topics state that every GitHub Pages site of the same owner can read what this browser stores (`THE
  SHARED PAGES ORIGIN IS DISCLOSED`, which UC-001 realises).
- MOD-settings-pages' file: "every notice a setting needs stands before the setting is stored".
- `add-product-view.mjs`, the item's model, shows that notice with its tick *I have read this* before the token field,
  in both places. No test states the notice.

Noted, no reason by themselves:
- The main flow's test still runs without the instance's token, which is 3b.
- Step B has no folded explanation; UC-001 names no topic for it.
- The view reads the instance's token as MOD-browser-store's `github-token`, which the dashboard does not write yet.

The item is not done; the review at the sprint's end decides what needs more work in the next sprint. ITM-244 and
ITM-245 build on it.
