# Module: MOD-work-plans
# Guards: EVERY TEAM RUNS SPRINTS OF ITS OWN; A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH; SPRINTS OF DIFFERENT TEAMS CHANGE NO MODULE THE OTHER CHANGES OR USES; SPRINT PLANNING SHOWS WHAT THE OTHER TEAMS' SPRINTS HOLD; UC-032; UC-041
# Level: component
"""SPEC §13 — several teams of one product run sprints at the same time:

- EVERY TEAM RUNS SPRINTS OF ITS OWN — runs sprints of several teams of one product at the same time, and checks that each
  team's sprints are its own: numbered within the team, holding what the team selected, and unchanged by another team's
  sprint starting or closing;
- A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH — follows held items through their sprint's close and the
  merges into the default branch, and checks that an item stays held until its change is merged there or it returns to the
  backlog;
- SPRINTS OF DIFFERENT TEAMS CHANGE NO MODULE THE OTHER CHANGES OR USES — plans a sprint while other teams' sprints hold
  items, compares the modules each item changes and uses with those of the held items, and checks that no item sharing a
  module is selectable and that each refusal names the holding sprint, the item and the module;
- SPRINT PLANNING SHOWS WHAT THE OTHER TEAMS' SPRINTS HOLD — checks that each item another team's sprint holds comes with
  its sprint, the modules it changes and the modules they use.

MOD-work-plans' heldItems and conflicts, asked through node over the fixture product of tests/parallel_sprints_fixture.py:
two teams, team1 running sprint 01, team2 having closed sprint 01 and running sprint 02. Every expectation is read from the
fixture's data, never from the code under test. Starting and closing a sprint through startSprint and closeSprint, and the
sprint planning page, are not built yet; their tests below are skipped and say why.
"""
import unittest

from parallel_sprints_fixture import (CURRENT, ITEMS, PULL_REQUESTS, SELECTIONS, SPRINTS, FIX, conflicts_of, held, uses_of)

CLOSED = "docs/backlog/sprints/team2/01.md"


def by_sprint(entries: list) -> dict:
    out = {}
    for entry in entries:
        out.setdefault(entry["sprint"], []).append(entry["item"])
    return out


def before_its_close(path: str) -> str:
    """A sprint record as it stood before its close appended its review, unfinished items and retrospective."""
    return (FIX / path).read_text(encoding="utf-8").split("\n## Review")[0] + "\n"


class EveryTeamRunsSprintsOfItsOwn(unittest.TestCase):
    def test_each_teams_sprints_stand_in_its_own_folder_numbered_within_the_team(self):
        teams = {}
        for path in SPRINTS:
            team, number = path.split("/")[-2], path.split("/")[-1][:-3]
            teams.setdefault(team, []).append(number)
        self.assertEqual(teams, {"team1": ["01"], "team2": ["01", "02"]})

    def test_each_running_sprint_holds_what_its_own_team_selected(self):
        got = by_sprint(held())
        self.assertEqual(got, {f"{team}/{path.split('/')[-1][:-3]}": SELECTIONS[path] for team, path in CURRENT.items()})
        self.assertTrue(all(entry["team"] == entry["sprint"].split("/")[0] for entry in held()))

    def test_another_team_starting_or_closing_a_sprint_changes_nothing_a_team_holds(self):
        team1 = lambda entries: [entry for entry in entries if entry["team"] == "team1"]
        now = team1(held())
        self.assertTrue(now, "known positive: team1 holds items")
        self.assertEqual(team1(held(texts={CLOSED: before_its_close(CLOSED)})), now, "team2's close")
        self.assertEqual(team1(held(paths=[p for p in SPRINTS if not p.endswith("team2/02.md")])), now, "team2's start")

    @unittest.skip("startSprint and closeSprint are not built yet: startSprint reads the selected items with MOD-documents' "
                   "artifactSchemas and creates a sprint's branch with MOD-repository-hosts' createBranch, neither built")
    def test_a_team_starts_and_closes_its_sprints_through_start_sprint_and_close_sprint(self):
        pass


