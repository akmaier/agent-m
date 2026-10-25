# Module: MOD-work-plans
# Guards: NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT; UC-032
# Level: unit
"""SPEC §13 NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT — when a product's model sets a work-in-progress limit, no
implementation job starts while the number of items in progress under the job's role assignment has reached that limit;
an item waiting for review counts as in progress (UC-032 step 7 and 7a). TestTheLimitPerRoleAssignment asks MOD-work-plans'
startable to start jobs while items are in progress, counting them per role assignment (the fixture product of
tests/parallel_sprints_fixture.py); the rest of this file starts jobs in a product of one team (tests/flow_fixture.py).

MOD-work-plans: itemStates derives each item's state from the pull requests and job rows given — in progress while a job of
it runs or a pull request of it is open, waiting for review —; startable refuses a start while the items in progress under
the item's role assignment have reached the model's limit, naming the limit, those items and those waiting for review.
"""
import unittest

from flow_fixture import job, pr, reasons, run, starts, state_of
from parallel_sprints_fixture import WIP_LIMIT, all_ready, start, state

# ITM-014 and ITM-017 build on ITM-016: with ITM-016 merged, ITM-014, ITM-015 and ITM-017 may each be in progress.
DONE = pr(9, "ITM-016", state="merged")


def limit_reasons(result: dict) -> list:
    return [r for r in reasons(result) if "work-in-progress limit" in r]


class TestTheLimitOfTwo(unittest.TestCase):
    """The Kanban fixture: WIP limit 2, no sprints."""

    # TST-475065 · level: unit · module: MOD-work-plans
    # guards: NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT; UC-032
    # given: the Kanban fixture, WIP limit 2, ITM-016 merged; pull requests of ITM-014 and ITM-015 open
    # input: startable of ITM-017
    # expect: ITM-017 ready; the one reason names the limit 2, ITM-014 and ITM-015 in progress, both waiting for review; the item does not start
    def test_with_limit_two_and_two_items_in_progress_a_third_start_is_refused_with_the_limit_named(self):
        got = run("ITM-017", "kanban", prs=[DONE, pr(1, "ITM-014"), pr(2, "ITM-015")])
        self.assertEqual(state_of(got, "ITM-017")["state"], "ready")
        self.assertEqual([state_of(got, i)["state"] for i in ("ITM-014", "ITM-015")], ["in progress", "in progress"])
        self.assertFalse(starts(got))
        self.assertEqual(len(reasons(got)), 1, reasons(got))
        [why] = reasons(got)
        self.assertIn("limit of 2", why)
        self.assertIn("ITM-014 and ITM-015 are in progress", why)
        self.assertIn("ITM-014 and ITM-015 waiting for review", why)

    # TST-475066 · level: unit · module: MOD-work-plans
    # guards: NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT; UC-032
    # given: the Kanban fixture, WIP limit 2, ITM-016 merged; ITM-014's pull request open, ITM-015's merged
    # input: startable of ITM-017
    # expect: the item starts
    def test_with_one_of_the_two_done_the_start_succeeds(self):
        got = run("ITM-017", "kanban", prs=[DONE, pr(1, "ITM-014"), pr(2, "ITM-015", state="merged")])
        self.assertEqual(state_of(got, "ITM-015")["state"], "done")
        self.assertTrue(starts(got), reasons(got))

    # TST-475067 · level: unit · module: MOD-work-plans
    # guards: NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT; UC-032
    # given: the Kanban fixture, WIP limit 2, ITM-016 merged
    # input: startable of ITM-017 with one pull request open, and with none
    # expect: both start
    def test_counter_proof_with_one_item_in_progress_the_start_succeeds(self):
        self.assertTrue(starts(run("ITM-017", "kanban", prs=[DONE, pr(1, "ITM-014")])))
        self.assertTrue(starts(run("ITM-017", "kanban", prs=[DONE])))

    # TST-475068 · level: unit · module: MOD-work-plans
    # guards: NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT; UC-032
    # given: the Kanban fixture, WIP limit 2, ITM-016 merged; pull requests of ITM-014 and ITM-015 open
    # input: startable of ITM-014 itself
    # expect: refused because it is in progress already, and not for the limit
    def test_an_item_in_progress_is_not_counted_against_itself(self):
        got = run("ITM-014", "kanban", prs=[DONE, pr(1, "ITM-014"), pr(2, "ITM-015")])
        self.assertEqual(state_of(got, "ITM-014")["state"], "in progress")
        self.assertEqual(limit_reasons(got), [])
        self.assertTrue(any("in progress already" in r for r in reasons(got)), reasons(got))


