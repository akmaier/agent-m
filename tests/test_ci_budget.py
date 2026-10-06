# Module: none — Agent M's own CI workflow (.github/workflows/tests.yml), outside every module (AGENT M'S SOURCE CODE LIVES IN SRC)
# Guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
# Level: unit
"""A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES (queue 2026-10-06d): every job of the pull-request workflow carries GitHub's
`timeout-minutes` of at most two, after which GitHub stops the job and the run fails. A test that would make a pull request's
CI longer is therefore moved to the nightly build (nightly.yml), or the suite is split, before it is merged.

Expected, stated before the run: in .github/workflows/tests.yml every job under `jobs:` has `timeout-minutes` of 2 or less, on
the job itself. Counter-proofs: a workflow with a job without the limit, with a limit of five minutes, or with the limit on a
step only, is reported with the job's name.
"""
import pathlib
import re
import unittest

WORKFLOW = pathlib.Path(__file__).resolve().parent.parent / ".github" / "workflows" / "tests.yml"
LIMIT = 2


def jobs_over_budget(text: str, limit: int = LIMIT) -> list:
    """The jobs of a GitHub Actions workflow whose own timeout-minutes is missing or above `limit`, read from its text: a job is
    a key indented by two spaces under `jobs:`, its timeout a `timeout-minutes:` line indented by four."""
    lines = text.splitlines()
    if "jobs:" not in lines:
        return ["(no jobs)"]
    jobs, current = {}, None
    for line in lines[lines.index("jobs:") + 1:]:
        if re.match(r"^\S", line):  # the next top-level key ends the jobs
            break
        job = re.match(r"^  ([\w-]+):\s*$", line)
        if job:
            current = job.group(1)
            jobs[current] = None
            continue
        minutes = re.match(r"^    timeout-minutes:\s*(\d+)\s*$", line)
        if minutes and current:
            jobs[current] = int(minutes.group(1))
    if not jobs:
        return ["(no jobs)"]
    return [name for name, m in jobs.items() if m is None or m > limit]


class PullRequestCiWithinTwoMinutes(unittest.TestCase):
    def test_every_job_of_the_pull_request_workflow_stops_after_two_minutes(self):
        text = WORKFLOW.read_text(encoding="utf-8")
        self.assertRegex(text, r"(?m)^on:\n  pull_request:", "the workflow of the pull requests")
        self.assertEqual(jobs_over_budget(text), [])

    def test_counter_proof_a_job_without_the_limit_or_with_a_longer_one_is_named(self):
        ok = "on:\n  pull_request:\njobs:\n  python:\n    runs-on: ubuntu-latest\n    timeout-minutes: 2\n    steps:\n      - run: x\n"
        self.assertEqual(jobs_over_budget(ok), [])
        self.assertEqual(jobs_over_budget(ok + "  node:\n    runs-on: ubuntu-latest\n    steps:\n      - run: y\n"), ["node"])
        self.assertEqual(jobs_over_budget(ok.replace("timeout-minutes: 2", "timeout-minutes: 5")), ["python"])
        step_only = "jobs:\n  node:\n    runs-on: ubuntu-latest\n    steps:\n      - run: y\n        timeout-minutes: 2\n"
        self.assertEqual(jobs_over_budget(step_only), ["node"], "a step's own limit is not the job's")


if __name__ == "__main__":
    unittest.main()
