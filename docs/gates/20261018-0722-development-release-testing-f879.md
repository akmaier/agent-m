---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 9c47b71c43e724d0e00acf40ff4d408fccae4480
  - https://github.com/akmaier/agent-m/pull/855
date: 2026-10-18 07:22 UTC
---
# Development → Release testing: ITM-879, the use case and architecture lists show open changes first, then every file

**REGISTER**

## Reason

ITM-879 (MOD-review-pages), pull request #855 into `sprint/team1/87`, passes on `9c47b71c`. This is ITM-879 as split in
87.md; the history page and its link are ITM-898.

1. **Red first, tests only, by two participants:**
   - `185d91c9` (developer-sonnet-d): the new `tests/review-pages-open-changes-first.test.mjs`, and the two ruled unit
     tests in `review-pages-use-cases` and `review-pages-architecture`.
   - `41b03029` and `b2fecb25` (developer-sonnet-b, who builds none of the item): the release test UC-006 4d in
     `tests/release-sprint-01-dashboard-app.test.mjs`. Its ticks are read from the first part. 87.md had named the wrong
     file for it.
   - Run 39106954780 is red on exactly sonnet-d's five. UC-006 4d does not run in CI's node jobs. Its red is sonnet-b's
     local run ("the open entries stand in a first part").
2. **The change** is only `src/review-pages/flow.mjs`:
   - `section.open-changes` comes first, only while a file is neither accepted nor in SPEC, each with its status and, with
     a token, a tick;
   - then every file with its status;
   - no history link.
   This is the accepted `<k>` sentence without its link, as split. The rebase before the first push rewrote no pushed
   commit.
3. **Green.** Run 39107128744 on `9c47b71c` passes all twelve jobs. `git merge-tree --write-tree` merges the head into the
   current `sprint/team1/87` without a conflict (tree `b7d8220f`).
4. **The Acceptance holds.**
   - I replayed a counter-proof in a clean checkout of the head: with the first part always shown, 2 of 5 of the new tests
     fail. Restored, `src/` is clean.
   - The developer's four counter-proofs each fail their tests.
5. **The reading on the tick in the full list is accepted** (TST-879001 and 879004 assert none).
   - The accepted sentence gives the first part "each with its status and a tick" and the full list "with its status".
   - The text it replaced gave every file "a tick" (`git show bb10b0bf^:docs/architecture/MOD-review-pages.md`). The
     accepted draft moved the tick to the first part, by design.
   - So no tick in the full list is what the change says, not an added word. A tick in both places would also offer two
     controls for one file.
   - sonnet-b's removal of that assertion from 4d is fine, since the unit tests pin it.
6. **Release tests (agreement 83).** I ran on the head every release test that loads the review pages or the live app,
   `release-sprint-01-dashboard-app` with 4d included, together with the sprint's review-pages tests and the Bridge
   packages installed as CI does: 235 tests, 230 pass, 0 fail, 5 todo.
