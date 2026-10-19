---
id: ITM-1022
title: A job's page shows its commits, its pull request and its CI runs
level: module
realises:
  - UC-036
  - ONE DASHBOARD SHOWS EVERY JOB
modules:
  - MOD-runtimes
  - MOD-main-page
builds_on:
  - ITM-971
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-036-3, read against the accepted texts on main at 40e04d8d
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-1022 A job's page shows its commits, its pull request and its CI runs

**REGISTER**

## Outcome

UC-036-inspect-running-jobs.md:90-91: a job's page shows "its commits and pull request so far" and "its CI runs".
MOD-main-page.md:96 has the route `job` show them, read through MOD-runtimes' `jobTrail`, which is not built
(`src/runtimes/index.mjs` exports no `jobTrail`).

## The accepted text

The draft for this item is accepted (`1c30ad0b` and the acceptances before it); quoted from `main` at 40e04d8d:

MOD-runtimes.md:211-214:

> - `jobTrail(record: JobRecord, product: { host: Host }) -> Promise<{ branch: string, commits: HistoryEntry[], pullRequest:
>   PullRequest | null, runs: CiRun[] }>` — what a job left in its product: the commits of the branch named after the job
>   (`readHistory`, `changes: false`), the pull request of that branch (`listPullRequests`), and the CI runs of its commits
>   (`listCiRuns`). A branch that does not exist gives no commits. Crosses the network; fails as the host fails (UC-036).

MOD-main-page.md:116-116:

> - `job` (`params.id`) — one job: its inputs, its commits and pull request and its CI runs (MOD-runtimes' `jobTrail`), its log while it runs, its …

## Acceptance

- The job's page lists the commits of the job's branch, its pull request and its CI runs, over a fake host, with a
  counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
