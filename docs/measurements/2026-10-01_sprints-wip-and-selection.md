# Sprints, item states, the work-in-progress limit and the sprint's selection — the red first commit and the counter-proof of every new test

**MESSUNG** — 2026-10-01, branch `team/ITM-034` (from `sprint/02` at `ab9ff83`), macOS, Node 25.9.0, Python 3.14.6.
ITM-034 (implementation job, developer-opus-b): `sprint(text)` and `itemState(item, …)` of MOD-work-items in
`docs/assets/work-items/flow.mjs`, guarded by `tests/test_wip_limit.py`, `tests/test_time_box_selection.py` and
`tests/test_job_from_backlog.py`, with their shared fixture product `tests/flow_fixture.py` and `tests/fixtures/flow/`.
This file records the red first commit and the counter-proof of every new test (SOFTWARE_MAINTENANCE §4.0a rule 5,
`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).

## 1. The first commit is red

`a6832a3` holds only the three test files, the fixture helper and the fixtures. Locally: Python 283 tests, 49 failures —
every new test, each with `ReferenceError: flow is not defined`; node 318 tests, 315 pass, 0 fail, 3 todo (no new node
test). In CI, both runs of pull request #53 on that commit failed: run 36925546993 (push) and run 36925564813 (pull
request) — `gh pr checks 53`, once, 240 s after the push.

One test was corrected after the first run against the implementation: in
`test_counter_proof_the_pull_requests_and_jobs_of_another_item_change_nothing` the expectation *ready with no reason* was
wrong — the two other items hold the two slots of the limit and refuse the start; the test now expects *ready* with the
`wip-limit` reason naming them. One test was added after the first series (section 2):
`test_counter_proof_a_pull_request_naming_a_longer_identifier_is_not_the_items`.

## 2. Counter-proofs

**Method.** A script (not committed; `scratchpad/itm034-developer-opus-b/plant-faults.txt`) planted one fault at a time
and then restored the file: one exact string replaced in one file — refused unless it occurred exactly once, with the
file's SHA-256 compared after the restore. For each fault it ran `cd tests && python3 -m unittest test_wip_limit
test_time_box_selection test_job_from_backlog`. The three modules were green before the series and after it.

The first series found one fault no test caught: a pull request naming `ITM-0145` was taken as naming `ITM-014` in the
item's own state (only the limit's count had been tested with it). The test named above was added; in the second series,
whose results follow, that fault is red. One fault stays green and is kept in the table: the pattern by which the limit
collects the identifiers its pull requests name (`holding`) lets `ITM-0145` through as `ITM-014`, but every collected
identifier is then derived again by `activity`, whose own pattern refuses it. The first pattern only proposes
candidates, so its fault cannot be seen from outside.

53 faults; 52 red.

| Planted fault | File | Red |
|---|---|---|
| sprint: a text without front matter is not reported | `flow.mjs` | 1: test_counter_proof_a_text_without_front_matter_is_no_sprint_record (test_time_box_selection) |
| sprint: a record without an id passes | `flow.mjs` | 1: test_counter_proof_a_sprint_without_an_id_or_a_start_is_a_problem (test_time_box_selection) |
| sprint: a record without a start passes | `flow.mjs` | 1: test_counter_proof_a_sprint_without_an_id_or_a_start_is_a_problem (test_time_box_selection) |
| sprint: a start that is no date passes | `flow.mjs` | 1: test_counter_proof_a_date_that_is_no_date_or_an_end_before_the_start_is_a_problem (test_time_box_selection) |
| sprint: an end that is no date passes | `flow.mjs` | 1: test_counter_proof_a_date_that_is_no_date_or_an_end_before_the_start_is_a_problem (test_time_box_selection) |
| sprint: an end before the start passes | `flow.mjs` | 1: test_counter_proof_a_date_that_is_no_date_or_an_end_before_the_start_is_a_problem (test_time_box_selection) |
| sprint: a selection written as one line is not reported | `flow.mjs` | 1: test_counter_proof_a_selection_that_selects_no_item_once_is_a_problem (test_time_box_selection) |
| sprint: an empty selection is not reported | `flow.mjs` | 1: test_counter_proof_a_selection_that_selects_no_item_once_is_a_problem (test_time_box_selection) |
| sprint: a selected entry that is no item passes | `flow.mjs` | 1: test_counter_proof_a_selection_that_selects_no_item_once_is_a_problem (test_time_box_selection) |
| sprint: an item selected twice passes | `flow.mjs` | 1: test_counter_proof_a_selection_that_selects_no_item_once_is_a_problem (test_time_box_selection) |
| sprint: an empty end is kept as the empty text, not as none | `flow.mjs` | 2: test_a_running_sprint_without_a_time_box_is_read_into_its_parts_and_its_end_is_empty (test_time_box_selection); test_sprint_01_is_closed_and_sprint_02_runs (test_time_box_selection) |
| sprint: only the first selected item is read | `flow.mjs` | 8: test_a_running_sprint_without_a_time_box_is_read_into_its_parts_and_its_end_is_empty (test_time_box_selection); test_a_selected_item_above_the_limit_is_refused_for_the_limit_only (test_time_box_selection); test_a_selected_item_below_the_limit_starts (test_time_box_selection); test_an_item_the_backlog_does_not_hold_is_refused_in_a_pulled_model (test_job_from_backlog); test_counter_proof_a_selection_that_selects_no_item_once_is_a_problem (test_time_box_selection); test_counter_proof_an_item_of_the_backlog_starts_in_both (test_job_from_backlog); test_every_sprint_record_of_this_repository_is_read_without_a_problem (test_time_box_selection); test_sprint_01_is_closed_and_sprint_02_runs (test_time_box_selection) |
| sprint: the planner is not read | `flow.mjs` | 2: test_a_running_sprint_without_a_time_box_is_read_into_its_parts_and_its_end_is_empty (test_time_box_selection); test_sprint_01_is_closed_and_sprint_02_runs (test_time_box_selection) |
| names: the head branch is not read | `flow.mjs` | 1: test_a_pull_request_names_its_item_in_its_title_or_in_its_head_branch (test_wip_limit) |
| names: the title is not read | `flow.mjs` | 1: test_a_pull_request_names_its_item_in_its_title_or_in_its_head_branch (test_wip_limit) |
| names: an identifier followed by a digit counts | `flow.mjs` | 1: test_counter_proof_a_pull_request_naming_a_longer_identifier_is_not_the_items (test_job_from_backlog) |
| names: an identifier followed by a digit holds a slot | `flow.mjs` | 0 — stays green; why, see above |
| state: a closed pull request counts as open | `flow.mjs` | 2: test_counter_proof_a_closed_pull_request_and_a_finished_or_cancelled_job_leave_it_ready (test_job_from_backlog); test_counter_proof_a_closed_pull_request_or_a_finished_job_holds_no_slot (test_wip_limit) |
| state: an open pull request is no work under way | `flow.mjs` | 12: test_a_blocked_item_holds_its_slot_until_it_is_merged (test_wip_limit); test_a_pull_request_names_its_item_in_its_title_or_in_its_head_branch (test_wip_limit); test_a_running_job_counts_and_is_not_named_as_in_review (test_wip_limit); test_a_selected_item_above_the_limit_is_refused_for_the_limit_only (test_time_box_selection); test_an_item_back_in_development_after_its_merge_is_in_progress_again (test_job_from_backlog); test_an_item_in_progress_is_not_counted_against_itself (test_wip_limit); test_an_item_outside_the_selection_above_the_limit_is_refused_for_both (test_time_box_selection); test_an_item_waiting_for_review_counts_whatever_its_job_does (test_wip_limit); test_an_open_pull_request_makes_it_in_progress_and_is_named (test_job_from_backlog); test_counter_proof_the_pull_requests_and_jobs_of_another_item_change_nothing (test_job_from_backlog); test_what_is_happening_is_shown_before_what_is_not_accepted (test_job_from_backlog); test_with_limit_two_and_two_items_in_progress_a_third_start_is_refused_with_the_limit_named (test_wip_limit) |
| state: a queued job is no work under way | `flow.mjs` | 1: test_a_running_or_queued_job_makes_it_in_progress_and_is_named (test_job_from_backlog) |
| state: a job finished counts as running | `flow.mjs` | 2: test_counter_proof_a_closed_pull_request_and_a_finished_or_cancelled_job_leave_it_ready (test_job_from_backlog); test_counter_proof_a_closed_pull_request_or_a_finished_job_holds_no_slot (test_wip_limit) |
| state: a job at a gate of a check counts as waiting for a person | `flow.mjs` | 1: test_a_job_waiting_at_a_gate_for_a_person_blocks_it_and_one_for_a_check_does_not (test_job_from_backlog) |
| state: a job at a person's gate blocks nothing | `flow.mjs` | 1: test_a_job_waiting_at_a_gate_for_a_person_blocks_it_and_one_for_a_check_does_not (test_job_from_backlog) |
| state: a job ended without record blocks nothing | `flow.mjs` | 1: test_a_job_that_ended_without_record_blocks_it (test_job_from_backlog) |
| state: a failed job before the merge still blocks | `flow.mjs` | 1: test_a_failed_job_after_the_merge_blocks_it_and_one_before_it_does_not (test_job_from_backlog) |
| state: a merge before a later failed job wins | `flow.mjs` | 1: test_a_failed_job_after_the_merge_blocks_it_and_one_before_it_does_not (test_job_from_backlog) |
| state: a failed job blocks although a later one runs | `flow.mjs` | 1: test_a_failed_job_retried_by_a_later_running_one_is_in_progress (test_job_from_backlog) |
| state: a merge counts before open work | `flow.mjs` | 1: test_an_item_back_in_development_after_its_merge_is_in_progress_again (test_job_from_backlog) |
| state: a merged pull request does not make it done | `flow.mjs` | 2: test_a_failed_job_after_the_merge_blocks_it_and_one_before_it_does_not (test_job_from_backlog); test_a_merged_pull_request_makes_it_done_and_is_named (test_job_from_backlog) |
| state: what is not accepted counts before what is happening | `flow.mjs` | 1: test_what_is_happening_is_shown_before_what_is_not_accepted (test_job_from_backlog) |
| state: a use case is never checked for acceptance | `flow.mjs` | 1: test_an_item_naming_a_requirement_or_use_case_not_accepted_waits_for_acceptance_and_names_it (test_job_from_backlog) |
| state: a requirement is never checked for acceptance | `flow.mjs` | 1: test_an_item_naming_a_requirement_or_use_case_not_accepted_waits_for_acceptance_and_names_it (test_job_from_backlog) |
| limit: a blocked item frees its slot | `flow.mjs` | 2: test_a_blocked_item_holds_its_slot_until_it_is_merged (test_wip_limit); test_counter_proof_the_pull_requests_and_jobs_of_another_item_change_nothing (test_job_from_backlog) |
| limit: an item outside the backlog holds a slot | `flow.mjs` | 1: test_counter_proof_a_pull_request_naming_no_item_of_the_backlog_holds_no_slot (test_wip_limit) |
| limit: the limit is reached only above it | `flow.mjs` | 8: test_a_blocked_item_holds_its_slot_until_it_is_merged (test_wip_limit); test_a_pull_request_names_its_item_in_its_title_or_in_its_head_branch (test_wip_limit); test_a_running_job_counts_and_is_not_named_as_in_review (test_wip_limit); test_a_selected_item_above_the_limit_is_refused_for_the_limit_only (test_time_box_selection); test_an_item_outside_the_selection_above_the_limit_is_refused_for_both (test_time_box_selection); test_an_item_waiting_for_review_counts_whatever_its_job_does (test_wip_limit); test_counter_proof_the_pull_requests_and_jobs_of_another_item_change_nothing (test_job_from_backlog); test_with_limit_two_and_two_items_in_progress_a_third_start_is_refused_with_the_limit_named (test_wip_limit) |
| limit: an item in review is not named as such | `flow.mjs` | 3: test_a_blocked_item_holds_its_slot_until_it_is_merged (test_wip_limit); test_a_running_job_counts_and_is_not_named_as_in_review (test_wip_limit); test_with_limit_two_and_two_items_in_progress_a_third_start_is_refused_with_the_limit_named (test_wip_limit) |
| limit: the limit is not named | `flow.mjs` | 1: test_with_limit_two_and_two_items_in_progress_a_third_start_is_refused_with_the_limit_named (test_wip_limit) |
| limit: no limit is kept | `flow.mjs` | 8: test_a_blocked_item_holds_its_slot_until_it_is_merged (test_wip_limit); test_a_pull_request_names_its_item_in_its_title_or_in_its_head_branch (test_wip_limit); test_a_running_job_counts_and_is_not_named_as_in_review (test_wip_limit); test_a_selected_item_above_the_limit_is_refused_for_the_limit_only (test_time_box_selection); test_an_item_outside_the_selection_above_the_limit_is_refused_for_both (test_time_box_selection); test_an_item_waiting_for_review_counts_whatever_its_job_does (test_wip_limit); test_counter_proof_the_pull_requests_and_jobs_of_another_item_change_nothing (test_job_from_backlog); test_with_limit_two_and_two_items_in_progress_a_third_start_is_refused_with_the_limit_named (test_wip_limit) |
| limit: an item named only in a title holds no slot | `flow.mjs` | 1: test_a_pull_request_names_its_item_in_its_title_or_in_its_head_branch (test_wip_limit) |
| selection: the selection is never checked | `flow.mjs` | 7: test_a_sprint_not_yet_begun_starts_nothing (test_time_box_selection); test_a_time_box_ends_on_its_end_date (test_time_box_selection); test_an_item_outside_the_selection_above_the_limit_is_refused_for_both (test_time_box_selection); test_an_item_outside_the_selection_below_the_limit_is_refused_for_the_selection_only (test_time_box_selection); test_an_item_outside_the_selection_is_refused_with_the_sprint_named (test_time_box_selection); test_with_no_sprint_running_nothing_starts (test_time_box_selection); test_without_a_time_box_a_recorded_end_ends_the_sprint (test_time_box_selection) |
| selection: a model without sprints keeps a selection | `flow.mjs` | 18: test_a_blocked_item_holds_its_slot_until_it_is_merged (test_wip_limit); test_a_planned_model_works_from_its_plan_and_refuses_neither (test_job_from_backlog); test_a_pull_request_names_its_item_in_its_title_or_in_its_head_branch (test_wip_limit); test_a_running_job_counts_and_is_not_named_as_in_review (test_wip_limit); test_an_item_naming_a_requirement_or_use_case_not_accepted_waits_for_acceptance_and_names_it (test_job_from_backlog); test_an_item_the_backlog_does_not_hold_is_refused_in_a_pulled_model (test_job_from_backlog); test_an_item_waiting_for_review_counts_whatever_its_job_does (test_wip_limit); test_an_item_whose_names_are_all_accepted_is_ready (test_job_from_backlog); test_counter_proof_a_closed_pull_request_and_a_finished_or_cancelled_job_leave_it_ready (test_job_from_backlog); test_counter_proof_a_closed_pull_request_or_a_finished_job_holds_no_slot (test_wip_limit); test_counter_proof_a_model_without_sprints_has_no_selection_to_keep (test_time_box_selection); test_counter_proof_a_pull_request_naming_a_longer_identifier_is_not_the_items (test_job_from_backlog); test_counter_proof_a_pull_request_naming_no_item_of_the_backlog_holds_no_slot (test_wip_limit); test_counter_proof_an_item_of_the_backlog_starts_in_both (test_job_from_backlog); test_counter_proof_the_pull_requests_and_jobs_of_another_item_change_nothing (test_job_from_backlog); test_counter_proof_with_one_item_in_progress_the_start_succeeds (test_wip_limit); test_with_limit_two_and_two_items_in_progress_a_third_start_is_refused_with_the_limit_named (test_wip_limit); test_with_one_of_the_two_done_the_start_succeeds (test_wip_limit) |
| selection: with no sprint running, an item starts | `flow.mjs` | 1: test_with_no_sprint_running_nothing_starts (test_time_box_selection) |
| selection: an unselected item starts | `flow.mjs` | 3: test_an_item_outside_the_selection_above_the_limit_is_refused_for_both (test_time_box_selection); test_an_item_outside_the_selection_below_the_limit_is_refused_for_the_selection_only (test_time_box_selection); test_an_item_outside_the_selection_is_refused_with_the_sprint_named (test_time_box_selection) |
| selection: a time box never ends | `flow.mjs` | 1: test_a_time_box_ends_on_its_end_date (test_time_box_selection) |
| selection: a time box ends the day before its end date | `flow.mjs` | 1: test_a_time_box_ends_on_its_end_date (test_time_box_selection) |
| selection: a recorded end without a time box ends nothing | `flow.mjs` | 1: test_without_a_time_box_a_recorded_end_ends_the_sprint (test_time_box_selection) |
| selection: a sprint not yet begun runs | `flow.mjs` | 1: test_a_sprint_not_yet_begun_starts_nothing (test_time_box_selection) |
| backlog: an item the backlog does not hold starts | `flow.mjs` | 1: test_an_item_the_backlog_does_not_hold_is_refused_in_a_pulled_model (test_job_from_backlog) |
| backlog: a planned model refuses an item outside a backlog | `flow.mjs` | 1: test_a_planned_model_works_from_its_plan_and_refuses_neither (test_job_from_backlog) |
| backlog: a start without an item is not refused | `flow.mjs` | 1: test_starting_an_implementation_job_without_an_item_is_refused_for_a_scrum_and_a_kanban_fixture (test_job_from_backlog) |
| backlog: a planned model refuses a start without an item | `flow.mjs` | 1: test_a_planned_model_works_from_its_plan_and_refuses_neither (test_job_from_backlog) |
| repository: sprint-02's front matter lists two selected items in another order than its table | `sprint-02.md` | 1: test_every_sprint_record_of_this_repository_is_read_without_a_problem (test_time_box_selection) |
| repository: sprint-01 selects an item the backlog does not hold | `sprint-01.md` | 2: test_every_sprint_record_of_this_repository_is_read_without_a_problem (test_time_box_selection); test_sprint_01_is_closed_and_sprint_02_runs (test_time_box_selection) |

## 3. The suites

On the implementation commit: `cd tests && python3 -m unittest` → 284 tests, OK (234 before the item);
`node --test tests/*.test.mjs` → 318 tests, 315 pass, 0 fail, 3 todo (unchanged).

## 4. Not covered here

- Agent M's own model on `sprint/02`, `docs/process-models/scrum-wip.md`, has no row `Sprints | yes` (`main` has it since
  `f35dc60`); parsed, its `sprints` is `null`, so itemState applies no selection rule to Agent M's own items until `main`
  is merged into `sprint/02`. No test asserts either value of Agent M's own model. Read with this module, `main`'s
  `sprint-01.md` and `sprint-02.md` give no problem (15 and 25 selected items).
- The jobs: no job record exists yet (ITM-037). The job shape itemState reads — `{ id, item, state, start,
  waitsForPerson }` — is tested only on constructed records.
