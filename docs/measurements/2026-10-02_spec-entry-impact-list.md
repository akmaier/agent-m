# The SPEC change entry shows its impact list — counter-proofs and requests per load (ITM-134)

**MESSUNG** — 2026-10-02, branch `team/ITM-134` (on `sprint/02` at `a19371b`), tests at `aed5ca7`, code at `c9ce932`, macOS,
Node 25.9.0, Python 3.14.6. developer-opus-d (claude-opus-5-5).

UC-006 3b, `A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST`: `dashboard/spec-changes-view.mjs` `viewSpecEntry` shows, for
every requirement of the SPEC that the entry changes or withdraws, the use cases, decisions, modules and tests that name it —
MOD-traceability's `requirementImpact` over `linkGraph` of the files of the commit shown — beside the current section, the
proposal and the difference, before *Accept*. The counter-proofs of its five tests (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED
FAULT`, SOFTWARE_MAINTENANCE §4.0a rule 5), and the requests one load of an entry makes before and after.

## Suites

| | before (`a19371b`) | tests only (`aed5ca7`) | after (`c9ce932`) |
|---|---|---|---|
| `node --test tests/*.test.mjs` | 366 tests — 361 pass, 5 todo | 370 — 362 pass, 3 fail, 5 todo | 371 — 366 pass, 5 todo |
| `cd tests && python3 -m unittest` | 351, OK (5 expected failures) | 351, OK (5 expected failures) | 351, OK (5 expected failures) |

On `aed5ca7` the three failures are the three tests of `tests/dashboard-spec-impact.test.mjs` that expect a list ("the entry
shows an impact list" / the request count); its counter-proof test — an entry that only adds a requirement shows none and reads
nothing for it — passes on the dashboard of today, as it must. CI on `aed5ca7`: runs 36932132266 (push) and 36932163629 (pull
request), both red. The fifth test (an entry whose list cannot be derived is not offered for acceptance) was added with the code
in `c9ce932`; on `aed5ca7`'s view it fails too (no list, Accept offered). The five `todo` cases are the release tests' and
the approval engine's findings, unchanged. No expected result of another test changed.

## Counter-proofs

Each fault planted in `docs/assets/dashboard/spec-changes-view.mjs`, `node --test tests/dashboard-spec-impact.test.mjs` run,
the file restored; after all of them the file was byte-identical and the suite green. Script:
`scratchpad/itm134-developer-opus-d/counter-proofs.txt` (not committed).

| | Planted fault | Red |
|---|---|---|
| M1 | the impact section is not rendered | the three tests that expect a list: changed (T1), withdrawn (T3), not derivable (T5) |
| M2 | a requirement the entry only adds counts as touched | the counter-proof (T2) — a list shown and the graph read for entry 02 —; the request count (T4) |
| M3 | a withdrawn requirement is not counted as touched | T3 |
| M4 | the graph is built without the tests | T1 (the test guarding RULE ONE missing), T4, T5 (the failing file not read, Accept offered) |
| M5 | every code file is read, not only the tests | T4 (`src/reader.mjs` read) |
| M6 | the files are read although the entry touches no requirement | T2, T4 |
| M7 | Accept is offered although the list could not be derived | T5 |
| M8 | the list is shown after the Accept panel | T1 |
| M9 | the list keeps only the tests (`requirementImpact` filtered) | T1, T3 |

T1 also shows that the list is derived, not stored: after a commit that adds a fourth use case naming RULE ONE, a new load
lists four.

## Requests per load of an entry

The harness (`tests/app-harness.mjs`) counts every request. Two fixtures: the test's own, and Agent M's own repository — every
tracked file except the vendored libraries, at `c9ce932` — with one synthetic queue added: entry 01 rewords `A REQUIREMENT IS
NOT CHANGED WITHOUT AN IMPACT LIST`, entry 02 adds a new rule beside it. *Cold*: an empty file cache; *warm*: a second load
with the Cache Storage of the first. Before is the view of `a19371b` (served from an export of `docs/assets` at that commit),
after the view of `c9ce932`, on the same files. Script: `scratchpad/itm134-developer-opus-d/measure-requests.txt`.

| Fixture, entry | before: cold · warm | after: cold · warm | list shown after |
|---|---|---|---|
| test fixture, 01 (changes RULE ONE; has a rationale) | 9 (7 files) · 2 | 16 (14 files) · 2 | UC-001, UC-002, `tests/one.test.mjs` |
| test fixture, 02 (adds only) | 8 (6 files) · 2 | 8 (6 files) · 2 | no |
| test fixture, 03 (withdraws RULE TWO) | 8 (6 files) · 2 | 15 (13 files) · 2 | UC-002, ARC-001, MOD-reader |
| Agent M, 02 (adds only) | 61 (59 files) · 2 | 61 (59 files) · 2 | no |
| Agent M, 01 (changes the rule) | 61 (59 files) · 2 | 260 (258 files) · 2 | 9: UC-005, UC-006, UC-012, UC-016, UC-018, ARC-006, MOD-traceability, `tests/dashboard-spec-impact.test.mjs`, `tests/test_impact_list.py` |

The warm load is the commit and the tree in every case: each file is read through the page's file cache by its blob SHA
(`app.fileText`, MOD-settings-store `fileTexts`), the same cache every view reads through — a test file the architecture
impact list read before (`headersAt`) is not read again, and vice versa. An entry that touches no existing requirement reads
nothing more than before. An entry that does reads, once per blob, every use case (43), architecture file (54) and test
(102, 13 of them under `tests/fixtures/`) of the commit: 199 files on Agent M's repository. Which tests guard a requirement
is stated only in each test's own `Guards:` line, so no smaller set can be read; code files that are not tests are not read
(the list names none).

## Readings taken while writing

- The table's test-fixture rows load each entry with its own empty cache (`scratchpad/itm134-developer-opus-d/measure-fixture.txt`).
  The test itself loads entry 02 and then entry 01 with one shared cache and prints what it saw (`t.diagnostic`): entry 02
  cold 8 requests (6 files), warm 2; entry 01 cold 10 (8 files — the rationale and the 7 use cases, architecture files and
  tests; the SPEC and the queue were read by entry 02's load), warm 2.
- `isCodePath` and `isTestPath` (`docs/assets/artifacts.mjs`) choose the tests — the same predicates `linkGraph` and
  `moduleHeaders` use; neither is listed under MOD-artifacts' `provides`, as `ARCHITECTURE_FILE`, which `review-views.mjs`
  already imports, is not.
