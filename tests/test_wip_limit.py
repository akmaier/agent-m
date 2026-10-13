# Module: MOD-work-items; MOD-work-plans
# Guards: NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT; UC-032
# Level: unit
"""SPEC §13 NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT — when a product's model sets a work-in-progress limit, no
implementation job starts while the number of items in progress under the job's role assignment has reached that limit;
an item waiting for review counts as in progress (UC-032 step 7 and 7a). TestTheLimitPerRoleAssignment asks MOD-work-plans'
startable to start jobs while items are in progress, counting them per role assignment (the fixture product of
tests/parallel_sprints_fixture.py); the rest of this file asks the dashboard's kernel, for one team.

docs/assets/work-items/flow.mjs (MOD-work-items): itemState(item, { requirements, useCases, jobs, pullRequests, wip })
derives the item's state from the pull requests and job records passed in, and lists in `reasons` what refuses its
start; a start is allowed exactly when the state is *ready* and no reason stands. `wip` is the model's flow control as
parseModel reads it (wipLimit, timeBox, sprints) with the model's kind, the running sprint, the backlog's order and the
day. An item counts against the limit from its start until its pull request is merged — with a pull request open (in
review) or a job running, or blocked by a failed job or a person's gate (`docs/process.md`, *Sprint*). The fixture
product is tests/flow_fixture.py's. Counter-proofs: docs/measurements/2026-10-01_sprints-wip-and-selection.md.
"""
import unittest

from flow_fixture import WIP, item_state, job, kinds, pr, starts
from parallel_sprints_fixture import WIP_LIMIT, all_ready, start, state


class TestTheLimitOfTwo(unittest.TestCase):
    """The Kanban fixture: WIP limit 2, no sprints."""

    # Module (as the case stated it): MOD-work-items; MOD-work-plans
    # TST-475065 · level: unit · module: MOD-work-items
    # guards: NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT; UC-032
    # given: the Kanban fixture, WIP limit 2, no sprints; pull requests of ITM-014 and ITM-016 open
    # input: itemState of ITM-015
    # expect: state ready and the one reason wip-limit with limit 2 listing ITM-014 and ITM-016 in progress in review; the item does not start
    def test_with_limit_two_and_two_items_in_progress_a_third_start_is_refused_with_the_limit_named(self):
        got = item_state("ITM-015", "kanban", prs=[pr(1, "ITM-014"), pr(2, "ITM-016")])
        self.assertEqual(got["state"], "ready")
        self.assertEqual(got["reasons"], [{
            "kind": "wip-limit", "rule": WIP, "limit": 2,
            "inProgress": [{"id": "ITM-014", "state": "in progress", "inReview": True},
                           {"id": "ITM-016", "state": "in progress", "inReview": True}]}])
        self.assertFalse(starts(got))

    # Module (as the case stated it): MOD-work-items; MOD-work-plans
    # TST-475066 · level: unit · module: MOD-work-items
    # guards: NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT; UC-032
    # given: the Kanban fixture, WIP limit 2; ITM-014's pull request open, ITM-016's merged
    # input: itemState of ITM-015
    # expect: state ready, no reason, the item starts
    def test_with_one_of_the_two_done_the_start_succeeds(self):
        got = item_state("ITM-015", "kanban", prs=[pr(1, "ITM-014"), pr(2, "ITM-016", state="merged")])
        self.assertEqual((got["state"], got["reasons"]), ("ready", []))
        self.assertTrue(starts(got))

    # Module (as the case stated it): MOD-work-items; MOD-work-plans
    # TST-475067 · level: unit · module: MOD-work-items
    # guards: NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT; UC-032
    # given: the Kanban fixture, WIP limit 2
    # input: itemState of ITM-015 with one pull request open, and with none
    # expect: both start
    def test_counter_proof_with_one_item_in_progress_the_start_succeeds(self):
        self.assertTrue(starts(item_state("ITM-015", "kanban", prs=[pr(1, "ITM-014")])))
        self.assertTrue(starts(item_state("ITM-015", "kanban")))

    # Module (as the case stated it): MOD-work-items; MOD-work-plans
    # TST-475068 · level: unit · module: MOD-work-items
    # guards: NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT; UC-032
    # given: the Kanban fixture, WIP limit 2; pull requests of ITM-014 and ITM-016 open
    # input: itemState of ITM-014 itself
    # expect: state in progress and the one reason kind pull-request
    def test_an_item_in_progress_is_not_counted_against_itself(self):
        got = item_state("ITM-014", "kanban", prs=[pr(1, "ITM-014"), pr(2, "ITM-016")])
        self.assertEqual(got["state"], "in progress")
        self.assertEqual(kinds(got), ["pull-request"])


