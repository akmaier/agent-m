---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 87c3f34a59bb57fbb9164c70fff68715a23ae15f
  - https://github.com/akmaier/agent-m/pull/196
date: 2026-10-07 19:04 UTC
---
# Development → Release testing: ITM-251

**REGISTER**

## Reason

ITM-251, the outcomes of a commit: pull request #196 by developer-sonnet-a, on head `87c3f34`, branched from `sprint/12`
at `a0bc752`.
- The first commit, `cca4631`, holds only `tests/result-records-outcomes.test.mjs`, and CI was red on it (run
  37669226785). The node job failed on exactly that file, whose module did not exist yet, beside the suite's known todo
  marks.
- CI is green on the head (run 37670937430), merged with `sprint/12` as it stands after #193, #194 and #195: node 905
  tests, 0 fail, 11 todo; python 396, OK. The python run on `4d7312a` was red on a JSDoc `import(` in a comment;
  `87c3f34` replaces it by a plain comment and changes nothing else.
- Only `src/result-records/` — `index.mjs`, `read.mjs`, `result-record.schema.md` and `counter-proof.schema.md`, among
  the module's Parts — and the new test, whose header names MOD-result-records, changed. The module's one read of its own
  data files is the one `tests/test_no_backend.py` allows the folder (#160).
- The six new tests name what they guard and the module, and each has its counter-proof recorded. Run on the head with
  the fault planted, each turns its test red: a test without a row read as passed; the uncommitted record counted;
  model-dependent rows kept in `flakyTests`; a comparison without a last release; and the last release's rate read at
  the commit itself.
- The Acceptance holds, on a fixture branch `test-results`:
  - a commit's outcomes per level, with their counts;
  - a level without a record `not run`;
  - a record marked `uncommitted` left out;
  - a flaky test with both its records;
  - a lower rate than the last release's marked worse, and no comparison without a last release.

Noted, no reason by itself: `resultsAt`, `flakyTests` and `rateComparison` are async, because a snapshot's `read` is,
while MOD-result-records' file types them without `Promise`. It is the gap of `listJobs` (#183, #191). The pull request
names it, ITM-254 and ITM-256 await them, and no item needs the file changed now.
