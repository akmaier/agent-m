# Module: MOD-work-plans
# Guards: A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT; UC-032
# Level: unit
"""SPEC §13 A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT — when a product's model works in sprints, a team's
implementation jobs start only for items selected for that team's current sprint. With several teams running sprints at
once, TestSeveralTeamsRunSprints asks MOD-work-plans' startable to start a job for every item under each team, and compares
each answer with the team's current sprint (the fixture product of tests/parallel_sprints_fixture.py). The rest of this file
starts jobs in a product of one team (tests/flow_fixture.py): implementation jobs start only for items selected for the
current sprint (UC-032 step 6, 6a), and in a model with sprints and a WIP limit both hold (step 7).

MOD-work-plans' startable refuses the start of an item outside the selection of its team's current sprint, naming the item
and the sprint, and every start while the team runs no sprint; a model without sprints keeps no selection.
"""
import unittest

from flow_fixture import pr, reasons, run, starts
from parallel_sprints_fixture import CURRENT, ITEMS, SELECTIONS, all_ready, start

# ITM-014 and ITM-017 build on ITM-016: with ITM-016 merged, ITM-014, ITM-015 and ITM-017 may each be in progress.
DONE = pr(9, "ITM-016", state="merged")


def selection_reasons(result: dict) -> list:
    return [r for r in reasons(result) if "is not selected" in r or "No sprint" in r]


def limit_reasons(result: dict) -> list:
    return [r for r in reasons(result) if "work-in-progress limit" in r]


class TestOnlyTheSelectionStarts(unittest.TestCase):
    """The Scrum fixture: sprints with a time box, and no WIP limit; the team's running sprint selects ITM-015 and ITM-016."""

    SPRINT = ["ITM-015", "ITM-016"]

    # TST-475053 · level: unit · module: MOD-work-plans
    # guards: A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT; UC-032
    # given: the Scrum fixture, the running sprint selecting ITM-015 and ITM-016
    # input: startable of ITM-015
    # expect: the item starts
    def test_a_selected_item_starts(self):
        self.assertTrue(starts(run("ITM-015", "scrum", sprint=self.SPRINT)))

    # TST-475054 · level: unit · module: MOD-work-plans
    # guards: A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT; UC-032
    # given: the Scrum fixture, the running sprint selecting ITM-015 and ITM-016; ITM-016 merged
    # input: startable of ITM-014, which the sprint does not select
    # expect: the one reason names ITM-014 and the team's current sprint
    def test_an_item_outside_the_selection_is_refused_with_the_sprint_named(self):
        got = run("ITM-014", "scrum", sprint=self.SPRINT, prs=[DONE])
        self.assertEqual(len(reasons(got)), 1, reasons(got))
        self.assertIn("ITM-014 is not selected", reasons(got)[0])
        self.assertIn("the current sprint of product", reasons(got)[0])

    # TST-475055 · level: unit · module: MOD-work-plans
    # guards: A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT; UC-032
    # given: the Scrum fixture with no sprint running
    # input: startable of ITM-015
    # expect: the one reason says that no sprint of the team runs
    def test_with_no_sprint_running_nothing_starts(self):
        got = run("ITM-015", "scrum", sprint=None)
        self.assertEqual(len(reasons(got)), 1, reasons(got))
        self.assertIn("No sprint of product is running", reasons(got)[0])

    # TST-475059 · level: unit · module: MOD-work-plans
    # guards: A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT; UC-032
    # given: the Kanban fixture, a model without sprints
    # input: startable of ITM-015 with no sprint, and of ITM-016 with a sprint that does not select it
    # expect: both start
    def test_counter_proof_a_model_without_sprints_has_no_selection_to_keep(self):
        self.assertTrue(starts(run("ITM-015", "kanban", sprint=None)))
        self.assertTrue(starts(run("ITM-016", "kanban", sprint=["ITM-015"])))