class ASprintHoldsItsItemsUntilTheyReachTheDefaultBranch(unittest.TestCase):
    def test_an_item_merged_into_its_sprints_branch_stays_held_until_that_branch_reaches_the_default_branch(self):
        merged_into_branch = next(pr for pr in PULL_REQUESTS if pr["branch"] == "work/ITM-001")
        self.assertEqual((merged_into_branch["state"], merged_into_branch["base"]), ("merged", "sprint/team1/01"))
        held_items = lambda prs: [entry["item"] for entry in held(prs) if entry["sprint"] == "team1/01"]
        self.assertIn("ITM-001", held_items(PULL_REQUESTS))
        branch = lambda merged: {"number": 9, "title": "The increment of team1's sprint 01", "branch": "sprint/team1/01",
                                 "base": "main", "head": "b" * 40, "state": "merged", "draft": False,
                                 "url": "https://github.com/alice/product/pull/9", "opened": "2026-10-08T12:00:00Z",
                                 "merged": merged, "closed": merged}
        self.assertIn("ITM-001", held_items(PULL_REQUESTS + [branch("2026-10-07T12:00:00Z")]), "merged before the item's merge")
        self.assertNotIn("ITM-001", held_items(PULL_REQUESTS + [branch("2026-10-09T12:00:00Z")]), "merged after it")
        self.assertIn("ITM-003", held_items(PULL_REQUESTS + [branch("2026-10-09T12:00:00Z")]), "an open pull request")

    def test_an_item_whose_change_reached_the_default_branch_or_that_went_back_to_the_backlog_is_no_longer_held(self):
        self.assertNotIn(CLOSED.split("sprints/")[1][:-3], by_sprint(held()))
        before = held(pull_requests=[pr for pr in PULL_REQUESTS if pr["number"] not in (1, 2)],
                      texts={CLOSED: before_its_close(CLOSED)})
        self.assertEqual(by_sprint(before)["team2/01"], ["ITM-002", "ITM-006"], "known positive: held before merge and close")

    def test_with_the_pull_requests_unknown_every_selected_item_not_sent_back_is_held(self):
        got = by_sprint(held("unknown"))
        self.assertEqual(got["team2/01"], ["ITM-002"])
        self.assertEqual(got["team1/01"], SELECTIONS[CURRENT["team1"]])


class SprintsOfDifferentTeamsChangeNoModuleTheOtherChangesOrUses(unittest.TestCase):
    def expected(self, item: str, team: str, held_items: list) -> set:
        found = set()
        for entry in held_items:
            if entry["team"] == team:
                continue
            changes, uses = set(ITEMS[entry["item"]]), uses_of(entry["item"])
            shared = (changes & set(ITEMS[item])) | (changes & uses_of(item)) | (uses & set(ITEMS[item]))
            found |= {(entry["sprint"], entry["item"], module) for module in shared}
        return found

    def test_each_item_is_kept_from_a_teams_selection_exactly_when_it_shares_a_module_with_another_teams_held_item(self):
        held_items = held()
        refused = 0
        for team in CURRENT:
            for item in ITEMS:
                got = conflicts_of(item, team, held_items)
                with self.subTest(team=team, item=item):
                    self.assertEqual({(c["sprint"], c["item"], c["module"]) for c in got}, self.expected(item, team, held_items))
                    self.assertTrue(all(c["sprint"] and c["item"] and c["module"] for c in got))
                    refused += bool(got)
        self.assertTrue(refused, "known positive: some item is kept from a selection")

    @unittest.skip("startSprint is not built yet: it is the one that refuses a selection with the sprint, the held item and "
                   "the module; MOD-documents' artifactSchemas and MOD-repository-hosts' createBranch, which it uses, are not "
                   "built either")
    def test_start_sprint_refuses_a_selection_that_shares_a_module_naming_the_sprint_the_item_and_the_module(self):
        pass


class SprintPlanningShowsWhatTheOtherTeamsSprintsHold(unittest.TestCase):
    def test_each_item_another_teams_sprint_holds_comes_with_its_sprint_and_the_modules_it_changes_and_uses(self):
        others = [entry for entry in held() if entry["team"] != "team1"]
        self.assertTrue(others, "known positive: team2's sprint holds items")
        for entry in others:
            with self.subTest(item=entry["item"]):
                self.assertEqual(entry["sprint"], "team2/02")
                self.assertEqual(entry["changes"], ITEMS[entry["item"]])
                self.assertEqual(entry["uses"], sorted(uses_of(entry["item"])))

    @unittest.skip("the sprint planning page is not built yet; it lists heldItems' entries beside the backlog (UC-032 step 5)")
    def test_a_teams_sprint_planning_lists_every_item_the_other_teams_sprints_hold(self):
        pass


if __name__ == "__main__":
    unittest.main()
