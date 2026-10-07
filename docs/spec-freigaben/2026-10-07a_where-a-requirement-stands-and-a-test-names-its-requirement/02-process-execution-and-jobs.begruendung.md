# 13. Process execution and jobs: the default Definition of Done holds that every new test names its requirement

**The change.** `THE DEFAULT DEFINITION OF DONE IS THE JOB RULES` gains one condition: every new test names the requirement
it guards and the module it exercises — as `EVERY ARTIFACT NAMES ITS ORIGIN` asks of every test. Its name and its check are
kept.

**Why.** ITM-223's release test found the preset Definition of Done holding this condition beyond the four the rule named
(finding F8). PO, 2026-10-07: "Actually I want a test to specify the requirement". The rule now says what the preset does.

**Impact list** (`git grep` at `main`): the name stands in SPEC.md, ARC-042, MOD-product-process, UC-002, UC-024, ITM-218,
`src/product-process/workflow.mjs`, `tests/product-process.test.mjs`, `tests/release-sprint-06-uc-002-implementation-pages.test.mjs`
and the frozen fixtures of sprint 02. Once accepted, MOD-product-process' list of the job rules gains the condition, and the
release test of F8, marked todo, states the five conditions — an item of the release tester.
