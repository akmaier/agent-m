# No request for a view file that is not built — the list beside the views, and its counter-proofs

**MESSUNG** — 2026-10-01, branch `team/ITM-129` (from `sprint/02` at `26bfa0b`), macOS, Node 25, Python 3. ITM-129
(implementation job): the shell learnt which of its table's view and settings-section files are built from a data file beside
them, `docs/assets/dashboard/built.json`, instead of importing each file to find out. This file records how many files that
are not there a page asked for before and after, and the counter-proofs of the two new tests in
`tests/dashboard-shell.test.mjs` (SOFTWARE_MAINTENANCE §4.0a rule 5).

## 1. Files asked for that are not there, before and after

**Method.** The harness's `fetch` does not see a module import, so node's module resolution was hooked (`module.registerHooks`,
the same recorder the new test uses): every import of a file below `<assets>/dashboard/`, whether the file exists or not, was
recorded; in a browser each such import of a missing file is one `404` on GitHub Pages. One page load in `tests/app-harness.mjs`
(stored GitHub token, a two-file repository) for each of 40 addresses — none, `#<view>` for each of the 35 views of the table,
`#uc/UC-001`, `#review/uc`, `#review/arc`, `#nothing` —, first with `docs/assets` of `26bfa0b` (`git archive`), then with this
branch's. Counted: the recorded files that do not exist.

**Result.**

| Address | `26bfa0b` | this branch |
|---|---|---|
| none, every other address of a view with a tab or of a built view, `#uc/UC-001`, `#review/uc`, `#review/arc`, `#nothing` (27 addresses) | 15 each | 0 |
| a view without a tab whose file is not built (`#arrange`, `#derive-*`, `#sources`, `#sprint-close`, `#tests-browser`, `#tests-schedule`, `#tests-generate`, `#audit`, `#mail-replies`, `#get-your-own`) | 16 each | 0 |
| `#settings` | 19 — the 15 views, and the 4 section files `settings/endpoints.mjs`, `settings/mailbox.mjs`, `settings/bridge.mjs`, `settings/instance.mjs` | 0 |
| all 40 loads | 616 | 0 |

The 15 are the views with a tab whose file is not built, as the item counted at the end of sprint 01; the tab bar asked for each.
The sixteenth is the router's own import of the address's view. Each file was asked for once per load (the shell keeps an import
per page).

## 2. Counter-proofs

**Method.** Each mutation changed one file, `node --test tests/dashboard-shell.test.mjs` ran, and the file was restored; a
mutation that left its file unchanged would have been refused by the script. Failing tests were read from node's report (its `✖`
lines).

| Mutation | Red |
|---|---|
| the shell asks for each file to find out whether it is there (the `present` of `26bfa0b`) | "a load of every address of today asks for no view or settings file that is not built …" |
| the router imports a view's file whether it is built or not | the same test |
| every file of the table counts as built | the same test; and "with every view file of today, the tab bar shows the tabs it showed before …", "every view of today is shown …", "a view or settings section whose file is not there yet is not shown …", "a request handler a test brings answers …" |
| `built.json` drops `how-view.mjs` | "the list of built files beside the views names exactly the files of the table that are there"; the tab bar, every view, a view not there not shown, the stylesheet test, and "a load of every address …" (its recording no longer sees `how-view.mjs`) |
| `built.json` names a file that is not there (`nothing-view.mjs`) | "the list of built files beside the views …" |
| `built.json` names a file that is there but not in the table (`writes.mjs`) | the same test |
| the test's recording sees no import | "a load of every address …" — its check that the recording saw the files of the views shown |

The first commit of the job (`aa47625`, tests only) is the first row on the unchanged shell: both new tests red, the other 247
node tests green.

Before the series: `cd tests && python3 -m unittest` — 197 tests, OK; `node --test tests/*.test.mjs` — 247 tests, 247 pass.
After it: 197 OK; 249 tests, 249 pass.
