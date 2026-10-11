---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 592dbcc0b5f536057b41562e7db6d6ef70af846e
  - https://github.com/akmaier/agent-m/pull/328
date: 2026-10-11 08:21 UTC
---
# Development → Release testing: ITM-328

**REGISTER**

## Reason

ITM-328, pull request #328 by developer-sonnet-c into `sprint/team1/13`, on head `592dbcc`, against the item and
MOD-job-runner's and MOD-documents' accepted files as they stand at the sprint's commit `8a12001` and on `main`. All five
points hold:
- The first commit, `4d087f1`, holds only `tests/job-runner-document-schema.test.mjs`, and CI was red on it (run
  38123818780): node failed on the new test alone, `UnknownStrategy` for `document-schema` — 1208 tests, 1 failed.
- CI is green on the head (run 38124006560): node 1208 tests, 0 failed; python 441 tests OK, the 8 of
  `tests/test_correction_loop.py` among them.
- In scope: `builtins.mjs` and the header comment of `index.mjs` in MOD-job-runner's folder; the new test, whose header
  names the module; and `tests/job-runner-run.test.mjs` and `tests/test_correction_loop.py`, whose headers name
  MOD-job-runner (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`, and the item: "the tests that name MOD-job-runner").
  Their change is only that their prepared kind runs without `document-schema`; their stand-in for it returned no
  finding, so no asserted value and no expected result changes.
- The new test names what it guards and MOD-job-runner, and has 7 counter-proofs.
- The Acceptance holds: a fixture kind naming the check, and a drafter whose first draft lacks a required section in each
  of the four artifact formats, is asked once more with the four findings in the compiler form; the corrected draft ends
  the loop.

Noted for the sprint's review, no condition of this gate:
- The changed existing tests: once the runner registers its own `document-schema` (`src/job-runner/index.mjs`), the
  tests' stand-in of that name is skipped on `DuplicateStrategy`, and the real check judges their drafts at
  `docs/use-cases/UC-001-x.md`, which are no documents. The developers' instructions — "no existing test", "every
  existing test stays green unchanged" — and the item's "the existing tests stay green" cannot both hold for this item;
  the Product Owner's check 3 names "new test files" too. ITM-329 and ITM-330 meet the same stand-ins, `graph-checks`'
  feeding findings these tests assert.
- MOD-documents offers no function giving the artifact schema a path matches, so `builtins.mjs` matches `{nnn}` and
  `{slug}` itself, a second copy of the matching in `src/documents/schema-language.mjs`. The placeholders stay defined
  once, in MOD-documents' file; the two copies can drift.
- MOD-job-runner's file lists neither `artifactSchemas` nor `readDocument` among its uses, as the start decision
  foresaw; a drafted document whose path fits no artifact schema is not judged by the check.
