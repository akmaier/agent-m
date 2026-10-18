---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: rejected
on:
  - 6eb31763d957a9b4f90f340ee1613ec418814472
  - https://github.com/akmaier/agent-m/pull/873
date: 2026-10-18 09:36 UTC
---
# Development → Release testing: ITM-909, Review all of the SPEC change entries

**REGISTER**

## Reason

ITM-909 builds MOD-review-pages' `<k>/all` for SPEC change entries. Its pull request #873 into `sprint/team2/90` is
rejected on `6eb31763`: *Review all* leaves out the entries that wait for their anchor, and the accepted texts put
them in the sequence.

- **The accepted texts.** MOD-approvals' `statuses` on `90cfa6e9` gives MOD-review-pages and MOD-spec-changes the
  status accepted (record `831c98f5`). The head changes neither module file.
- **CI.** The tests-only commit `c7e09da0` is red (run 39114961020). The head is green (run 39115445597) on the merge
  with `9f170206`. Since then the sprint's branch has gained #872, which shares no file with this pull request.
- **What holds.** TST-909001 to TST-909004 pass. I replayed five counter-proofs on the head, and each failed its test:
  the filter removed, one record only, the stale check disabled, the count forced to 0, the empty case disabled.
- **Agreement 83, widened.** These ran on the head with `LC_ALL=C`, after the npm install:
  - the 38 release `.mjs` files that import or read a changed file, `release-sprint-02-d-traceability` among them,
    with `load-per-view`: 283 tests, 275 pass, 8 todo, 0 fail;
  - the 6 Python whole-tree readers: 18 passed, 2 skipped.
- **TST-472677.** The accepted `<k>` line names only a link to `<k>/history` (MOD-review-pages.md:175). The link to
  Review all comes from ITM-909's Acceptance.
  - The old assertion gave as its reason "a queue having no page of the kind", which `<k>/all` contradicts
    (:164, :195). So changing it is right.
  - The test's quote of `<k>` ("a link to <k>/all") is not in the module file and is to be corrected.
- **Gap 1: the page leaves out, `acceptEntries` refuses.** The developer's reading is one the texts allow, and no
  module line is needed. `<k>/all` makes leaving out a changed file the page's job (:196-197). `acceptEntries` refuses
  whatever it is handed if any of it is stale (MOD-spec-changes.md:185-186). The page re-reads, leaves out and names the
  changed entries, and hands over the rest once.
- **Gap 2: the entries that wait for their anchor belong in the sequence.**
  - `<k>/all` shows "every open or changed file" (:195), and every status comes from MOD-approvals (:106-107).
  - MOD-approvals keeps an entry open until a record names its text (MOD-approvals.md:43, 96).
  - `A QUEUE IS ACCEPTED IN ITS ORDER` (SPEC.md:1058-1060) offers a waiting entry together with the entry that
    creates its anchor, and so does `acceptEntries` (MOD-spec-changes.md:184-185).
  - Replayed on the head with the test file's fixture (05, 06 and 07, where 06 waits for 05): `#spec-entry/id=all`
    shows 05 and 07, "Accept all 2 shown", and not 06. The list reads "Review all 2 not accepted", although three
    entries are not accepted. The known positive: 05 and 07 are shown.
- **The rework.**
  - Review all shows a waiting entry whose creating entry is in the sequence, and counts it. On that fixture this is
    "Accept all 3 shown", in one commit in the queue's order.
  - A waiting entry whose creating entry is left out is left out and named with it.
  - The comments quote the texts that actually exist.
  - The tests come first, red on their own commit.
