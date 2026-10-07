---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 0636b2b49e33bb7422181c7837aacca65f11c2de
  - https://github.com/akmaier/agent-m/pull/150
date: 2026-10-07 08:06 UTC
---
# Development → Release testing: ITM-207

**REGISTER**

## Reason

ITM-207, the add-product page: pull request #150 by developer-sonnet-c, on head `0636b2b`, branched from `sprint/07` at
`b7e6cc4`. What holds:
- The first commit, `3a133b2`, holds only `tests/settings-pages-add-product.test.mjs`, and CI was red on it: that file
  failed, since `src/settings-pages/` did not exist yet.
- CI is green on the head (python and node).
- Only `src/settings-pages/index.mjs` and `products.mjs`, among the module's Parts, and the new test, whose header names
  MOD-settings-pages, changed.
- The nine new tests name their requirements and the module, and each has its counter-proof recorded.

Why it is rejected: check 5, the Acceptance, does not hold for UC-001's main flow and its flows 4a and 5a.
- UC-001's precondition has the instance's token stored. Step A counts that token as a key that reaches every GitHub
  product, without any check (`products.mjs:98-102`, `242-249`). So the page shows Step A as done and never offers the
  product's own key, which the main flow's step 3 and `A GITHUB PRODUCT USES A TOKEN OF ITS OWN` ask for.
- 4a and 5a show Step A again; the page keeps it done, so a failed check or a refused write leaves no way to store a key.
- No test states 4a, and the main flow's tests run without the instance's token, which is flow 3b.
- Run with the pull request's own test harness, the instance's token stored and a product it does not reach: Step A is
  done before and after the failed check, no token form is offered, and Step C stays enabled.

Weighed as well, and no reason by themselves: `render`'s fourth parameter, a `connect` for the tests, which the `Route` of
MOD-site-frame does not state; and the steps' topics, which MOD-site-frame's `explanations.md` does not hold yet, so each
*What is this?* is empty.

The item is not done; the review at the sprint's end decides what needs more work in the next sprint.
