---
id: ITM-123
title: Characterise the use cases the dashboard already carries out — flow by flow, alternative flows included
kind: refactoring
level: 1
realises:
  - UC-001
  - UC-006
  - UC-008
  - UC-014
  - UC-042
modules:
  - MOD-dashboard-app
  - MOD-review-core
  - MOD-git-host
depends_on:
  - ITM-008
origin: backlog refinement 2026-10-01
---
# ITM-123 Characterise the use cases the dashboard already carries out — flow by flow, alternative flows included

**REGISTER**

## Outcome

The review dashboard already carries out UC-001, UC-006, UC-008 and parts of UC-014 and UC-042; no check walks their alternative flows one by one. This item writes one app-harness test per main and alternative flow of UC-001, UC-006 and UC-008 and of the parts of UC-014 (*Finish setting up*) and UC-042 (browser settings, export and import, pseudonymisation, collaborators) that exist, records each with a planted fault, and lists every flow it finds not carried out in the dated measurement file — each such flow then becomes an implementation item for the PO's backlog.

## Realises

- UC-001 — Add a managed product
- UC-006 — Approve a specification change
- UC-008 — Review and accept a use case
- UC-014 — Get your own Agent M
- UC-042 — Manage settings in one place

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — the existing dashboard against the accepted use cases UC-001, UC-006, UC-008, UC-014, UC-042.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-004, ARC-005, ARC-006.

## Modules

- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items
- MOD-review-core (kernel) — uses MOD-artifacts
- MOD-git-host (adapters) — uses no other module

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `tests/dashboard-review-flows.test.mjs` (new)
- `docs/measurements/<date>_built-flows-characterised.md` (new)

## Kind and level

- Job kind: **refactoring** — CI green on every commit, no expected result changed (`A REFACTORING JOB BEGINS WITHOUT A FAILING TEST`, `A REFACTORING JOB CHANGES NO EXPECTED RESULT`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- none — it realises use cases only; its tests are the files listed above.

## Acceptance criteria


From the postcondition of UC-001 (Add a managed product), for the part this item builds:

> - The product repository contains the review layout; it has no Pages site.
> - This browser lists the product; the instance repository names no product.
> - The one token from UC-014 now reaches the instance and this product, and nothing else.
> - Clicks: *+ Add product*, *Open your tokens on GitHub*, on GitHub *Edit* and *Update*, *Check*,
>   *Add product*. If the token already reaches the product: *+ Add product*, *Check*, *Add product*.

From the postcondition of UC-006 (Approve a specification change), for the part this item builds:

> - The SPEC contains exactly the approved text.
> - The commit history shows who approved, when, and which text; the replaced text is reachable in
>   the history.

From the postcondition of UC-008 (Review and accept a use case), for the part this item builds:

> - An approval record names the file and the SHA of the accepted text; the commit names who and
>   when.
> - Where the diagram and the prose disagree, the prose is what was accepted.

From the postcondition of UC-014 (Get your own Agent M), for the part this item builds:

> - The person has a dashboard at their own address, served from `docs/` of their fork; no server was
>   set up.
> - One token, limited to the instance repository, is stored in this browser. Adding a product later
>   extends this token; it never needs a second one.
> - The fork also carries Agent M's own specification and use cases; the person does not have to
>   review them.

From the postcondition of UC-042 (Manage settings in one place), for the part this item builds:

> - The person has seen every setting Agent M uses, where it is kept, and whether it works.
> - Browser settings changed or cleared here are changed or cleared in `localStorage` itself; repository
>   settings changed here are commits under the person's account.
> - No secret was shown in full except on **Show**, written to a repository, or put into a URL; an export
>   holds them only after the notice.

Further:

- No code changes in this item; a flow that does not behave as its use case says is recorded, not fixed.
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-008 — runs against the write path with its authority

## Needs a person

No.
