---
id: ITM-055
title: Issues, pull requests, workflow runs and repository information on both hosts
kind: implementation
level: 1
realises:
  - GITLAB PRODUCTS ARE SUPPORTED
  - A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
  - UC-033
  - UC-036
modules:
  - MOD-git-host
depends_on:
  - ITM-008
origin: backlog refinement 2026-10-01
---
# ITM-055 Issues, pull requests, workflow runs and repository information on both hosts

**REGISTER**

## Outcome

`issues`, `pullRequests`, `workflows` (dispatch, runs, cancel, log) and `repositoryInfo` (visibility, default branch, a GitLab token's role) of MOD-git-host, each token only to its own server's API, each write on an authority.

## Realises

- `GITLAB PRODUCTS ARE SUPPORTED`
- `A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT`
- UC-033 — Move an issue into the backlog
- UC-036 — Inspect running jobs

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-git-host; ARC-004 decision 1.

Architecture decisions its modules follow: ARC-001, ARC-003, ARC-004, ARC-006.

## Modules

- MOD-git-host (adapters) — uses no other module

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/git-host/issues.mjs` (new)
- `docs/assets/git-host/pull-requests.mjs` (`merge(n, authority)` only; `list` and `get` are ITM-146 — *From the sprint 02 planning*)
- `docs/assets/git-host/workflows.mjs` (new)
- `tests/review-core.d/git-host-calls.test.mjs`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/review-core.test.mjs` — `GITLAB PRODUCTS ARE SUPPORTED`; `A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT`

## Acceptance criteria

From the SPEC's checks:

- `GITLAB PRODUCTS ARE SUPPORTED` — `tests/review-core.test.mjs`
- `A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT` — `tests/review-core.test.mjs`

From the postcondition of UC-033 (Move an issue into the backlog), for the part this item builds:

> - The backlog holds an item that names the issue as its origin, and what it realises.
> - The issue names the item.
> - No implementation job can start for a change item before its specification change is accepted.

From the postcondition of UC-036 (Inspect running jobs), for the part this item builds:

> - The author has seen every reachable job of every product in one place, with state, participant,
>   runtime, elapsed time, cost where known, and log.
> - Every gate passed from this page is recorded with who, when and on which text.
> - A cancelled job wrote nothing after its cancel. A retry is a new job that names the one it retries.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-008 — writes take an authority
- ITM-146 — creates `docs/assets/git-host/pull-requests.mjs` with `list` and `get`; this item adds `merge`

## Needs a person

No.

## From the sprint 02 planning

The reads of pull requests — `pullRequests().list(filter)` and `get(n)` on both hosts — were cut out into ITM-146 for the
first slice of the process dashboard (ITM-147), which needs them and nothing else of this item. This item keeps
`issues`, `workflows`, `repositoryInfo` and the write `pullRequests().merge`, and now depends on ITM-146.
