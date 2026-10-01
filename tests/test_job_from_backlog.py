# Module: MOD-work-items
# Guards: AGILE IMPLEMENTATION STARTS FROM THE BACKLOG; UC-032
# Level: unit
"""SPEC §13 AGILE IMPLEMENTATION STARTS FROM THE BACKLOG — in a model that pulls its work from a backlog, every
implementation job implements one item of the product's backlog; and UC-032 step 1 — each item's state, derived:
*waiting for acceptance* (it names a requirement or use case that is not accepted), *ready*, *in progress* (a job is
running, or a pull request is open), *blocked* (a job failed or waits for a person), *done*.

docs/assets/work-items/flow.mjs (MOD-work-items): itemState(item, { requirements, useCases, jobs, pullRequests, wip }).
`requirements` and `useCases` are the product's accepted names; a pull request belongs to an item when its head branch
or its title names the item's identifier; a job record names its item. A start without an item, or of an item a pulled
model's backlog does not hold, is refused; a planned model works from its plan and refuses neither. The fixture product
is tests/flow_fixture.py's. Counter-proofs: docs/measurements/2026-10-01_sprints-wip-and-selection.md.
"""
import unittest

from flow_fixture import ACCEPTED, AGILE, DERIVED, KNOWN, item_state, job, kinds, pr, starts


class TestAJobImplementsAnItemOfTheBacklog(unittest.TestCase):
    def test_starting_an_implementation_job_without_an_item_is_refused_for_a_scrum_and_a_kanban_fixture(self):
        for model, sprint in (("scrum", "timeboxed"), ("kanban", None)):
            got = item_state(None, model, sprint=sprint, today="2026-09-20")
            self.assertEqual(got, {"state": None, "reasons": [{"kind": "no-item", "rule": AGILE}]}, model)

    def test_counter_proof_an_item_of_the_backlog_starts_in_both(self):
        for model, sprint in (("scrum", "timeboxed"), ("kanban", None)):
            self.assertTrue(starts(item_state("ITM-014", model, sprint=sprint, today="2026-09-20")), model)

    def test_an_item_the_backlog_does_not_hold_is_refused_in_a_pulled_model(self):
        for model, sprint in (("scrum", "timeboxed"), ("kanban", None)):
            got = item_state("ITM-014", model, sprint=sprint, today="2026-09-20", backlog=["ITM-015", "ITM-016"])
            self.assertEqual(got["reasons"], [{"kind": "not-in-backlog", "rule": AGILE}], model)

    def test_a_planned_model_works_from_its_plan_and_refuses_neither(self):
        self.assertEqual(item_state(None, "planned"), {"state": None, "reasons": []})
        self.assertTrue(starts(item_state("ITM-014", "planned", backlog=[])))


