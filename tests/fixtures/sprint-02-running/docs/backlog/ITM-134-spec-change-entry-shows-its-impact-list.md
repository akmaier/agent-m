---
id: ITM-134
title: A SPEC change entry that touches an existing requirement shows the artifacts that reference it before the reviewer decides
kind: implementation
level: 1
realises:
  - A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST
  - UC-006
modules:
  - MOD-dashboard-app
depends_on:
  - ITM-018
origin: sprint 01 review
---
# ITM-134 A SPEC change entry that touches an existing requirement shows the artifacts that reference it before the reviewer decides

**REGISTER**

## Outcome

UC-006 3b: the SPEC changes page shows, for an entry that changes or withdraws an existing requirement, the artifacts
that reference its name — derived with MOD-traceability's `requirementImpact` (ITM-018) at the commit shown —, beside the
current section, the proposal and the difference, before *Accept*. Today the entry view shows section, proposal,
difference and rationale only; whether an impact list appears depends on whether the proposal's own text carries one
(`dashboard/spec-changes-view.mjs` `viewSpecEntry`; `docs/measurements/2026-10-01_built-flows-characterised.md`,
section 3). ITM-018 derives the list in the kernel, ITM-075 shows it in the requirement editor (UC-018); neither shows it
where the reviewer decides (UC-006).

## Realises

- `A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST`
- UC-006 — Approve a specification change (3b)

## Where it came from

Sprint 01 review (`docs/backlog/sprints/sprint-01.md`, *Review*, feedback 13): a flow ITM-123 found not carried out.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-005.

## Modules

- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/dashboard/spec-changes-view.mjs` (`viewSpecEntry` shows the derived impact list)
- `tests/dashboard-spec-impact.test.mjs` (new — run in `tests/app-harness.mjs`)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_impact_list.py` — `A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST` (created by ITM-018; this item adds the view's test beside it)

## Acceptance criteria

From the postcondition of UC-006 (Approve a specification change), for the part this item builds:

> - The SPEC contains exactly the approved text.

Further:

- An entry changing a requirement that two use cases and one test name shows those three, derived from the commit shown, before *Accept*; counter-proof: an entry adding a new requirement shows no list, and the dashboard of today shows none.
- A withdrawn requirement's entry lists what still names it.
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-018 — `requirementImpact` over the link graph

## Needs a person

No.

## Back from Release testing (2026-10-02) — finding D1, the view's half

Finding **D1** of ITM-145 (`docs/measurements/2026-10-02_release-tests-sprint-02-d.md`, case 18, `{ todo }` in
`tests/release-sprint-02-d-dashboard-app.test.mjs`): an entry that renames TITLE in place, or leaves it out of its section,
shows no impact list and offers *Accept*. Path: `spec-changes-view.mjs` `viewSpecEntry` → `entryImpact` →
`touchedBy(linkGraph({ files: own, status }), e.proposalPath)` → the graph reads only the names the entry states (ITM-018's
half) → `[]` → no list, *Accept* offered. Soll: UC-001, UC-002, MOD-cover and `tests/title.test.mjs` listed before *Accept*,
as for a withdrawal.

The Product Owner sends the item **back to Development** (`docs/backlog/sprints/sprint-02.md`, *Decided on 2026-10-02*):
developer-opus-d takes it up on a new branch, red first — the first commit removes the mark of case 18 —, after ITM-018's
re-opening, inside MOD-dashboard-app: `entryImpact` gives the graph the queue's `index.md` beside `SPEC.md` and the proposal
(`own`), so that the graph knows the section the entry replaces, and the list names the requirement as withdrawn or
changed as the graph says. The view holds the replaced section already (`e.current`); it is the graph that draws the edge,
so that `tests/release-sprint-02-d-traceability.test.mjs` case 24 and this case go green together. The request count of
ITM-134's record changes by the index file at most.
