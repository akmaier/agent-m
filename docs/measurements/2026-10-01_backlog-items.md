# Backlog items and their order — the red first commit and the counter-proof of every new test

**MESSUNG** — 2026-10-01, branch `team/ITM-033` (from `sprint/02` at `b80079d`), macOS, Node 25.9, Python 3.14.
ITM-033 (implementation job, developer-opus-b): `docs/assets/work-items.mjs` (`parseItem`, `itemProblems`,
`backlogOrder`, `itemFromIssue`) and the job definition `docs/assets/jobs/propose-backlog-items/` (`job.json`,
`prompt.md`), guarded by `tests/test_backlog_layout.py` and `tests/test_backlog_item_fields.py` with their fixtures under
`tests/fixtures/backlog/`. This file records the red first commit and the counter-proof of every new test
(SOFTWARE_MAINTENANCE §4.0a rule 5, `A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).

## 1. The first commit is red

`9c639ff` holds only the two test files and the fixtures. Locally, Python ran 233 tests, and 35 of them failed (31
failures, 4 errors): every new test but one, each with `ReferenceError: workItems is not defined` or, for the job
definition, a missing `job.json`. The one that passed, `test_the_backlog_is_markdown_under_docs_backlog`, checks the
layout of this repository's `docs/backlog/` and needs no module; its counter-proof is the planted file in section 2.
Node ran 244 tests, all passing; there is no new node test. In CI, both runs of pull request #45 on that commit failed:
run 36919815913 (push) and run 36919837445 (pull request) — `gh pr checks 45`, once, 240 s after the push.

## 2. Counter-proofs

**Method.** A script (not committed) planted one fault at a time and then restored the file. Each fault was one exact
string replaced in one file — refused unless it occurred exactly once, with the file's SHA-256 compared after the
restore — or one file planted and removed. For each fault it ran `cd tests && python3 -m unittest test_backlog_layout
test_backlog_item_fields`. Both modules were green before the series and after it. Every row below is red; the *Red*
column gives the number of red tests and their names (unittest names, with their file).

| Planted fault | File | Red |
|---|---|---|
| parse: an item anywhere is accepted as an item of the backlog | `work-items.mjs` | 1: test_counter_proof_an_item_elsewhere_or_named_otherwise_is_a_problem (test_backlog_layout) |
| parse: an item file without its slug, or with capitals in it, passes | `work-items.mjs` | 1: test_counter_proof_an_item_elsewhere_or_named_otherwise_is_a_problem (test_backlog_layout) |
| parse: a file without front matter is not reported | `work-items.mjs` | 2: test_counter_proof_a_file_without_front_matter_is_no_item (test_backlog_layout); test_every_broken_item_yields_exactly_the_findings_expected_json_names (test_backlog_item_fields) |
| parse: an item without an id passes | `work-items.mjs` | 1: test_every_broken_item_yields_exactly_the_findings_expected_json_names (test_backlog_item_fields) |
| parse: an id other than the file name's passes | `work-items.mjs` | 2: test_counter_proof_an_identifier_other_than_the_file_name_is_a_problem (test_backlog_layout); test_every_broken_item_yields_exactly_the_findings_expected_json_names (test_backlog_item_fields) |
| parse: an item without a title passes | `work-items.mjs` | 1: test_every_broken_item_yields_exactly_the_findings_expected_json_names (test_backlog_item_fields) |
| parse: realises written as one line is not reported | `work-items.mjs` | 1: test_every_broken_item_yields_exactly_the_findings_expected_json_names (test_backlog_item_fields) |
| parse: `[]` is not read as the empty list | `work-items.mjs` | 1: test_every_broken_item_yields_exactly_the_findings_expected_json_names (test_backlog_item_fields) |
| parse: an origin written as a list is not read | `work-items.mjs` | 2: test_lists_may_be_empty_and_an_origin_may_name_several_issues (test_backlog_layout); test_the_items_of_the_fixture_backlog_have_no_finding (test_backlog_item_fields) |
| parse: every origin counts as an issue | `work-items.mjs` | 1: test_an_origin_that_is_no_issue_is_kept_as_it_is_written (test_backlog_layout) |
| parse: only GitHub addresses are issues | `work-items.mjs` | 2: test_a_change_realises_the_requirements_of_its_queue_entries_each_once (test_backlog_item_fields); test_lists_may_be_empty_and_an_origin_may_name_several_issues (test_backlog_layout) |
| parse: the level is kept as text | `work-items.mjs` | 2: test_an_item_is_read_into_its_parts (test_backlog_layout); test_lists_may_be_empty_and_an_origin_may_name_several_issues (test_backlog_layout) |
| parse: a section runs to the end of the file | `work-items.mjs` | 1: test_an_item_is_read_into_its_parts (test_backlog_layout) |
| parse: the acceptance criteria are not read | `work-items.mjs` | 1: test_an_item_is_read_into_its_parts (test_backlog_layout) |
| parse: the line of each listed name is not kept | `work-items.mjs` | 2: test_counter_proof_another_identifier_in_capitals_is_no_requirement_name (test_backlog_item_fields); test_every_broken_item_yields_exactly_the_findings_expected_json_names (test_backlog_item_fields) |
| check: the item's own problems are dropped | `work-items.mjs` | 1: test_every_broken_item_yields_exactly_the_findings_expected_json_names (test_backlog_item_fields) |
| check: the item's own list of problems is extended | `work-items.mjs` | 1: test_checking_leaves_the_item_as_it_was (test_backlog_item_fields) |
| check: a file without front matter is checked further | `work-items.mjs` | 1: test_every_broken_item_yields_exactly_the_findings_expected_json_names (test_backlog_item_fields) |
| check: an item that realises nothing passes | `work-items.mjs` | 4: test_counter_proof_a_change_without_queue_entries_or_a_bug_without_a_violated_requirement_realises_nothing (test_backlog_item_fields); test_counter_proof_a_draft_that_realises_nothing_is_rejected_and_one_restating_an_item_flagged (test_backlog_item_fields); test_every_broken_item_yields_exactly_the_findings_expected_json_names (test_backlog_item_fields); test_without_known_names_only_the_form_of_a_name_is_checked (test_backlog_item_fields) |
| check: a use case the product lacks passes | `work-items.mjs` | 2: test_a_use_case_counts_only_when_the_product_has_it (test_backlog_item_fields); test_every_broken_item_yields_exactly_the_findings_expected_json_names (test_backlog_item_fields) |
| check: a requirement the product lacks passes | `work-items.mjs` | 2: test_checking_leaves_the_item_as_it_was (test_backlog_item_fields); test_every_broken_item_yields_exactly_the_findings_expected_json_names (test_backlog_item_fields) |
| check: any text counts as a requirement name | `work-items.mjs` | 3: test_counter_proof_another_identifier_in_capitals_is_no_requirement_name (test_backlog_item_fields); test_every_broken_item_yields_exactly_the_findings_expected_json_names (test_backlog_item_fields); test_without_known_names_only_the_form_of_a_name_is_checked (test_backlog_item_fields) |
| check: an identifier in capitals counts as a requirement name | `work-items.mjs` | 1: test_counter_proof_another_identifier_in_capitals_is_no_requirement_name (test_backlog_item_fields) |
| check: an item without an origin passes | `work-items.mjs` | 1: test_every_broken_item_yields_exactly_the_findings_expected_json_names (test_backlog_item_fields) |
| check: an item restating another is not flagged | `work-items.mjs` | 3: test_an_item_with_the_outcome_of_another_is_flagged (test_backlog_item_fields); test_an_item_with_the_title_of_another_is_flagged (test_backlog_item_fields); test_counter_proof_a_draft_that_realises_nothing_is_rejected_and_one_restating_an_item_flagged (test_backlog_item_fields) |
| check: an item is compared with itself | `work-items.mjs` | 3: test_counter_proof_an_item_is_not_compared_with_itself_nor_flagged_for_a_different_title_and_outcome (test_backlog_item_fields); test_every_item_of_this_repository_names_what_it_realises_and_where_it_came_from (test_backlog_item_fields); test_the_items_of_the_fixture_backlog_have_no_finding (test_backlog_item_fields) |
| check: the outcome is not compared | `work-items.mjs` | 1: test_an_item_with_the_outcome_of_another_is_flagged (test_backlog_item_fields) |
| check: case, punctuation and spacing count when comparing | `work-items.mjs` | 2: test_an_item_with_the_outcome_of_another_is_flagged (test_backlog_item_fields); test_an_item_with_the_title_of_another_is_flagged (test_backlog_item_fields) |
| order: a line naming no item is taken into the order | `work-items.mjs` | 1: test_counter_proof_a_line_naming_no_item_or_an_item_twice_is_a_problem (test_backlog_layout) |
| order: an item named twice is not reported | `work-items.mjs` | 1: test_counter_proof_a_line_naming_no_item_or_an_item_twice_is_a_problem (test_backlog_layout) |
| order: the unplaced items are not appended | `work-items.mjs` | 3: test_counter_proof_a_line_naming_no_item_or_an_item_twice_is_a_problem (test_backlog_layout); test_the_order_names_items_and_the_rest_is_appended_at_the_bottom (test_backlog_layout); test_without_an_order_file_every_item_is_unplaced_in_the_order_of_its_identifier (test_backlog_layout) |
| order: the unplaced items are not in the order of their identifiers | `work-items.mjs` | 4: test_counter_proof_a_line_naming_no_item_or_an_item_twice_is_a_problem (test_backlog_layout); test_prose_and_other_lists_of_the_order_file_are_not_read_as_items (test_backlog_layout); test_the_order_names_items_and_the_rest_is_appended_at_the_bottom (test_backlog_layout); test_without_an_order_file_every_item_is_unplaced_in_the_order_of_its_identifier (test_backlog_layout) |
| order: an identifier anywhere in a line is read as a place | `work-items.mjs` | 2: test_prose_and_other_lists_of_the_order_file_are_not_read_as_items (test_backlog_layout); test_the_order_of_this_repository_places_every_item_once (test_backlog_layout) |
| order: the lines are taken in sorted order, as their numbers say | `work-items.mjs` | 2: test_counter_proof_a_line_naming_no_item_or_an_item_twice_is_a_problem (test_backlog_layout); test_the_order_follows_the_lines_not_their_numbers (test_backlog_layout) |
| from issue: an issue of any class gives an item | `work-items.mjs` | 1: test_counter_proof_an_issue_that_is_neither_bug_nor_change_gives_no_item (test_backlog_item_fields) |
| from issue: a bug realises the queue's names | `work-items.mjs` | 2: test_a_bug_realises_the_requirement_the_code_violates (test_backlog_item_fields); test_counter_proof_a_change_without_queue_entries_or_a_bug_without_a_violated_requirement_realises_nothing (test_backlog_item_fields) |
| from issue: a name of two queue entries is kept twice | `work-items.mjs` | 1: test_a_change_realises_the_requirements_of_its_queue_entries_each_once (test_backlog_item_fields) |
| from issue: the issue's address is not the origin | `work-items.mjs` | 3: test_a_bug_realises_the_requirement_the_code_violates (test_backlog_item_fields); test_a_change_realises_the_requirements_of_its_queue_entries_each_once (test_backlog_item_fields); test_counter_proof_a_change_without_queue_entries_or_a_bug_without_a_violated_requirement_realises_nothing (test_backlog_item_fields) |
| from issue: the outcome is not the issue's description | `work-items.mjs` | 1: test_a_bug_realises_the_requirement_the_code_violates (test_backlog_item_fields) |
| from issue: a missing description becomes the text null | `work-items.mjs` | 1: test_an_issue_without_a_description_gives_an_empty_outcome (test_backlog_item_fields) |
| job: a drafted item may realise nothing | `job.json` | 1: test_a_drafted_item_must_realise_something_and_may_carry_acceptance_criteria (test_backlog_item_fields) |
| job: a drafted item must name what it realises — not required | `job.json` | 1: test_a_drafted_item_must_realise_something_and_may_carry_acceptance_criteria (test_backlog_item_fields) |
| job: a drafted item carries no acceptance criteria | `job.json` | 1: test_a_drafted_item_must_realise_something_and_may_carry_acceptance_criteria (test_backlog_item_fields) |
| job: the existing items are not an input | `job.json` | 2: test_the_definition_takes_the_requirements_the_use_cases_and_the_existing_items (test_backlog_item_fields); test_the_prompt_fills_every_input_and_nothing_else (test_backlog_item_fields) |
| job: the job asks for more than drafting text | `job.json` | 1: test_the_definition_takes_the_requirements_the_use_cases_and_the_existing_items (test_backlog_item_fields) |
| job: no correction round | `job.json` | 1: test_the_definition_takes_the_requirements_the_use_cases_and_the_existing_items (test_backlog_item_fields) |
| job: the check named is no function of the module | `job.json` | 1: test_the_checks_it_names_are_functions_of_the_module (test_backlog_item_fields) |
| job: the prompt leaves out the existing items | `prompt.md` | 1: test_the_prompt_fills_every_input_and_nothing_else (test_backlog_item_fields) |
| repository: an item of Agent M's backlog names a use case it lacks | `ITM-033-backlog-items-and-order.md` | 1: test_every_item_of_this_repository_names_what_it_realises_and_where_it_came_from (test_backlog_item_fields) |
| repository: an item of Agent M's backlog has no origin | `ITM-033-backlog-items-and-order.md` | 2: test_every_item_of_this_repository_is_read_without_a_problem (test_backlog_layout); test_every_item_of_this_repository_names_what_it_realises_and_where_it_came_from (test_backlog_item_fields) |
| repository: Agent M's order leaves an item out | `order.md` | 1: test_the_order_of_this_repository_places_every_item_once (test_backlog_layout) |
| repository: Agent M's order names an item twice | `order.md` | 1: test_the_order_of_this_repository_places_every_item_once (test_backlog_layout) |
| parse: a section the item lacks is read as the rest of the file | `work-items.mjs` | 1: test_a_section_the_item_lacks_is_read_as_empty (test_backlog_layout) |
| parse: an item's slug may hold one word only | `work-items.mjs` | 16: test_a_use_case_counts_only_when_the_product_has_it (test_backlog_item_fields); test_an_item_is_read_into_its_parts (test_backlog_layout); test_an_item_with_the_outcome_of_another_is_flagged (test_backlog_item_fields); test_an_item_with_the_title_of_another_is_flagged (test_backlog_item_fields); test_checking_leaves_the_item_as_it_was (test_backlog_item_fields); test_counter_proof_a_file_without_front_matter_is_no_item (test_backlog_layout); test_counter_proof_an_identifier_other_than_the_file_name_is_a_problem (test_backlog_layout); test_counter_proof_an_item_is_not_compared_with_itself_nor_flagged_for_a_different_title_and_outcome (test_backlog_item_fields); test_counter_proof_another_identifier_in_capitals_is_no_requirement_name (test_backlog_item_fields); test_every_broken_item_yields_exactly_the_findings_expected_json_names (test_backlog_item_fields); test_every_item_of_the_fixture_backlog_is_where_an_item_must_be (test_backlog_layout); test_every_item_of_this_repository_is_read_without_a_problem (test_backlog_layout); test_every_item_of_this_repository_names_what_it_realises_and_where_it_came_from (test_backlog_item_fields); test_lists_may_be_empty_and_an_origin_may_name_several_issues (test_backlog_layout); test_the_items_of_the_fixture_backlog_have_no_finding (test_backlog_item_fields); test_without_known_names_only_the_form_of_a_name_is_checked (test_backlog_item_fields) |
| order: only places numbered 1 and 2 are read | `work-items.mjs` | 3: test_an_order_naming_every_item_leaves_nothing_unplaced (test_backlog_layout); test_counter_proof_a_line_naming_no_item_or_an_item_twice_is_a_problem (test_backlog_layout); test_the_order_of_this_repository_places_every_item_once (test_backlog_layout) |
| repository: a file in docs/backlog that is no item, no order and no sprint | `notes.md` | 1: test_the_backlog_is_markdown_under_docs_backlog (test_backlog_layout) |
| repository: an item file of Agent M's backlog without front matter | `ITM-999-planted.md` | 3: test_every_item_of_this_repository_is_read_without_a_problem (test_backlog_layout); test_every_item_of_this_repository_names_what_it_realises_and_where_it_came_from (test_backlog_item_fields); test_the_order_of_this_repository_places_every_item_once (test_backlog_layout) |

Each of the 37 new tests is red in at least one row. In the first run of the series two faults survived — an identifier
in capitals such as `ARC-003` counted as a requirement name, and a planted order line `23a. ITM-001`, which is no list
item and so rightly not read —, and three tests were red in no row.
`test_counter_proof_another_identifier_in_capitals_is_no_requirement_name` was added for the first, the second fault was
replaced by `23. ITM-001`, and three faults were added for the three tests (a section the item lacks, the slug of a file
name, the places of the order). The table is the run after these changes.

## 3. Red in CI on the implementation commit, green locally

The implementation commit `e920d48` was green locally and red in CI (runs 36921937257 and 36921945898): the three tests
over Agent M's own backlog failed with `OSError: [Errno 7] Argument list too long: 'node'`. They passed the whole
backlog — 147 item texts — inside the one expression `tests/jsrun.py` hands to `node -e`; Linux limits a single
argument to 128 KiB, macOS does not. The next commit has node read the item files itself (`items_js` in both test
files) and asserts that node read as many item files as Python sees, so that an empty read cannot pass. No expected
result changed. The series above was run again after that change.

Before and after the series, on the commit that reads the backlog through node: `cd tests && python3 -m unittest` ran 234 tests, OK;
`node --test tests/*.test.mjs` ran 244 tests, 244 pass. Before this item: 197 Python tests, 244 node tests.
