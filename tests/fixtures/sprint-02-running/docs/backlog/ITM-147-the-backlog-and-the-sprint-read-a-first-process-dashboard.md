---
id: ITM-147
title: The backlog and the running sprint, read — the first slice of the process dashboard, showing Agent M's own sprint live
kind: implementation
level: 1
realises:
  - PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
  - EVERY STEP EXPLAINS ITSELF
  - UC-032
modules:
  - MOD-dashboard-app
depends_on:
  - ITM-027
  - ITM-033
  - ITM-034
  - ITM-146
  - ITM-129
origin: sprint 02 planning — cut out of ITM-083
---
# ITM-147 The backlog and the running sprint, read — the first slice of the process dashboard, showing Agent M's own sprint live

**REGISTER**

## Outcome

The tab **Backlog** (`DASHBOARD` already names it: view `backlog`, file `dashboard/backlog-view.mjs`, UC-032) shows,
for the product the dashboard is on — the instance itself included —, read from its repository and derived at the
moment it is shown, nothing stored and nothing written:

1. **The running sprint** (`docs/backlog/sprints/`, the sprint file without an end): its goal, branch, closer and
   planned-by, and its selection as a board under the model's work-in-progress limit — *ready*, *in progress*
   (with the open pull request and who opened it), *done* (with the merged pull request and when), *blocked* (with
   the reason) —, in the order of the selection; the limit named, and how many slots are taken.
2. **The backlog** in its order (`docs/backlog/order.md`), each item with identifier, title, kind, level, what it
   realises, where it came from and its derived state (UC-032 step 1): *waiting for acceptance* (a name it realises
   is not accepted), *ready*, *in progress*, *blocked*, *done*; folded below the sprint, loaded only when the reader
   unfolds it.
3. Above both, the accepted requirements and use cases that no item realises yet (UC-032 step 1, last sentence).

The states come from MOD-work-items' `itemState` (ITM-034) with the accepted names from MOD-review-core, the pull
requests from MOD-git-host's `pullRequests` (ITM-146) and the limit from MOD-process-model's `parseModel` (ITM-027)
over the model file the declaration names; no job runs yet, so `jobs` is empty and the view says so in its *What is
this?*. A pull request belongs to an item when its head branch or its title names the item's identifier. The
declaration `docs/process.md` is read for its front matter (`model_file`, `sprint_close`) with MOD-artifacts'
`parseFrontMatter` until ITM-030 provides `parseDeclaration`; the view then switches, nothing else changes.

**What this slice leaves to the items it was cut from:** every write — *Propose items*, *+ Item*, *Save order*, *Plan
sprint*, *Pull* — stays with ITM-083; the chart in the model's measure, the gates and *Who works on what* are UC-035
(ITM-035, ITM-084); the jobs are UC-036 (ITM-085). The board of the sprint is the first picture of Agent M assembling
itself: the sprint that builds this view is the one it shows.

## Realises

- `PROGRESS AND JOB STATE ARE DERIVED, NOT STORED` — the item states, for the job states see ITM-085
- `EVERY STEP EXPLAINS ITSELF`
- UC-032 — Maintain the backlog (step 1; the board of step 7, read)

## Where it came from

Sprint 02 planning (`docs/backlog/sprints/sprint-02.md`): akmaier's wish of 2026-10-01 — "an early prototype of the
process / job dashboard; then one can watch how Agent M assembles itself" — cut as a thin vertical slice from the
item files, the sprint file and the pull requests to one view. ITM-083 built the whole of UC-032 in one item; the
read part is this one, ITM-083 keeps the writes and depends on it (*From the sprint 02 planning* there).

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-005, ARC-006.

## Modules

- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/dashboard/backlog-view.mjs` (new)
- the list of built view files that ITM-129 keeps beside the views, if it keeps one (one line)
- `tests/dashboard-backlog.test.mjs` (new — run in `tests/app-harness.mjs`)
- `tests/test_progress_derived.py` (new — the check the SPEC names, for the item states)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_progress_derived.py` — `PROGRESS AND JOB STATE ARE DERIVED, NOT STORED` (the item states here; the job states are checked by ITM-085)
- `tests/test_step_explanations.py` — `EVERY STEP EXPLAINS ITSELF`

## Acceptance criteria

From the SPEC's checks:

- `PROGRESS AND JOB STATE ARE DERIVED, NOT STORED` — `tests/test_progress_derived.py` — in the app harness, deleting all local storage and the cached file texts and reloading shows the same board and the same item states; counter-proof: a state planted into local storage changes nothing shown.
- `EVERY STEP EXPLAINS ITSELF` — `tests/test_step_explanations.py` — the view carries a folded *What is this?* for the backlog, the sprint, the limit and each state.

From the postcondition of UC-032 (Maintain the backlog), for the part this item builds:

> - The product repository holds its backlog as one Markdown file per item, plus an order and, in
>   Scrum, the sprint selections. No state is stored in them. State is derived from approvals, jobs
>   and pull requests.

Further:

- Over a fixture repository with a sprint file, an order, items and a pull-request fake: an item with an open pull request naming it is *in progress*, with a merged one *done*, one naming an unaccepted requirement *waiting for acceptance*, one whose dependency is not done *ready* is not shown as *in progress*; the board counts the slots taken against the limit of the model file; counter-proofs: a pull request naming no item changes no state, and a selection item whose pull request is merged into another base than the sprint branch is not *done* for the sprint.
- **API economy:** one load of the tab reads the sprint file, the order, the items of the sprint's selection and the pull requests with the sprint branch as base — through the cached file texts (`fileTexts`) keyed by blob SHA, so that a file unchanged since the last load costs no request; the rest of the backlog is read only when unfolded; the test counts the requests of a load against a fixture of 25 selected and 140 backlog items and asserts no request for an unselected item before the fold is opened.
- Nothing is written: no request with a method other than `GET` leaves the view (counter-proof in the harness's recorder).
- Every person-facing text lives in the dashboard (ARC-003 decision 5); kernel and adapters return data.
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-027 — `parseModel`: the work-in-progress limit and whether the work runs in sprints
- ITM-033 — `parseItem`, `backlogOrder`
- ITM-034 — `sprint`, `itemState`
- ITM-146 — `pullRequests().list`
- ITM-129 — how the shell knows which view files are built; this item adds its file where ITM-129 leaves the list

## Needs a person

No.

## Notes

- The sprint whose board this view first shows is sprint 02 itself (`docs/backlog/sprints/sprint-02.md`), on the
  branch `sprint/02`; the pull requests it reads are the teams' pull requests into that branch.
- A sprint file whose `end` is set is a closed sprint; with no running sprint the view shows the last sprint's
  board and says so (UC-035 2b names the same for the chart).
