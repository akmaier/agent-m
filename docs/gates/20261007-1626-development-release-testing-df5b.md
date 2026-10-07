---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 8c2dcf64a7414a0e49f8e733e05637ca825a33fe
  - https://github.com/akmaier/agent-m/pull/183
date: 2026-10-07 16:26 UTC
---
# Development → Release testing: ITM-252, its second attempt

**REGISTER**

## Reason

ITM-252, the record of a job: pull request #183 by developer-sonnet-b, on head `8c2dcf6`, branched from `sprint/10` at
`515622d`. What holds:
- The first commit, `7344219`, holds only `tests/job-ledger.test.mjs` and `tests/documents-spaced-keys.test.mjs`, and CI
  was red on it (run 37649371205). The node job failed on exactly those two files, whose modules did not exist yet, beside
  the suite's known todo marks.
- CI is green on the head (python and node, run 37651152900).
- Only the folders of the item's two modules changed, with the two new tests, which name MOD-job-ledger and
  MOD-documents:
  - `src/job-ledger/`: `index.mjs`, `job.schema.md`, `states.mjs`, `cost.mjs`;
  - `src/documents/`: `index.mjs`, `read-write.mjs`, `schema-language.mjs`.
- The nine new tests name what they guard and the module, and each has its counter-proof recorded.
- The first rejection's reasons (`20261007-1330-…-00bc.md`) are met as the corrected item states them.
  - `gate record:`, `works on:` and `jobs at once:` are read with their spaces, through MOD-documents, which now takes a
    key of words separated by single spaces in a section's or an appended section's fields, and appends it with
    `appendSection`; a front matter key stays as MOD-text-tools states it.
  - An End is read without a round record.

Why it is rejected: check 5. The Acceptance's "a record with each kind of part appended as the file writes it — …
—, read, its End without a round record" does not hold for two parts that the item does not leave out.
- MOD-job-ledger's Data writes a question to the author under `## Gate reached` as `question:`, and its `RecordPart` and
  `JobRecord` have the question. The End holds `draft:` for a job whose kind hands its draft back, as one fenced JSON
  block.
- `job.schema.md` says both are "not part of this item", and `index.mjs` sets `question` and the End's `draft` to `null`
  for every record. The item leaves out only the round record.
- Run on the head, through `listJobs`:
  - a record with a gate is read with the gate's name and decider;
  - the same record with `question:` in place of them is read as a gate with no name, and `question` is `null`;
  - an End with its `draft:` block is read with `draft` `null`.

Noted, no reason by themselves:
- `listJobs` is built async, because a snapshot's `read` is async in MOD-repository-hosts' file. MOD-job-ledger's file
  types its result `JobRow[]`, so the two files disagree on that point, and the gap goes to the review as the pull request
  notes it.
- `usage:` and `cost:` stay one line of JSON each; the file fixes no other form.

The item is not done; the review at the sprint's end decides what needs more work in the next sprint. ITM-239 builds on
it.
