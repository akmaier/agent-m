---
id: ITM-146
title: The pull requests of a product on both hosts — list and get, each token only to its own server
kind: implementation
level: 1
realises:
  - GITLAB PRODUCTS ARE SUPPORTED
  - A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
  - UC-032
modules:
  - MOD-git-host
depends_on: []
origin: sprint 02 planning — cut out of ITM-055
---
# ITM-146 The pull requests of a product on both hosts — list and get, each token only to its own server

**REGISTER**

## Outcome

`pullRequests({ product, token })` of MOD-git-host with `list(filter)` and `get(n)` — the pull requests of a GitHub
repository and the merge requests of a GitLab project, read with the token of their own server only, as data: number,
title, head branch, base branch, state (open, merged, closed), opened at, merged at, merge commit, the participant line
the body opens with where there is one, and the CI state of the head. `filter` takes a base branch and a state; the
list is read in pages of 100 and stops at the first page older than the date the filter names, so that a view that
shows one sprint reads one or two pages. No write: `merge(n, authority)` stays with ITM-055.

This is the one adapter call the process dashboard's first slice needs (ITM-147): an item is *in progress* when a
pull request naming it is open, *done* when one is merged (UC-032 step 1, `PROGRESS AND JOB STATE ARE DERIVED, NOT
STORED`).

## Realises

- `GITLAB PRODUCTS ARE SUPPORTED`
- `A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT`
- UC-032 — Maintain the backlog (step 1: the derived state reads the pull requests)

## Where it came from

Sprint 02 planning (`docs/backlog/sprints/sprint-02.md`): akmaier's wish of 2026-10-01 for an early prototype of the
process dashboard, cut as a thin slice. ITM-055 (issues, pull requests, workflow runs and repository information)
named `docs/assets/git-host/pull-requests.mjs` among three new files; the reads of that file are this item, so that the
slice needs neither issues nor workflows. ITM-055 keeps the rest, the merge included (*From the sprint 02 planning*
there). MOD-git-host; ARC-004 decision 1.

Architecture decisions its modules follow: ARC-001, ARC-003, ARC-004, ARC-006.

## Modules

- MOD-git-host (adapters) — uses no other module

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/git-host/pull-requests.mjs` (new)
- `tests/review-core.d/git-host-pulls.test.mjs` (new)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/review-core.test.mjs` — `GITLAB PRODUCTS ARE SUPPORTED`; `A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT` (added as a file of `tests/review-core.d/`)

## Acceptance criteria

From the SPEC's checks:

- `GITLAB PRODUCTS ARE SUPPORTED` — `tests/review-core.test.mjs` — the same `list` and `get` over a GitHub fake and over the GitLab fake of `tests/review-core.d/helpers.mjs` give the same data shape; counter-proof: a field the GitLab answer lacks is `null`, never invented.
- `A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT` — `tests/review-core.test.mjs` — a recorder of every request sees the GitHub token only at `api.github.com` and the GitLab token only at that project's API; counter-proof: a product on another GitLab server gets neither.

From the postcondition of UC-032 (Maintain the backlog), for the part this item builds:

> - No state is stored in them. State is derived from approvals, jobs and pull requests.

Further:

- `list({ base, state, since })` reads pages of 100 and stops at the first page whose newest entry is older than `since`; counter-proof: without `since` it reads to the end.
- No URL carries a token or a text (`A CREDENTIAL IS NEVER PLACED IN A URL`, `NO TEXT TRAVELS IN A URL`); the request helper of MOD-git-host is used, no header is set here.
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- nothing — a new file beside `docs/assets/git-host.mjs`; ITM-130 changes `git-host.mjs` in the same sprint, not this file.

## Needs a person

No.
