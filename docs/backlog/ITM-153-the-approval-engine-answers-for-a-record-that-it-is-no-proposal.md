---
id: ITM-153
title: The approval engine answers for a record that it is no proposal — a job record without approval is not open
kind: implementation
level: 1
realises:
  - A RECORD IS EVIDENCE, NOT A PROPOSAL
  - A GENERATED ARTIFACT IS A PROPOSAL
modules:
  - MOD-review-core
depends_on:
  - ITM-152
origin: release tests of sprint 02, strand C (ITM-144); ITM-014's finding G1
---
# ITM-153 The approval engine answers for a record that it is no proposal — a job record without approval is not open

**REGISTER**

## Outcome

The SPEC's check of `A RECORD IS EVIDENCE, NOT A PROPOSAL` (`tests/review-core.test.mjs`): "a job record without approval
is not listed as open; counter-proof: a use case without approval is." Today `deriveReviewedStatus` (`docs/assets/review-core.mjs`)
takes the kind from the path (`kindOfPath`, null for `docs/jobs/…`), finds no record of kind null and answers `"open"`;
`statusByNames` answers `{ status: "open" }` (ITM-014's finding **G1**, `docs/measurements/2026-10-01_approval-gates-counter-proofs.md`).
The rule is kept today by the views' filters, not by the engine whose module realises it. Soll: the engine answers, for a
path that is none of the three reviewed kinds, a value that says it is no proposal — neither open nor accepted nor
changed —, and `reviewPage` neither shows nor counts such a file.

MOD-review-core's accepted interface gives no such value: "`deriveStatus(path, currentBlob, records) -> "open" |
"accepted" | "changed"`". The value is a change to the module's interface, which only `akmaier` accepts
(`docs/process.md`, *Boundary*; UC-023). What is asked: one more value of `deriveStatus` — proposed name `"record"` —
for a path of no reviewed kind, in the module file's interface line.

## Realises

- `A RECORD IS EVIDENCE, NOT A PROPOSAL` — the engine's half: a record is never shown for acceptance
- `A GENERATED ARTIFACT IS A PROPOSAL` — its counter-proof: a use case without a record stays open

## Where it came from

ITM-014 (sprint 02, strand C, pull request #52) found G1 red; its note sends a failing check to an implementation item.
The release tests of strand C (ITM-144, pull request #61) pinned it again from the rule's text: case 13 of
`docs/measurements/2026-10-01_release-tests-sprint-02-c.md`, marked `{ todo }` in `tests/release-sprint-02-c-review-core.test.mjs`
("finding G1") with ITM-014; the same mark stands in `tests/review-core.d/gates.test.mjs`. The Product Owner decided at the
gate *Release testing → Sprint review* of strand C (`docs/backlog/sprints/sprint-02.md`, *Decided on 2026-10-02*): an
accepted limitation of the increment, closed by this item once `akmaier` has accepted the interface's value.

Architecture decisions its modules follow: ARC-003, ARC-006.

## Modules

- MOD-review-core (kernel) — uses MOD-artifacts

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/review-core.mjs` (`deriveReviewedStatus`, `statusByNames`, `reviewPage`)
- `tests/review-core.d/gates.test.mjs` (the G1 case loses its `{ todo }` mark)
- `tests/release-sprint-02-c-review-core.test.mjs` (case "a job record without approval is not open; a use case without approval is" loses its `{ todo }` mark and becomes an ordinary test; nothing else in the file)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/review-core.test.mjs` — `A RECORD IS EVIDENCE, NOT A PROPOSAL`; `A GENERATED ARTIFACT IS A PROPOSAL` (files of `tests/review-core.d/`)

## Acceptance criteria

From the SPEC's checks:

- `A RECORD IS EVIDENCE, NOT A PROPOSAL` — `tests/review-core.test.mjs` — a job record without approval is not listed as open; counter-proof: a use case without approval is.

Further:

- `deriveStatus` answers the accepted value for a job, gate, approval or test result record, with or without a record naming its blob; `reviewPage` lists and counts none of them; a use case, decision or module keeps its three values.
- The `{ todo }` marks of G1 in both test files are removed and the cases are green; no other release case changes.
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-152 — changes `docs/assets/review-core.mjs` and `tests/review-core.d/gates.test.mjs` first (G2)

## Needs a person

**Yes — `akmaier`:** the interface line of `deriveStatus` in `docs/architecture/MOD-review-core.md` gains the value for a
path of no reviewed kind (proposed `"record"`), accepted by an approval record under that account (UC-023; `docs/process.md`,
*Boundary*). The item waits until then; nothing of it is decided here.

## Callers and the tests that assert what changes (checked at filing, 2026-10-02)

`deriveReviewedStatus` is called by `statusByNames` and `reviewPage` in `review-core.mjs`; `statusByNames` by the dashboard's
views (`review-views.mjs`, `spec-changes-view.mjs`) and `tests/status-by-names.test.mjs`, all of which hand it use cases,
decisions, modules or SPEC entries, so their expectations hold. The release test file lies on `sprint/02` until that sprint
is merged; this item starts from a `main` that holds it.

## Decided by akmaier, 2026-10-03

Yes: `deriveStatus` gains the value `"record"` for a path of no reviewed kind (job, gate, approval, test result record). The interface line of `docs/architecture/MOD-review-core.md` is changed accordingly and waits for akmaier's acceptance on the dashboard; this item is ready once that approval record exists (`NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED`).
