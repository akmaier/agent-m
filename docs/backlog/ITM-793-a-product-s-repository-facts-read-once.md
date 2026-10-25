---
id: ITM-793
title: A product's facts read once with the scope all, from its repository
level: module
realises:
  - UC-035
  - UC-031
  - PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
  - STATUS IS DERIVED FROM THE RECORDS
modules:
  - MOD-progress-measures
builds_on:
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
built_by:
  - a13a5d54e5cb93143bb50b32e37bbfa0f132c3ae
  - 4173b60077561db71b8ce54da1bdbab0632a8b09
---
# ITM-793 A product's facts read once with the scope all, from its repository

**REGISTER**

## Outcome

UC-035 step 1. ITM-536 builds `productFacts` with the scope `work` and leaves `all` to a later item; a call for `all`
is refused (`src/progress-measures/facts.mjs:123`). This item builds the scope `all` for what the product's files give,
as MOD-progress-measures' file states it, each read once: the trace graph, the accepted `requirements`, `modelSince`
from the declaration's history, the test declarations, the test schedule or its default, the branch `test-results`,
`ci.configured`, `ci.drift` and `ci.jobWorkflow`, and `resourceNeeds` — beside everything the scope `work` reads.

The facts only a server or a runtime gives — `info`, `ci.runs`, `tags`, and the live state of jobs — stay
`"unknown"` here, as the module's file allows for a host that gives them not; ITM-794 adds them.

## Acceptance

- Against a fixture product and instance, the scope `all` reads each of these facts once and gives them; the scope
  `work` gives what it gave before.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

## Settled at sprint team2/89's start, 2026-10-18 (po-opus-b): closed, nothing left to build

The question sprint 89's first Selection left for akmaier — close or narrow, against team 1's ITM-843
(`docs/backlog/sprints/team2/89.md:83-84`) — is settled from the texts and the code. It was no question for akmaier
(AGENTS.md §6a.6): closing a REGISTER item changes no SPEC sentence, use case or module text.

- **The premise is gone.** The Outcome says a call for `all` is refused (`facts.mjs:123`). On `main` the scope `all` is the
  default and is built: `src/progress-measures/facts.mjs:151-154`, `options = { scope: "all" }`. ITM-826 built it, with
  `681137fa`, merged with #782.
- **What `all` reads now.** The trace graph, the accepted `requirements`, the test declarations, the branch
  `test-results`, `info` and `tags` (`facts.mjs:198-205`). TST-536015 (`tests/progress-measures-product-facts.test.mjs`)
  and TST-826005 (`tests/progress-measures-batches.test.mjs`) assert them.
- **What is left is ITM-843's, word for word.** `modelSince`, `schedule`, `ci` and `resourceNeeds` are still `"unknown"`
  (`facts.mjs:202-205`). ITM-843's Outcome: "`modelSince` (through `readHistory`), `schedule`, `ci`, `resourceNeeds` and
  the jobs' live state stay `"unknown"`. This item reads them as the text says, in batches where they are files". Its
  `ci` is the whole of `{ runs, configured, drift, jobWorkflow }` (MOD-progress-measures.md:126-127), so it holds this
  item's `ci.configured`, `ci.drift` and `ci.jobWorkflow`.
- **Its Acceptance is covered.** "Each of these facts once" is ITM-843's "Every field of `Facts` is read in the scope
  `all` [...] with tests and the counts". TST-826004 already guards that no blob is read twice, in both scopes. "The
  scope `work` gives what it gave before" is guarded by the scope-`work` tests of
  `tests/progress-measures-product-facts.test.mjs` and TST-826002.

So this item is done with ITM-826 and ITM-843 (team 1's, unchanged by this decision). UC-035 step 1 stays with ITM-794.
UC-031 and the two rules this item names are realised by other items too, ITM-778 among them. Nothing here changes
ITM-843.
