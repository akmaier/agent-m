# Requirement checks — counter-proof mutations (ITM-009)

**MESSUNG** — 2026-10-01, branch `team/ITM-009` (on `sprint/01` at `cfecd40`), macOS, Node 25,
Python 3. The counter-proofs of the four new test files of ITM-009 (`A NEW TEST IS SHOWN TO FAIL ON A
PLANTED FAULT`, SOFTWARE_MAINTENANCE §4.0a rule 5): `tests/test_requirement_fields.py`,
`tests/test_single_statement.py`, `tests/test_requirement_names_check.py`,
`tests/test_requirement_has_source.py`, over the fixture `tests/fixtures/requirements/spec.md`.

**Method.** Each mutation replaced exactly one piece of text in `docs/assets/artifacts/requirements.mjs`.
The four files then ran (`cd tests && python3 -m unittest test_requirement_fields test_single_statement
test_requirement_names_check test_requirement_has_source`), and the file was restored. A test is listed as
red when unittest reported it as FAIL or ERROR. Before and after the series, all 13 tests were green, and so
were both full suites (`cd tests && python3 -m unittest`: 106; `node --test tests/*.test.mjs`: 134).

**Known positive of the delegation.** `specRequirements` now reads through `parseRequirements`. On
Agent M's own `SPEC.md` both readers — the one at `cfecd40` and the delegating one — give the same 333
names with the same withdrawal marks (compared once by hand; no test reads `SPEC.md` for it).

| Mutation | Red |
|---|---|
| the occasion is not required | `test_counter_proof_each_missing_field_is_an_error` |
| the rule is not required | `test_counter_proof_each_missing_field_is_an_error` |
| the check field is not required | `test_counter_proof_each_missing_field_is_an_error` |
| the source's date is not required | `test_counter_proof_each_missing_field_is_an_error` |
| the source is read on its first line only | `test_every_requirement_is_read_by_its_name_with_its_fields`, `test_a_field_that_runs_over_several_lines_is_read_whole`, `test_a_withdrawn_requirement_is_marked_and_owes_no_fields`, `test_the_well_formed_requirements_have_no_finding`, `test_a_named_test_or_review_is_a_check`, `test_a_linked_source_is_a_registered_source`, `test_a_resource_entry_named_as_source_is_rejected` |
| the section is never read | `test_every_requirement_is_read_by_its_name_with_its_fields` |
| a field is read on its first line only | 12 of 13, among them `test_a_queue_entry_is_read_like_a_spec` |
| a withdrawn requirement is checked like any other | `test_a_withdrawn_requirement_is_marked_and_owes_no_fields` |
| no conjunction is ever found | `test_a_conjunction_in_the_rule_is_a_warning` |
| "additionally" is not a conjunction | `test_a_conjunction_in_the_rule_is_a_warning` |
| a conjunction is found without word boundaries | `test_counter_proof_no_conjunction_no_warning`, `test_the_well_formed_requirements_have_no_finding` |
| names in backticks are not left out | `test_counter_proof_no_conjunction_no_warning`, `test_the_well_formed_requirements_have_no_finding` |
| any mention of review counts as a check | `test_counter_proof_a_check_that_names_neither_is_an_error` |
| any check counts as naming a test | `test_counter_proof_a_check_that_names_neither_is_an_error` |
| the linked sources are not compared | `test_counter_proof_a_source_the_product_does_not_link` |
| a resource entry named as source is not rejected | `test_a_resource_entry_named_as_source_is_rejected` |
| a requirement without a source identifier passes | `test_counter_proof_a_source_the_product_does_not_link` |
| linked entries given as `{ source }` are not read | `test_a_linked_source_is_a_registered_source` |

Every one of the 13 new tests is red under at least one mutation.

**Not covered here.** `A REQUIREMENT NAMES WHAT IT CONSTRAINS` — the item names it for
`tests/test_requirement_fields.py`, but neither the SPEC's form of a requirement nor MOD-artifacts nor an
ARC file says how a requirement states it; no check was written (change request in pull request #28).
