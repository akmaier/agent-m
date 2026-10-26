# Module: MOD-test-schedule
# Guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
# Level: unit
"""A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES: every job that `.github/workflows/agent-m-tests.yml` — the workflow
MOD-test-schedule generates from Agent M's declared schedule `docs/tests/schedule.md` — runs on a pull request carries GitHub's
`timeout-minutes` of at most two, on the job itself, after which GitHub stops the job and the run fails. The bound is there
because Agent M's schedule declares `minutes: 2`; a test that would make a pull request's CI longer runs on another occasion,
or its row gets more shards, before it is merged.

A job runs on a pull request unless its `if:` names the event it runs on (`github.event_name == '…'`) and none of the events it
names is `pull_request`: a test job of the nightly run, of a release candidate or of a start by hand does not, and carries no
limit; a job without an `if:`, one with `${{ !cancelled() }}` alone, and one naming `pull_request` do.

Expected, stated before the run: the workflow starts on `pull_request`, and every job of it that runs on a pull request has
`timeout-minutes` of 2 or less. Counter-proofs: a pull request's job without the limit, with a limit of five minutes, or with
the limit on a step only, is reported with the job's name, and so is a job whose `if:` is `${{ !cancelled() }}`; a nightly job
without a limit is not.
"""
import pathlib
import re
import unittest

WORKFLOW = pathlib.Path(__file__).resolve().parent.parent / ".github" / "workflows" / "agent-m-tests.yml"
LIMIT = 2


def jobs_of(text: str) -> dict:
    """The jobs of a GitHub Actions workflow, read from its text: a job is a key indented by two spaces under `jobs:`; for each,
    its own `if:` and its own `timeout-minutes:`, the lines indented by four (None where it has none)."""
    lines = text.splitlines()
    if "jobs:" not in lines:
        return {}
    jobs, current = {}, None
    for line in lines[lines.index("jobs:") + 1:]:
        if re.match(r"^\S", line):  # the next top-level key ends the jobs
            break
        job = re.match(r"^  ([\w-]+):\s*$", line)
        if job:
            current = job.group(1)
            jobs[current] = {"if": None, "minutes": None}
            continue
        if not current:
            continue
        condition = re.match(r"^    if:\s*(.+?)\s*$", line)
        if condition:
            jobs[current]["if"] = condition.group(1)
        minutes = re.match(r"^    timeout-minutes:\s*(\d+)\s*$", line)
        if minutes:
            jobs[current]["minutes"] = int(minutes.group(1))
    return jobs


def runs_on_a_pull_request(condition) -> bool:
    """Whether a job with this `if:` runs on a pull request: unless the events its condition names leave `pull_request` out."""
    events = re.findall(r"github\.event_name\s*==\s*'([\w-]+)'", condition or "")
    return not events or "pull_request" in events


def jobs_over_budget(text: str, limit: int = LIMIT) -> list:
    """The jobs of the workflow that run on a pull request and whose own timeout-minutes is missing or above `limit`."""
    jobs = jobs_of(text)
    if not jobs:
        return ["(no jobs)"]
    return [name for name, job in jobs.items()
            if runs_on_a_pull_request(job["if"]) and (job["minutes"] is None or job["minutes"] > limit)]


class PullRequestCiWithinTwoMinutes(unittest.TestCase):
    # TST-476921 · level: unit · module: MOD-test-schedule
    # guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
    # given: .github/workflows/agent-m-tests.yml as it is committed; and written workflows: a pull request's job with the limit 2, one
    #        without a limit, one with 5, one with the limit on a step only, one whose if is ${{ !cancelled() }} without a limit, and a
    #        nightly job (if: github.event_name == 'schedule') without a limit
    # input: jobs_over_budget over each
    # expect: the committed workflow starts on pull_request and no job of it is named; of the written ones, every pull request's job
    #         without the limit or with a longer one is named, the one with !cancelled() too, and the nightly job is not
    def test_every_job_the_generated_workflow_runs_on_a_pull_request_stops_after_two_minutes(self):
        text = WORKFLOW.read_text(encoding="utf-8")
        self.assertRegex(text, r"(?m)^on:\n(?:  .*\n|\n)*?  pull_request:", "the workflow starts on a pull request")
        self.assertEqual(jobs_over_budget(text), [])

        ok = ("on:\n  pull_request:\njobs:\n  unit-pull-request:\n    if: github.event_name == 'pull_request'\n"
              "    runs-on: ubuntu-latest\n    timeout-minutes: 2\n    steps:\n      - run: x\n")
        self.assertEqual(jobs_over_budget(ok), [])
        nightly = "  unit-nightly:\n    if: github.event_name == 'schedule'\n    runs-on: ubuntu-latest\n    steps:\n      - run: y\n"
        self.assertEqual(jobs_over_budget(ok + nightly), [], "a nightly job needs no limit")
        unbounded = "  node:\n    runs-on: ubuntu-latest\n    steps:\n      - run: y\n"
        self.assertEqual(jobs_over_budget(ok + unbounded), ["node"])
        self.assertEqual(jobs_over_budget(ok.replace("timeout-minutes: 2", "timeout-minutes: 5")), ["unit-pull-request"])
        records = "  agent-m-records:\n    if: ${{ !cancelled() }}\n    runs-on: ubuntu-latest\n    steps:\n      - run: z\n"
        self.assertEqual(jobs_over_budget(ok + records), ["agent-m-records"])
        step_only = "jobs:\n  node:\n    runs-on: ubuntu-latest\n    steps:\n      - run: y\n        timeout-minutes: 2\n"
        self.assertEqual(jobs_over_budget(step_only), ["node"], "a step's own limit is not the job's")


if __name__ == "__main__":
    unittest.main()
