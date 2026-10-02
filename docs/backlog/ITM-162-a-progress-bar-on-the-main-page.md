---
id: ITM-162
title: A progress bar of the product's completion on the main page — items per state, derived from the order and the pull requests, in the model's own measure
kind: implementation
level: 1
realises:
  - PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE
  - PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
  - EVERY STEP EXPLAINS ITSELF
  - UC-035
modules:
  - MOD-dashboard-app
depends_on:
  - ITM-147
  - ITM-034
  - ITM-027
  - ITM-033
  - ITM-146
origin: sprint 03 planning — akmaier's direction of 2026-10-02, cut out of ITM-084 and ITM-035
---
# ITM-162 A progress bar of the product's completion on the main page — items per state, derived from the order and the pull requests, in the model's own measure

**REGISTER**

## Outcome

akmaier, 2026-10-02: "the job dashboard for agent-m completion should feature a progress-bar on the main page of the github
page." The main page is the one the dashboard opens on — `docs/index.html` without a fragment, which shows the use cases, and
the same page under `#uc` —; the bar stands on it above the view, in a slot of its own outside `<main>` (as the token line
has one), filled by the shell after the view is rendered and left empty on every other route. It shows how far the product's
backlog has come, in the measure its model names, derived at the moment it is shown from the order and the pull requests —
nothing stored, nothing written, and no item file read:

- **The items.** Every item of the backlog as `backlogOrder` (MOD-work-items) gives it from `docs/backlog/order.md` and the
  item paths of the tree — the order and the unplaced, level 1 and level 2 alike. The bar's denominator is their number.
  The tree the page already holds lists the paths; no item file is read.
- **The state of each item, from the pull requests alone.** `itemState({ id, realises: [] }, { pullRequests, jobs: [] })`
  (MOD-work-items), the way the Backlog tab counts the slots taken: *done* — a pull request naming the item is merged;
  *in progress* — one is open; *blocked* — a job says so (no job writes a record yet, so none); otherwise *not started* —
  *ready* or *waiting for acceptance*, which only the item file tells and the Backlog tab shows. The pull requests are those
  into the branches of the product's sprint records and into the default branch: one `pullRequests().list({ since })`
  (MOD-git-host) without a base, `since` the earliest sprint's start, filtered to those bases — one request per hundred pull
  requests opened since that day, on either host.
