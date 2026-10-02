---
id: ITM-003
title: The dashboard shell — texts and HTML out of the kernel, review-app.mjs becomes dashboard-app.mjs with view files loaded by name
kind: refactoring
level: 1
realises:
  - EVERY ARTIFACT NAMES ITS ORIGIN
  - EVERY STEP EXPLAINS ITSELF
  - CONFIGURATION LIVES IN THE BROWSER
  - UC-024
modules:
  - MOD-dashboard-app
  - MOD-review-core
  - MOD-git-host
  - MOD-settings-store
  - MOD-bridge-tunnel
  - MOD-traceability
  - MOD-artifacts
  - MOD-pseudonymiser
depends_on:
  - ITM-002
origin: backlog refinement 2026-10-01
---
# ITM-003 The dashboard shell — texts and HTML out of the kernel, review-app.mjs becomes dashboard-app.mjs with view files loaded by name

**REGISTER**

## Outcome

Every sentence a person reads and every HTML builder leaves the kernel and the adapters (ARC-003 decision 5): `stepHtml`, `prerequisitesHtml`, `impactHtml`, `diffHtml`, `browserSettingsHtml`, `secretFieldHtml`, `tokenBannerHtml`, `sharedOriginNotice`, `TOKEN_GUIDANCE`, the token and GitLab step texts, `exportNotice`, `PASSPHRASE_NOTICE`, `pseudonymisationOffNotice` and the renewal texts move into the dashboard, which keeps the data functions they read. `review-app.mjs` becomes `docs/assets/dashboard-app.mjs` — the composition root and router — and its views move into `docs/assets/dashboard/<view>-view.mjs`, each naming MOD-dashboard-app. The router loads a view file by its name, and the tab bar and the settings page's sections come from one table that names every view and settings section the accepted use cases call for; a view or section whose file does not exist yet is not shown. So later items add a view or a settings section as a new file without editing a shared one. A view may load a stylesheet of its own beside `style.css`. `tests/app-harness.mjs` accepts extra request handlers from a test, so that each view's tests bring their own fakes. `docs/index.html`, `docs/assets/style.css`, `tools/apply_approvals.py` and `tests/artifact_checks.py` carry their `Module:` line. The repository checks of ARC-003 decision 6 cover every module file: only the adapters call `fetch`, only MOD-settings-store touches `localStorage` or `caches`. No expected result changes; tests that read `review-app.mjs` read the dashboard's files instead.

## Realises

- `EVERY ARTIFACT NAMES ITS ORIGIN`
- `EVERY STEP EXPLAINS ITSELF`
- `CONFIGURATION LIVES IN THE BROWSER`
- UC-024 — Implement modules from the architecture

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — ARC-003 decisions 1, 5, 6; ARC-020 decision 1.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-004, ARC-005, ARC-006, ARC-007, ARC-013, ARC-014, ARC-020.

## Modules

- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items
- MOD-review-core (kernel) — uses MOD-artifacts
- MOD-git-host (adapters) — uses no other module
- MOD-settings-store (adapters) — uses no other module
- MOD-bridge-tunnel (adapters) — uses no other module
- MOD-traceability (kernel) — uses MOD-artifacts, MOD-review-core
- MOD-artifacts (kernel) — uses no other module
- MOD-pseudonymiser (features) — uses MOD-job-harness

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/review-app.mjs` (renamed to docs/assets/dashboard-app.mjs)
- `docs/assets/dashboard/review-views.mjs` (new)
- `docs/assets/dashboard/spec-changes-view.mjs` (new)
- `docs/assets/dashboard/how-view.mjs` (new)
- `docs/assets/dashboard/settings-view.mjs` (new)
- `docs/assets/dashboard/add-product-view.mjs` (new)
- `docs/assets/dashboard/setup-view.mjs` (new)
- `docs/index.html`
- `docs/assets/style.css`
- `docs/assets/review-core.mjs`
- `docs/assets/git-host.mjs`
- `docs/assets/settings-store.mjs`
- `docs/assets/bridge-tunnel.mjs`
- `docs/assets/traceability.mjs`
- `docs/assets/artifacts.mjs`
- `docs/assets/pseudonymiser.mjs`
- `tools/apply_approvals.py` (Module line only)
- `tests/artifact_checks.py` (Module line only)
- `tests/app-harness.mjs`
- `tests/*.test.mjs`
- `tests/test_*.py`

## Kind and level

- Job kind: **refactoring** — CI green on every commit, no expected result changed (`A REFACTORING JOB BEGINS WITHOUT A FAILING TEST`, `A REFACTORING JOB CHANGES NO EXPECTED RESULT`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_config_client_side.py` — `CONFIGURATION LIVES IN THE BROWSER`
- `tests/test_origin_links.py` — `EVERY ARTIFACT NAMES ITS ORIGIN`
- `tests/test_step_explanations.py` — `EVERY STEP EXPLAINS ITSELF`

## Acceptance criteria

From the SPEC's checks:

- `EVERY ARTIFACT NAMES ITS ORIGIN` — `tests/test_origin_links.py`
- `EVERY STEP EXPLAINS ITSELF` — `tests/test_step_explanations.py`
- `CONFIGURATION LIVES IN THE BROWSER` — `tests/test_config_client_side.py`

From the postcondition of UC-024 (Implement modules from the architecture), for the part this item builds:

> - The code reached the default branch only through a pull request whose CI run was green.
> - The job's first commit was a failing test; the module's tests guard named requirements from now on.
> - Every file the job created or changed names the module it belongs to; no file outside the job's
>   modules was changed.
> - The pull request records who implemented it, with which model and Agent M version, and when.

Further:

- Every test green before is green after; assertions unchanged apart from the file paths they read.
- With every view file present that exists today, the page shows the same tabs and the same views as before (use cases, architecture, SPEC changes, how acceptance works, settings, add product, setup, review pages).
- The boundary checks fail on a planted `fetch(` in a kernel file and on a planted `localStorage.` in a view file (counter-proofs recorded in a dated file in `docs/measurements/`).
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-002 — moves the HTML builders out of the files ITM-002 produced

## Needs a person

No.

## Notes

Route table: the views named by the accepted use cases are use cases, architecture, SPEC changes, review pages, specification (UC-020), modules (UC-025), library and sources (UC-004, UC-015, UC-016), resources (UC-040), participants (UC-017), process models (UC-031), how this product is developed (UC-002), backlog (UC-032), progress (UC-035), jobs (UC-036), run (UC-043), tests (UC-026–UC-030), release (UC-013), issues (UC-012), mail (UC-038, UC-039), settings (UC-042) and the bridge (UC-044).