class TestWhatCountsAsInProgress(unittest.TestCase):
    # Module (as the case stated it): MOD-work-items; MOD-work-plans
    # TST-475069 · level: unit · module: MOD-work-items
    # guards: NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT; UC-032
    # given: the Kanban fixture; a running job of ITM-014 and an open pull request of ITM-016
    # input: itemState of ITM-015
    # expect: the in-progress list holds ITM-014 (inReview false) and ITM-016 (inReview true)
    def test_a_running_job_counts_and_is_not_named_as_in_review(self):
        got = item_state("ITM-015", "kanban", prs=[pr(2, "ITM-016")], jobs=[job("JOB-a", "ITM-014", "running")])
        self.assertEqual(got["reasons"][0]["inProgress"],
                         [{"id": "ITM-014", "state": "in progress", "inReview": False},
                          {"id": "ITM-016", "state": "in progress", "inReview": True}])

    # Module (as the case stated it): MOD-work-items; MOD-work-plans
    # TST-475070 · level: unit · module: MOD-work-items
    # guards: NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT; UC-032
    # given: the Kanban fixture; pull requests of ITM-014 and ITM-016 open, ITM-014's job waiting at a gate for a person
    # input: itemState of ITM-015
    # expect: the only reason kind is wip-limit
    def test_an_item_waiting_for_review_counts_whatever_its_job_does(self):
        got = item_state("ITM-015", "kanban", prs=[pr(1, "ITM-014"), pr(2, "ITM-016")],
                         jobs=[job("JOB-a", "ITM-014", "waiting at a gate", waits_for_person=True)])
        self.assertEqual(kinds(got), ["wip-limit"])

    # Module (as the case stated it): MOD-work-items; MOD-work-plans
    # TST-475071 · level: unit · module: MOD-work-items
    # guards: NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT; UC-032
    # given: the Kanban fixture; a failed job of ITM-014 and an open pull request of ITM-016
    # input: itemState of ITM-015
    # expect: the in-progress list holds ITM-014 as blocked (inReview false) and ITM-016 in progress (inReview true)
    def test_a_blocked_item_holds_its_slot_until_it_is_merged(self):
        got = item_state("ITM-015", "kanban", prs=[pr(2, "ITM-016")], jobs=[job("JOB-a", "ITM-014", "failed")])
        self.assertEqual(got["reasons"][0]["inProgress"],
                         [{"id": "ITM-014", "state": "blocked", "inReview": False},
                          {"id": "ITM-016", "state": "in progress", "inReview": True}])

    # Module (as the case stated it): MOD-work-items; MOD-work-plans
    # TST-475072 · level: unit · module: MOD-work-items
    # guards: NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT; UC-032
    # given: the Kanban fixture; ITM-016's pull request open; ITM-014 with a closed pull request, or a done job, or a cancelled job
    # input: itemState of ITM-015 in each of the three cases
    # expect: the item starts in each case
    def test_counter_proof_a_closed_pull_request_or_a_finished_job_holds_no_slot(self):
        for prs, jobs in (([pr(1, "ITM-014", state="closed"), pr(2, "ITM-016")], []),
                          ([pr(2, "ITM-016")], [job("JOB-a", "ITM-014", "done")]),
                          ([pr(2, "ITM-016")], [job("JOB-a", "ITM-014", "cancelled")])):
            self.assertTrue(starts(item_state("ITM-015", "kanban", prs=prs, jobs=jobs)), (prs, jobs))

    # Module (as the case stated it): MOD-work-items; MOD-work-plans
    # TST-475073 · level: unit · module: MOD-work-items
    # guards: NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT; UC-032
    # given: the Kanban fixture; ITM-014's pull request open and a second pull request naming ITM-099, or a sprint-close branch, or ITM-0145
    # input: itemState of ITM-015 for each second pull request
    # expect: the item starts in each case
    def test_counter_proof_a_pull_request_naming_no_item_of_the_backlog_holds_no_slot(self):
        for other in (pr(3, "ITM-099"), pr(3, "x", head="docs/sprint-close", title="Close sprint 02"),
                      pr(3, "x", head="team/ITM-0145", title="ITM-0145: not an identifier")):
            got = item_state("ITM-015", "kanban", prs=[pr(1, "ITM-014"), other])
            self.assertTrue(starts(got), other)

    # Module (as the case stated it): MOD-work-items; MOD-work-plans
    # TST-475074 · level: unit · module: MOD-work-items
    # guards: NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT; UC-032
    # given: the Kanban fixture; one pull request naming ITM-014 in its title, one naming ITM-016 in its head branch
    # input: itemState of ITM-015
    # expect: the in-progress list holds ITM-014 and ITM-016
    def test_a_pull_request_names_its_item_in_its_title_or_in_its_head_branch(self):
        by_title = pr(1, "x", head="feature/export", title="ITM-014: export as PDF")
        by_head = pr(2, "x", head="team/ITM-016", title="Read the chapters")
        got = item_state("ITM-015", "kanban", prs=[by_title, by_head])
        self.assertEqual([p["id"] for p in got["reasons"][0]["inProgress"]], ["ITM-014", "ITM-016"])


class TestWithoutALimit(unittest.TestCase):
    # Module (as the case stated it): MOD-work-items; MOD-work-plans
    # TST-475075 · level: unit · module: MOD-work-items
    # guards: NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT; UC-032
    # given: the Scrum fixture without a WIP limit, sprint timeboxed on 2026-09-20; pull requests of ITM-014, ITM-016 and ITM-017 open
    # input: itemState of ITM-015
    # expect: state ready and no reason
    def test_a_model_without_a_wip_limit_refuses_no_start_for_it(self):
        prs = [pr(1, "ITM-014"), pr(2, "ITM-016"), pr(3, "ITM-017")]
        got = item_state("ITM-015", "scrum", prs=prs, sprint="timeboxed", today="2026-09-20")
        self.assertEqual((got["state"], got["reasons"]), ("ready", []))



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
