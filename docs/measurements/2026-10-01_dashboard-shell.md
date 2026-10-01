# Dashboard shell — the views in files of their own, and the boundary checks over every module file

**MESSUNG** — 2026-10-01, branch `team/ITM-003` (from `sprint/01` at `3bc2cf3`, the views split off in `4b6df04`), macOS,
Node 25, Python 3. ITM-003 (refactoring job): `review-app.mjs` became `docs/assets/dashboard-app.mjs` with its views under
`docs/assets/dashboard/`, and the texts and HTML builders left the kernel. This file records that the page did not change, and
the counter-proofs of the new test and of the checks extended to every module file (SOFTWARE_MAINTENANCE §4.0a rule 5).

## 1. Every view renders as before

**Method.** The dashboard of `sprint/01` (`git archive origin/sprint/01 docs/assets`, its `review-app.mjs` loaded as the app)
and the dashboard of this branch were each loaded in `tests/app-harness.mjs` on the same repository: every tracked text file of
this repository under `docs/` and `SPEC.md`. For each address — none, `#uc`, `#uc/UC-001`, `#uc/UC-042`, `#arc`, `#arc/ARC-003`,
`#arc/MOD-review-core`, `#spec`, `#spec/2026-09-23_agent-m-v1`, `#spec/2026-09-23_agent-m-v1/01`, `#how`, `#settings`, `#add`,
`#add/https%3A%2F%2Fgitlab.com%2Fa%2Fb`, `#setup`, `#review/uc`, `#review/arc`, `#nothing` — with a stored GitHub token and
without one, the HTML of `<main>`, of the token line and of the repository line, and the list of requests the load made, were
compared as strings.

**Result.** 36 page loads, all four strings identical. The first run differed on `#settings` only: the page carried an empty,
hidden place for each settings section whose file is not there yet. The settings view was changed to write a section's place
only when its file is there; the second run was identical throughout.

The comparison is not part of the suite: it needs the old checkout. What the suite keeps is `tests/dashboard-shell.test.mjs`
below — the tab bar link for link, and the heading of every view of today.

## 2. Counter-proofs

**Method.** Each mutation changed one file (or removed it), the named suites ran, and the file was restored. A mutation that
left its file unchanged was refused by the script. Failing tests were read from node's own report (its `✖` lines); that this
reading sees a failure was checked on each row below, every one of which names the failing test.

| Mutation | Red |
|---|---|
| `fetch("x")` planted in `artifacts.mjs` (kernel) | `review-core.test.mjs` "the app never calls fetch directly — every request goes through fetchText" |
| `localStorage.getItem("x")` planted in `dashboard/settings-view.mjs` (a view) | the same test; `test_config_client_side` `test_only_the_store_module_touches_browser_storage` |
| `caches.open("x")` planted in `dashboard/how-view.mjs` | `test_config_client_side` `test_only_the_store_module_touches_browser_storage` |
| a foreign origin planted in `dashboard/how-view.mjs` | `test_pages_layout` `test_site_code_calls_no_foreign_origin` |
| the group *Adapters* renamed in `docs/groups/modules.md` | `review-core.test.mjs` "the app never calls fetch directly …" (the adapters are read from the group file) |
| `dashboard/how-view.mjs` removed | `dashboard-shell.test.mjs`: "with every view file of today, the tab bar shows the tabs it showed before …", "every view of today is shown …", "a view or settings section whose file is not there yet …" |
| `dashboard/spec-changes-view.mjs` removed | `dashboard-shell.test.mjs`: the tab bar, every view; `load-per-view.test.mjs` "the SPEC view reads SPEC.md and every queue's index and decisions …" |
| `dashboard/setup-view.mjs` removed | `dashboard-shell.test.mjs` "every view of today is shown …"; `review-core.test.mjs` does not load |
| `dashboard/add-product-view.mjs` removed | `dashboard-shell.test.mjs` "every view of today is shown …"; `review-core.test.mjs` does not load |
| `dashboard/review-views.mjs` removed | 24 of 115 node tests (every page load, the tab bar) |
| `dashboard/settings-view.mjs` removed | 22 of 53 node tests (the app does not load) |
| the harness asks none of a test's handlers | `dashboard-shell.test.mjs` "a request handler a test brings answers before the harness's own GitHub" |
| a view counts as there whether its file is or not | all four tests of `dashboard-shell.test.mjs` |
| the tab bar drops the title the table gives *Settings* | `dashboard-shell.test.mjs` "with every view file of today, the tab bar shows the tabs it showed before …" |

Before and after the series: `cd tests && python3 -m unittest` — 93 tests, OK; `node --test tests/*.test.mjs` — 133 tests,
133 pass.
