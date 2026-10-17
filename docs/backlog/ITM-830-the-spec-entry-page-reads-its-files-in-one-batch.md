---
id: ITM-830
title: The SPEC entry page reads its files in one batch
level: unit
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
modules:
  - MOD-review-pages
builds_on:
  - ITM-710
tests:
  - unit
origin:
  - ITM-710's draft stop (sprint team1/76), from developer-sonnet-d's draft and count
---
# ITM-830 The SPEC entry page reads its files in one batch

**REGISTER**

## Outcome

ITM-710's draft batched the files of a SPEC change entry's page. With a token, `#spec/<queue>/01` fell from 11 requests to
6 at this repository's size: SPEC.md, the proposal, the rationale, `docs/sources.md` and two SRC files, read as one batch
(`src/review-pages/spec-entries.mjs`, `queueService.view` and `sourcesOf`).

It changes the counts of `tests/system-uc-006-batched-reads.test.mjs` (TST-479101, 479103 and 479104) and of release test
`release-uc-006-batched-reads` (TST-479201 and 479202). The system test names MOD-repository-hosts and MOD-trace-graph,
which sprint 76 left free for team 2 (`76.md`). So it is its own item, selected at a start that checks team 2's holds
(SPEC.md:1663).

Before its red commit, two things are explained:
- the +2 of TST-479101 on its fixture;
- the +1 of TST-479104. If that comes from the added `holder.readMany` in `sourcesOf`, the call goes.

The release cases are changed by a participant who builds none of this item, with their expected results kept or each
change named.

## Acceptance

- `#spec/<queue>/01` reads its files in one batch, with a token, and a committed test counts it.
- No file is read twice, and no other route's count rises.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**Decided at its draft stop (sprint team1/77, 2026-10-17, po-opus).**
- **The counts are explained,** each with a stack probe. TST-479101's total falls from 21 to 20, and its "+2" is the size
  of a new third query. TST-479104's fourth query is the entry page's batch, not `sourcesOf`.
- **The named changes of the system test are accepted:**
  - TST-479101: the queries name [2, 1, 2, 100×13, 31], no own GET, 17 queries, at most 20 requests;
  - TST-479103: three files, 17 queries;
  - TST-479104: four queries.

  The total falls in each. They are fixed before the red, as sprint 56's agreement asks.
- **The named changes of the release tests are accepted.** TST-479201 allows at most 17 queries, its 22-request bound
  kept. TST-479202 allows 14 to 17. Each raises a query bound by one, while the requests fall. developer-sonnet-b makes
  them on this item's branch, before the gate.
- **The `readMany` in `sourcesOf` is dropped.** No test reaches it, and the entry page's own batch already holds the
  register. A product's entry page, whose register is in the instance, is ITM-844, test first.
- **The reading gap closes before the red commit:** AGENTS.md and SPEC.md as files, and chapters 9, 11, 12 and 13.
