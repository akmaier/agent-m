---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 7bd3169bcb4b7217e43f4512575323d6f55e7f7e
  - https://github.com/akmaier/agent-m/pull/541
date: 2026-10-16 00:29 UTC
---
# Development → Release testing: ITM-521, its release tests read the page's last element as the test DOM offers it

**REGISTER**

## Reason

ITM-521's release tests, in pull request #541 into `sprint/team1/32`, at head `7bd3169b`. developer-sonnet-e, who
wrote them in #539 and implemented none of the review pages, made the change.

1. **No red commit is required.** The pull request changes release tests only, so check 1 does not apply.
2. **CI is green on the head** (run 38829548068). Its first attempt failed on node (0) at TST-371003, in
   `tests/system-uc-006-approve-spec-change.test.mjs`, a file this pull request does not touch. The re-run passed. I ran
   that file locally with the code of #540 and this fix, and it passed.
3. **The changes are two lines of `tests/release-uc-006-batched-reads.test.mjs`.** In TST-479203 and TST-521201,
   `page.lastElementChild` becomes the page's last child read from `children`. The shared test document offers no
   `lastElementChild`, so as merged in #539 the two tests could never have passed. This changes only how they read the
   page, not what they expect.
4. **The tests** state their values in their own text.
5. **Results.** With #540's code they pass, all three cases of TST-479203 reached. With the new catch removed they fail.
   I ran both: 82 of 82 UC-006 and ITM-521 tests pass, and 3 of them fail without the catch.

**Is order proven?** Neither these tests nor #540's prove that the paragraph comes after what the view drew: in their
scenario the view fails before it draws anything. ITM-521's Acceptance does not ask for the order, though. It asks for
a paragraph naming the limit and its reset and no word of the token, and for a unit test with a counter-proof. The order
is a value the start decision named, and the code shows it holds: the catch calls `target.append`, which adds after any
children. No further test is required. It is noted for the review.

Noted for the review: TST-371003 failed once on CI and passed on its re-run; its cause was not examined.
