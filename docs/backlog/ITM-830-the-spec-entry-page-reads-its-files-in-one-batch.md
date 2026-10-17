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