class TestWhatCountsAsInProgress(unittest.TestCase):
    # TST-475069 · level: unit · module: MOD-work-plans
    # guards: NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT; UC-032
    # given: the Kanban fixture, ITM-016 merged; a running job of ITM-014 and an open pull request of ITM-015
    # input: startable of ITM-017
    # expect: the limit's reason names ITM-014 and ITM-015 in progress, and ITM-015 alone waiting for review
    def test_a_running_job_counts_and_is_not_named_as_in_review(self):
        got = run("ITM-017", "kanban", prs=[DONE, pr(2, "ITM-015")], jobs=[job("JOB-a", "ITM-014", "running")])
        [why] = limit_reasons(got)
        self.assertIn("ITM-014 and ITM-015 are in progress", why)
        self.assertIn(", ITM-015 waiting for review", why)
        self.assertNotIn("ITM-014 waiting", why)

    # TST-475072 · level: unit · module: MOD-work-plans
    # guards: NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT; UC-032
    # given: the Kanban fixture, ITM-016 merged; ITM-015's pull request open; ITM-014 with a closed pull request, or a cancelled job
    # input: startable of ITM-017 in each of the two cases
    # expect: the item starts in each case
    def test_counter_proof_a_closed_pull_request_or_a_cancelled_job_holds_no_slot(self):
        for prs, jobs in (([DONE, pr(1, "ITM-014", state="closed"), pr(2, "ITM-015")], []),
                          ([DONE, pr(2, "ITM-015")], [job("JOB-a", "ITM-014", "cancelled")])):
            got = run("ITM-017", "kanban", prs=prs, jobs=jobs)
            self.assertTrue(starts(got), (prs, jobs, reasons(got)))

    # TST-475073 · level: unit · module: MOD-work-plans
    # guards: NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT; UC-032
    # given: the Kanban fixture, ITM-016 merged; ITM-014's pull request open and a second pull request naming ITM-099, or a sprint-close branch, or ITM-0145
    # input: startable of ITM-017 for each second pull request
    # expect: the item starts in each case
    def test_counter_proof_a_pull_request_naming_no_item_of_the_backlog_holds_no_slot(self):
        for other in (pr(3, "ITM-099"), pr(3, "x", branch="docs/sprint-close", title="Close sprint 02"),
                      pr(3, "x", branch="team/ITM-0145", title="ITM-0145: not an identifier")):
            got = run("ITM-017", "kanban", prs=[DONE, pr(1, "ITM-014"), other])
            self.assertTrue(starts(got), (other, reasons(got)))

    # TST-475074 · level: unit · module: MOD-work-plans
    # guards: NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT; UC-032
    # given: the Kanban fixture, ITM-016 merged; one pull request naming ITM-014 in its title, one naming ITM-015 in its branch
    # input: startable of ITM-017
    # expect: the limit's reason names ITM-014 and ITM-015
    def test_a_pull_request_names_its_item_in_its_title_or_in_its_branch(self):
        by_title = pr(1, "x", branch="feature/export", title="ITM-014: export as PDF")
        by_branch = pr(2, "x", branch="team/ITM-015", title="Read the chapters")
        [why] = limit_reasons(run("ITM-017", "kanban", prs=[DONE, by_title, by_branch]))
        self.assertIn("ITM-014 and ITM-015 are in progress", why)