- **The measure.** `parseModel` (MOD-process-model) over the model file the declaration names. `items per state over time`
  (Agent M's own `scrum-wip`): a stacked bar — done, in progress, blocked, not started — with the counts, the percentage done
  and the measure named; the bar is the newest point of the cumulative flow the Progress tab will draw (UC-035, ITM-084).
  `remaining items per time box`: the running sprint's remaining selected items against its selection, from the same reads.
  `plan entries per phase`: no bar; one sentence that the plan is shown on Progress once it exists (ITM-035, ITM-084). A
  product without a declaration, or whose model file is not in the tree, gets an empty slot: the Backlog tab says why
  (UC-035's precondition is a declared model).
- **What it links to.** The bar links to the Backlog tab, where the board and the states stand; it carries a folded *What is
  this?* that says what is counted, what *not started* hides, and that the numbers are computed now from the pull requests
  and never kept (`EVERY STEP EXPLAINS ITSELF`).

The counting stands in the shell until MOD-work-items' `progress` exists (ITM-035): then the bar reads its numbers from
`progress`, nothing else changes — as the Backlog tab reads the declaration's front matter until `parseDeclaration` exists
(ITM-147, ITM-030). The chart over time, the gates, *Blocked* and *Who works on what* stay with ITM-084.

## Realises

- `PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE` — the bar's shape follows the measure the model names
- `PROGRESS AND JOB STATE ARE DERIVED, NOT STORED` — the numbers are computed from the order and the pull requests at every load
- `EVERY STEP EXPLAINS ITSELF`
- UC-035 — Follow progress on the process dashboard (step 2, the first slice: the measure, on the main page)

## Where it came from

Sprint 03 planning (`docs/backlog/sprints/sprint-03.md`): akmaier's direction of 2026-10-02, recorded in the sprint 02
retrospective. Cut out of ITM-084 (the Progress view) and ITM-035 (`progress`) the way ITM-147 was cut out of ITM-083: the
part that the existing reads already yield, without ITM-030's workflow — `backlogOrder`, `sprint`, `itemState`, `parseModel`
and `pullRequests().list` are built and in their modules' `provides`.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-005, ARC-006.

## Modules

- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).
No kernel or adapter changes: every function the bar calls is provided today.

Files it creates or changes:

- `docs/assets/dashboard/progress-bar.mjs` (new — the reads, the counting and the bar's HTML; imported by the shell by name,
  as `dashboard/settings-view.mjs` is for the token line; not a view, so not a line of `dashboard/built.json`, whose list
  names only files of the `DASHBOARD` table)
- `docs/assets/dashboard-app.mjs` (the import; one call in `route` that fills the slot on the main page and empties it elsewhere)
- `docs/index.html` (the slot)
- `docs/assets/style.css` (the bar)
- `tests/dashboard-progress-bar.test.mjs` (new — run in `tests/app-harness.mjs`)
- `tests/test_progress_derived.py` (the bar beside the board: deleting every store and reloading shows the same bar)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_progress_derived.py` — `PROGRESS AND JOB STATE ARE DERIVED, NOT STORED` (exists for the item states, ITM-147; gains the bar)
- `tests/test_step_explanations.py` — `EVERY STEP EXPLAINS ITSELF` (exists; holds — the bar's explanation is a folded *What is this?*)
- `tests/test_progress_view.py` — `PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE` (checked by ITM-035, which builds `progress` and the
  three fixtures' renderings; this item's part — the bar follows the measure — is checked in `tests/dashboard-progress-bar.test.mjs`)

## Acceptance criteria

From the postcondition of UC-035 (Follow progress on the process dashboard), for the part this item builds:

> - The reader has seen the product's progress in its model's own measure, the state of every gate,
>   what is blocked, and who works on what.
> - Nothing was written. Everything shown was derived at the moment it was shown.

Further:

- Over a fixture product with a declaration, a model of measure `items per state over time`, an order of N items, two sprint
  records with branches and a pull-request fake: the main page shows the bar with the counts done, in progress, blocked and
  not started, the percentage done, the measure named and the link to the Backlog tab; an item with a merged pull request into
  a sprint's branch or the default branch is counted done, one with an open pull request in progress, the rest not started;
  counter-proofs: a pull request naming no item changes no count; one merged into another base counts nothing; a fixture of
  measure `remaining items per time box` shows the sprint's remaining items against its selection instead; a planned model
  shows the sentence and no bar.
- The bar stands on the address without a fragment and on `#uc`, and on no other route (`#backlog`, `#spec`, `#settings`, a
  use case's own page); a product without `docs/process.md` gets an empty slot and no request for it.
- **Request economy:** a cold load of the main page reads, beyond what the view reads, the declaration, the model file, the
  order and the sprint records through the cached file texts (`fileTexts`, by blob SHA) and one page of pull requests; a warm
  load only the page of pull requests; no item file and no use case is read for the bar — asserted against a fixture of 140
  items (the Backlog tab's fixture): the request list of a cold and a warm load, exactly. On Agent M's own repository the bar
  costs five file reads cold, none warm, and one pull-request request per load; the record names the numbers.
- `PROGRESS AND JOB STATE ARE DERIVED, NOT STORED`: deleting all local storage and the cached file texts and reloading shows the
  same bar; counter-proof: counts planted into local storage change nothing shown. Nothing is written: no request with a method
  other than `GET` leaves the page for the bar.
- Every person-facing text lives in the dashboard (ARC-003 decision 5); the kernel's data is read as it is given.
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-147 — the Backlog tab, whose reads the bar shares: the declaration, the model, the order, the sprint records
- ITM-034 — `sprint`, `itemState`
- ITM-027 — `parseModel`: the measure and the flow control
- ITM-033 — `backlogOrder`
- ITM-146 — `pullRequests().list`

## Needs a person

No. The bar changes no SPEC rule, use case or architecture file: `PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE` says the
process dashboard shows the measure and not where; UC-035 draws the chart on Progress, and the bar is its summary on the
main page, linking to the board today and to Progress once ITM-084 builds it.

## Callers and the tests that assert what changes (checked at planning, 2026-10-02)

The shell's `route` gains one call; `docs/index.html` one slot; no signature changes. The tests that assert a page load's
requests over a product *without* a declaration — `tests/load-per-view.test.mjs` (`["commit", "tree"]` and the files of the
use-case list), `tests/review-page.test.mjs`, `tests/dashboard-review-flows.test.mjs` — hold: an empty slot makes no request.
No test loads the main page over a product with a declaration: `tests/dashboard-backlog.test.mjs`,
`tests/release-sprint-02-b-dashboard-app.test.mjs` and `tests/test_progress_derived.py` open `#backlog`, where the slot is
empty — ITM-143's release case "on load, only the pull requests into the sprint branch" holds, which is why the bar stands
on the main page and not on every route. `tests/dashboard-shell.test.mjs` asserts that `built.json` names only files of the
`DASHBOARD` table — the bar's file is imported, not listed. `tests/test_step_explanations.py` refuses a step without an
explanation; the bar's *What is this?* is a folded `details`, as the Backlog tab's are.
