# The writes leave the kernel — unchanged tests, and the counter-proof of the new repository check

**MESSUNG** — 2026-10-01, branch `team/ITM-124` (from `sprint/01` at `b958097`), macOS 26.6, Node 25.9, Python 3.14.
ITM-124 (refactoring job): the five writes moved from `docs/assets/review-core.mjs` (MOD-review-core) into
`docs/assets/dashboard/writes.mjs` (MOD-dashboard-app) in `089d503`, and `setProductSetting`, `PRODUCT_SETTINGS_PATH`,
`COLLABORATORS_PATH` into `docs/assets/pseudonymiser.mjs`. The repository check of `1d0328c` was added beside the `fetch`
check of ARC-003 decision 6. This file records that no test changed its expectation and that the new check, the moved
checks and the dashboard's own suites fail on a planted fault (SOFTWARE_MAINTENANCE §4.0a rule 5, `A NEW TEST IS SHOWN TO
FAIL ON A PLANTED FAULT`).

## 1. The same tests before and after

**Method.** `node --test tests/*.test.mjs` and `cd tests && python3 -m unittest -v` ran on `b958097` and on `089d503`. The
names of the passing tests were sorted and compared with `diff`.

**Result.** Node ran 158 tests before and 158 after, all passing, and the two lists of names are identical. Python ran 172
tests before and 172 after, all passing. The lists differ in one line only: the module of
`ProductSettingsInTheRepository.test_the_store_has_no_product_setting` is `test_settings_page` instead of
`test_settings_in_the_core`. On `1d0328c`, node runs 159 tests: these 158 and the new repository check.

**Moved, not rewritten.** A script compared the diff of `tests/review-core.test.mjs`, `tests/architecture.test.mjs` and
`tests/review-page-core.test.mjs` with the new `tests/review-core.d/dashboard-writes.test.mjs`. Every line removed from the
three files is found in the new file, except header lines (`Guards:` and the comments describing the file) and import lines.
Every line of the new file is found in the three files at `b958097`, except these: the header, the import lines, one comment
line and the braces that open and close each file's block, and the fixture path `../fixtures/architecture/`. That path is
relative to the folder of the new file. Each source file's checks stand in a block of their own, because the three files used
the same names for different fixtures (`WHEN`, `fakeGitHub`, `readerOf`, `treeOf`). The fixtures that the checks staying
behind also use were copied, not moved.

The Python check moved with one change: the expression reaches the write as `writes.savePseudonymisation` (the name
`tests/jsrun.py` gives `docs/assets/dashboard/writes.mjs`) instead of `core.savePseudonymisation`.

## 2. Counter-proofs

**Method.** A script (not committed) planted one fault at a time and then restored the file. Each fault was either one exact
string replaced in one file or one file removed. The script refused a replacement that did not occur exactly once, and it
compared the SHA-256 of each file after the restore. For each fault it ran `node --test tests/*.test.mjs`, and also `cd tests
&& python3 -m unittest` where the table names Python. Failing tests were read from node's own report (its `✖` lines) and from
unittest's `FAIL`/`ERROR` lines. Both suites were green before the series and after it.

| Planted fault | File | Red |
|---|---|---|
| `writeFiles` added to the import from `./git-host.mjs` | `review-core.mjs` | "the kernel never writes — no kernel file imports a write function of the git host" |
| `import { commitFilesGitLab as c } from "./git-host.mjs"` added | `traceability.mjs` (kernel) | the same test |
| `import * as gitHost from "./git-host.mjs"` added | `artifacts.mjs` (kernel) | the same test |
| the group *Kernel* renamed *Core* | `docs/groups/modules.md` | the same test (the kernel is read from the group file) |
| `addProduct` without its `isTrusted` check | `dashboard/writes.mjs` | "UC-001 5b: a product with the complete layout is only added to the list; no click, nothing at all" |
| `acceptItems` without the order check (`missingNeeds`) | `dashboard/writes.mjs` | "A QUEUE IS ACCEPTED IN ITS ORDER — counter-proof: 06 alone is not offered while its anchor is missing, and 05 is named" |
| `acceptItems` commits none of the files it planned | `dashboard/writes.mjs` | 16 tests: twelve of the acceptance checks moved to `dashboard-writes.test.mjs`, from all three files, and four of the app harness in `review-page.test.mjs`, among them "Accept all N shown: one commit with one record per file the page counted …" and "counter-proof: the write happens only on a trusted click — a click a script makes writes and reads nothing" |
| `saveReviewedFile` without the identifier check | `dashboard/writes.mjs` | "AN EDITED FILE KEEPS ITS IDENTIFIER · A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE — ARC and MOD" |
| `savePseudonymisation` writes `docs/collaborators.md` instead of `docs/settings.md` | `dashboard/writes.mjs` | "A PRODUCT'S SETTINGS LIVE IN ITS REPOSITORY — switching off commits docs/settings.md on a click, after the notice" |
| `savePseudonymisation` returns without writing (Node and Python) | `dashboard/writes.mjs` | the same node test; Python `test_settings_page.ProductSettingsInTheRepository.test_the_store_has_no_product_setting` |
| `setProductSetting` keeps the line it should remove | `pseudonymiser.mjs` | "PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF — docs/settings.md, one line per setting"; "A PRODUCT'S SETTINGS LIVE IN ITS REPOSITORY — switching off commits …" |
| `docs/assets/dashboard/writes.mjs` removed | — | 18 tests of the app harness (`review-page.test.mjs`, `load-per-view.test.mjs`) and the files `architecture-impact.test.mjs`, `architecture-view.test.mjs`, `dashboard-shell.test.mjs` and `review-core.test.mjs`, which no longer load |

The new repository check also checks itself: it shows that each way of importing a write function is caught (by name, under
another name, as a namespace, dynamically). It also shows that a read (`fetchText`) is not caught, and that a `writeFiles`
imported from another module is not caught.

## 3. What the suites do not see

Two planted faults went unseen. Both concern checks that existed before this item and are unchanged by it; they are
recorded here, not repaired.

- **The settings view's import of `savePseudonymisation` and `saveCollaborators` removed** (`dashboard/settings-view.mjs`).
  Both suites stayed green. The view still loads, and the names are missing only when a person clicks *Save*: no test of the
  app harness clicks the settings page's saves.
- **`savePseudonymisation` writing `docs/collaborators.md` instead of `docs/settings.md`.** The Python check stayed green: it
  sees only that a commit was made to the product, not which file was written. The node check in the table sees it.
