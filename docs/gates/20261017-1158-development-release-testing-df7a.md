---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - b2e2e371acfd72a08dbbfe16003ee7e6be63fd9a
  - https://github.com/akmaier/agent-m/pull/726
date: 2026-10-17 11:58 UTC
---
# Development → Release testing: ITM-695, the group files as MOD-group-document reads and writes them

**REGISTER**

## Reason

ITM-695, pull request #726 into `sprint/team1/72`, at head `b2e2e371`. It changes three files:
`src/group-document/group-file.mjs`, `src/group-document/index.mjs` and `tests/test_groups.py`. The tests-only commit
`6125f438` was red in run 39030059173 with 13 failures. CI run 39030206289 on the head passed ten of ten, and the pull
request is mergeable.

**The six checks the rewrite drops.** Each is read against `docs/architecture/MOD-group-document.md`:
- **Group titles written like identifiers stay guarded.** The module asks for this twice. `hierarchy` reports "an error
  under `A GROUP CARRIES NO IDENTIFIER` … for a group titled by an identifier". `applyMoves` refuses to "create a group
  whose title is an identifier". The finding is tested: `test_a_list_not_nested_by_two_spaces_is_read_as_far_as_it_goes`
  (:169) and `test_a_member_listed_twice_and_a_group_titled_by_an_identifier_are_reported_with_their_lines` (:215).
  The refusal (`src/group-document/moves.mjs:40`) has no test, neither here nor on the base. `moves.mjs` is not in this
  diff, so the gap is not this item's altered behaviour. It is registered as ITM-708.
- **Duplicate sibling titles, withdrawn members and list-form findings** are asked for by no text. The module, UC-021 and
  the group requirements of SPEC §1 hold no sentence on a withdrawn member or on two groups with one title. A grep of the
  module and UC-021 for "withdrawn", "same title", "sibling" and "two groups" gave no hit. The same files give 10 and 7
  hits for "identifier". On list-form findings, `parseGroupFile` says: "Lines that are no list item and no title are kept
  as they are and do not count". `A DOCUMENT HOLDS NO HISTORY` keeps withdrawn entries out of the files. These
  behaviours are the old code's own, and they may go.

**Which test guards each requirement** (`tests/test_groups.py` at the head):

| Requirement | Tests |
|---|---|
| ARTIFACTS ARE ARRANGED IN NESTED GROUPS | `ArrangedInNestedGroups` (:151), the canonical-text tests (:178 to :202) |
| A GROUP CARRIES NO IDENTIFIER | :169, :215, `GroupCarriesNoIdentifier` (:237); the refusal of `applyMoves` is ITM-708 |
| A GROUP HOLDS ONE KIND OF ARTIFACT | `OneKindOfArtifact` (:270) |
| AN ITEM HAS ONE PLACE IN ITS HIERARCHY | `OnePlaceInTheHierarchy` (:296), the member named twice in :215 |
| EVERY HIERARCHY IS KEPT IN A GROUP FILE OF ITS OWN | `OwnGroupFile` (:352) |
| REGROUPING LEAVES THE GROUPED FILE UNCHANGED | `RegroupingLeavesTheGroupedFilesUnchanged` (:401), on the fixture repository |
| AN UNGROUPED ITEM IS SHOWN AT THE TOP LEVEL | `UngroupedItemAtTheTopLevel` (:428) |

**The skipped repository-level check** (`test_every_group_file_of_this_repository_holds_one_kind_in_the_file_of_that_kind`,
:374) skips because this repository has no `docs/groups/`. The base skips it the same way (`tests/test_groups.py:339` on
`origin/main`), so nothing was lost. The fixture tests cover the logic it runs. Nothing more is asked.

**What else holds.**
- The developer reported five planted faults, each caught.
- The readings stand: the title line and the line below it come from the kind; members are written before groups;
  `groupFileText` writes every member the tree holds.
- The footer in the middle of the pull request body is cosmetic, and does not decide the gate.
