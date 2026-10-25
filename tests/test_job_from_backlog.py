# Module: MOD-work-plans
# Guards: AGILE IMPLEMENTATION STARTS FROM THE BACKLOG; UC-032
# Level: unit
"""SPEC §13 AGILE IMPLEMENTATION STARTS FROM THE BACKLOG — in a model that pulls its work from a backlog, every
implementation job implements one item of the product's backlog; and UC-032 step 1 — each item's state, derived:
*waiting for acceptance* (it names a requirement or use case that is not accepted), *ready*, *in progress* (a job is
running, or a pull request is open), *blocked* (a job failed or waits for a person), *done*.

MOD-work-plans: itemStates(items, null, facts) derives the state of every item of the backlog from the approval statuses,
the job rows and the pull requests; a pull request belongs to an item when its branch or its title names the item's
identifier; a job row names its item in the items its record works on. startable(item, states, context) refuses a job for
what has no state — no item, or one the backlog does not hold. The fixture product is tests/flow_fixture.py's.
"""
import unittest

from flow_fixture import KNOWN, job, pr, reasons, run, starts, state_of

PULLED = (("scrum", ["ITM-015", "ITM-016"]), ("kanban", None))


class TestAJobImplementsAnItemOfTheBacklog(unittest.TestCase):
    def test_starting_an_implementation_job_without_an_item_is_refused_for_a_scrum_and_a_kanban_fixture(self):
        for model, sprint in PULLED:
            for item in (None, ""):
                got = run(item, model, sprint=sprint)
                self.assertFalse(starts(got), (model, item))
                self.assertTrue(any("no item of the backlog" in r for r in reasons(got)), (model, item, reasons(got)))

    def test_counter_proof_an_item_of_the_backlog_starts_in_both(self):
        for model, sprint in PULLED:
            self.assertTrue(starts(run("ITM-016", model, sprint=sprint)), model)

    def test_an_item_the_backlog_does_not_hold_is_refused_in_a_pulled_model(self):
        for model, sprint in PULLED:
            got = run("ITM-099", model, sprint=sprint and sprint + ["ITM-099"])
            self.assertFalse(starts(got), model)
            self.assertTrue(any("ITM-099" in r and "no item of the backlog" in r for r in reasons(got)), (model, reasons(got)))


class TestTheStateOfAnItem(unittest.TestCase):
    """UC-032 step 1, under the Kanban fixture."""

    def state(self, item="ITM-014", **kw):
        return state_of(run(item, "kanban", **kw), item)

    def test_an_item_whose_names_are_all_accepted_is_ready(self):
        for item in ("ITM-015", "ITM-016"):
            self.assertEqual(self.state(item)["state"], "ready", item)
        # ITM-014 and ITM-017 build on ITM-016: once it is done, both are ready.
        for item in ("ITM-014", "ITM-017"):
            self.assertEqual(self.state(item, prs=[pr(1, "ITM-016", state="merged")])["state"], "ready", item)

    def test_an_item_naming_a_requirement_or_use_case_not_accepted_waits_for_acceptance_and_names_it(self):
        accepted = [r for r in KNOWN["requirements"] if r != "EXPORT IS A PDF"] + ["UC-001"]
        got = self.state(accepted=accepted)
        self.assertEqual(got["state"], "waiting for acceptance")
        self.assertIn("EXPORT IS A PDF", got["reason"])
        self.assertIn("UC-003", got["reason"])

    def test_an_item_waits_for_an_item_it_builds_on_that_is_not_done_and_names_it(self):
        got = self.state("ITM-014")
        self.assertEqual(got["state"], "waiting for an item it builds on")
        self.assertIn("ITM-016", got["reason"])

    def test_an_open_pull_request_makes_it_in_progress_and_is_named(self):
        got = self.state("ITM-016", prs=[pr(7, "ITM-016")])
        self.assertEqual((got["state"], got["pullRequest"]), ("in progress", "7"))

    def test_a_running_or_queued_job_makes_it_in_progress_and_is_named(self):
        for state in ("queued", "running"):
            got = self.state("ITM-016", jobs=[job("JOB-a", "ITM-016", state)])
            self.assertEqual((got["state"], got["job"]), ("in progress", "JOB-a"), state)

    def test_a_merged_pull_request_makes_it_done_and_is_named(self):
        got = self.state("ITM-016", prs=[pr(7, "ITM-016", state="merged")])
        self.assertEqual((got["state"], got["pullRequest"]), ("done", "7"))

    def test_a_failed_job_blocks_it(self):
        got = self.state("ITM-016", jobs=[job("JOB-a", "ITM-016", "failed")])
        self.assertEqual(got["state"], "blocked")
        self.assertIn("JOB-a", got["reason"])

    def test_a_job_waiting_at_a_gate_blocks_it(self):
        self.assertEqual(self.state("ITM-016", jobs=[job("JOB-a", "ITM-016", "waiting at a gate")])["state"], "blocked")

    def test_counter_proof_a_closed_pull_request_and_a_cancelled_job_leave_it_ready(self):
        for kw in ({"prs": [pr(7, "ITM-016", state="closed")]}, {"jobs": [job("JOB-a", "ITM-016", "cancelled")]}):
            self.assertEqual(self.state("ITM-016", **kw)["state"], "ready", kw)

    def test_counter_proof_the_pull_requests_and_jobs_of_another_item_change_nothing(self):
        got = self.state("ITM-015", prs=[pr(7, "ITM-016", state="merged"), pr(8, "ITM-017")], jobs=[job("JOB-a", "ITM-014", "failed")])
        self.assertEqual(got["state"], "ready")

    def test_counter_proof_a_pull_request_naming_a_longer_identifier_is_not_the_items(self):
        got = self.state("ITM-016", prs=[pr(7, "x", branch="team/ITM-0165", title="ITM-0165: another"), pr(8, "x", branch="x/ITM-0167")])
        self.assertEqual(got["state"], "ready")

    # TST-590002 · level: unit · module: MOD-work-plans
    # guards: PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; UC-032
    # given: the fixture backlog item ITM-016 and a merged pull request whose branch says `codex/itm-016-work` in lower case
    # input: itemStates of the fixture backlog with that pull request
    # expect: ITM-016 is done
    def test_a_lower_case_identifier_in_a_pull_request_branch_names_the_item(self):
        got = self.state("ITM-016", prs=[pr(1, "x", state="merged", branch="codex/itm-016-work", title="the work")])
        self.assertEqual(got["state"], "done")

    def test_what_is_merged_decides_before_what_is_not_accepted(self):
        got = self.state("ITM-016", prs=[pr(7, "ITM-016", state="merged")], accepted=[])
        self.assertEqual(got["state"], "done")


if __name__ == "__main__":
    unittest.main()
