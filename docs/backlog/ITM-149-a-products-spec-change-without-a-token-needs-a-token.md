---
id: ITM-149
title: A product's SPEC change without a token is not offered GitHub's page — a token is required, because no product carries the apply workflow
kind: implementation
level: 1
realises:
  - WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE
  - EVERY STEP EXPLAINS ITSELF
  - UC-006
modules:
  - MOD-dashboard-app
depends_on:
  - ITM-133
  - ITM-018
  - ITM-134
origin: release tests of sprint 01 (ITM-141)
---
# ITM-149 A product's SPEC change without a token is not offered GitHub's page — a token is required, because no product carries the apply workflow

**REGISTER**

## Outcome

UC-006 4c: "The instance's own SPEC, without a token. The record is committed on GitHub's page; the instance's workflow
then writes the section, applying the same checks. **For a product, a token is required — no product carries the
workflow.**" Today a product's SPEC entry without a token is offered GitHub's new-file page like the instance's. Path:
`dashboard/spec-changes-view.mjs` `viewSpecEntry` → `review-views.mjs` `acceptPanel` → `git-host.mjs` `writeRoute(T.product,
null)` returns `"github-web"` for every GitHub repository, instance or product → `acceptPanel` builds
`newFileUrl(T.repo, …)` "Open in GitHub to commit ↗". The head of the list says so too (`spec-changes-view.mjs`: "Accept it
here; the workflow writes it into `SPEC.md` byte for byte once your approval commit arrives") for any GitHub repository.
Ist: on `?repo=<product>` without a token the entry offers `https://github.com/<product>/new/main?filename=docs/approvals/…`
— a record committed there would show *approved* for ever, since no workflow applies it; Soll: for a product's SPEC
entry the panel offers no such page, says that accepting needs a token and links the token step (UC-001 step A, as the
product settings do in UC-042 3a); the list's head says the same for a product.

The decision is the shell's: the dashboard knows which repository is the instance (`T.instance`, `T.repo` from
`deriveTarget`) and MOD-git-host does not (it "reads no store"; ARC-003 leaves the rules the shells decide to them).
`writeRoute` stays as it is — GitHub's web interface is the fallback for everything a record alone decides: a use case,
a decision or a module of a product without a token keeps GitHub's page (UC-008 3b), and so does editing a proposal
(UC-006 3a, 4b: the edit is a proposal file, which no workflow has to apply).

## Realises

- `WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE` — the dashboard offers the route only where the rule holds
- `EVERY STEP EXPLAINS ITSELF` — the panel says why a token is required for a product
- UC-006 — Approve a specification change (4c, the product's half)

## Where it came from

Release tests of the sprint 01 increment (ITM-141, pull request #48 into `sprint/02`): finding **R2** of
`docs/measurements/2026-10-01_release-tests-sprint-01.md`, case 29 — marked `{ todo }` in
`tests/release-sprint-01-dashboard-app.test.mjs` ("FINDING R2"). ITM-123 characterised 4c's instance half only
(`tests/test_apply_approvals.py`); no backlog item named the product's half.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-005.

## Modules

- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules
(`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`). MOD-git-host is not among them: `writeRoute` and its test
(`tests/review-core.d/git-host.test.mjs`, "GitHub keeps its web-interface fallback") do not change.

Files it creates or changes:

- `docs/assets/dashboard/review-views.mjs` (`acceptPanel`: for a record of kind `spec` on a repository that is not the
  instance, the route `"github-web"` becomes the token-needed panel — like the GitLab `"token-step"` panel, with the reason
  from UC-006 4c and the link to the token step)
- `docs/assets/dashboard/spec-changes-view.mjs` (the head of the list, without a token, on a product: accepting needs a
  token, with the link; the instance's sentence stays)
- `tests/dashboard-spec-product-token.test.mjs` (new — run in `tests/app-harness.mjs`)
- `tests/release-sprint-01-dashboard-app.test.mjs` (case "release · UC-006 4c: a product's SPEC change without a token
  is not offered GitHub's page; a token is required" loses its `{ todo }` mark and becomes an ordinary test; nothing
  else in the file)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it
  (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_apply_approvals.py` — `WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE` (the instance's half;
  exists, not changed by this item — ITM-016 moves it)
- `tests/test_step_explanations.py` — `EVERY STEP EXPLAINS ITSELF`

## Acceptance criteria

From the postcondition of UC-006 (Approve a specification change), for the part this item builds:

> - The SPEC contains exactly the approved text.

Further:

- On `?repo=<GitHub product>` without a token, a SPEC entry is shown with section, proposal, difference and rationale,
  offers no link to `https://github.com/<product>/new/…`, says that accepting needs a token, and links the token step;
  the list's head says the same (release case 29). Counter-proofs: the instance's entry without a token keeps GitHub's
  new-file page with the record (UC-006 4b — `tests/dashboard-review-flows.test.mjs`, "UC-006 4b", unchanged); a
  product's use case without a token keeps GitHub's page (UC-008 3b — unchanged); a product with a token keeps *Accept*.
- With a GitLab product nothing changes: the `"token-step"` panel of today.
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-133 — changes `docs/assets/dashboard/review-views.mjs` first (sprint 02, strand A)
- ITM-018 — the last change to `docs/assets/dashboard/review-views.mjs` in sprint 02 (strand D)
- ITM-134 — changes `docs/assets/dashboard/spec-changes-view.mjs` first (sprint 02, strand D)

## Needs a person

No.

## Callers and the tests that assert what changes (checked at filing, 2026-10-01)

`acceptPanel` is called from `spec-changes-view.mjs` (`viewSpecEntry`) and from the reviewed-file views of
`review-views.mjs` (use cases, decisions, modules — records of other kinds, untouched by the `spec` branch). `writeRoute`
is called in `review-views.mjs` three times (`acceptPanel`, `editPanel`, `acceptAllPanel`) and keeps its result;
`batchBar` already returns nothing without a token. The sentences that change are asserted nowhere in `tests/`: the head
of the list ("Accept it here; the workflow writes it …") has no assertion; the GitHub-page assertions of
`tests/dashboard-review-flows.test.mjs` (UC-006 4b, UC-008 3b), `tests/review-page.test.mjs` ("without a token: no Accept
all") and `tests/review-core.d/dashboard-app.test.mjs` (the label of status *approved*) all concern the instance or a
reviewed file and hold. The release test file lies on `sprint/02` until that sprint is merged; this item starts from a
`main` that holds it.
