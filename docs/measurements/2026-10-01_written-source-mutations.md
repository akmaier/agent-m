# A source named as it is written — counter-proof mutations (ITM-127)

**MESSUNG** — 2026-10-01, branch `team/ITM-127` (on `sprint/02` at `7d7667a`), macOS, Node 25.9.0, Python 3.14.6.
The counter-proofs of the tests ITM-127 adds or changes (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`,
SOFTWARE_MAINTENANCE §4.0a rule 5), over the fixture `tests/fixtures/requirements/spec.md`, in which
`A NAMED RULE STAYS ONE` now names its source as it is written (`PO A. Maier, 2026-09-25`).

**Method.** Each mutation replaced exactly one piece of text in `docs/assets/artifacts/requirements.mjs`
(`requirementProblems`). Then the four Python readers of the fixture ran (`cd tests && python3 -m unittest
test_requirement_has_source test_requirement_fields test_single_statement test_requirement_names_check`) and
`node --test tests/artifacts-checks.test.mjs`, and the file was restored. A test is listed as red when unittest
reported it as FAIL or ERROR, or node marked it ✖. Before and after the series, all of them were green, and so
were both full suites (`cd tests && python3 -m unittest`: 175; `node --test tests/*.test.mjs`: 244).

**Red first.** On the test-only commit `8a8355f`, before the change to `requirementProblems`, the Python suite
had 6 failures of 175 and the node suite 3 of 244 — among them every test below that expects a written source
to pass.

| Mutation | Red |
|---|---|
| a source without an SRC- identifier is an error again (the reading of ITM-009) | `test_a_source_named_as_it_is_written_is_no_error`, `test_counter_proof_a_missing_source_is_named_as_missing`, `test_counter_proof_each_missing_field_is_an_error`, `test_the_well_formed_requirements_have_no_finding`, `test_a_resource_entry_named_as_source_is_rejected`, `test_counter_proof_no_conjunction_no_warning`; node: *a complete artifact of every kind yields no finding*, *a requirement: each broken field, check, source, statement and name is one finding at its line*, *one shape in every check of MOD-artifacts — fix, never correction* |
| the linked sources are not compared | `test_counter_proof_a_source_the_product_does_not_link`; node: *a requirement: each broken field …*, *one call runs every check of its kind …* |
| a resource entry named as source is not rejected | `test_a_resource_entry_named_as_source_is_rejected`; node: *a requirement: each broken field …* |
| a source that is only a date counts as a source | `test_counter_proof_a_missing_source_is_named_as_missing`, `test_counter_proof_each_missing_field_is_an_error`; node: *a requirement: each broken field …* |
| a missing source is reported as a source without a date | `test_counter_proof_a_missing_source_is_named_as_missing`; node: *a requirement: each broken field …* |
| a source's date is not required | `test_counter_proof_each_missing_field_is_an_error`; node: *a requirement: each broken field …* |

The two new tests — `test_a_source_named_as_it_is_written_is_no_error` and
`test_counter_proof_a_missing_source_is_named_as_missing` — and every changed one are red under at least one
mutation.
