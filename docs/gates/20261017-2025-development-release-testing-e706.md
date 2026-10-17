---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 36404760b95e62f0f2b5b6f045d95013f992e277
  - https://github.com/akmaier/agent-m/pull/769
date: 2026-10-17 20:25 UTC
---
# Development → Release testing: ITM-824, An issue's notes are read back, and its labels are named

**REGISTER**

## Reason

ITM-824, pull request #769 into `sprint/team2/78`, at head `36404760`.

1. The first commit `ff481c11` holds only `tests/mail-records-notes.test.mjs`, and CI run 39066269493 was red on it.
2. CI run 39066444146 is green on `36404760`, ten of ten.
3. Changed files: `src/mail-records/index.mjs` and `src/mail-records/issue-marks.mjs` (the module's folder, where the
   accepted file places `notesOf` and `issueLabels`) and `tests/mail-records-notes.test.mjs` (new, names
   MOD-mail-records). No existing test changed.
4. TST-824001 to TST-824005 each name a requirement and MOD-mail-records, with counter-proofs recorded. Three were
   replayed on the head (the reply-sent anchor, `not_reproducible`, item-added as closed-with); each failed as recorded.
5. The Acceptance holds as far as the tests show. What the accepted file leaves open — `Note.date` of item-added and
   closed-with taken from the comment's `createdAt`, subject `""` for a closed-with text without an item — is named in
   the pull request, and no test asserts it; a replayed date-source fault fails no test, as the item's Outcome requires.
