---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 364d1fe668a6a9a3e4e7ddb09e5a51d4946c986d
  - https://github.com/akmaier/agent-m/pull/885
date: 2026-10-18 11:36 UTC
---
# Development → Release testing: ITM-898, a kind's history of changes opens from its list

**REGISTER**

## Reason

ITM-898 (MOD-review-pages), pull request #885 into `sprint/team1/89`, passes on `364d1fe6`.

1. **Red first, twice, tests only.**
   - `e962656c` is red in run 39121297141 with nine failures.
   - `beca98f1` adds the page of twenty and *Older*, after akmaier accepted the bound (`379c9e6b`). Run 39123230196 is red
     on exactly TST-898001 and 898003 to 898013.
   - `b4b9c6e5` only merges the sprint branch.
2. **The change** is in `src/review-pages/flow.mjs`, `spec-entries.mjs` and `subjects.mjs` (+48/−2), as accepted in
   MOD-review-pages.md `<k>/history` (`5b161c29`):
   - `<k>` ends with a link to `#<route>/id=history`;
   - the page reads `readHistory("docs/approvals", { ref, limit: 20 })`;
   - it lists the records the commits added whose identifier is one of the kind's current files, or carries the `spec-`
     prefix for SPEC entries, as reading 4 accepted;
   - it reads their texts in one batch and reads them with `approvalSchema`;
   - each row shows file, person and date;
   - *Older* appears when a page holds twenty commits, from the parent of the last one.
3. **Green.** CI on `364d1fe6` passes all twelve jobs. GitHub shows mergeable as unknown after #887's merge, but
   `git merge-tree --write-tree` merges the head into the current `sprint/team1/89` without a conflict (tree `e1a63a78`).
4. **The Acceptance holds.**
   - I replayed a counter-proof in a clean checkout of the head: with no `limit`, 5 of 15 of the item's tests fail.
     Restored, `src/` is clean.
   - The developer's second counter-proof, *Older* from the last commit instead of its parent, fails 898011 and 898012.
   - **The cost is bounded.** At this repository's 236 commits, a page costs 25 requests with a token and 37 to 38
     without, whatever the number of commits.
5. **The reading on the address is accepted.** `before=<parent>` is the developer's name for the page's start. The
   accepted text names no address form. The address follows the module's own `id=` form, and the tests follow the link
   rather than the name.
6. **Release tests (agreement 83).** I ran on the head every release test that loads the review pages, together with the
   item's and the module's list tests and the Bridge packages installed as CI does: 221 tests, 216 pass, 0 fail, 5 todo.
7. **The developer's full local run, checked:** 49 failing tests on the head. Their names are the 46 unique names that
   fail on the base, no more and no fewer (`ITM-898-final-names.txt` and
   `ITM-898-base-failing-names.txt` compare equal). So the item adds no failing name. Those failures depend on the
   machine, and CI's run on the head is green.

**developer-sonnet-e takes ITM-878 once this is merged and ITM-905 is done.**
