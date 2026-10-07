---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - bda70771ff63f8e1ffb5f5607d8257da313a3876
  - https://github.com/akmaier/agent-m/pull/161
date: 2026-10-07 13:13 UTC
---
# Development → Release testing: ITM-255

**REGISTER**

## Reason

ITM-255, the explanations of adding a product and of a release: pull request #161 by developer-sonnet-c, on head
`bda7077`, branched from `sprint/08` at `7815b0a`.
- The first commit, `14ed009`, holds only `tests/site-frame.test.mjs`, and CI was red on it. The node job failed on
  exactly the eight new tests, beside the suite's known todo marks.
- CI is green on the head (python and node).
- Only `src/site-frame/explanations.md`, with eight topics appended, and `tests/site-frame.test.mjs`, which names
  MOD-site-frame, changed. The file's existing tests are unchanged, and its `Guards:` line now names UC-001 and UC-013 too.
- Each new test names what it guards — `EVERY STEP EXPLAINS ITSELF` and its step of UC-001 or UC-013 — and has its
  counter-proof recorded in the pull request.
- The Acceptance holds. `explain` gives the five topics UC-001 names — `repository`, `product-key`,
  `review-layout-commit`, `reverting-the-commit`, `the-product-list` — and the three UC-013 names —
  `release-test-levels`, `independent-release-tests`, `version-not-rewritten` —, each with the text the use case asks of
  it. ITM-207 and ITM-256 name these slugs.

Noted for the review, no reason by itself: `reverting-the-commit` says the commit can be reverted "from there" on
GitHub. GitHub's web pages offer *Revert* for a merged pull request, not for a single commit; GitHub Desktop offers
*Revert changes in commit*. The dashboard's add-product page says the same today (`add-product-view.mjs:104`).
