# Code outside every module

**MEASUREMENT** · 2026-10-17 · po-opus · on `main` at `f1e86652`

## Why

akmaier rejected the between-jobs form of queue `2026-10-17`'s entry 02: "I don't want legacy code in the code basis;
Therefore it should become part if the architecture, modules and documentation." The draft that follows from it (queue
`2026-10-17d`) states its scope from this count.

## Method

1. **The module folders.** Every `docs/architecture/MOD-*.md` has a `folder:` line: 54 module files and 54 folders, all
   under `src/`.
2. **The code files.** `git ls-files`, kept when the name ends in `.mjs`, `.js`, `.cjs`, `.ts`, `.css`, `.html`, `.py`,
   `.sh`, `.yml`, `.yaml`, `.swift`, `.rs`, `.go` or `.json`. `tests/` and `docs/sources/` are left out.
   - A file is outside every module when no folder of step 1 is a prefix of its path.
   - `.claude/settings.json` is the agents' tool setting, not the product's code, and is left out of the count.
   - **The known positive:** `src/site-frame/` holds 7 tracked `.mjs` files, and none of them is listed.
3. **The tests.** `git ls-files tests`, kept for `.mjs`, `.js` and `.py` outside `tests/fixtures/`, 565 files. For each,
   the first 60 lines are searched for `Module: MOD-` or `module: MOD-`.
   - A test is listed under "names no module" when neither is found.
   - It is listed under "names only modules the architecture does not hold" when every module it names has no
     `docs/architecture/MOD-*.md`.

## Result

**55 code files lie outside every module's folder:**
- `docs/assets/`: 39 scripts, style sheets, libraries and data files;
- `docs/index.html` and `index.html`, the two pages;
- `src/home/` (4), `src/site/` (4) and `src/theme/` (1): folders under `src/` that no module file names;
- `.github/workflows/` (4);
- `tools/apply_approvals.py`.

- `.github/workflows/apply-approvals.yml`
- `.github/workflows/fetch-sources.yml`
- `.github/workflows/nightly.yml`
- `.github/workflows/tests.yml`
- `docs/assets/artifacts.mjs`
- `docs/assets/artifacts/checks.mjs`
- `docs/assets/artifacts/groups.mjs`
- `docs/assets/artifacts/headers.mjs`
- `docs/assets/artifacts/identity.mjs`
- `docs/assets/artifacts/requirements.mjs`
- `docs/assets/artifacts/use-cases.mjs`
- `docs/assets/bridge-tunnel.mjs`
- `docs/assets/dashboard-app.mjs`
- `docs/assets/dashboard/backlog-view.mjs`
- `docs/assets/dashboard/built.json`
- `docs/assets/dashboard/how-view.mjs`
- `docs/assets/dashboard/process-view.mjs`
- `docs/assets/dashboard/reads.mjs`
- `docs/assets/dashboard/release-view.mjs`
- `docs/assets/dashboard/requirement-prompt-view.mjs`
- `docs/assets/dashboard/review-views.mjs`
- `docs/assets/dashboard/roles-view.mjs`
- `docs/assets/dashboard/settings-view.mjs`
- `docs/assets/dashboard/settings/endpoints.mjs`
- `docs/assets/dashboard/spec-changes-view.mjs`
- `docs/assets/dashboard/writes.mjs`
- `docs/assets/git-host.mjs`
- `docs/assets/git-host/pull-requests.mjs`
- `docs/assets/jobs/propose-backlog-items/job.json`
- `docs/assets/process-model.mjs`
- `docs/assets/product-store-adapter.mjs`
- `docs/assets/pseudonymiser.mjs`
- `docs/assets/review-core.mjs`
- `docs/assets/review-core/apply-approvals.mjs`
- `docs/assets/settings-store.mjs`
- `docs/assets/style.css`
- `docs/assets/traceability.mjs`
- `docs/assets/traceability/graph.mjs`
- `docs/assets/vendor/marked.esm.js`
- `docs/assets/vendor/mermaid.min.js`
- `docs/assets/vendor/purify.es.mjs`
- `docs/assets/work-items.mjs`
- `docs/assets/work-items/flow.mjs`
- `docs/index.html`
- `index.html`
- `src/home/cards.mjs`
- `src/home/home.css`
- `src/home/home.mjs`
- `src/home/progress.mjs`
- `src/site/html.mjs`
- `src/site/instance-repository.mjs`
- `src/site/menu.mjs`
- `src/site/views.mjs`
- `src/theme/lme.css`
- `tools/apply_approvals.py`

**37 tests or test helpers name no module:**

- `tests/app-harness.mjs`
- `tests/dashboard-pending-release-report.test.mjs`
- `tests/jsrun.py`
- `tests/release-itm-290-public-settings-layout.test.mjs`
- `tests/release-uc-011-local-cli-session.test.mjs`
- `tests/release-uc-017-configure-participants.test.mjs`
- `tests/review-core.d/helpers.mjs`
- `tests/review-pages-edit-entry.test.mjs`
- `tests/settings-pages-export-import.test.mjs`
- `tests/settings-pages-settings-regressions.test.mjs`
- `tests/system-uc-011-local-cli-session.test.mjs`
- `tests/test-pages-pending-release-report.test.mjs`
- `tests/test_artifact_format.py`
- `tests/test_artifact_provenance.py`
- `tests/test_ci_budget.py`
- `tests/test_derivation_classes.py`
- `tests/test_derivation_context.py`
- `tests/test_home_screen_icon.py`
- `tests/test_implementation_job.py`
- `tests/test_job_preconditions.py`
- `tests/test_jsrun_names.py`
- `tests/test_licence.py`
- `tests/test_mail_password_route.py`
- `tests/test_mail_routes.py`
- `tests/test_main_page.py`
- `tests/test_no_backend.py`
- `tests/test_no_history.py`
- `tests/test_pages_layout.py`
- `tests/test_products_folder.py`
- `tests/test_prompted_change_context.py`
- `tests/test_prompted_source.py`
- `tests/test_rate_reporting.py`
- `tests/test_release_sprint_02_d.py`
- `tests/test_self_sufficient.py`
- `tests/test_test_battery.py`
- `tests/trace-pages-edit-links.test.mjs`
- `tests/uc-006-batched-reads-harness.mjs`

**91 tests name only modules the architecture does not hold.** By the module they name:
- MOD-dashboard-app 23
- MOD-artifacts 22
- MOD-review-core 14
- MOD-git-host 8
- MOD-work-items 7
- MOD-traceability 6
- MOD-settings-store 5
- MOD-reader 3
- MOD-process-model 3
- MOD-bridge-tunnel 2
- MOD-pseudonymiser 1
- MOD-ghost 1
- MOD-review 1
- MOD-x 1

The last three look like fixtures inside test files; each is read when its test is moved.

## Notes

- **Duplicates.** Some of these files duplicate a module already:
  - `docs/assets/vendor/marked.esm.js` and `purify.es.mjs` sit beside `src/markdown-render/vendor/`;
  - `docs/assets/traceability/graph.mjs` has its own `coverageGaps` and `tracesTo` beside MOD-trace-graph's.
- **The live page.** `docs/index.html` loads `docs/assets/dashboard-app.mjs`, and no page loads MOD-site-frame's
  `start.mjs`.
- **An unchecked SPEC rule.** The SPEC's `AGENT M'S SOURCE CODE LIVES IN SRC` has the Check
  `tests/test_pages_layout.py`, whose cases test only the root and `docs/`. So no case finds the scripts under
  `docs/assets/`.
