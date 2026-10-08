---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 30811c9e3a4e4052d80112b055a549a5771bb570
  - https://github.com/akmaier/agent-m/pull/191
date: 2026-10-07 17:42 UTC
---
# Development → Release testing: ITM-252, its third attempt

**REGISTER**

## Reason

ITM-252, the record of a job: pull request #191 by developer-sonnet-b, on head `30811c9`, branched from `sprint/11` at
`2295551`.
- The first commit, `d5eb7fc`, holds only `tests/job-ledger.test.mjs` and `tests/documents-spaced-keys.test.mjs`, and CI
  was red on it (run 37659096770). The node job failed on exactly those two files, whose code did not exist yet, beside
  the suite's known todo marks.
- CI is green on the head (run 37659858882): node 882 tests, 0 fail, 11 todo; python 396, OK.
- Only the folders of the item's two modules changed, with the two new tests, which name MOD-job-ledger and
  MOD-documents:
  - `src/job-ledger/`: `index.mjs`, `job.schema.md`, `states.mjs`, `cost.mjs`;
  - `src/documents/`: `index.mjs`, `read-write.mjs`, `schema-language.mjs`.
  The third commit, `30811c9`, only adds assertions to the new test and corrects one typedef.
- The eleven new tests name what they guard and the module, and each has its counter-proof recorded.
- The Acceptance as corrected for this sprint holds:
  - `gate record:`, `works on:` and `jobs at once:` are read with their spaces, through MOD-documents, which loads,
    reads and appends a field whose key holds spaces; a front matter key stays as it was;
  - an End is read without a round record;
  - a question to the author under `## Gate reached` is the record's question, not a gate with no name, and its job
    waits at a gate;
  - an End's `draft:` block is its End's draft;
  - the identifier, the start read back, the state with and without a live state, two products' jobs in their order with
    an unreadable record listed with its reason, and the cost each hold as the Acceptance states them.
- The reasons of both earlier rejections are met:
  - `20261007-1330-…-00bc.md` (#164): the spaced lines are read as the file writes them, and only the round record is
    left out;
  - `20261007-1626-…-df5b.md` (#183): run through `listJobs` on the head, a waiting question is read as the record's
    question and a draft as its End's draft. Planting `question: null` or `draft: null` turns its test red.

Noted, no reason by themselves:
- A question once resumed is read as `null`, and its `## Resumed` stands nowhere in the record as read; a named gate
  keeps its resumption in `gates`. MOD-job-ledger's file names one `question` and no resumption of it, and uses a question
  only to stop a job (`A JOB STOPS AT EVERY GATE`). The record keeps the question as written, and no item of this sprint
  reads a resumed one. The gap goes to the review.
- `listJobs` is async, as in #183, because a snapshot's `read` is; the pull request names the gap.
- `usage:` and `cost:` stay one line of JSON each; the file fixes no other form.
