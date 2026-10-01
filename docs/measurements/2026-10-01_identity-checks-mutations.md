# Identity checks — the red first commit and counter-proof mutations (ITM-011)

**MESSUNG** — 2026-10-01, branch `team/ITM-011` (from `sprint/01` at `70d7fa6`), macOS, Node 25, Python 3.14.
The counter-proofs of the four new test files of ITM-011 (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`,
SOFTWARE_MAINTENANCE §4.0a rule 5): `tests/test_identifiers.py`, `tests/test_identifier_stability.py`,
`tests/test_origin_links.py`, `tests/test_test_levels.py`, over the fixture repository
`tests/fixtures/identity/` — two versions of one product, `v1` and `v2`.

**The red first commit.** `00d26d0` held only the four test files and the fixture. CI on it was red
(pull request #32, run `36890947023`, job `110466128238`): `Ran 142 tests`, `FAILED (failures=22)` — the 22
new tests and no other, because `docs/assets/artifacts/headers.mjs` and `identity.mjs` did not exist.

**Method.** Each mutation replaced exactly one piece of text in `docs/assets/artifacts/headers.mjs` or
`docs/assets/artifacts/identity.mjs`. The four files then ran (`cd tests && python3 -m unittest
test_identifiers test_identifier_stability test_origin_links test_test_levels`), and the file was restored. A
test is listed as red when unittest reported it as FAIL or ERROR. Before and after the series all 22 tests
were green. After merging `sprint/01` at `50ff611` (ITM-006, ITM-010), with the two module files unchanged,
both full suites were green: `cd tests && python3 -m unittest` 142 (120 before this item), `node --test
tests/*.test.mjs` 158 (unchanged).

**Known positives.** Between `v1` and `v2` a requirement moved to another section, a use case's file was
renamed, a module was withdrawn with its note, a test case moved to another file, and new artifacts were
added; the stability check finds nothing, and the identifier and origin checks find nothing in either
version. Every file of `v2/tests/` has one level.

| Mutation | Red |
|---|---|
| Guards split on a comma, not a semicolon | `test_guards_are_names_separated_by_semicolons`, `test_the_header_of_a_test_is_read` |
| header lines read beyond the first 20 | `test_counter_proof_no_level_more_than_one_or_another_one` |
| a header line may start with prose (a docstring) | `test_the_header_of_a_test_is_read` |
| the first of several Level lines is the level | `test_counter_proof_no_level_more_than_one_or_another_one` |
| only the first TST- identifier of a file is read | `test_the_header_of_a_test_is_read`, `test_every_artifact_of_the_fixture_is_read_by_its_identifier`, `test_counter_proof_one_identifier_on_two_artifacts`, `test_counter_proof_an_identifier_gone_without_a_note`, `test_counter_proof_the_earlier_version_read_as_the_later_one` |
| every code file counts as a test | `test_the_header_of_a_test_is_read` |
| a file that is no test owes a level too | `test_a_file_that_is_no_test_owes_no_level` |
| a test without a Level line passes | `test_counter_proof_no_level_more_than_one_or_another_one` |
| several Level lines pass | `test_counter_proof_no_level_more_than_one_or_another_one` |
| `user` is no level | `test_every_test_of_the_fixture_has_one_level` |
| any level passes | `test_counter_proof_no_level_more_than_one_or_another_one` |
| a requirement name is no identifier | `test_the_kind_of_an_identifier_is_told_by_its_form` |
| UC- takes any number of digits | `test_counter_proof_a_malformed_identifier_has_no_kind` |
| a requirement head without a name in capitals is passed over | `test_counter_proof_a_requirement_without_a_name_in_capitals` |
| any file name in `docs/jobs/` is an identifier | `test_counter_proof_a_file_without_an_identifier` |
| the front matter's id is not compared with the file name | `test_counter_proof_an_identifier_that_is_not_the_one_its_file_carries` |
| a use case may lack its id | `test_counter_proof_an_identifier_that_is_not_the_one_its_file_carries` |
| a malformed TST- identifier is passed over | `test_counter_proof_a_test_whose_cases_carry_no_identifier` |
| a test whose cases carry no TST- passes | `test_counter_proof_a_test_whose_cases_carry_no_identifier` |
| one identifier on two artifacts passes | `test_counter_proof_one_identifier_on_two_artifacts` |
| an identifier may disappear | `test_counter_proof_an_identifier_gone_without_a_note`, `test_counter_proof_the_earlier_version_read_as_the_later_one` |
| a withdrawn identifier may be reused | `test_counter_proof_a_withdrawn_identifier_is_not_reused`, `test_counter_proof_the_earlier_version_read_as_the_later_one` |
| a withdrawal needs no note | `test_counter_proof_a_withdrawn_identifier_without_its_note` |
| identifiers are compared by their place, not alone | `test_an_identifier_travels_with_its_artifact` and four more |
| a withdrawn decision or module is read as live | `test_every_artifact_of_the_fixture_is_read_by_its_identifier`, `test_counter_proof_a_withdrawn_identifier_is_not_reused`, `test_counter_proof_a_withdrawn_identifier_without_its_note`, `test_counter_proof_the_earlier_version_read_as_the_later_one` |
| a withdrawn requirement is read as live | `test_every_artifact_of_the_fixture_is_read_by_its_identifier`, `test_counter_proof_a_withdrawn_identifier_is_not_reused`, `test_counter_proof_a_withdrawn_identifier_without_its_note` |
| a use case that realises nothing passes | `test_counter_proof_a_use_case_decision_or_module_that_names_nothing` |
| a decision that nothing forces passes | `test_counter_proof_a_use_case_decision_or_module_that_names_nothing` |
| a module that realises nothing passes | `test_counter_proof_a_use_case_decision_or_module_that_names_nothing` |
| a module that follows no decision passes | `test_counter_proof_a_use_case_decision_or_module_that_names_nothing` |
| a withdrawn module owes its origin | `test_every_artifact_of_the_fixture_names_its_origin` and three more |
| two modules in one file pass | `test_counter_proof_a_code_file_that_names_not_one_module`, `test_counter_proof_a_test_that_names_no_module_or_guards_nothing` |
| vendored and Markdown files owe a module | `test_every_artifact_of_the_fixture_names_its_origin` and three more |
| a test that guards nothing passes | `test_counter_proof_a_test_that_names_no_module_or_guards_nothing` |
| any guarded entry passes | `test_counter_proof_a_test_that_names_no_module_or_guards_nothing` |

Every one of the 22 new tests is red under at least one mutation.

**Not covered here.** The checks run on the fixture only; this item does not run them on Agent M's own
repository. Where ARC-020 and the SPEC leave the form open — `TST-` in a Python test case's name, a withdrawal
note for use cases, tests, backlog items, job records, sources and resources, how a resource entry carries its
`RES-` identifier, what a test of a rule under no module names in its `Module:` line, how a helper file in a
test folder is told from a test — the checks take the strict reading and the open points are a change request
in pull request #32.
