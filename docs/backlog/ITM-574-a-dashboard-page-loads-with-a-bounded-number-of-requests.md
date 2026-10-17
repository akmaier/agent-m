---
id: ITM-574
title: A dashboard page loads with a bounded number of requests
level: system
realises:
  - A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN
  - UC-006
modules:
  - MOD-site-frame
  - MOD-review-pages
  - MOD-approvals
  - MOD-implementation-pages
  - MOD-settings-pages
  - MOD-repository-hosts
  - MOD-documents
builds_on:
  - ITM-707
  - ITM-479
tests:
  - component
  - release
origin:
  - akmaier, 2026-10-16, after accepting four module files on the dashboard (3f3af683): "The excessive use of token requests is still a problem that needs to be fixed." — "The problem is not the accept click but the loading code of the dash board. I am sure it still uses excessive number of token acceseses."
---
# ITM-574 A dashboard page loads with a bounded number of requests

**REGISTER**

## Outcome

The live dashboard meets `A PAGE LOAD READS THE REPOSITORY IN BATCHES`, which the SPEC queue
`docs/spec-freigaben/2026-10-17_a-page-load-reads-the-repository-in-batches/` drafts for akmaier. With a token on
GitHub, one page load:
- reads its commit and that commit's tree once;
- reads the files it shows in requests of at most 100 files;
- reads no blob it has read already.

An acceptance reads the head it commits on once.

**The measurement**, `docs/measurements/2026-10-17_dashboard-load-requests.md`, measured on `c7717fd1`:
- **The counts.**
  - The start page sends 51 requests, `#arc` 91, `#spec` 116 and `#backlog` 563.
  - A reload of the same commit sends 51 again.
  - All are REST; no batch is ever sent.
- **The causes, each traced at its failure node.**
  - `fileText` (`docs/assets/dashboard-app.mjs:288`) reads through `Snapshot.read`, which is one `/contents/` request
    per file (`src/repository-hosts/github.mjs:223`). The loading code never calls `Snapshot.readMany`.
  - `readAt` (`dashboard-app.mjs:270`, called at `docs/assets/dashboard/writes.mjs:72`) builds a snapshot per path.
  - `#spec`, process, release, roles and backlog open hosts of their own, whose caches start empty.
- **The cache of file texts across loads** was retired by `d8c69b76` (2026-10-10), which also runs `retireFileTexts`
  (`dashboard-app.mjs:622`). `b9a65089` changed only the tests that expected it. The draft does not bring it back,
  since it would change MOD-browser-store's text and the batches suffice.
- **Refuted.** Resetting `memo` on an unchanged commit costs only the commit and the tree.

**How it is changed.** No module owns the loading code. The SPEC queue's entry 02 adds to
`WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS` the form "makes old code meet a requirement of this specification by
calling a module's interface as the module's file states it, together with the test that checks that requirement". The
fix is a pull request of that form:
- one host and one snapshot per load, its files read with `Snapshot.readMany` ahead of their reads;
- `readAt` reading the head's snapshot once per acceptance;
- `tests/load-per-view.test.mjs` counting it.

MOD-repository-hosts, named under `modules`, is the module whose interface the fix calls. Its file and its code do not
change.

**Ready to be selected** once akmaier accepts the queue.

**Not in it.** The prompt bar's reads (`productFacts` at a hand-over, the poll every 15 s) and the notifications check
were not measured. Bounding them is a later item, after a count.

**Settled at sprint team1/72's start. Selectable:** akmaier accepted MOD-site-frame's file with its taken-over lines
(`c75a15be`).
- **The move.** `docs/assets/dashboard-app.mjs` moves into `src/site-frame/`, as the accepted line says.
  - Its relative imports are rewritten to where their files stand: `./vendor/`, `./settings-store.mjs`,
    `./product-store-adapter.mjs`, `./dashboard/…`, and `../../src/…`.
  - `loadFile` and `linkStylesheet` keep loading the views from `docs/assets/dashboard/`.
  - `docs/index.html` loads the moved file.
  - The views stay where they are, since they are other modules' (MOD-review-pages and others) and go in their items.
- **The batches, in the moved app alone.**
  - Before a route is drawn, the app reads through the load's one snapshot's `readMany` the paths that route shows,
    taken from the tree by the route: `#uc` the use cases, `#arc` the architecture, `#spec` `SPEC.md` and the queues'
    files, `#backlog` the backlog, and the records each needs.
  - So no view changes.
  - `readAt` keeps one snapshot per head for the length of an acceptance.
  - A blob read once is not read again (sprint 71's agreement: a read is skipped where the item holds what it would
    read).
