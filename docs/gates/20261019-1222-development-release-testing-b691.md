---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 8b468cd9ad298d31014bf9f6bb497534cfa3b4a9
  - https://github.com/akmaier/agent-m/pull/1048
date: 2026-10-19 12:22 UTC
---
# Development → Release testing: ITM-691, rejected — its implementer changes a release test, and deletes a test the text has rewritten

**REGISTER**

## Reason

ITM-691 (MOD-workflow-entries, MOD-spec-changes), pull request #1048 into `sprint/team1/93`, is rejected on `8b468cd9`.

**What holds.**
- Two commits, one parent each, with the trailer `developer-sonnet-e`.
- The red is `16e228ff`, run 39250058863: exactly TST-691001 and 002.
- `apply-approvals.yml` runs only `onApprovalsCommitted`, and `tools/apply_approvals.py` and
  `docs/assets/review-core/apply-approvals.mjs` go, as MOD-spec-changes.md:84 and MOD-workflow-entries say.
- The behaviour that differs from the old tool follows `applyApproved`'s accepted text. Proposals are written as they stand,
  CRLF is kept, a section runs to the next heading, the first of two equal headings wins, and the refusals are
  `applyApproved`'s.

**What fails.**
- **A release test changed by the implementer.** `16e228ff` removes three ITM-016 tests from
  `tests/release-sprint-02-c-review-core.test.mjs`, a test of level `release`. SPEC.md:1501-1503 RELEASE TESTS ARE NOT
  WRITTEN BY THE IMPLEMENTER: "A test of level `release` is generated or written by a participant other than the one that
  implemented the behaviour it tests." developer-sonnet-e implements ITM-691.
- **A test deleted that the text has rewritten.** MOD-spec-changes.md:85 says of these tests that "one of only the old writer
  is rewritten on `applyApproved`". `tests/review-core.d/apply-approvals.test.mjs` is that test, and it is deleted. The
  accepted text decides over the item's Acceptance, which allowed it to go.

**What passes on the next head.**
- The changes to `release-sprint-02-c-review-core.test.mjs` are made in a commit of their own by a participant who builds
  none of ITM-691.
- `tests/review-core.d/apply-approvals.test.mjs` is rewritten on `applyApproved`, not deleted.
- The stale comments sonnet-e names may stay. They are no part of this item.
