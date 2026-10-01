---
id: ITM-152
title: An acceptance handed a record writes no approval record for it — a job, gate, approval or test result record is left out and named
kind: implementation
level: 1
realises:
  - A RECORD IS EVIDENCE, NOT A PROPOSAL
  - UC-008
modules:
  - MOD-review-core
depends_on:
  - ITM-016
origin: release tests of sprint 02, strand C (ITM-144); ITM-014's finding G2
---
# ITM-152 An acceptance handed a record writes no approval record for it — a job, gate, approval or test result record is left out and named

**REGISTER**

## Outcome

`A RECORD IS EVIDENCE, NOT A PROPOSAL`: "Approval records, gate records, job records and test result records are written
once as evidence of what happened and are never shown for acceptance." Today `planAcceptance` (`docs/assets/review-core.mjs`)
builds a non-architecture item's record with `useCaseRecord(it.path, it.blob)` — the kind from the item, not from the
path — and so writes `docs/approvals/JOB-….md` with `kind: use-case` / `file: docs/jobs/JOB-….md` for a job record handed
to it as a use case, where `reviewedRecord`, used for decisions and modules, refuses the same path (ITM-014's finding
**G2**, `docs/measurements/2026-10-01_approval-gates-counter-proofs.md`). Soll: an item whose path is none of the three
reviewed kinds (`kindOfPath` null — a job, gate, approval or test result record, or any other file) is left out with its
reason, as a changed file is (`leftOut`), and no file is written for it; `useCaseRecord` refuses a path that is no use
case, as `reviewedRecord` refuses one that is no decision or module.

## Realises

- `A RECORD IS EVIDENCE, NOT A PROPOSAL` — the engine's half: no acceptance writes a record for a record
- UC-008 — Review and accept a use case (the commit of step 4 holds records of reviewed files only)

## Where it came from

ITM-014 (sprint 02, strand C, pull request #52) characterised the approval gates and found G2 red; its note sends a
failing check to an implementation item. The release tests of strand C (ITM-144, pull request #61) pinned it again
from the rule's text: case 14 of `docs/measurements/2026-10-01_release-tests-sprint-02-c.md`, marked `{ todo }` in
`tests/release-sprint-02-c-review-core.test.mjs` ("finding G2") with ITM-014; the same mark stands in
`tests/review-core.d/gates.test.mjs`. The Product Owner decided at the gate *Release testing → Sprint review* of strand C
(`docs/backlog/sprints/sprint-02.md`, *Decided on 2026-10-02*): G2 was known and accepted at the merge of ITM-014, a
refactoring item that fixes nothing; it is closed by this item, inside MOD-review-core, without a change to its interface
— unlike G1 (ITM-153).

Architecture decisions its modules follow: ARC-003, ARC-006.

## Modules

- MOD-review-core (kernel) — uses MOD-artifacts

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/review-core.mjs` (`planAcceptance` leaves out an item of no reviewed kind, naming it; `useCaseRecord` refuses a path that is no use case)
- `tests/review-core.d/gates.test.mjs` (the G2 case loses its `{ todo }` mark; a counter-proof: a use case handed in the same batch is still written)
- `tests/release-sprint-02-c-review-core.test.mjs` (case "an acceptance handed a job record writes no approval record for it" loses its `{ todo }` mark and becomes an ordinary test; nothing else in the file)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/review-core.test.mjs` — `A RECORD IS EVIDENCE, NOT A PROPOSAL` (a file of `tests/review-core.d/`)

## Acceptance criteria

From the postcondition of UC-008 (Review and accept a use case), for the part this item builds:

> - An approval record names the file and the SHA of the accepted text; the commit names who and
>   when.

Further:

- `planAcceptance` handed a job record (`docs/jobs/JOB-….md`), a gate record, an approval record or a test result record as an item writes no file for it and names it under `leftOut` with its reason; counter-proof: a use case in the same call is written as today, and the dashboard's acceptance of a use case (the app-harness checks of UC-008) keeps every expectation.
- `useCaseRecord` throws for a path that is no use case, as `reviewedRecord` does for one that is no decision or module.
- The `{ todo }` marks of G2 in both test files are removed and the cases are green; G1's marks stay (ITM-153).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-016 — the last change to `docs/assets/review-core.mjs` and its tests in sprint 02 (strand C)

## Needs a person

No.

## Callers and the tests that assert what changes (checked at filing, 2026-10-02)

`planAcceptance` is called from `docs/assets/dashboard/writes.mjs` (`acceptItems`) and `docs/assets/review-core/apply-approvals.mjs`
is its twin for SPEC entries only; neither hands it a record today (the views select use cases, decisions and modules by
path), so no expectation of theirs changes. `useCaseRecord` is called in `review-views.mjs` (`acceptAllPanel`, for use cases
only) and in `planAcceptance`. The release test file lies on `sprint/02` until that sprint is merged; this item starts from a
`main` that holds it.
