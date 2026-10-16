---
id: ITM-546
title: The host lists, follows and cancels CI runs
level: module
realises:
  - UC-049
  - ONE DASHBOARD SHOWS EVERY JOB
  - A CANCELLED JOB WRITES NOTHING MORE
  - A REMOTE INTERFACE NAMES HOW IT FAILS
modules:
  - MOD-repository-hosts
builds_on:
  - ITM-400
tests:
  - unit
origin:
  - MOD-repository-hosts, provides and Interfaces: listCiRuns, cancelCiRun, ciRunLog
  - ITM-535 in sprint team1/45: its CI route asks these three, and `src/repository-hosts/` builds none of them
---
# ITM-546 The host lists, follows and cancels CI runs

**REGISTER**

## Outcome

MOD-repository-hosts' `listCiRuns`, `cancelCiRun` and `ciRunLog`, as its file states them, on GitHub and on a GitLab
server. `src/repository-hosts/` names them only in comments, and the host `connect` returns has none of them. So
`fetchFailures` in `src/settings-pages/library.mjs` finds no failure, because it asks only a host that has both. ITM-535's
CI route finds no run either.

The readings, settled from the module file and from what `startWorkflow` already does in the two adapters:
- **Through a clone.** Each of the three uses the REST adapter where a token is given, and otherwise throws
  `NotSupported`, as `connect` states ("every other function uses the REST adapter where a token is given, or throws
  `NotSupported`") and as `startWorkflow` does in `src/repository-hosts/index.mjs`.
- **`listCiRuns(filter)` on GitHub.** "List workflow runs for a workflow" (`…/actions/workflows/{workflow}/runs`) where
  `workflow` is given, and "List workflow runs for a repository" (`…/actions/runs`) where it is not. `branch` and `commit`
  are sent as the server's `branch` and `head_sha`. The answers are read page by page with the adapter's `everyPage`.
  - Each run is a `CiRun`:
    - `id` is the run's id, as a string;
    - `workflow` is the workflow's file name, the last part of its `path`;
    - `commit` is `head_sha`, and `event` is `event`;
    - `url` is `html_url`, the address `startWorkflow` returns and MOD-workflow-entries writes as `by:`;
    - `started` is `run_started_at`, and `ended` is `updated_at` once the run is completed, otherwise `null`.
  - **`state`.**
    - `waiting` is `waiting`;
    - `in_progress` is `running`;
    - `queued`, `requested` and `pending` are `queued`;
    - a completed run takes its conclusion: `success`, `cancelled` and `skipped` as named, and every other conclusion
      `failure`.
- **`listCiRuns(filter)` on GitLab.** "List project pipelines", with `ref` and `sha` from `branch` and `commit`, read page
  by page. A GitLab project has one pipeline definition, which `startWorkflow` starts whatever workflow it is given. So
  `workflow` narrows nothing there, and each run's `workflow` is the filter's `workflow`, or `""` without one. The other
  fields are mapped as `startWorkflow` maps a pipeline, with the adapter's `STATES` table.
- **`cancelCiRun(id)`.** GitHub's "Cancel a workflow run" or GitLab's "Cancel a pipeline's jobs". A run that has already
  ended is not a failure: it returns, and the run's state shows that it ended ("the run's state shows when it has").
  Every other refusal goes through the adapter's existing refusal, as for `startWorkflow`.
- **`ciRunLog(id)`.** The texts of the run's jobs, in the order the server lists them, each preceded by a line with the
  job's name.
  - GitHub: "List jobs for a workflow run", then "Download job logs for a workflow run" for each job.
  - GitLab: "List pipeline jobs", then "Get a log file" for each job.
  - `null` where the server keeps no log of any of its jobs, that is, where every job's log is answered 404 or 410. A run
    the server does not know fails `NotFound`, as `readSnapshot` does.
  - This item does not establish whether GitHub's log redirect answers a page's `fetch` across origins. A `fetch` that
    throws fails `Unreachable`, as every call in the adapter does.

No existing test's expected result changes. The tests of `fetchFailures` and of ITM-535 use fixture hosts. Through the
real host, the library page now sends requests it did not send before. So the tests of `src/settings-pages/library.mjs`
and its callers are run under a `fetch` spy.

## Acceptance

- Against a fetch fixture for each server, `listCiRuns` gives the runs with the fields and states above, with and
  without `workflow`, `branch` and `commit`; `cancelCiRun` makes the one cancel request, and returns for a run that has
  already ended; `ciRunLog` gives the jobs' texts in order, and `null` where no job's log is kept.
- Each of the three names how it fails: `TokenRefused`, `PermissionMissing`, `RateLimited` and `Unreachable` as the file
  states, with a known positive beside each failure. Through a clone without a token, each throws `NotSupported`.
- The first commit holds only the tests, and CI is red on it.
- Each test states its expected values in its own text, and runs under a fetch spy that records every request.