- **The tests that name the old path** (`grep -rln "docs/assets/dashboard-app.mjs\|assets/dashboard-app" tests src
  docs/index.html`, full output read). `tests/app-harness.mjs` and `tests/load-per-view.test.mjs` become this module's,
  as its accepted lines say. Others name modules this item does not hold:
  - `dashboard-roles` (MOD-implementation-pages);
  - `dashboard-review-flows`, `dashboard-settings-last-test` and the release test `release-uc-003-direct-endpoint`
    (MOD-settings-pages);
  - the release test `release-sprint-04-trace-pages` (MOD-trace-pages);
  - `dashboard-notifications`, `dashboard-notifications-wiring` and `system-uc-047-…` (MOD-notifications);
  - `test_no_backend.py` (MOD-repository-hosts' takeover);
  - `dashboard-spec-impact`, `architecture-view` and `dashboard-backlog-teams` (MOD-review-pages' and
    MOD-implementation-pages' takeovers).

  The developer reads each for how it names the path. One that only reaches the app through `app-harness.mjs` keeps
  working. One that reads the file at the old path fails on the draft. Such a test is changed by its own module's item,
  and a release test by another participant (sprint 68's agreement). If the draft run shows any, the developer stops
  and reports them before the tests-only commit.
- **The release tests that count requests or writes:** TST-472516 and 472518 (`writes()` counts the batch's
  `POST /graphql`), and TST-479201 and 479202 (their counts move). They are ITM-678's, by developer-sonnet-b, before this
  item's gate. Every other release file run through `app-harness.mjs` is run on the draft (sprint 70's agreement).
- **The harness.** `tests/app-harness.mjs` answers `POST /graphql` with the files of its repository, as GitHub's batch
  query does. Today it answers 500, which reads as `Unreachable`.
- **The measurement** is the SPEC's Check: `tests/load-per-view.test.mjs`. The start page, `#arc`, `#spec` and
  `#backlog` each send their commit and tree once and one batch per 100 files they show, and an acceptance of three
  files reads its head once.
- **Error fields:** none added. **Topics:** no step is added.
- **Sprints 64 to 71:**
  - each draft run lists the changed tests, and stops at a release test, whose whole file is run;
  - one action per shell command; DOM assertions compare booleans or strings; no refusal is worked around;
  - a header the item touches loses its item history;
  - every step added names the topic it folds;
  - a read is skipped where the item already holds what it would read.

## Acceptance

- Over a counting fake GitHub that serves the batch request, each of the start page, `#arc`, `#spec` and `#backlog` sends
  its commit and tree once and one batch for every hundred files it shows.
- An acceptance of three files reads its head once.
- The counter-proof: the loading code as it stands exceeds those counts, and the test is seen failing on it first.
- A used-up limit is still named, never blamed on the token.

**Measured at ITM-597's gate on #690 (`docs/gates/20261017-0533-development-release-testing-7f40.md`).** Opening the first requirement on `#spec` builds the trace graph of
the version. On this repository that costs 11 GraphQL batches with a token, and 1139 requests without a token: one raw
file per artifact. Drawing `#spec` stays at 12 and 127 requests. The bound this item gives a page load covers that
opening too.

**Measured at ITM-598's gate on #697 (`docs/gates/20261017-0634-development-release-testing-3c18.md`).** A requirement's history read through today's interface costs 4 requests
per commit of `SPEC.md`: 380 per first opening on this repository, 286 of them API calls. ITM-652 holds the interface
that reads it in batches.

**Rests on queue `2026-10-17d` (2026-10-17, po-opus).**
- akmaier rejected the path this item counts on: code no module owns, changed by a pull request between jobs.
- Under the draft of queue `2026-10-17d`, the module whose file names that code as taken over changes it in its own
  implementation job, moving it into the module or removing it. A workflow or a page whose place the platform fixes
  is named in that module's parts.
- This item waits for akmaier's acceptance of that draft, and its fix is read again then.

**Measured at ITM-648's gate on #715 (`docs/gates/20261017-0930-development-release-testing-91e4.md`).** The live `#spec` page load reads every queue's `index.md` and
`entscheidungen.md`, and the specification route reads them again for an opened requirement. The page load's reads are
in the live dashboard's code (`docs/assets/`), which this item bounds once queue `2026-10-17d` is decided.

**The first item of the plan of moving the code outside the architecture into it (2026-10-17, po-opus, sprint team1/70).**
akmaier accepted queue `2026-10-17` (`e513ce62`), so `A PAGE LOAD READS THE REPOSITORY IN BATCHES` is binding. The fix
form of its entry 02 was rejected, and queue `2026-10-17d` was accepted in its place.
- So MOD-site-frame takes over the live loading code: `docs/assets/dashboard-app.mjs` moves into its folder, as its
  module-file draft of the plan names.
- In this item the moved app reads one host and one snapshot per load, and the files it shows through
  `Snapshot.readMany` ahead of their reads. `readAt` reads the head once per acceptance.
- `tests/load-per-view.test.mjs` and `tests/app-harness.mjs` become MOD-site-frame's. The harness serves the batch
  request (`POST /graphql`), which also unblocks ITM-677.
- MOD-repository-hosts leaves its modules: its interface is called, and its file and code do not change.

It waits for akmaier's acceptance of the module-file draft committed with the plan, which names these files as taken over in the module's Parts.

**Decided at its stop before the tests-only commit (2026-10-17, po-opus, sprint team1/72).** The draft already brings a
page load with a token to 3 requests for the start page and `#arc`, 15 for `#spec` and 12 for `#backlog`, where it was
51, 74, 125 and 691.

1. **No change in place.** `CODE OUTSIDE THE ARCHITECTURE IS MOVED INTO IT` (SPEC.md:1441) reads: "A code file, test or
   test helper that belongs to no module is changed only by an implementation job of the module whose file names it as
   taken over, which moves it into that module, or removes it once the module provides what it did".
   - The job that changes the file moves it or removes it. Batching it where it stands would be a third thing the
     sentence does not name.
   - Its approval package says so in words: "An old file is moved or removed, never changed in place"
     (`docs/spec-freigaben/2026-10-17d_every-code-file-belongs-to-a-module/01-architecture-and-implementation.begruendung.md:51`).
   - So the cut "batch in place now, move later" is not open, and the move stays in this item.
2. **The tests the move breaks** are taken into this item, since its job may change a test that names one of its modules
   or that its modules' accepted Parts take over (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).
   - That is why MOD-review-pages, MOD-approvals, MOD-implementation-pages, MOD-settings-pages, MOD-repository-hosts and
     MOD-documents join its modules.
   - It covers `dashboard-shell`, `architecture-view`, `review-core.d/authority` and `helpers`, `dashboard-backlog-teams`,
     `dashboard-review-flows`, `test_no_backend.py`, `test_release_sprint_02_d.py`, `test_instance_target.py`,
     `test_settings_disclosure.py` and `test_settings_page.py`.
   - Each reaches the app at its new place, through `tests/app-harness.mjs` where it can. No expected value changes.
   - A failure whose cause is not traced yet (`dashboard-review-flows`, UC-008 3, UC-006 4a) is traced before the
     tests-only commit, and if an expected value would change, the developer stops again.
3. **The release tests the move breaks** are ITM-707's: `release-sprint-01-dashboard-app`, `release-sprint-02-a-dashboard-app`
   and, if the draft confirms it, TST-292005 of `release-uc-019-change-requirements-by-prompt`.
   - ITM-707 is written by a participant who builds none of this item, before its gate (sprint 68's agreement).
   - Those tests reach the app through `app-harness.mjs`, so they pass on the base and on this item's head.
4. **`#spec`.** `docs/assets/dashboard/spec-changes-view.mjs:19-25` connects hosts of its own for the trace route, whose
   reads the app cannot batch.
   - That view is MOD-review-pages' to take over, and it may only move or go, which is ITM-680.
   - So this item meets the Check for the start page, `#arc` and `#backlog`, and for the app's own reads on `#spec`.
   - `load-per-view.test.mjs`'s case for `#spec`'s reads through the trace route is a todo naming ITM-680, which makes
     `#spec` read through the app's host.
5. **Two waves are read as the requirement allows.** `A PAGE LOAD READS THE REPOSITORY IN BATCHES` asks for "the texts of
   the files it shows in requests of at most 100 files each".
   - A page whose list of files depends on files it has read, such as an open queue's proposals or `#backlog`'s
     process model, reads them in a second `readMany`.
   - Every request then still holds at most 100 files, no file is read by itself, and none is read twice.
   - The Check counts batches by those waves: one per hundred files of each wave.