class TestSprintsAndALimitBothHold(unittest.TestCase):
    """The fixture scrum-wip: sprints without a time box and a WIP limit of 2 (UC-032 step 7: only selected items are pulled,
    and only below the limit); ITM-016 merged."""

    # TST-475060 · level: unit · module: MOD-work-plans
    # guards: A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT; UC-032
    # given: the scrum-wip fixture (WIP limit 2), the sprint selecting ITM-014, ITM-015 and ITM-017; pull requests of ITM-014 and ITM-015 open
    # input: startable of the selected ITM-017
    # expect: the one reason is the limit's
    def test_a_selected_item_above_the_limit_is_refused_for_the_limit_only(self):
        got = run("ITM-017", "scrum-wip", sprint=["ITM-014", "ITM-015", "ITM-017"], prs=[DONE, pr(1, "ITM-014"), pr(2, "ITM-015")])
        self.assertEqual(len(reasons(got)), 1, reasons(got))
        self.assertEqual(len(limit_reasons(got)), 1, reasons(got))

    # TST-475061 · level: unit · module: MOD-work-plans
    # guards: A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT; UC-032
    # given: the scrum-wip fixture, the sprint selecting ITM-014 and ITM-017, ITM-014's pull request open
    # input: startable of ITM-015, which is not selected
    # expect: the one reason is the selection's
    def test_an_item_outside_the_selection_below_the_limit_is_refused_for_the_selection_only(self):
        got = run("ITM-015", "scrum-wip", sprint=["ITM-014", "ITM-017"], prs=[DONE, pr(1, "ITM-014")])
        self.assertEqual(len(reasons(got)), 1, reasons(got))
        self.assertEqual(len(selection_reasons(got)), 1, reasons(got))

    # TST-475062 · level: unit · module: MOD-work-plans
    # guards: A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT; UC-032
    # given: the scrum-wip fixture, the sprint selecting ITM-014 and ITM-017, pull requests of ITM-014 and ITM-017 open
    # input: startable of ITM-015, which is not selected
    # expect: two reasons: the selection's, then the limit's
    def test_an_item_outside_the_selection_above_the_limit_is_refused_for_both(self):
        got = run("ITM-015", "scrum-wip", sprint=["ITM-014", "ITM-017"], prs=[DONE, pr(1, "ITM-014"), pr(2, "ITM-017")])
        self.assertEqual(len(reasons(got)), 2, reasons(got))
        self.assertEqual((len(selection_reasons(got)), len(limit_reasons(got))), (1, 1), reasons(got))
        self.assertLess(reasons(got).index(selection_reasons(got)[0]), reasons(got).index(limit_reasons(got)[0]))

    # TST-475063 · level: unit · module: MOD-work-plans
    # guards: A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT; UC-032
    # given: the scrum-wip fixture, the sprint selecting ITM-014 and ITM-017, ITM-014's pull request open
    # input: startable of the selected ITM-017
    # expect: the item starts
    def test_a_selected_item_below_the_limit_starts(self):
        self.assertTrue(starts(run("ITM-017", "scrum-wip", sprint=["ITM-014", "ITM-017"], prs=[DONE, pr(1, "ITM-014")])))


class TestSeveralTeamsRunSprints(unittest.TestCase):
    """team1 runs its sprint 01 and team2 its sprint 02 at the same time; every item is ready, and each team's Developers
    have what the role needs."""

    # Module (as the case stated it): MOD-work-items; MOD-work-plans
    # TST-475064 · level: unit · module: MOD-work-plans
    # guards: A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT; UC-032
    # given: the fixture product of tests/parallel_sprints_fixture.py: team1 runs sprint 01, team2 sprint 02, every item ready
    # input: startable of every item under each team
    # expect: an item is startable exactly when the team's current sprint selects it; a refusal names the item and the sprint; known positive: an item starts
    def test_a_job_starts_only_for_an_item_selected_for_its_own_teams_current_sprint(self):
        started = 0
        for team, path in CURRENT.items():
            sprint = path.split("sprints/")[1][:-3]
            for item in ITEMS:
                got = start(item, team, all_ready())
                with self.subTest(team=team, item=item):
                    self.assertEqual(got["startable"], item in SELECTIONS[path])
                    if not got["startable"]:
                        self.assertTrue(any(item in r and sprint in r for r in got["reasons"]), got["reasons"])
                    started += got["startable"]
        self.assertTrue(started, "known positive: an item starts")


if __name__ == "__main__":
    unittest.main()
