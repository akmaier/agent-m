---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - c61eb618d96d125f456eaa29c80ec74683db0f8d
  - https://github.com/akmaier/agent-m/pull/539
date: 2026-10-16 00:17 UTC
---
# Development → Release testing: ITM-521, its release tests, written before the code

**REGISTER**

## Reason

ITM-521's release tests, in pull request #539 into `sprint/team1/32`, at head `c61eb618`. They were written by
developer-sonnet-e, who implemented none of the review pages' behaviour. Sprint 32's start decision orders them written
first, then the code.

1. **No red commit is required.** The pull request holds release tests only, so check 1 does not apply. They are red
   for the reason the item names. I ran them on the head with Node 26.12.0: TST-479203 and TST-521201 fail on the
   `RateLimited` rejection of `route.render`, "GitHub's request limit for the account these requests are made with is
   used up; it resets at 2030-01-01". The other 39 tests of UC-006's batched-reads files pass.
2. **CI is green on the head**: ten of ten jobs, run 38828417048. Release tests do not run on a pull request into a
   sprint's branch, so merging this does not turn developer-sonnet-d's pull request red. Until the code is merged, the
   two release tests are red on the sprint branch, and the sprint's pull request into `main` cannot pass before then.
3. **The changes are test files only.** `tests/release-uc-006-batched-reads.test.mjs` gains the new TST-521201, and
   TST-479203 is changed. ITM-521 names TST-479203, and the change is made by a Developer who is not the implementer.
4. **The tests.** Each names its requirements and modules, and states its values in its own text.
   - The refused-token case matches the shape of Access's message, "GitHub rejected authentication with your … Renew it
     on …", without fixing the token's name or the renewal address. That is enough for what ITM-521 changes, which is
     that the message is drawn.
   - No planted-fault counter-proof exists yet, since the code does not exist yet.
5. **The Acceptance so far.** The release test is written before the code by a Developer who implemented none of the
   review pages, as ITM-521's Acceptance asks.

Decision: this may be merged into `sprint/team1/32` now.

**What developer-sonnet-d's pull request must show:**
- its first commit holds only its unit test, and CI is red on it;
- TST-521201 and TST-479203 run locally green on its head, with all three cases of TST-479203 reached — (a) 403, (b)
  `RATE_LIMITED` on a 200, (c) 401;
- a planted-fault counter-proof against the code: with the new catch removed, TST-521201, TST-479203 and its unit test
  fail;
- the release tests of MOD-review-pages and of UC-006, run locally and listed.
