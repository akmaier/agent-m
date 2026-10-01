---
id: ITM-155
title: Accept ticked on the SPEC list leaves out an entry whose impact list was not shown — as a changed decision is left out
kind: implementation
level: 1
realises:
  - A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST
  - UC-006
modules:
  - MOD-review-core
  - MOD-dashboard-app
depends_on:
  - ITM-134
  - ITM-152
origin: sprint 02 review input (the SPEC list's batch acceptance)
---
# ITM-155 Accept ticked on the SPEC list leaves out an entry whose impact list was not shown — as a changed decision is left out

**REGISTER**

## Outcome

UC-006 3b: the impact list is shown "before the reviewer decides"; `A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST`:
"the list is part of the proposal rather than a result reported afterwards." ITM-134 shows the list on the entry's page
(`viewSpecEntry`, `entryImpact`), and an entry whose list could not be derived is not offered there. The SPEC list
(`spec-changes-view.mjs` `viewSpec`) ticks entries without opening them and `batchBar`'s *Accept ticked* writes them
(UC-006 4d); `planAcceptance` (`review-core.mjs`) leaves out a changed decision or module "whose impact list was not shown"
(`impactShown`) but has no such condition for a SPEC entry — so an entry that changes or withdraws a requirement can be
accepted from the list without its list ever being shown. Soll: a SPEC entry ticked on the list carries whether its impact
list was shown (the entry page sets it, as the architecture views set `impactShown`); `planAcceptance` leaves out a
changing or withdrawing entry without it, naming the reason ("its impact list was not shown — open it"), and an entry
that adds only is written as today; the list says beside a ticked changing entry that it must be opened first.

## Realises

- `A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST` — on every route that accepts an entry
- UC-006 — Approve a specification change (3b, 4d)

## Where it came from

Sprint 02 review input, raised by the Scrum Master at the gate decisions of 2026-10-02 and read in the code by the
Product Owner: `viewSpec` — `tickCell`/`batchBar` — `wireBatch` — `runAccept` — `acceptItems` — `planAcceptance`, where the
`impactShown` condition stands for `it.kind !== "use-case" && it.changed` and a SPEC item (`specItem`) carries neither.
Not a release-test finding; no mark in any test. ITM-145's cases 14–17 test the entry page only.

Architecture decisions its modules follow: ARC-001, ARC-003, ARC-005, ARC-006.

## Modules

- MOD-review-core (kernel) — uses MOD-artifacts (`planAcceptance`'s condition)
- MOD-dashboard-app (shells) — `dashboard/spec-changes-view.mjs` (the item carries what the entry page showed; the list's note)

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/review-core.mjs` (`planAcceptance`: a SPEC entry that changes or withdraws a requirement without `impactShown` is left out)
- `docs/assets/dashboard/spec-changes-view.mjs` (`specItem` carries `impactShown` and whether the entry touches a requirement; the list's note)
- `tests/review-core.d/gates.test.mjs` (the condition, with its counter-proof: an adding entry is written)
- `tests/dashboard-spec-impact.test.mjs` (the list's route, in the harness)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_impact_list.py` — `A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST` (exists; not changed by this item)

## Acceptance criteria

From the postcondition of UC-006 (Approve a specification change), for the part this item builds:

> - The SPEC contains exactly the approved text.

Further:

- On the SPEC list, with a token, an entry that changes a requirement is ticked and *Accept ticked* pressed without the entry having been opened: nothing is written for it, it is named with the reason; opened once (its list shown), the same click writes it. Counter-proofs: an entry that adds only is written without being opened; a changing entry whose list was shown on the entry page and ticked there is written.
- `planAcceptance` handed a SPEC item that touches a requirement without `impactShown: true` leaves it out, naming it; one with it, or one that adds only, is planned as today.
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-134 — built the entry page's list (sprint 02, strand D)
- ITM-152 — changes `planAcceptance` and `tests/review-core.d/gates.test.mjs` first

## Needs a person

No.

## Callers and the tests that assert what changes (checked at filing, 2026-10-02)

`planAcceptance`'s interface line already names the condition for decisions and modules ("a changed decision or module whose
impact list was not shown — each left out with its reason"); the same condition for a SPEC entry adds no parameter and no
value. `specItem` is built in `spec-changes-view.mjs` only. `tests/dashboard-spec-impact.test.mjs` (ITM-134) and
`tests/release-sprint-02-d-dashboard-app.test.mjs` test the entry page and hold.