class TestWithoutALimit(unittest.TestCase):
    # TST-475075 · level: unit · module: MOD-work-plans
    # guards: NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT; UC-032
    # given: the Scrum fixture without a WIP limit, its sprint selecting ITM-014, ITM-015 and ITM-017; ITM-016 merged, pull requests of ITM-014 and ITM-015 open
    # input: startable of ITM-017
    # expect: the item starts
    def test_a_model_without_a_wip_limit_refuses_no_start_for_it(self):
        got = run("ITM-017", "scrum", prs=[DONE, pr(1, "ITM-014"), pr(2, "ITM-015")], sprint=["ITM-014", "ITM-015", "ITM-017"])
        self.assertTrue(starts(got), reasons(got))


class TestTheLimitPerRoleAssignment(unittest.TestCase):
    """MOD-work-plans' startable over the fixture product of tests/parallel_sprints_fixture.py: the limit 2; team1's sprint
    01 holds ITM-001, ITM-003 and ITM-005, team2's sprint 02 holds ITM-007 and ITM-008. Items in progress are counted per
    role assignment: those team1's sprint holds count under team1's, those team2's holds under team2's."""

    def states(self, *changed):
        return [next((c for c in changed if c["item"] == s["item"]), s) for s in all_ready()]

    # Module (as the case stated it): MOD-work-items; MOD-work-plans
    # TST-475076 · level: unit · module: MOD-work-plans
    # guards: NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT; UC-032
    # given: the parallel-sprints fixture, limit 2; ITM-001 and ITM-003 in progress in team1's sprint, ITM-007 in progress in team2's
    # input: startable of ITM-005 under team1
    # expect: not startable; a reason names the limit, ITM-001 and ITM-003 and not ITM-007
    def test_a_start_is_refused_naming_the_limit_while_the_items_in_progress_under_its_assignment_reach_it(self):
        busy = self.states(state("ITM-001", "in progress", job="JOB-1"), state("ITM-003", "in progress", pull_request="#4"),
                           state("ITM-007", "in progress", pull_request="#5"))
        got = start("ITM-005", "team1", busy)
        self.assertFalse(got["startable"])
        self.assertTrue(any(str(WIP_LIMIT) in r and "ITM-001" in r and "ITM-003" in r for r in got["reasons"]), got["reasons"])
        self.assertFalse(any("ITM-007" in r for r in got["reasons"]), "team2's item counts under team2 only")

    # Module (as the case stated it): MOD-work-items; MOD-work-plans
    # TST-475077 · level: unit · module: MOD-work-plans
    # guards: NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT; UC-032
    # given: the parallel-sprints fixture, limit 2; ITM-001 done, ITM-003 in progress in team1's sprint, ITM-007 in progress in team2's
    # input: startable of ITM-005 under team1
    # expect: startable is true
    def test_the_start_succeeds_once_the_count_under_its_assignment_is_below_the_limit(self):
        freed = self.states(state("ITM-001", "done"), state("ITM-003", "in progress", pull_request="#4"),
                            state("ITM-007", "in progress", pull_request="#5"))
        self.assertEqual(start("ITM-005", "team1", freed), {"startable": True})

    # Module (as the case stated it): MOD-work-items; MOD-work-plans
    # TST-475078 · level: unit · module: MOD-work-plans
    # guards: NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT; UC-032
    # given: the parallel-sprints fixture, limit 2; ITM-001 and ITM-003 in progress in team1's sprint, ITM-007 in progress in team2's
    # input: startable of ITM-008 under team2
    # expect: startable is true
    def test_another_teams_items_in_progress_do_not_count_under_a_teams_assignment(self):
        busy = self.states(state("ITM-001", "in progress", job="JOB-1"), state("ITM-003", "in progress", pull_request="#4"),
                           state("ITM-007", "in progress", pull_request="#5"))
        self.assertEqual(start("ITM-008", "team2", busy), {"startable": True})


if __name__ == "__main__":
    unittest.main()
