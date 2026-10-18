---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - d902d30d6ffc028cad2206ddcd3f2f0ff24d0aca
  - https://github.com/akmaier/agent-m/pull/895
date: 2026-10-18 12:53 UTC
---
# Development → Release testing: ITM-911, an approval record holds one line per limitation

**REGISTER**

## Reason

ITM-911, pull request #895 into `sprint/team2/92`, passes on `d902d30d`. I checked it in a clone of my own.

1. The first commit, `88b8915c`, holds only `tests/documents-lines-list.test.mjs`, and CI run 39128534027 is red on it.
2. CI run 39128690464 is green on the head, on its second attempt. The first attempt failed only TST-905001 to TST-905008
   (`tests/site-accessibility.test.mjs`, a headless browser that did not load `/` within 30 s). Those tests reach no
   file of `src/documents/`.
3. Only `src/documents/read-write.mjs`, `src/documents/checks.mjs` and one new test file that names MOD-documents changed.
4. TST-911001 to TST-911004 name A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED and MOD-documents. Five
   counter-proofs are recorded. TST-911001 fails on two different wrong implementations: items joined on one line, and
   only the last line of a key kept (agreement 90).
5. The Acceptance holds. My replay on the head (`gate895.mjs` in the Product Owner's scratchpad) uses a record with the
   limitations `TST-001 — slow, on CI only` and `TST-002 — known bug`:
   - `readDocument` gives both, in order;
   - `writeDocument` gives the text back byte for byte;
   - `documentFindings` gives none.

**Against MOD-documents' accepted text.** MOD-documents.md, accepted at its current blob, states a list "in front matter
one per line, in a table cell separated by commas" (:97). The `lines` shape is "the whole file is `key: value` lines, as
an approval record is" (:65). It says nothing of a list in a `lines` record. MOD-approvals' accepted Data states
`limitation` as "one line per failing test or worse rate". The change takes the item's reading, which fills the silent
case. It contradicts no line of MOD-documents: a section's `key: value` lines (`"line"`) and table cells still separate
by commas.

**Agreements 83 and 89.** On the head, with the Bridge packages installed and LC_ALL=C, I ran every release test file
(`tests/release-*.test.mjs`, 63 files, among them the traceability test) and the tests of MOD-documents, MOD-approvals and
MOD-release-evidence: 454 tests, 445 pass, 1 skipped, 7 todo, and 1 fails. The failure is TST-320321902, the known Node 25
failure that also occurs on `main`.

**For the review, not conditions of this gate:**
- The developer read the book chapters 9, 11, 12 and 13 (AGENTS.md:21) only after the tests-only commit, and the pull
  request says so. This is the breach sprint 90's retrospective names, again. The gate's checks concern the change, and it
  holds.
- `src/release-evidence/report.mjs:376-379` keeps a comment that a reason is recorded without a comma. It is stale once
  this is merged, and it is MOD-release-evidence's to change.
