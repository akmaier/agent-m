---
id: ITM-724
title: The whole architecture as a recipe, and what a change of it rests on
level: module
realises:
  - UC-023
  - THE ARCHITECTURE'S PARTICIPANTS RECEIVE THE WHOLE PROJECT
  - NOTHING IS LEFT OUT OF AN ARCHITECTURE PROMPT SILENTLY
  - ARCHITECTURE IS DESIGNED ONLY AGAINST ACCEPTED USE CASES
  - NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED
modules:
  - MOD-approvals
builds_on:
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-724 The whole architecture as a recipe, and what a change of it rests on

**REGISTER**

## Outcome

UC-023 step 2 sends a described change "with the entire project — the whole SPEC, every use case and the whole
architecture". The kind `change-architecture` names the recipe `whole-architecture` and the precondition
`rests-on-accepted`. MOD-approvals states both (`docs/architecture/MOD-approvals.md`, `approvalStrategies`);
`src/approvals/strategies.mjs:4` says "the recipe `whole-architecture` and the architecture's part of
`rests-on-accepted` are not built yet".

This item builds them as the file states them:
- recipe `whole-architecture`: every architecture decision and module file, one part per file, carrying its file as an
  artifact keyed by the key of its format;
- `rests-on-accepted`, where the parameters ask for it: an error finding naming every file of the architecture that is not
  accepted, beside the requirements and use cases it names today.

## Acceptance

- With a fixture snapshot: every ARC and MOD file as one part each, none left out; `prepareJob` of
  `change-architecture` finds every strategy it names.
- `rests-on-accepted` names an open and a changed architecture file when asked, and nothing of the architecture when not
  asked; the existing findings for requirements and use cases stay as they are.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

## Settled at sprint team2/89's start, 2026-10-18 (po-opus-b): (a), answered by the texts

The question sprint 85 left for akmaier (`docs/backlog/sprints/team2/85.md:67-69`): which parameter asks
`rests-on-accepted` for the architecture, or does `change-architecture` always ask? The texts answer both halves.

- **Not always.** UC-023's precondition is "The use cases the change concerns are accepted (UC-008)"
  (`docs/use-cases/UC-023-modify-the-architecture.md:69-70`), and SPEC.md:1287 "An architecture is drafted or changed
  only against use cases whose current text an approval record names." The architecture is a precondition of other use
  cases (UC-024, UC-032, UC-043, UC-045), whose kinds ask for it; this item builds the check, not their callers.
- **The parameter.** MOD-approvals.md:142-143 names no parameter for the requirements and use cases either ("the job's
  selection names"); the code names them `requirements` and `useCases` in `src/approvals/strategies.mjs:99-102`, and
  TST-472024 and TST-472025 call them. `JobContext.params` is `Record<string, unknown>` (MOD-job-runner.md:202), and a
  job's `## Parameters` hold "the parameters the kind's recipes read" (MOD-job-ledger.md:83-84), so the strategy names
  its own. **The reading:** the parameter is `architecture: true`, named in `strategies.mjs`' header beside
  `requirements` and `useCases`. With it, every architecture file whose status is not `accepted` is named; without it,
  nothing of the architecture.

The item is buildable as it stands. Its module, MOD-approvals, is changed by no item of team 1's sprint 87; MOD-review-
pages uses it, so it is held while that sprint runs.
