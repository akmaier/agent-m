# 10. Review on GitHub Pages: no history

**The change.** 37 occasions removed; every source keeps who or what decided, without date or edit note; 5 withdrawn entries removed. Every other rule and check is carried over byte for byte.

**Changed in this section:**
- `THE PAGES ROOT IS DOCS` removed — the name is not reused.
- `THE PAGES ROOT IS THE REPOSITORY ROOT` — replaces `THE PAGES ROOT IS DOCS`; the Pages setting is `/` already.
- `THE MAIN PAGE SHOWS WHAT GOES ON IN THE INSTANCE` — new: the main page is the instance's dashboard.
- `DOCUMENTS ARE REVIEWED AND EDITED UNDER DOCS` — new: document review and editing stay under `docs/`.
- `AGENT M'S SOURCE CODE LIVES IN SRC` — new: the code leaves `docs/`.
- `ONE REVIEW LAYOUT FOR EVERY PRODUCT` — "and modules" removed: there are no module files.
- `ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON` — "a module" removed: there are no module files.
- `AN EDITED FILE KEEPS ITS IDENTIFIER` — "architecture element, module" → "architecture decision": there are no module files.

**Why.** The SPEC states only what holds now; its history is in git. Why a rule exists is recorded with the decision that accepted it, not beside the rule. The SPEC no longer cites SOFTWARE_MAINTENANCE.md: Agent M replaces it.

**Impact list.**
- `ACCEPTANCE IS A COMMIT IN GITHUB`: nothing outside the SPEC names it.
- `THE REVIEW DASHBOARD HOLDS NO CREDENTIAL`: nothing outside the SPEC names it.
- `THE REVIEW DASHBOARD USES THE TOKEN ONLY TO READ`: nothing outside the SPEC names it.
- `AN ACCEPTED SPEC CHANGE IS WRITTEN BY A WORKFLOW`: code: `.github/workflows/apply-approvals.yml`, `tools/apply_approvals.py`.
- `THE INSTANCE LISTS ITS PRODUCTS IN A FILE`: nothing outside the SPEC names it.
- `THE PAGES ROOT IS DOCS`: ARC-001, UC-014; backlog: `docs/backlog/ITM-073-get-your-own-agent-m.md`; tests: `tests/test_pages_layout.py`.
- `ONE REVIEW LAYOUT FOR EVERY PRODUCT`: ARC-006, UC-001, UC-022, UC-025; backlog: `docs/backlog/ITM-148-the-layout-add-product-writes-holds-docs-architecture.md`, `docs/backlog/ITM-165-release-tests-of-sprint-03-strand-c.md`, `docs/backlog/sprints/sprint-01.md`; tests: `tests/architecture-format.test.mjs`, `tests/architecture-view.test.mjs`, `tests/artifact_checks.py`, `tests/fixtures/flow/agent-m/sprint-01.md`, `tests/release-sprint-01-dashboard-app.test.mjs`, `tests/test_architecture_files.py`, `tests/test_pages_layout.py`; code: `docs/assets/artifacts.mjs`.
- `ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON`: MOD-review-core, UC-006, UC-008, UC-022, UC-023; tests: `tests/review-core.d/dashboard-writes.test.mjs`, `tests/test_approval_records.py`; code: `docs/assets/artifacts.mjs`.
- `AN EDITED FILE KEEPS ITS IDENTIFIER`: MOD-artifacts, UC-018, UC-019; backlog: `docs/backlog/ITM-010-use-case-checks-and-the-python-twin.md`, `docs/backlog/ITM-126-identifier-kept-returns-a-finding.md`, `docs/backlog/ITM-142-release-tests-of-sprint-02-strand-a.md`, `docs/backlog/sprints/sprint-01.md`; tests: `tests/artifacts-checks.test.mjs`, `tests/dashboard-review-flows.test.mjs`, `tests/fixtures/flow/agent-m/sprint-01.md`, `tests/release-sprint-02-a-artifacts.test.mjs`, `tests/release-sprint-02-a-dashboard-app.test.mjs`, `tests/review-core.d/artifacts.test.mjs`, `tests/review-core.d/dashboard-writes.test.mjs`; code: `docs/assets/artifacts.mjs`, `docs/assets/artifacts/checks.mjs`, `docs/assets/dashboard/review-views.mjs`, `docs/assets/dashboard/writes.mjs`.
