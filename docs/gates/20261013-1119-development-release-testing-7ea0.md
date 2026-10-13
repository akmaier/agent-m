---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - a6d74275b544244e4b40a7c5043bdf22afa89f5c
  - https://github.com/akmaier/agent-m/pull/491
date: 2026-10-13 11:19 UTC
---
# Development → Release testing: ITM-442, Starting the derivation of the architecture

**REGISTER**

## Reason

ITM-442, pull request #491 by developer-sonnet-d into `sprint/team1/27`, head `a6d7427`.

The job rules hold:
- The first commit `ec147f8` adds only `tests/review-pages-draft-architecture.test.mjs`. CI is red on it (run
  38388656143): the node job fails on the eleven new cases.
- CI is green on `a6d7427` (run 38388894968).
- The code changes only `src/review-pages/` (`jobs.mjs`, `kinds.mjs`, `spec-entries.mjs`), and the new test names
  MOD-review-pages.
- Its cases carry the declarations `TST-442001` to `TST-442011`, and eleven counter-proofs are recorded.

The Acceptance holds:
- No selection is offered.
- Each finding of `architecture-ready` is shown with its way on.
- A reviewer is offered only when it differs from the drafter, and *Run* is withheld with its reason when none does.
- A participant whose place a linked restricted source does not permit is left out as drafter and as reviewer, through
  `eligible` with the source's places. TST-442007 shows this together with its known positive.
- The run panel names every destination and part, a part that does not fit is named, and *Run* starts one job.

Dropping warnings from `prepared.blocking` keeps every error. The open SPEC change stays shown in the readiness section
with its link to decide it first. This is the page's reading of UC-022 1b against MOD-job-runner's `blocking`.

Noted for the review, beyond this item:
- The page reading of UC-022 1b above.
- In the real program, `prepareJob("derive-architecture")` fails while no module registers the step `due-diligence`
  (ITM-436); ITM-442 does not build on that item.
- `MOD-source-register.permittedPlaces` is used but not named in MOD-review-pages' Uses.
- UC-023's page does not exist yet.
- The run panel has no explanation topic of its own for the architecture.
- The imported harness runs its ten cases a second time.
