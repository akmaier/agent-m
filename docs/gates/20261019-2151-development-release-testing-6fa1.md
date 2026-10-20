---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 4eb8f494e92c2f0161b15762906eed7dfe4f6bc5
  - https://github.com/akmaier/agent-m/pull/1166
date: 2026-10-19 21:51 UTC
---
# Development → Release testing: ITM-1122, a schema form checks the rows of a section the person edited

**REGISTER**

## Reason

ITM-1122, pull request #1166 into `sprint/team2/97`, passes on `4eb8f494`. CI is green, on 20 of 20 jobs.

1. **Red first.** `b7a6467f` holds only `tests/site-frame-schema-form-rows.test.mjs`, and its run 39328749237 failed.
2. **The fix meets the accepted text.** MOD-site-frame.md:219-224 says an invalid register is never saved. `documentNow` now
   reads an edited section's rows again by its schema, so the checks see them.
3. **A planted fault, repeated by me.** `editedSection` keeping no rows, which is the defect, fails all 3 new tests.
   h's three counter-proofs are in the pull request.
4. **Callers.** The callers of `schemaForm` (the resources, participants, library and implementation pages) pass locally.
5. **Not to be merged yet.** `forms.mjs` imports MOD-documents' `readDocument`, which MOD-site-frame's uses do not name.
   That is the gap of #1139's kind. The use is drafted for akmaier, and the merge waits for an approval record that names
   the draft's blob.
6. **The todo marks** of TST-1041017, TST-1041018 and TST-1041109 are removed by developer-sonnet-g, who did not implement
   ITM-1122, in a commit of its own on this branch.
