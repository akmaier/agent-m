# The link graph of one commit, its gaps and the impact lists — counter-proofs (ITM-018)

**MESSUNG** — 2026-10-01, branch `team/ITM-018` (on `sprint/02` at `4e20caa`), tests at `22e3114`, code at `0b82ab8`, macOS,
Node 25.9.0, Python 3.14.6. developer-opus-d (claude-opus-5-5).

The counter-proofs of the four checks the SPEC names for `THE TRACEABILITY MATRIX IS DERIVED`, `A REFERENCE NAMES THE
IDENTIFIER, NOT THE POSITION`, `UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN`, `MODULE GAPS ARE REPORTED, NOT
FORBIDDEN` and `A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST`, and of the impact list of an architecture change now
computed over the graph (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`, SOFTWARE_MAINTENANCE §4.0a rule 5).

## Suites

| | before (`4e20caa`) | tests only (`22e3114`) | after (`0b82ab8` and the test fix below) |
|---|---|---|---|
| `node --test tests/*.test.mjs` | 338 tests — 333 pass, 5 todo | 335 — 329 pass, 1 fail, 5 todo | 338 — 333 pass, 5 todo |
| `cd tests && python3 -m unittest` | 318, OK (2 expected failures) | 337 — 19 failures (2 expected failures) | 337, OK (2 expected failures) |

On `22e3114` the Python failures are `TypeError: traceability.linkGraph is not a function`; the one node failure is
`tests/architecture-impact.test.mjs`, which does not load (`does not provide an export named 'architectureImpact'`), so its
three tests are not counted. CI on `22e3114`: runs 36929769287 (push) and 36929789103 (pull request), both red. CI on
`0b82ab8`: runs 36930293817 and 36930298473, both green.

19 Python tests added: `test_matrix_derived` 4, `test_references` 3, `test_coverage_report` 8, `test_impact_list` 4. No
node test added or removed; `tests/architecture-impact.test.mjs` calls `architectureImpact` over `linkGraph` with every
expected result unchanged.

## Counter-proofs

Each fault planted in a real file, the four Python modules and four node test files run
(`tests/architecture-impact.test.mjs`, `tests/architecture-view.test.mjs`, `tests/review-page.test.mjs`,
`tests/load-per-view.test.mjs`), the file restored; after all of them `git status` showed no change under `docs/`. Script:
`scratchpad/itm018-developer-opus-d/plant.txt` (not committed).

| | Planted fault | File | Red |
|---|---|---|---|
| G1 | `tracesTo` keeps its first answer per name — a stored row | `traceability/graph.mjs` | `test_matrix_derived` the graph is a value of the files alone |
| G2 | `linkGraph` reads a matrix kept by hand (rows `\| NAME \| UC-nnn \|` of a file named matrix or traceability) | `traceability/graph.mjs` | `test_matrix_derived` a stored matrix is not read |
| G3 | a use case's `realises` read only up to its first name | `traceability/graph.mjs` | 4 tests in `test_matrix_derived`, `test_references`, `test_coverage_report`, `test_impact_list` |
| R1 | a reference `§1`, `section 1` or `SPEC.md:7` resolved to the requirement standing there | `traceability/graph.mjs` | `test_references` a reference by position reaches nothing |
| R2 | `tracesTo` names a use case by its path instead of its identifier | `traceability/graph.mjs` | 4 tests, among them `test_references` moving a requirement or renaming a file |
| R3 | names compared without their apostrophes | `traceability/graph.mjs` | `test_references` a name spelled otherwise is another name |
| C1 | `coverageGaps` lists no unrealised requirement | `traceability/graph.mjs` | 2 tests of `test_coverage_report` |
| C2 | a use case realising only unknown or withdrawn names counts as realising | `traceability/graph.mjs` | `test_coverage_report` a requirement without use case … are listed |
| C3 | an unknown name loses the note that it was withdrawn | `traceability/graph.mjs` | `test_coverage_report` a requirement without use case … are listed |
| C4 | `coverageGaps` throws when a requirement is unrealised — a blocking gate | `traceability/graph.mjs` | 3 tests, among them `test_coverage_report` every view is computed on a graph full of gaps |
| C5 | `moduleRows` drops the gap of a module that realises nothing | `traceability/graph.mjs` | 2 tests of `test_coverage_report` |
| C6 | `moduleRows` drops the gap of a requirement no module realises | `traceability/graph.mjs` | 2 tests of `test_coverage_report` |
| C7 | `moduleRows` drops the gap of a code file that names no module | `traceability/graph.mjs` | 2 tests of `test_coverage_report` |
| C8 | every gap is marked `severity: "error"` | `traceability/graph.mjs` | `test_coverage_report` every view is computed on a graph full of gaps |
| C9 | `linkGraph` throws on a module that realises nothing — ITM-013's format error turned into a block | `traceability/graph.mjs` | 18 Python tests and 8 node tests (the impact tests, the review page, the changed module's view) |
| C10 | `coverageGaps` reports no untested requirement | `traceability/graph.mjs` | 2 tests of `test_coverage_report` |
| I1 | `requirementImpact` leaves out the tests | `traceability/graph.mjs` | 2 tests of `test_impact_list` |
| I2 | `requirementImpact` lists the queue entries too | `traceability/graph.mjs` | `test_impact_list` the open entry is shown with … each existing name |
| I3 | `requirementImpact` lists nothing for a name without a node — a withdrawn one | `traceability/graph.mjs` | `test_impact_list` a withdrawn requirement lists what still names it; `test_coverage_report` every view … |
| I4 | a queue entry the approval engine found `applied` or `superseded` still proposes | `traceability/graph.mjs` | `test_impact_list` what does not name it is not listed |
| I5 | a requirement an entry repeats word for word counts as changed | `traceability/graph.mjs` | `test_impact_list` the open entry is shown with … each existing name |
| I6 | an entry's rationale file (`*.begruendung.md`) is read as an entry | `traceability/graph.mjs` | 2 tests of `test_impact_list` — after the test fix below |
| A1 | `architectureImpact` finds no code or test of an affected module | `traceability.mjs` | 2 tests of `tests/architecture-impact.test.mjs` |
| A2 | `architectureImpact` does not mark the user of a removed interface *breaks* | `traceability.mjs` | `tests/architecture-impact.test.mjs` a module: users of an altered or removed interface |
| A3 | `architectureImpact` reads no module of the graph for a decision | `traceability.mjs` | `tests/architecture-impact.test.mjs` a decision …; `test_coverage_report` every view … |
| D1 | the architecture view builds its graph without the code's headers | `dashboard/review-views.mjs` | **none** |
| D2 | the review page builds its graph without the architecture files | `dashboard/review-views.mjs` | **none** |

**I6, first run: not red.** The rationale file of the fixture queue held `Why: **RULE ONE** *(nobody)*` — not a requirement
in the SPEC's form, because the name does not begin its line, so reading it as an entry changed nothing. The fixture now
quotes `**RULE ONE** *(PO, 2026-10-01)*` at the start of a line, and I6 is red on two tests. The fix is in the test only.

**D1 and D2: not red — no test checks what the dashboard's impact list contains.** `tests/review-page.test.mjs` asserts
*Impact of this change* and *Affected modules*, `tests/load-per-view.test.mjs` *Affected modules* and the requests for the
code's headers; neither asserts a module, a code file or a test in the list. In the fixture of both tests the changed
module alters no interface, so D2 would leave even the list's content unchanged. The two calls themselves are covered —
an undefined function or a thrown error leaves the panel without *Accept* (C9 turns all of them red). The tests that
would see D1 lie outside this item's files (MOD-dashboard-app, `review-views.mjs` only); reported, not added.
