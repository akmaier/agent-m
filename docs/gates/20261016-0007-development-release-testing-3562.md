---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - dbb05569a15d811245f67957a3c8e3ae3efc63c0
  - https://github.com/akmaier/agent-m/pull/537
date: 2026-10-16 00:07 UTC
---
# Development → Release testing: ITM-479, the system and release tests of UC-006 for batched reads

**REGISTER**

## Reason

ITM-479's system and release tests, in pull request #537 into `sprint/team1/31`, at head `dbb05569`. They were written
by developer-sonnet-e, who implemented none of the behaviour they test; ITM-479's code is developer-sonnet-d's (#536).

1. **No red commit is required.** The pull request holds release and system tests only and adds no behaviour, so check 1
   does not apply. Against code without `readMany`, TST-479201 and TST-479202 count GraphQL queries the code never
   makes. Eight counter-proofs are recorded in #537.
2. **CI is green on the head**: ten of ten jobs, run 38827461786. Release tests do not run on this pull request. I ran
   them on the head, with UC-006's existing system and release files: 64 tests, 64 passing, none failing.
3. **The changes are test files only.**
   - `tests/system-uc-006-batched-reads.test.mjs` (TST-479101 to TST-479105);
   - `tests/release-uc-006-batched-reads.test.mjs` (TST-479201 to TST-479203);
   - their helper `tests/uc-006-batched-reads-harness.mjs`.
   No existing test, source file or document changed.
4. **The new tests.** Each names its requirements and modules, and states its values in its own text.
5. **The Acceptance holds for what these tests guard.**
   - An impact list names an artifact read in the last batch.
   - Every request goes to `api.github.com` with the token in its header only.
   - A used-up limit on a batched read fails as `RateLimited`, naming the limit and its reset and not the token. A
     refused token fails as `TokenRefused`.

**The page does not draw a used-up limit (SPEC.md, `A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN`).**
TST-479203 is enough evidence for ITM-479. ITM-479's Acceptance asks that a used-up limit is still named and never
blamed on the token, and Access names it. But the requirement asks the dashboard to name the limit, and the SPEC entry's
page does not:
- `showEntry` in `src/review-pages/flow.mjs` has no catch, so a failure after the snapshot rejects `route.render`
  instead of drawing the problem paragraph.
- This is so with per-file reads as well, so it is not caused by ITM-479.
- It lies in MOD-review-pages, which is not among ITM-479's modules.

So it is a finding of the review pages, and a new item, not ITM-479's:
- ITM-521 is registered: a failure while a SPEC entry is shown is named on the page. Its release test is written first,
  by a Developer who implemented none of the review pages.
- It is not added to this sprint. MOD-review-pages uses MOD-test-document, which ITM-518 of Team 2's set changes, and
  the sprint is near its end.

Noted for the review: TST-371101's coverage table does not list the new files. That test is not changed here, since no
existing test changes.
