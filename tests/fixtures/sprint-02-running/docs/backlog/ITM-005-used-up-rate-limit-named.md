---
id: ITM-005
title: A used-up rate limit is named, not blamed on the token
kind: implementation
level: 1
realises:
  - A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN
  - AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED
modules:
  - MOD-git-host
  - MOD-dashboard-app
depends_on:
  - ITM-004
origin: backlog refinement 2026-10-01
---
# ITM-005 A used-up rate limit is named, not blamed on the token

**REGISTER**

## Outcome

`MOD-git-host.usedUpLimit(error, product)` turns a `403` or `429` whose rate-limit headers mark a used-up limit into `{ limit: "account" | "network", resetsAt }` — on GitHub from `X-RateLimit-Remaining: 0`, `X-RateLimit-Limit` (5000 with a token, 60 without) and `X-RateLimit-Reset`; on gitlab.com without a time, because it exposes no such header to pages. Such an error never reaches `tokenRefusal`. `fetchText` keeps the response headers on the error it throws. The dashboard's load error (today: "Could not read … 403" with the 60-calls hint even when a token is stored) names the limit, whose it is and when it resets, and says nothing about the token.

## Realises

- `A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN`
- `AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED`

## Where it came from

Known defect, PO report of 2026-10-01 (SPEC queue 2026-10-01b_ratenlimit-benennen, accepted); MOD-git-host `usedUpLimit`.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-004, ARC-005, ARC-006.

## Modules

- MOD-git-host (adapters) — uses no other module
- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/git-host.mjs`
- `docs/assets/dashboard-app.mjs`
- `tests/review-core.d/rate-limit.test.mjs`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/review-core.test.mjs` — `A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN`; `AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED`

## Acceptance criteria

From the SPEC's checks:

- `A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN` — `tests/review-core.test.mjs` — a `403` with `X-RateLimit-Remaining: 0` and `X-RateLimit-Limit: 5000` yields the account's limit and its reset time, and no token message; counter-proof: a `403` without those headers is still reported as a missing permission.
- `AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED` — `tests/review-core.test.mjs` — a refused request yields the token's name and the renewal link.

Further:

- The counter-proof the SPEC names: a `403` without those headers is still reported as a missing permission.
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-004 — adds its check under tests/review-core.d/

## Needs a person

No.
