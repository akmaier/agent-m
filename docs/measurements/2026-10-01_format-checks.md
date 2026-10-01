# Format checks in one call — the red first commit and the counter-proof of every new test

**MESSUNG** — 2026-10-01, branch `team/ITM-013` (from `sprint/01` at `b958097`), macOS, Node 25.9, Python 3.14. ITM-013
(implementation job): `docs/assets/artifacts/checks.mjs` (`formatChecks`, `FORMAT_KINDS`), guarded by
`tests/artifacts-checks.test.mjs`; the finding shape of MOD-artifacts unified to `{ artifact, line, kind, what, rule, fix }`
(MOD-job-harness `formatFinding`). This file records the red first commit and the counter-proof of every new or changed test
(SOFTWARE_MAINTENANCE §4.0a rule 5, `A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).

## 1. The first commit is red

`167ab73` holds only `tests/artifacts-checks.test.mjs` and the five changed Python expectations (`correction` → `fix`).
Locally: Python ran 172 tests with 12 errors (`KeyError: 'fix'` in `test_identifier_stability`, `test_identifiers`,
`test_origin_links`, `test_requirement_fields`, `test_test_levels`); node ran 159 with 1 failing — `tests/artifacts-checks.test.mjs`
cannot load `docs/assets/artifacts/checks.mjs`. In CI, both runs of pull request #35 on that commit failed: run 36894774879
(push) and run 36894797222 (pull request).

## 2. Counter-proofs

**Method.** A script (not committed) planted one fault at a time and restored the file. Each fault was one exact string
replaced in one file; the script refused a replacement that did not occur exactly once and compared the SHA-256 of each file
after the restore. For each fault it ran `cd tests && python3 -m unittest` and `node --test tests/*.test.mjs`. Both suites
were green before the series and after it. Every row is red; node test names are those of `tests/artifacts-checks.test.mjs`
unless the row names another file.

| # | Planted fault | File | Red |
|---|---|---|---|
| 1 | FORMAT_KINDS lacks group-file | `checks.mjs` | node: formatChecks knows the six kinds, and refuses another by naming them |
| 2 | an unknown kind yields no finding instead of throwing | `checks.mjs` | node: formatChecks knows the six kinds, and refuses another by naming them |
| 3 | requirement: the names themselves are not checked | `checks.mjs` | node: a requirement: each broken field, check, source, statement and name is one finding at its line |
| 4 | requirement: the linked sources are not passed on | `checks.mjs` | node: a complete artifact of every kind yields no finding; node: a requirement: each broken field, check, source, statement and name is one finding at its line; node: one call runs every check of its kind — the same findings as the single checks, nothing left out |
| 5 | requirement: a name given twice is named by SPEC.md, not by its lines | `checks.mjs` | node: a requirement: each broken field, check, source, statement and name is one finding at its line |
| 6 | use case: the identifier it was opened with is not compared | `checks.mjs` | node: a use case: the identifier it was opened with is kept, beside every check of useCaseProblems |
| 7 | the identifier's finding names line 1, not the line of the id | `checks.mjs` | node: a decision: each broken part, origin, key, identifier, diagram and withdrawal is one finding at its line; node: a module: each broken interface, origin, key and part is one finding at its line; node: a use case: the identifier it was opened with is kept, beside every check of useCaseProblems |
| 8 | decision: a missing title is filed under the file's rule | `checks.mjs` | node: a decision: each broken part, origin, key, identifier, diagram and withdrawal is one finding at its line |
| 9 | decision: forced_by is filed under the parts' rule | `checks.mjs` | node: a decision: each broken part, origin, key, identifier, diagram and withdrawal is one finding at its line |
| 10 | architecture: a wrong item names the line of its key, not its own | `checks.mjs` | node: a decision: each broken part, origin, key, identifier, diagram and withdrawal is one finding at its line; node: a module: each broken interface, origin, key and part is one finding at its line |
| 11 | architecture: without front matter every missing key is reported | `checks.mjs` | node: a decision: each broken part, origin, key, identifier, diagram and withdrawal is one finding at its line |
| 12 | architecture: a module checked as a decision is not named | `checks.mjs` | node: a decision: each broken part, origin, key, identifier, diagram and withdrawal is one finding at its line |
| 13 | architecture: names are not looked up in the known names | `checks.mjs` | node: a decision: each broken part, origin, key, identifier, diagram and withdrawal is one finding at its line; node: a module: each broken interface, origin, key and part is one finding at its line |
| 14 | module: its origin (realises, follows) is not checked | `checks.mjs` | node: a module: each broken interface, origin, key and part is one finding at its line |
| 15 | architecture: an image is not reported | `checks.mjs` | node: a decision: each broken part, origin, key, identifier, diagram and withdrawal is one finding at its line |
| 16 | architecture: an image's line is counted in the body | `checks.mjs` | node: a decision: each broken part, origin, key, identifier, diagram and withdrawal is one finding at its line |
| 17 | architecture: a withdrawal without its note is not reported | `checks.mjs` | node: a decision: each broken part, origin, key, identifier, diagram and withdrawal is one finding at its line |
| 18 | architecture: the identifier it was opened with is not compared | `checks.mjs` | node: a decision: each broken part, origin, key, identifier, diagram and withdrawal is one finding at its line; node: a module: each broken interface, origin, key and part is one finding at its line |
| 19 | test: the level is not checked | `checks.mjs` | node: a test: its level, its module, what it guards and its case identifiers are each one finding |
| 20 | test: the TST- identifiers are not checked | `checks.mjs` | node: a test: its level, its module, what it guards and its case identifiers are each one finding |
| 21 | test: a guarded name is not looked up | `checks.mjs` | node: a test: its level, its module, what it guards and its case identifiers are each one finding |
| 22 | group file: the item stays the artifact | `checks.mjs` | node: a group file: each finding names the group file, at the line of the group file |
| 23 | shape: the correction is left out | `checks.mjs` | node: A FINDING READS LIKE A COMPILER MESSAGE — every finding has one shape and renders in the template's form; node: one call runs every check of its kind — the same findings as the single checks, nothing left out |
| 24 | shape: the keys in another order | `checks.mjs` | node: A FINDING READS LIKE A COMPILER MESSAGE — every finding has one shape and renders in the template's form |
| 25 | architecture: a missing section has no row of its own | `checks.mjs` | node: A FINDING READS LIKE A COMPILER MESSAGE — every finding has one shape and renders in the template's form; node: a decision: each broken part, origin, key, identifier, diagram and withdrawal is one finding at its line; node: a module: each broken interface, origin, key and part is one finding at its line |
| 26 | requirements.mjs: the correction is called correction again | `requirements.mjs` | node: A FINDING READS LIKE A COMPILER MESSAGE — every finding has one shape and renders in the template's form; node: one call runs every check of its kind — the same findings as the single checks, nothing left out; node: one shape in every check of MOD-artifacts — fix, never correction; python: `test_requirement_fields` test_counter_proof_each_missing_field_is_an_error |
| 27 | headers.mjs: the correction is called correction again | `headers.mjs` | node: A FINDING READS LIKE A COMPILER MESSAGE — every finding has one shape and renders in the template's form; node: one shape in every check of MOD-artifacts — fix, never correction; python: `test_test_levels` test_counter_proof_no_level_more_than_one_or_another_one |
| 28 | identity.mjs: the correction is called correction again | `identity.mjs` | node: A FINDING READS LIKE A COMPILER MESSAGE — every finding has one shape and renders in the template's form; node: one shape in every check of MOD-artifacts — fix, never correction; python: `test_identifier_stability` test_counter_proof_a_withdrawn_identifier_is_not_reused; python: `test_identifier_stability` test_counter_proof_a_withdrawn_identifier_without_its_note; python: `test_identifier_stability` test_counter_proof_an_identifier_gone_without_a_note; python: `test_identifiers` test_counter_proof_a_file_without_an_identifier; python: `test_identifiers` test_counter_proof_a_test_whose_cases_carry_no_identifier; python: `test_identifiers` test_counter_proof_an_identifier_that_is_not_the_one_its_file_carries; python: `test_identifiers` test_counter_proof_one_identifier_on_two_artifacts; python: `test_origin_links` test_counter_proof_a_code_file_that_names_not_one_module; python: `test_origin_links` test_counter_proof_a_test_that_names_no_module_or_guards_nothing; python: `test_origin_links` test_counter_proof_a_use_case_decision_or_module_that_names_nothing |
| 29 | use-cases.mjs: keyLine always names line 1 | `use-cases.mjs` | node: A FINDING READS LIKE A COMPILER MESSAGE — every finding has one shape and renders in the template's form; node: a decision: each broken part, origin, key, identifier, diagram and withdrawal is one finding at its line; node: a module: each broken interface, origin, key and part is one finding at its line; node: a use case: the identifier it was opened with is kept, beside every check of useCaseProblems |
| 30 | use-cases.mjs: diagramImages finds no image | `use-cases.mjs` | node: a decision: each broken part, origin, key, identifier, diagram and withdrawal is one finding at its line |
| 31 | repository: MOD-artifacts without its section ## Interfaces | `MOD-artifacts.md` | node: every use case, decision, module and group file of this repository passes formatChecks; python: `test_architecture_files` test_every_architecture_file_of_the_instance_is_complete |
| 32 | repository: UC-007 without its postcondition | `UC-007-derive-use-cases-from-requirements.md` | node: every use case of this repository passes the dashboard's reader; node: every use case, decision, module and group file of this repository passes formatChecks; python: `test_usecase_fields` test_every_use_case_is_complete |
| 33 | repository: a use case in the module groups | `modules.md` | node: every use case, decision, module and group file of this repository passes formatChecks; python: `test_groups` test_every_group_file_of_this_repository_holds_one_kind_in_the_file_of_that_kind |

Each of the 12 new node tests is red in at least one row, and so is each of the 12 Python tests whose expectation changed
(rows 26–28). Row 32 also turns `tests/artifacts-twin.test.mjs` red ("every use case of this repository passes the
dashboard's reader").

## 3. This repository, run through formatChecks (a scratch run, not part of the suite)

Without known names (the SPEC is not read): every use case, decision, module and group file yields no finding — the last test
of the file checks exactly this. The 54 files under `tests/` (fixtures excluded) that `isCodePath` and `isTestPath` count as
tests yield 72 errors, all from the strict readings of ITM-011 whose open points are pending with `akmaier`; they are not
loosened here:

- 54 `EVERY ARTIFACT HAS AN IDENTIFIER`: 49 files whose cases carry no `TST-` identifier, and 5 malformed `TST-` strings that
  are fixture data inside test code (`TST-12`, `TST-02` in `tests/test_identifiers.py`; `TST-4` three times in
  `tests/artifacts-checks.test.mjs`);
- 10 `EVERY ARTIFACT NAMES ITS ORIGIN`: no `Module:` or no `Guards:` in `tests/app-harness.mjs`, `tests/jsrun.py`,
  `tests/artifact_checks.py`, `tests/review-core.d/helpers.mjs` (helpers), `tests/test_licence.py`,
  `tests/test_pages_layout.py`, `tests/test_products_folder.py` (tests of rules under no module);
- 4 `EVERY TEST HAS ONE LEVEL`: the four helpers.
