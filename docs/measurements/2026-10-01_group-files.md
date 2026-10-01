# Group files — the red first commit and the counter-proof of every new test

**MESSUNG** — 2026-10-01, branch `team/ITM-012` (from `sprint/01` at `e6d9f73`), macOS, Node 25, Python 3.14. ITM-012
(implementation job): `docs/assets/artifacts/groups.mjs` (`parseGroupFile`, `formatGroupFile`, `hierarchy`, `applyMoves`),
guarded by `tests/test_groups.py` and its fixtures under `tests/fixtures/groups/`. This file records the red first commit and
the counter-proof of every new test (SOFTWARE_MAINTENANCE §4.0a rule 5, `A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).

## 1. The first commit is red

`29f9def` holds only `tests/test_groups.py` and the fixtures. Locally, Python ran 147 tests, and 27 of them failed. Those 27
are every test of `test_groups`, each failing with `ReferenceError: groups is not defined`, because the module did not exist.
Node ran 153 tests, all of them passing; there was no new node test. In CI, both runs of pull request #33 on that commit
failed: run 36891268657 (push) and run 36891288006 (pull request).

## 2. Counter-proofs

**Method.** A script (not committed) planted one fault at a time and then restored the file. Each fault was either one
exact string replaced in one file or one file planted. The script refused a replacement that did not occur exactly once,
and it compared the SHA-256 of each file after the restore. For each fault it ran `cd tests && python3 -m unittest` and
`node --test tests/*.test.mjs`. Both suites were green before the series and after it. Every row below is red. In the
*Red* column, test names are the unittest names in `test_groups`, given without their class unless they belong to
another file.

| Planted fault | File | Red |
|---|---|---|
| JS: parseGroupFile ignores the nesting — every item at the top level | `groups.mjs` | 18 tests, among them test_every_kind_reads_as_its_nested_hierarchy, test_a_list_not_nested_by_two_spaces_is_read_as_far_as_it_goes, test_format_of_parse_is_the_text_of_a_canonical_file |
| JS: a name in capitals is not a member | `groups.mjs` | test_every_kind_reads_as_its_nested_hierarchy; test_a_group_is_named_by_its_title_only; test_every_broken_fixture_yields_exactly_the_findings_expected_json_names; test_a_member_of_another_kind_is_reported; test_a_move_into_a_group_of_another_kind_is_refused |
| JS: every item that is no identifier is read as a member | `groups.mjs` | 24 tests, among them test_a_group_title_named_as_an_identifier_is_found, test_an_empty_hierarchy_holds_the_kind_it_is_given, test_every_known_item_has_exactly_one_place |
| JS: a group carries an identifier — its title as `id` | `groups.mjs` | test_a_group_is_named_by_its_title_only |
| JS: an item indented too far is not reported | `groups.mjs` | test_every_broken_fixture_yields_exactly_the_findings_expected_json_names |
| JS: an item under a member is not reported | `groups.mjs` | test_every_broken_fixture_yields_exactly_the_findings_expected_json_names |
| JS: a line in the list that is no item is not reported | `groups.mjs` | test_every_broken_fixture_yields_exactly_the_findings_expected_json_names |
| JS: trailing spaces of the heading are kept | `groups.mjs` | test_format_writes_the_canonical_text |
| JS: formatGroupFile writes no final newline | `groups.mjs` | 8 tests, among them test_format_of_parse_is_the_text_of_a_canonical_file, test_the_group_file_holds_titles_and_identifiers_only |
| JS: formatGroupFile ignores the heading it is given | `groups.mjs` | test_format_writes_the_heading_it_is_given |
| JS: formatGroupFile writes a member not yet placed | `groups.mjs` | test_a_not_yet_placed_item_is_written_only_once_it_is_moved |
| JS: a title written like an identifier is not reported | `groups.mjs` | test_a_title_written_like_an_identifier_is_reported; test_every_broken_fixture_yields_exactly_… |
| JS: a member of another kind is not reported | `groups.mjs` | test_a_member_of_another_kind_is_reported; test_every_broken_fixture_yields_exactly_… |
| JS: a member listed twice is not reported | `groups.mjs` | test_an_item_listed_twice_is_reported_in_both_places; test_every_broken_fixture_yields_exactly_… |
| JS: an unknown member is not reported | `groups.mjs` | test_an_unknown_member_and_a_withdrawn_one_outside_withdrawn_are_named; test_every_broken_fixture_yields_exactly_… |
| JS: a withdrawn member is reported inside the group Withdrawn too | `groups.mjs` | test_the_complete_files_yield_no_finding; test_every_group_file_of_this_repository_holds_one_kind_in_the_file_of_that_kind; test_every_broken_fixture_yields_exactly_… |
| JS: an item no group names is left out | `groups.mjs` | test_every_known_item_has_exactly_one_place; test_an_item_no_group_names_is_shown_at_the_top_level_not_yet_placed; test_without_a_group_file_every_item_is_at_the_top_level |
| JS: an item no group names is not marked notYetPlaced | `groups.mjs` | test_an_item_no_group_names_is_shown_at_the_top_level_not_yet_placed; test_a_not_yet_placed_item_is_written_only_once_it_is_moved |
| JS: the kind of the hierarchy is the tree's, not the known items' | `groups.mjs` | test_without_a_group_file_every_item_is_at_the_top_level |
| JS: applyMoves moves an item of another kind | `groups.mjs` | test_a_move_into_a_group_of_another_kind_is_refused; test_an_empty_hierarchy_holds_the_kind_it_is_given |
| JS: a moved item leaves its copy behind | `groups.mjs` | test_a_moved_item_or_group_leaves_no_copy_behind; test_the_group_file_holds_titles_and_identifiers_only; test_blob_shas_of_the_spec_and_every_artifact_are_equal_before_and_after |
| JS: a group that is not empty is deleted | `groups.mjs` | test_a_move_that_would_lose_or_duplicate_is_refused |
| JS: a group can be moved into itself | `groups.mjs` | test_a_move_that_would_lose_or_duplicate_is_refused |
| JS: a group is created beside one of the same title | `groups.mjs` | test_a_move_that_would_lose_or_duplicate_is_refused |
| JS: rename changes nothing | `groups.mjs` | test_create_rename_and_delete_change_only_groups; test_blob_shas_of_the_spec_and_every_artifact_are_equal_before_and_after |
| JS: an unknown change is applied as nothing, not refused | `groups.mjs` | test_a_move_that_would_lose_or_duplicate_is_refused |
| JS: applyMoves changes the tree it is given | `groups.mjs` | test_apply_moves_leaves_the_tree_it_is_given_as_it_was; test_a_not_yet_placed_item_is_written_only_once_it_is_moved |
| repository: a use case realises the group title "Kernel" | `docs/use-cases/UC-021-…md` | test_no_artifact_of_this_repository_names_a_group_title_where_an_identifier_is_expected; `test_usecase_fields` test_every_use_case_is_complete; `test_usecase_realises` test_every_use_case_of_this_repository_names_requirements_by_name; node “every use case of this repository passes the dashboard's reader” |
| repository: a module listed in two groups | `docs/groups/modules.md` | test_every_group_file_of_this_repository_holds_one_kind_in_the_file_of_that_kind |
| repository: a withdrawn module outside the group Withdrawn | `docs/groups/modules.md` | test_every_group_file_of_this_repository_holds_one_kind_in_the_file_of_that_kind |
| repository: a group file indented by four spaces | `docs/groups/modules.md` | test_every_group_file_of_this_repository_holds_one_kind_in_the_file_of_that_kind |
| repository: a group file not named after a kind (`docs/groups/decisions.md`) | planted | test_every_group_file_of_this_repository_holds_one_kind_in_the_file_of_that_kind |
| harness: the regrouping also writes the group into a module's front matter (the alternative ARC-020 rejects) | `tests/test_groups.py` | test_blob_shas_of_the_spec_and_every_artifact_are_equal_before_and_after |

Each of the 27 new tests is red in at least one row. The test of `REGROUPING LEAVES THE GROUPED FILE UNCHANGED` compares the
blob SHAs of every file of the fixture product. Its last row shows that the comparison catches a regrouping that also
touches an artifact. That is the one fault the module's interface cannot make by itself, because `applyMoves` and
`formatGroupFile` return a tree and a text and write nothing.

Before and after the series: `cd tests && python3 -m unittest` ran 147 tests, OK; `node --test tests/*.test.mjs` ran 153
tests, 153 pass. Before this item: 120 Python tests, 153 node tests.
