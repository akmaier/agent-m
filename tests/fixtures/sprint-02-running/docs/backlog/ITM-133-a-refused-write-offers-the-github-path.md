---
id: ITM-133
title: A write refused for missing write access offers the GitHub path as a link
kind: implementation
level: 1
realises:
  - WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK
  - UC-008
modules:
  - MOD-dashboard-app
depends_on:
  - ITM-130
  - ITM-131
origin: sprint 01 review
---
# ITM-133 A write refused for missing write access offers the GitHub path as a link

**REGISTER**

## Outcome

UC-008 4a: when the server refuses the reviewer's commit because the token has no write access, the dashboard says so
and offers the GitHub path — the prepared new-file page for the approval record, where the commit becomes a pull request
that counts once a maintainer merges it — as a link the reviewer can follow. Today it says so and names the path in words
only ("remove it to use GitHub's page instead"), without a link (`dashboard-app.mjs` `writeRefusalText`;
`docs/measurements/2026-10-01_built-flows-characterised.md`, section 3).

## Realises

- `WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK` — the same route, offered when the token cannot write
- UC-008 — Review and accept a use case (4a)

## Where it came from

Sprint 01 review (`docs/backlog/sprints/sprint-01.md`, *Review*, feedback 13): a flow ITM-123 found not carried out (its
test T15 covers the part that holds). No existing item builds it.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-005.

## Modules

- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/dashboard-app.mjs` (`writeRefusalText` and what it shows)
- `docs/assets/dashboard/review-views.mjs` (the link beside the refusal)
- `tests/review-core.d/write-refused.test.mjs` (new — run in `tests/app-harness.mjs`)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/review-core.test.mjs` — `WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK` (added as a file of `tests/review-core.d/`)

## Acceptance criteria

From the postcondition of UC-008 (Review and accept a use case), for the part this item builds:

> - An approval record names the file and the SHA of the accepted text; the commit names who and
>   when.

Further:

- A commit refused with `403` for missing permission writes nothing; the page says so and shows a link to GitHub's new-file page prefilled with the approval record, as without a token; counter-proof: a refusal for a used-up rate limit offers no such link (`A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN`).
- A GitLab product gets no such link (`A GITLAB PRODUCT IS WRITTEN WITH A TOKEN`).
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-130 — changes `docs/assets/dashboard-app.mjs` first
- ITM-131 — changes `docs/assets/dashboard/review-views.mjs` first

## Needs a person

No.
