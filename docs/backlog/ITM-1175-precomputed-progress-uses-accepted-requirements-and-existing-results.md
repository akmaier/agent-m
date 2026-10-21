---
id: ITM-1175
title: Precomputed progress uses accepted requirements and existing test results
level: module
realises:
  - THE MAIN PAGE SHOWS EACH PRODUCT'S PROGRESS BY STAGE
  - PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
modules:
  - MOD-progress-measures
  - MOD-workflow-entries
builds_on:
tests:
  - unit
  - component
origin:
  - The human main-page statistics priority and same-head native facts and producer-input diagnostics
---
# ITM-1175 Precomputed progress uses accepted requirements and existing test results

**REGISTER**

## Outcome

The existing onMainChanged -> productFacts -> stageShares -> publishOverview path derives statistics from
the actual accepted inputs at that commit. Repair its two confirmed missing inputs, without editing stored
values, inventing a target count, changing public APIs/formats or building a second producer.

facts.mjs's itemStates input currently contains only approvals.statuses' reviewed-file map. It omits SPEC
requirement names, so work-plans/states.mjs acceptanceReasons treats accepted realises rules as unaccepted.
Use the working implementation-pages/backlog.mjs statusesOf pattern internally: accepted SPEC names plus
reviewed-file statuses for state evaluation. Preserve public Facts.statuses' reviewed-file meaning.

The owned main-changed.yml checkout fetches trace-cache and overview-cache but not an existing test-results.
composeInstance connects that clone; resultsBranch catches its NotFound as no results, although the remote
branch exists. Fetch existing test-results for this producer before the entry runs, using the current checkout's
access. Do not create an empty result branch or misreport genuine absence/access failure as passing tests.

## Acceptance

- Focused public productFacts cases prove accepted requirement rules do not block a delivered item, alongside
  a known already-done positive and a genuinely missing/unaccepted input that still blocks. Cover all/work/build,
  stored and unstored inputs with equivalent derived states. Reuse stored requirements when available and
  original SPEC otherwise as required for itemStates; preserve scope-excluded public fields and no job live calls.
- The producer's native workflow/entry setup is exercised with an existing remote result branch absent locally:
  it becomes readable before onMainChanged, and stageShares uses actual result records from default ancestry.
  Also retain truthful absent-branch behavior. Verify request/setup behavior at this failure node, not a manually
  adjusted share. No new branch is created to pretend results exist.
- Existing main-changed push-on-main scheduling, immutable commit-addressed caches and output formats remain.
  Future commits regenerate from corrected inputs; previous observations/caches/results are not rewritten.
  No forced40/790/693 count, speculative result-algorithm repair, unrelated workflow change or new public API.
- First commit is tests-only with unused TST identifiers and actual intended automatic server red before SM
  Source permission. Each new case has effective owned-code fault/failure/exact restoration and truthful
  records; the standing isolated CI proof permission does not authorize changing tests/helpers to force failure.

## Scope and Old-Test Boundary

ProgressMeasures owns the internal acceptance context, existing facts/store/overview path and focused cases.
WorkflowEntries owns only main-changed producer checkout/setup and its focused existing workflow/entry tests.
Preserve all other entry triggers/permissions, runtime behavior, test IDs/levels, fixture outcomes, literal
counts for unchanged native fixtures, unknown/error semantics and no-token behavior. No helper, checker,
test-result reader, WorkPlans state-machine or Host implementation changes. A fixture expectation changes
only where it specifically encoded an accepted SPEC rule as missing; identify each such case and literal
actual/expected in the tests-only submission. No blanket old expected-result rewrite.

## Readiness

Accepted ProgressMeasures and WorkflowEntries already require facts derived from repository records and the
same facts whether stored or read. No formal change is required. The two producer inputs form one accurate
statistics outcome; One Responsibility keeps changes in their owning files, Nothing Twice reuses the working
acceptance-context pattern, and KISS keeps the existing producer and public interfaces.
