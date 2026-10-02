---
id: ITM-148
title: The layout Add product writes holds docs/architecture/ — on GitHub and on GitLab alike
kind: implementation
level: 1
realises:
  - ONE REVIEW LAYOUT FOR EVERY PRODUCT
  - ADDING A PRODUCT CREATES ITS LAYOUT
  - UC-001
modules:
  - MOD-review-core
  - MOD-dashboard-app
depends_on:
  - ITM-130
  - ITM-152
  - ITM-160
origin: release tests of sprint 01 (ITM-141)
---
# ITM-148 The layout Add product writes holds docs/architecture/ — on GitHub and on GitLab alike

**REGISTER**

## Outcome

UC-001 step 5: *Add product* "writes the missing review layout into the product repository's default branch
(`docs/use-cases/`, `docs/architecture/`, `docs/approvals/`, `docs/spec-freigaben/`, a `SPEC.md` skeleton, a
`CHANGELOG.md`), skipping whatever already exists", and `ONE REVIEW LAYOUT FOR EVERY PRODUCT` names `docs/architecture/`
as the place of a product's architecture decisions and modules. Today the commit into a product without a layout holds
five files and none under `docs/architecture/`, on both hosts. Path: `dashboard/add-product-view.mjs` `wireAddGo` →
`dashboard/writes.mjs` `addProduct` (GitHub and GitLab branches alike) → `review-core.mjs` `missingLayout(existingPaths,
product)`, which adds `docs/use-cases/README.md`, `docs/approvals/README.md`, `docs/spec-freigaben/README.md`, `SPEC.md`
and `CHANGELOG.md` and has no entry for `docs/architecture/`. Ist: five files, none under `docs/architecture/`; Soll: one
under it — `docs/architecture/README.md`, a README like the three the layout already writes, because git keeps no empty
folder —, skipped when the product already has anything under `docs/architecture/` (the `hasPrefix` rule of the other
three).

## Realises

- `ONE REVIEW LAYOUT FOR EVERY PRODUCT`
- `ADDING A PRODUCT CREATES ITS LAYOUT`
- UC-001 — Add a managed product (step 5, on GitHub and on a GitLab server, 3c)

## Where it came from

Release tests of the sprint 01 increment (ITM-141, pull request #48 into `sprint/02`): finding **R1** of
`docs/measurements/2026-10-01_release-tests-sprint-01.md`, case 3 — marked `{ todo }` in
`tests/release-sprint-01-dashboard-app.test.mjs` ("FINDING R1"). ITM-123's characterisation ("a product without any
layout gets all of it") passes on the code's own list and did not pin the gap; no backlog item named it.

Architecture decisions its modules follow: ARC-001, ARC-003, ARC-005, ARC-006.

## Modules

- MOD-review-core (kernel) — uses MOD-artifacts; `missingLayout` lives here (`docs/assets/review-core.mjs`), although the
  accepted module file does not yet name it among `provides` (ITM-138's matter, not this item's)
- MOD-dashboard-app (shells) — **for test files only**: the three MOD-dashboard-app test files below assert the layout's
  file list word for word and go red when the sixth file is written; no code file of MOD-dashboard-app changes
  (`dashboard/writes.mjs` passes what `missingLayout` returns)

The pull request changes only code files and tests that name one of these modules
(`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/review-core.mjs` (`missingLayout` adds `docs/architecture/README.md` with the prefix rule `docs/architecture/`)
- `tests/review-core.test.mjs` (the two asserted lists of `missingLayout` gain the file — the item's red test, the check
  `ADDING A PRODUCT CREATES ITS LAYOUT` names; its counter-proof: a product with any file under `docs/architecture/` gets
  no README there)
- `tests/review-core.d/dashboard-writes.test.mjs` (MOD-dashboard-app: the asserted tree of the GitHub commit, the
  `full` layout of UC-001 5b — which must now hold a `docs/architecture/` file, or 5b writes a commit —, and the
  GitLab commit's `create` actions)
- `tests/dashboard-review-flows.test.mjs` (MOD-dashboard-app: the constant `LAYOUT` of the UC-001 characterisation,
  asserted by four cases; nothing else in the file)
- `tests/release-sprint-01-dashboard-app.test.mjs` (MOD-dashboard-app: case "release · UC-001 5: the layout written into
  a new product holds docs/architecture/" loses its `{ todo }` mark and becomes an ordinary test; nothing else in the file)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it
  (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/review-core.test.mjs` — `ADDING A PRODUCT CREATES ITS LAYOUT` (the product's layout is asserted there)
- `tests/test_pages_layout.py` — `ONE REVIEW LAYOUT FOR EVERY PRODUCT` (checks the instance's own `docs/`, which has
  `docs/architecture/`; the product side of the rule is the release test above — the file carries no module line and is
  not changed)

## Acceptance criteria

From the postcondition of UC-001 (Add a managed product), for the part this item builds:

> - The product repository contains the review layout; it has no Pages site.

Further:

- `missingLayout([], product)` lists `docs/architecture/README.md` beside the five files of today, and the commit of
  *Add product* into a product without a layout holds it — on GitHub and on a GitLab server (release case 3, both
  halves); counter-proof: a product with `docs/architecture/<any file>` gets no README there, and a product with the
  complete layout (UC-001 5b) still gets no commit.
- The README says what the folder holds (`ARC-<nnn>-<slug>.md` and `MOD-<slug>.md`, reviewed on the Agent M dashboard),
  as the three READMEs of today do for their folders.
- The `{ todo }` mark of release case 3 is removed and the case is green; no other release case changes.
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-130 — changes `docs/assets/review-core.mjs`, `tests/review-core.test.mjs` and
  `tests/review-core.d/dashboard-writes.test.mjs` first (sprint 02, strand A)
- ITM-152 — changes `docs/assets/review-core.mjs` before this item (sprint 03, strand C; added at the sprint 03 planning)
- ITM-160 — changes `tests/dashboard-review-flows.test.mjs` before this item (sprint 03, strand A; added at the sprint 03 planning)

## Needs a person

No.

## Callers and the tests that assert what changes (checked at filing, 2026-10-01)

`missingLayout` is called in `docs/assets/dashboard/writes.mjs` only (`addProduct`, the GitHub and the GitLab branch);
its signature does not change. The list it returns is asserted in `tests/review-core.test.mjs` (MOD-review-core),
`tests/review-core.d/dashboard-writes.test.mjs` and `tests/dashboard-review-flows.test.mjs` (both MOD-dashboard-app) —
listed above, each with the one thing that changes in it (sprint 01 retrospective, P7; ITM-125's correction at the
sprint 02 review). The release test file lies on `sprint/02` until that sprint is merged; this item starts from a
`main` that holds it.
