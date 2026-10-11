---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - dd6d18f6c5a0254c67d7b39ad9ad2e16729194bc
  - https://github.com/akmaier/agent-m/pull/338
date: 2026-10-11 10:55 UTC
---
# Development → Release testing: ITM-378

**REGISTER**

## Reason

ITM-378, pull request #338 by developer-sonnet-d into `sprint/team1/14`, on head `dd6d18f`, against the item and
MOD-documents' accepted file as they stand at the sprint's commit `078aec0` and on `main`. All five points hold:
- The first commit, `a1a3fa5`, holds only `tests/documents-artifact-schema-of.test.mjs`, and CI was red on it (run
  38133221965): node failed on that file alone, `src/documents/index.mjs` giving no `artifactSchemaOf` — 1239 tests, 1
  failed. The code commit adds two near misses to the new test, each with its counter-proof.
- CI is green on the head (run 38133451829): node 1242 tests, 0 failed; python passed.
- Only MOD-documents' folder — `artifactSchemaOf` in `index.mjs`, and in `schema-language.mjs` `matchesPath`, which
  `pathRule` now shares with its result unchanged — and the new test whose header names the module change; no existing
  test or expected result changes.
- The 4 new tests name what they guard and MOD-documents, and have 13 counter-proofs.
- The Acceptance holds: a use case, a decision, a module file and a backlog item path each give their schema; a plan
  step's path the item schema; a path under `docs/` no pattern matches, and each near miss, `null`. The patterns are the
  ones the schemas compiled: no second copy is made.

Noted for the sprint's review, no condition of this gate: MOD-documents' file says `documentFindings` checks a path
against its pattern, which the code does not do yet; and `src/job-runner/builtins.mjs` keeps its own copy of the patterns
until ITM-386 replaces it with `artifactSchemaOf`.
