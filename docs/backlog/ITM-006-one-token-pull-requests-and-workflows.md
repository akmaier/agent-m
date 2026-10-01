---
id: ITM-006
title: One GitHub token serves every feature — Pull requests and Workflows in the link, the guidance and the steps
kind: implementation
level: 1
realises:
  - ONE GITHUB TOKEN SERVES EVERY FEATURE
  - THE TOKEN LINK IS PREFILLED
  - THE REPOSITORY CHOICE IS SPELLED OUT
  - A TOKEN IS SCOPED TO WHAT IT WRITES
  - UC-014
modules:
  - MOD-git-host
  - MOD-dashboard-app
depends_on:
  - ITM-005
origin: backlog refinement 2026-10-01
---
# ITM-006 One GitHub token serves every feature — Pull requests and Workflows in the link, the guidance and the steps

**REGISTER**

## Outcome

`MOD-git-host.requiredPermissions(host)` is the one list of the token's permissions: on GitHub *Contents*, *Issues* and *Pull requests* read and write, *Actions* and *Workflows* read and write, *Metadata* read; on GitLab a project access token with role Maintainer and scope `api`. The prefilled link, the guidance, the repository-choice steps and the settings page are written from it. Today the link asks for Contents, Issues, Actions and Metadata only, and two tests assert that set and that the guidance does not mention Pull requests — the requirement was extended on 2026-09-30, so these expectations change with this item (an implementation job, red first).

## Realises

- `ONE GITHUB TOKEN SERVES EVERY FEATURE`
- `THE TOKEN LINK IS PREFILLED`
- `THE REPOSITORY CHOICE IS SPELLED OUT`
- `A TOKEN IS SCOPED TO WHAT IT WRITES`
- UC-014 — Get your own Agent M

## Where it came from

Known gap between code and SPEC: `ONE GITHUB TOKEN SERVES EVERY FEATURE` names *Pull requests* and *Workflows* since 2026-09-30 (queue 2026-09-30i); `tokenLinkUrl` and its tests predate it. MOD-git-host `requiredPermissions`.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-004, ARC-005, ARC-006.

## Modules

- MOD-git-host (adapters) — uses no other module
- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/git-host.mjs`
- `docs/assets/dashboard/setup-view.mjs` (token texts)
- `docs/assets/dashboard/add-product-view.mjs` (token texts)
- `docs/assets/dashboard/settings-view.mjs` (token texts)
- `tests/test_token_scope_documented.py`
- `tests/review-core.test.mjs` (the token-link test)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_token_scope_documented.py` — `ONE GITHUB TOKEN SERVES EVERY FEATURE`; `THE TOKEN LINK IS PREFILLED`; `THE REPOSITORY CHOICE IS SPELLED OUT`; `A TOKEN IS SCOPED TO WHAT IT WRITES`

## Acceptance criteria

From the SPEC's checks:

- `ONE GITHUB TOKEN SERVES EVERY FEATURE` — `tests/test_token_scope_documented.py` — the prefilled link asks for exactly these permissions.
- `THE TOKEN LINK IS PREFILLED` — `tests/test_token_scope_documented.py`
- `THE REPOSITORY CHOICE IS SPELLED OUT` — `tests/test_token_scope_documented.py`
- `A TOKEN IS SCOPED TO WHAT IT WRITES` — `tests/test_token_scope_documented.py` — the configuration screen states the minimum scope and why each part is needed.

From the postcondition of UC-014 (Get your own Agent M), for the part this item builds:

> - The person has a dashboard at their own address, served from `docs/` of their fork; no server was
>   set up.
> - One token, limited to the instance repository, is stored in this browser. Adding a product later
>   extends this token; it never needs a second one.
> - The fork also carries Agent M's own specification and use cases; the person does not have to
>   review them.

Further:

- The URL parameter names for *Pull requests* and *Workflows* are taken from GitHub's documentation of prefilled fine-grained tokens and cited in the test with the date read — not guessed (`pull_requests` already appears in a counter-proof of `tests/test_token_scope_documented.py`; the name for *Workflows* is not yet verified in the repository).
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-005 — changes docs/assets/git-host.mjs after it

## Needs a person

No.
