---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 0a640fa65d3024784c559a562a537142305560ea
  - https://github.com/akmaier/agent-m/pull/896
date: 2026-10-18 12:57 UTC
---
# Development → Release testing: ITM-910, the release test reports are a kind of the review pages, with Review all

**REGISTER**

## Reason

ITM-910, pull request #896 into `sprint/team2/92`, passes on `0a640fa6`. I checked it in a clone of my own.

1. The first commit, `4f7bf78a`, holds only `tests/review-pages-release-reports.test.mjs`, and CI run 39128580069 is red on it.
   CI run 39129038970 is green on the head, on all 12 jobs.
2. The change is in `src/review-pages/` (`kinds.mjs`, `flow.mjs`, `index.mjs`), a new test naming MOD-review-pages, and
   two existing test files.
   - TST-472605 names MOD-review-pages and lists the module's routes. The accepted MOD-review-pages.md:145 names
     `release-report` among the kinds, so the expected list gains that route.
   - `tests/site-usability.d/routes.mjs` is MOD-site-frame's route table. TST-904001 requires a row for every route of the
     view, so a new route needs one. Team 1 told team 2: "Tests of an item's own output are changed in that item's pull
     request, whatever module their header names" (`docs/backlog/sprints/team1/89.md`, For Team 2, point 5; agreement 91).
     Team 1's sprint 89 is merged, and no team 1 sprint 90 record exists, so this touches nothing team 1 holds.
3. TST-910101 to TST-910103 name their requirements and MOD-review-pages. Four counter-proofs are recorded, and TST-910101
   fails on three different wrong implementations.
4. The Acceptance holds, by reading and by the tests: the list, one report with *Accept*, and `<k>/all` with only the open
   report and *Accept all 1 shown*, which writes one record of kind `release-report` naming the blob shown.

Agreements 83 and 89: on the merge of the head with the sprint head `fee9e27b`, with the Bridge packages and LC_ALL=C, I
ran every release test file, every `tests/review-pages-*` file and `tests/site-usability.test.mjs` and
`tests/site-accessibility.test.mjs`: 917 tests, 871 pass, 1 skipped, 44 todo, and 1 fails. The failure is the known
TST-320321902.

With ITM-913 (#894, `16c7cb30`) in `src/approvals/`, the three new tests and every `tests/review-pages-*` test pass
(359 of 359). `reviewedFiles` adds a report only where `statuses` has none (`!all.has(path)`). The kind has no
`restsOn`, so `acceptanceBlockers` is not called for a report (`flow.mjs:359, :535`).

**For the review, not conditions of this gate:**
- `<k>/all` for reports gives one commit per report. `acceptAndRelease` releases one report per call, while
  MOD-review-pages.md says "one commit with one record per file shown". With the one report the Acceptance names, both
  readings agree.
- The extra sections that MOD-review-pages.md lists for a report, the limitations and the changelog entry, are not built,
  because the item does not name them. A red report is therefore refused with LimitationMissing. This needs a backlog item.
- Adding a row to the route table shifts the identifiers of the generated TST-904 and TST-905 tests that follow it. This
  is how team 1's `site-usability` and `site-accessibility` tests number them, and it goes to team 1.
- The tests depend on the date, through `acceptAndRelease`'s real clock, as the existing release-evidence tests do.
