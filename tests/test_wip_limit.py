# Module: MOD-work-items
# Guards: NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT; UC-032
# Level: unit
"""SPEC §13 NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT — when a product's model sets a work-in-progress limit, no
implementation job starts while the number of the product's items in progress has reached that limit; an item waiting
for review counts as in progress (UC-032 step 7 and 7a).

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


class TestTheLimitOfTwo(unittest.TestCase):
    """The Kanban fixture: WIP limit 2, no sprints."""

    def test_with_limit_two_and_two_items_in_progress_a_third_start_is_refused_with_the_limit_named(self):
        got = item_state("ITM-015", "kanban", prs=[pr(1, "ITM-014"), pr(2, "ITM-016")])
        self.assertEqual(got["state"], "ready")
        self.assertEqual(got["reasons"], [{
            "kind": "wip-limit", "rule": WIP, "limit": 2,
            "inProgress": [{"id": "ITM-014", "state": "in progress", "inReview": True},
                           {"id": "ITM-016", "state": "in progress", "inReview": True}]}])
        self.assertFalse(starts(got))

    def test_with_one_of_the_two_done_the_start_succeeds(self):
        got = item_state("ITM-015", "kanban", prs=[pr(1, "ITM-014"), pr(2, "ITM-016", state="merged")])
        self.assertEqual((got["state"], got["reasons"]), ("ready", []))
        self.assertTrue(starts(got))

    def test_counter_proof_with_one_item_in_progress_the_start_succeeds(self):
        self.assertTrue(starts(item_state("ITM-015", "kanban", prs=[pr(1, "ITM-014")])))
        self.assertTrue(starts(item_state("ITM-015", "kanban")))

    def test_an_item_in_progress_is_not_counted_against_itself(self):
        got = item_state("ITM-014", "kanban", prs=[pr(1, "ITM-014"), pr(2, "ITM-016")])
        self.assertEqual(got["state"], "in progress")
        self.assertEqual(kinds(got), ["pull-request"])


class TestWhatCountsAsInProgress(unittest.TestCase):
    def test_a_running_job_counts_and_is_not_named_as_in_review(self):
        got = item_state("ITM-015", "kanban", prs=[pr(2, "ITM-016")], jobs=[job("JOB-a", "ITM-014", "running")])
        self.assertEqual(got["reasons"][0]["inProgress"],
                         [{"id": "ITM-014", "state": "in progress", "inReview": False},
                          {"id": "ITM-016", "state": "in progress", "inReview": True}])

    def test_an_item_waiting_for_review_counts_whatever_its_job_does(self):
        got = item_state("ITM-015", "kanban", prs=[pr(1, "ITM-014"), pr(2, "ITM-016")],
                         jobs=[job("JOB-a", "ITM-014", "waiting at a gate", waits_for_person=True)])
        self.assertEqual(kinds(got), ["wip-limit"])

    def test_a_blocked_item_holds_its_slot_until_it_is_merged(self):
        got = item_state("ITM-015", "kanban", prs=[pr(2, "ITM-016")], jobs=[job("JOB-a", "ITM-014", "failed")])
        self.assertEqual(got["reasons"][0]["inProgress"],
                         [{"id": "ITM-014", "state": "blocked", "inReview": False},
                          {"id": "ITM-016", "state": "in progress", "inReview": True}])

    def test_counter_proof_a_closed_pull_request_or_a_finished_job_holds_no_slot(self):
        for prs, jobs in (([pr(1, "ITM-014", state="closed"), pr(2, "ITM-016")], []),
                          ([pr(2, "ITM-016")], [job("JOB-a", "ITM-014", "done")]),
                          ([pr(2, "ITM-016")], [job("JOB-a", "ITM-014", "cancelled")])):
            self.assertTrue(starts(item_state("ITM-015", "kanban", prs=prs, jobs=jobs)), (prs, jobs))

    def test_counter_proof_a_pull_request_naming_no_item_of_the_backlog_holds_no_slot(self):
        for other in (pr(3, "ITM-099"), pr(3, "x", head="docs/sprint-close", title="Close sprint 02"),
                      pr(3, "x", head="team/ITM-0145", title="ITM-0145: not an identifier")):
            got = item_state("ITM-015", "kanban", prs=[pr(1, "ITM-014"), other])
            self.assertTrue(starts(got), other)

    def test_a_pull_request_names_its_item_in_its_title_or_in_its_head_branch(self):
        by_title = pr(1, "x", head="feature/export", title="ITM-014: export as PDF")
        by_head = pr(2, "x", head="team/ITM-016", title="Read the chapters")
        got = item_state("ITM-015", "kanban", prs=[by_title, by_head])
        self.assertEqual([p["id"] for p in got["reasons"][0]["inProgress"]], ["ITM-014", "ITM-016"])


class TestWithoutALimit(unittest.TestCase):
    def test_a_model_without_a_wip_limit_refuses_no_start_for_it(self):
        prs = [pr(1, "ITM-014"), pr(2, "ITM-016"), pr(3, "ITM-017")]
        got = item_state("ITM-015", "scrum", prs=prs, sprint="timeboxed", today="2026-09-20")
        self.assertEqual((got["state"], got["reasons"]), ("ready", []))


if __name__ == "__main__":
    unittest.main()