class TestTheStateOfAnItem(unittest.TestCase):
    """UC-032 step 1, under the Kanban fixture with nothing else in progress."""

    def state(self, item="ITM-014", **kw):
        return item_state(item, "kanban", **kw)

    def test_an_item_whose_names_are_all_accepted_is_ready(self):
        for item in ("ITM-014", "ITM-015", "ITM-016", "ITM-017"):
            self.assertEqual(self.state(item), {"state": "ready", "reasons": []}, item)

    def test_an_item_naming_a_requirement_or_use_case_not_accepted_waits_for_acceptance_and_names_it(self):
        reqs = [r for r in KNOWN["requirements"] if r != "EXPORT IS A PDF"]
        got = self.state(requirements=reqs, use_cases=["UC-001"])
        self.assertEqual(got, {"state": "waiting for acceptance", "reasons": [
            {"kind": "not-accepted", "rule": ACCEPTED, "name": "EXPORT IS A PDF"},
            {"kind": "not-accepted", "rule": ACCEPTED, "name": "UC-003"}]})
        self.assertFalse(starts(got))

    def test_an_open_pull_request_makes_it_in_progress_and_is_named(self):
        got = self.state(prs=[pr(7, "ITM-014")])
        self.assertEqual(got["state"], "in progress")
        self.assertEqual(got["reasons"], [{"kind": "pull-request", "rule": DERIVED, "pullRequest": pr(7, "ITM-014")}])

    def test_a_running_or_queued_job_makes_it_in_progress_and_is_named(self):
        for state in ("queued", "running"):
            got = self.state(jobs=[job("JOB-a", "ITM-014", state)])
            self.assertEqual(got["state"], "in progress", state)
            self.assertEqual(got["reasons"], [{"kind": "job", "rule": DERIVED, "job": job("JOB-a", "ITM-014", state)}])

    def test_a_merged_pull_request_makes_it_done_and_is_named(self):
        got = self.state(prs=[pr(7, "ITM-014", state="merged")])
        self.assertEqual(got, {"state": "done", "reasons": [
            {"kind": "pull-request", "rule": DERIVED, "pullRequest": pr(7, "ITM-014", state="merged")}]})

    def test_a_failed_job_blocks_it(self):
        got = self.state(jobs=[job("JOB-a", "ITM-014", "failed")])
        self.assertEqual((got["state"], kinds(got)), ("blocked", ["job"]))

    def test_a_job_that_ended_without_record_blocks_it(self):
        self.assertEqual(self.state(jobs=[job("JOB-a", "ITM-014", "ended without record")])["state"], "blocked")

    def test_a_job_waiting_at_a_gate_for_a_person_blocks_it_and_one_for_a_check_does_not(self):
        self.assertEqual(self.state(jobs=[job("JOB-a", "ITM-014", "waiting at a gate", waits_for_person=True)])["state"], "blocked")
        self.assertEqual(self.state(jobs=[job("JOB-a", "ITM-014", "waiting at a gate")])["state"], "in progress")

    def test_an_item_back_in_development_after_its_merge_is_in_progress_again(self):
        got = self.state(prs=[pr(7, "ITM-014", state="merged"), pr(9, "ITM-014", opened_at="2026-09-20T08:00:00.000Z")])
        self.assertEqual((got["state"], [r["pullRequest"]["number"] for r in got["reasons"]]), ("in progress", [9]))

    def test_a_failed_job_after_the_merge_blocks_it_and_one_before_it_does_not(self):
        merged = pr(7, "ITM-014", state="merged", merged_at="2026-09-17T10:00:00.000Z")
        self.assertEqual(self.state(prs=[merged], jobs=[job("JOB-b", "ITM-014", "failed", start="2026-09-18T08:00:00.000Z")])["state"],
                         "blocked")
        self.assertEqual(self.state(prs=[merged], jobs=[job("JOB-a", "ITM-014", "failed", start="2026-09-16T08:00:00.000Z")])["state"],
                         "done")

    def test_a_failed_job_retried_by_a_later_running_one_is_in_progress(self):
        jobs = [job("JOB-a", "ITM-014", "failed", start="2026-09-16T08:00:00.000Z"),
                job("JOB-b", "ITM-014", "running", start="2026-09-16T09:00:00.000Z")]
        got = self.state(jobs=jobs)
        self.assertEqual((got["state"], [r["job"]["id"] for r in got["reasons"]]), ("in progress", ["JOB-b"]))

    def test_counter_proof_a_closed_pull_request_and_a_finished_or_cancelled_job_leave_it_ready(self):
        for kw in ({"prs": [pr(7, "ITM-014", state="closed")]}, {"jobs": [job("JOB-a", "ITM-014", "done")]},
                   {"jobs": [job("JOB-a", "ITM-014", "cancelled")]}):
            self.assertEqual(self.state(**kw), {"state": "ready", "reasons": []}, kw)

    def test_counter_proof_the_pull_requests_and_jobs_of_another_item_change_nothing(self):
        got = self.state(prs=[pr(7, "ITM-016", state="merged"), pr(8, "ITM-017")], jobs=[job("JOB-a", "ITM-015", "failed")])
        self.assertEqual(got, {"state": "ready", "reasons": []})

    def test_what_is_happening_is_shown_before_what_is_not_accepted(self):
        got = self.state(prs=[pr(7, "ITM-014")], requirements=[])
        self.assertEqual((got["state"], kinds(got)), ("in progress", ["pull-request"]))


if __name__ == "__main__":
    unittest.main()
