---
id: ITM-151
title: A refused batch acceptance and a refused save offer the GitHub route — one prefilled page per record, the editor for the edit
kind: implementation
level: 1
realises:
  - WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK
  - UC-008
  - UC-018
modules:
  - MOD-dashboard-app
depends_on:
  - ITM-133
  - ITM-018
origin: release tests of sprint 02, strand A (ITM-142)
---
# ITM-151 A refused batch acceptance and a refused save offer the GitHub route — one prefilled page per record, the editor for the edit

**REGISTER**

## Outcome

`WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK`: "accepting and editing open GitHub's web interface with the
commit prepared as far as GitHub allows"; ITM-133 built that route for the one refusal UC-008 4a names — the single
*Accept* refused with `403` for missing write access. Two refusals of the same kind still end in words only:

- **Accept ticked** (UC-008 3d) and **Accept all** (3e), refused for missing write access. Path:
  `dashboard/review-views.mjs` `wireBatch` and `viewReviewAll` call `runAccept` without a `githubPage` → `runAccept`
  → `out.textContent = app.writeErrorText(e)` → "Your token cannot write to … remove it to use GitHub's page instead."
  Ist: the sentence, no link. Soll: the same route the page offers without a token for a batch — one prefilled new-file
  page per record (`acceptAllPanel`'s list: `newFileUrl(T.repo, T.ref, approvalPath(…), recordText(rec))`), for the
  ticked records or for every record of the *Review all* page, under the refusal.
- **Save** of an edit (UC-008 3a, UC-018 6: "as in UC-008 4a, the dashboard offers the GitHub route"), refused for
  missing write access. Path: `wireCommon` → the `[data-edit-save]` handler → `saveReviewedFile` throws the `403` →
  `out.textContent = app.writeErrorText(e)`. Ist: the sentence. Soll: GitHub's editor of the file, as *Edit* offers
  without a token (UC-008 3b: the text to the clipboard, `editUrl(T.repo, T.ref, path)`), under the refusal.

The counter-proofs of ITM-133 hold for both: a used-up rate limit offers no such link
(`A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN`), a GitLab product gets none
(`A GITLAB PRODUCT IS WRITTEN WITH A TOKEN`). The sentence written by `writeRefusalText` stays; the links stand beside it.

## Realises

- `WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK` — accepting (every acceptance commit) and editing
- UC-008 — Review and accept a use case (3d, 3e with 4a)
- UC-018 — Edit an artifact on the dashboard (6b)

## Where it came from

Release tests of sprint 02, strand A (ITM-142, pull request #63 into `sprint/02`): findings **A3** (case 21) and **A4**
(case 22) of `docs/measurements/2026-10-02_release-tests-sprint-02-a.md`, marked `{ todo }` in
`tests/release-sprint-02-a-dashboard-app.test.mjs` ("FINDING A3", "FINDING A4") with ITM-133. The Product Owner decided at
the gate *Release testing → Sprint review* of strand A (`docs/backlog/sprints/sprint-02.md`, *Decided on 2026-10-02*):
ITM-133's own acceptance criteria are met — it named the single *Accept* and the record's new-file page —; the tester's
readings R1 (4a is the alternative of every acceptance commit of UC-008) and R2 (UC-018 6b is the editing half of the
rule) are the Product Owner's readings too, and what they ask for is this item, not a re-opening of ITM-133.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-005.

## Modules

- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules
(`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`). MOD-git-host is not among them: `newFileUrl` and `editUrl` exist.

Files it creates or changes:

- `docs/assets/dashboard/review-views.mjs` (`runAccept` takes the pages of a batch — one per record — and shows them under
  a refusal for missing write access; the save handler shows the editor's route under such a refusal)
- `tests/review-core.d/write-refused.test.mjs` (the batch and the save, each with the two counter-proofs)
- `tests/release-sprint-02-a-dashboard-app.test.mjs` (cases "UC-008 3d with 4a" and "UC-008 3a with 4a, UC-018 6b" lose
  their `{ todo }` marks and become ordinary tests; nothing else in the file)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it
  (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/review-core.test.mjs` — `WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK` (a file of `tests/review-core.d/`)

## Acceptance criteria

From the postcondition of UC-008 (Review and accept a use case), for the part this item builds:

> - An approval record names the file and the SHA of the accepted text; the commit names who and
>   when.

Further:

- *Accept ticked* with two ticked use cases, refused `403` for missing permission: nothing written, the page says so and
  shows one link to GitHub's new-file page per ticked record, each prefilled with its record (release case 21); *Accept
  all* likewise for every record of the page. Counter-proofs: a used-up rate limit shows no link; a GitLab product none.
- *Save* refused `403` for missing permission: nothing written, the edit stays in the textarea, the page says so and
  offers GitHub's editor of the file — the link, or the control that copies the text and opens it (release case 22).
  Counter-proofs as above; a save refused because the file changed meanwhile keeps ITM-131's behaviour (the newer version
  shown, no GitHub route).
- The two `{ todo }` marks of the release cases are removed and the cases are green; no other release case changes.
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-133 — built `runAccept`'s single-record route and `writeAccessRefused` (sprint 02, strand A)
- ITM-018 — the last change to `docs/assets/dashboard/review-views.mjs` in sprint 02 (strand D)

## Needs a person

No.

## Callers and the tests that assert what changes (checked at filing, 2026-10-02)

`runAccept` is called from `wireAccept` (single record, with its page), `wireBatch` (Accept ticked) and `viewReviewAll`
(Accept all) — all in `review-views.mjs`; its signature gains the pages of a batch, which only these three callers pass.
`tests/review-core.d/write-refused.test.mjs` (ITM-133) asserts the single-record route and its counter-proofs, unchanged.
ITM-149 changes `acceptPanel` and the SPEC list's head in the same file and depends on this item. The release test file
lies on `sprint/02` until that sprint is merged; this item starts from a `main` that holds it.
