---
id: sprint-03
goal: Agent M shows how far it has come — a progress bar of its own completion on the main page, derived from the order and the pull requests in the model's own measure; the findings of sprint 02 are closed; the job definitions and the job records exist; every strand is release-tested
start: 2026-10-02
end:
selection:
  - ITM-158
  - ITM-162
  - ITM-152
  - ITM-160
  - ITM-151
  - ITM-148
  - ITM-157
  - ITM-156
  - ITM-155
  - ITM-161
  - ITM-023
  - ITM-149
  - ITM-159
  - ITM-150
  - ITM-037
  - ITM-164
  - ITM-165
  - ITM-163
  - ITM-166
closer: scrum-master-session
branch: sprint/03
model: scrum-wip
planned_by: po-fable
---
# Sprint 03

**REGISTER**

The third sprint of Agent M under its declared process (`docs/process.md`, model `scrum-wip`): the Product Owner's
selection from the ordered backlog (`docs/backlog/order.md`), made at sprint planning on 2026-10-02 (UC-032 step 6), on
`main` at `d2ed979` — sprint 02 merged (pull request #73) with all four strands' gates passed and no unfinished item. No
state is kept here; whether an item is ready, in progress, blocked or done is derived from the approval records, job records
and pull requests (`PROGRESS AND JOB STATE ARE DERIVED, NOT STORED`).

## Goal

Agent M shows how far it has come — a progress bar of its own completion on the main page, derived from the order and the
pull requests in the model's own measure; the findings of sprint 02 are closed; the job definitions and the job records
exist; every strand is release-tested:

- **The progress bar on the main page.** akmaier, 2026-10-02: "the job dashboard for agent-m completion should feature a
  progress-bar on the main page of the github page." It leads the goal, as the Backlog tab led sprint 02. Cut as ITM-162
  from ITM-084 and ITM-035 the way ITM-147 was cut from ITM-083 — the part the existing reads already yield, without
  ITM-030's workflow: the page the dashboard opens on shows, above the use cases, a bar of every item of the backlog by
  state — done, in progress, blocked, not started —, counted from the order and the pull requests into the sprint branches
  and the default branch, in the measure the model names (`PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE`, UC-035 step 2),
  derived at every load and never kept (`PROGRESS AND JOB STATE ARE DERIVED, NOT STORED`), within the dashboard's request
  economy: five file reads cold through the cached texts, none warm, one pull-request request per load, and no item file
  read. *The bar's definition*, below.
- **The findings of sprint 02 are closed.** The three findings of the sprint 01 release tests (ITM-148, ITM-149, ITM-150),
  the accepted limitations of sprint 02's strands A and C that need no person (ITM-151, ITM-152), the review input of
  2026-10-02 (ITM-155, ITM-156, ITM-157, ITM-158), the close's three follow-ups (ITM-159, ITM-160, ITM-161) — every `{ todo }`
  mark of a release test that the team can remove itself comes off; what remains marked waits for `akmaier` (ITM-153) or
  for ITM-017 (F1–F3).
- **CI pays the SPEC-read watcher once.** ITM-158 goes in first (the Product Owner's condition at the merge of sprint 02):
  it moves the watcher into CI's one run of the two suites and makes a failure name the failing case — the nested suite run,
  where the one flaky observation of sprint 02 happened (`6d94ba2`), goes. Until it merges, no red CI attempt is rerun.
- **The job harness and the job records exist.** ITM-023 (job definitions as data, the finding catalogue) and ITM-037 (job,
  gate, cancel and run records; the seven states) — taken out of sprint 02's first draft to make room for the slice, at the
  head of the order since. Each is a new kernel file with no view; they are what the next slices — the jobs view (ITM-085),
  the board's `jobs` input, the bar's *blocked* segment — read.
- **Release testing per strand.** Every strand ends with the release tests of its items (ITM-163 to ITM-166), written by
  `tester-opus` from the use cases and the SPEC, on fixtures and frozen copies — never the live backlog or sprint records
  (sprint 02's close broke two tests that pinned them) —, so that the gate *Release testing → Sprint review* is decided for
  each strand before the close.

### The bar's definition

Fixed at planning, before the item was written (the Product Owner's condition 2 at the merge of sprint 02); every input is
one the Backlog tab reads today or the tree gives for free.

| Part | Definition | Read from | Cost |
|---|---|---|---|
| Denominator | every item of the product's backlog — the identifiers `backlogOrder` yields from `docs/backlog/order.md` and the item paths of the tree, level 1 and 2 alike | the order (one file), the tree (already read) | 1 file cold, 0 warm |
| States | per identifier, `itemState({ id, realises: [] }, { pullRequests, jobs: [] })` as the Backlog tab counts its slots: *done* — a merged pull request names it; *in progress* — an open one; *blocked* — a job (none yet); else *not started* | the pull requests | — |
| Pull requests | one `pullRequests().list({ since })` without a base, `since` the earliest sprint's start; kept are those into a sprint record's `branch` or the default branch | the sprint records (for the branches and the start), one list | 2 files cold, 0 warm; 1 request per hundred pull requests opened since that day, every load (today 1) |
| Measure | `parseModel(model file).measure`: `items per state over time` → a stacked bar done · in progress · blocked · not started, counts and percentage done, the measure named — the newest point of the Progress tab's cumulative flow (ITM-084); `remaining items per time box` → the running sprint's remaining selected items over its selection; `plan entries per phase` → no bar, one sentence (ITM-035) | the declaration, the model file | 2 files cold, 0 warm |
| Where | the address without a fragment and `#uc` — the page the dashboard opens on —, a slot outside `<main>` as the token line has; empty on every other route and for a product without a declaration | — | no request where it is empty |
| Not read | item files (what *not started* hides — *ready* or *waiting for acceptance* — the Backlog tab tells), use cases, records | — | no cold read per item |
| Later | when ITM-035 builds `progress`, the bar reads its numbers from it; when ITM-084 builds Progress, the bar links there instead of to Backlog | — | — |

On Agent M's own repository: 5 file reads cold, 0 warm, 1 pull-request request per load — beside the main page's own reads;
the Backlog tab reads 34 cold and 3 warm (sprint 02 review). Why the main page and not every page: `tests/dashboard-backlog.test.mjs`
asserts the Backlog tab's exact requests, and ITM-143's release case asserts that its load reads "only the pull requests into the
sprint branch" — a bar on every route would change a passed strand's release test; on the main page the bar changes no existing
expectation (*Callers checked*, below). **No SPEC, use case or architecture change is needed:** `PROGRESS IS SHOWN IN THE
MODEL'S OWN MEASURE` says the process dashboard shows the measure, not where; UC-035 draws the chart on Progress and the bar is
its summary, linking to the board; MOD-dashboard-app "holds every page and every text" and the bar is a page element of the shell,
like the token line; every kernel and adapter function it calls is in its module's `provides`.

## Selection

In the order they are pulled: the top ready item of this list starts when fewer than four items are in
progress. Dependencies are given only where they lie inside this sprint; nothing selected waits for an item
outside it. *Strand* names the participant that holds the item's slot (below); within a strand the items run
one after the other in this order.

| # | Item | Title | Kind | Strand | Waits for (in this sprint) |
|---|---|---|---|---|---|
| 1 | ITM-158 | The SPEC-read watcher runs the suites once, not twice — CI's Python step back from 117 to about 50 seconds | refactoring | T | — |
| 2 | ITM-162 | A progress bar of the product's completion on the main page — items per state, derived from the order and the pull requests, in the model's own measure | implementation | B | — |
| 3 | ITM-152 | An acceptance handed a record writes no approval record for it — a job, gate, approval or test result record is left out and named | implementation | C | — |
| 4 | ITM-160 | An untested browser setting reads "not tested yet", not "not tested on this page yet" | implementation | A | — |
| 5 | ITM-151 | A refused batch acceptance and a refused save offer the GitHub route — one prefilled page per record, the editor for the edit | implementation | D | — |
| 6 | ITM-148 | The layout Add product writes holds docs/architecture/ — on GitHub and on GitLab alike | implementation | C | ITM-152, ITM-160 |
| 7 | ITM-157 | The dashboard renders no image from a host the page does not name — a product artifact's image loads from the git hosts only | implementation | A | ITM-162 |
| 8 | ITM-156 | A requirement that names another requirement in its text is in that requirement's impact list | implementation | D | — |
| 9 | ITM-155 | Accept ticked on the SPEC list leaves out an entry whose impact list was not shown — as a changed decision is left out | implementation | C | ITM-152, ITM-148 |
| 10 | ITM-161 | A token kept as refused is shown as working again after its next successful request | implementation | A | ITM-160, ITM-157 |
| 11 | ITM-023 | Job definitions as data — loader, prompt, output schema, context fit, disclosure, the finding catalogue | implementation | B | — |
| 12 | ITM-149 | A product's SPEC change without a token is not offered GitHub's page — a token is required, because no product carries the apply workflow | implementation | D | ITM-151, ITM-148, ITM-155 |
| 13 | ITM-159 | The blank lines that end an approved proposal are the separator, not its text — V1 settled as a reading, the mark comes off | refactoring | C | — |
| 14 | ITM-150 | The expiry warning offers the paste field for the renewed token — beside Renew, on every page, for the GitHub token and a GitLab project token alike | implementation | A | ITM-160, ITM-161, ITM-149 |
| 15 | ITM-037 | Job, gate, cancel and run records, and the seven job states | implementation | D | — |
| 16 | ITM-164 | Release tests of sprint 03, strand B — the progress bar on the main page and the job definitions (ITM-162, ITM-023) | refactoring | T | ITM-162, ITM-023 |
| 17 | ITM-165 | Release tests of sprint 03, strand C — the approval engine's records, the product layout, the SPEC list's batch and the verbatim reading (ITM-152, ITM-148, ITM-155, ITM-159) | refactoring | T | ITM-152, ITM-148, ITM-155, ITM-159 |
| 18 | ITM-163 | Release tests of sprint 03, strand A — the settings lines, the token line's paste field and the rendered images (ITM-160, ITM-157, ITM-161, ITM-150) | refactoring | T | ITM-160, ITM-157, ITM-161, ITM-150 |
| 19 | ITM-166 | Release tests of sprint 03, strand D — the GitHub routes of a refused batch and save, the requirement edge of the graph, the product's token rule and the job records (ITM-151, ITM-156, ITM-149, ITM-037) | refactoring | T | ITM-151, ITM-156, ITM-149, ITM-037 |

Every selected item realises only accepted requirements, use cases and modules (checked at planning against `SPEC.md` and
`docs/approvals/`: every name in every item's `realises` is a live requirement of the SPEC or a use case whose approval record
names its current blob), needs no person, and is level 1. The selection is the head of the level-1 backlog order, positions
41 to 59, without a gap: the head of the order as it stood after sprint 02 — ITM-151 to ITM-158, then ITM-148 to ITM-150,
ITM-159 to ITM-161 — less the two items that wait for `akmaier` (ITM-153, ITM-154; *Not selected*, below), plus the bar,
ITM-023 and ITM-037 from the positions right behind, and the four release-test items. ITM-158 stands first, as the merge
decision of sprint 02 requires; ITM-149 waits for ITM-151, as that decision names.

## Strands and slots

Four developers and one release tester (`docs/process.md`, *Roles*; `docs/participants.md`) and a limit of four
items in progress (`docs/process-models/scrum-wip.md`, *Flow control*). An item counts from the moment its team
starts it until its pull request is merged into `sprint/03`; a release-test item counts like any other. Each
strand changes files no other strand changes, except where a wait is named above.

| Strand | Participant | Items, in order | What it is |
|---|---|---|---|
| T | tester-opus | ITM-158; then ITM-164, ITM-165, ITM-163, ITM-166 as each strand's last item is merged | the watcher into CI's one run first (its own release-test file and the workflow), then each strand's release tests |
| A | developer-opus-a | ITM-160 → ITM-157 → ITM-161 → ITM-150 | the shell and the settings page: `settings-view.mjs` twice, `dashboard-app.mjs` three times (`md`, the success note, the token line), `settings-store.mjs` once |
| B | developer-opus-b | ITM-162 → ITM-023 | the progress bar — a new file beside the views, a slot and a call in the shell — then the job harness, a new kernel file |
| C | developer-opus-c | ITM-152 → ITM-148 → ITM-155 → ITM-159 | `review-core.mjs` three times (`planAcceptance` and `useCaseRecord`, `missingLayout`, the SPEC entry's condition), the SPEC list's note, then the V1 reading in `test_verbatim.py` |
| D | developer-opus-d | ITM-151 → ITM-156 → ITM-149 → ITM-037 | `review-views.mjs` twice (the batch and save routes, the product's token panel), the graph's `names` edge, then the job records — a new kernel file |

- **Slots.** ITM-158 is pulled first and holds one slot; strands B, C and A start at once, and strand D starts when the
  first of the four is merged — ITM-158 is small and goes first by the merge condition; B's bar leads the goal; C's ITM-152 and
  A's ITM-160 are what C's and A's chains and D's ITM-149 wait for. From then on each strand keeps its slot; a release-test
  item takes the slot its strand frees. When two items are ready at once, the pull order above decides.
- **Which developer.** developer-opus-b built the process dashboard slice (ITM-027, ITM-033, ITM-034, ITM-147) and knows the
  Backlog tab's reads the bar shares — strand B; developer-opus-a built the hub chain of sprint 02 (ITM-126, ITM-129, ITM-130,
  ITM-133, ITM-136) and the settings line's kept state — strand A; developer-opus-c built the approval engine's checks and
  applier (ITM-014, ITM-016) and wrote the V1 case — strand C; developer-opus-d built the graph and the entry's impact list
  (ITM-018, ITM-134) and the review findings — strand D, with the job records as a new file at its end.
- **Cross-strand waits.** ITM-148 (C) waits for ITM-160 (A): both change `tests/dashboard-review-flows.test.mjs` (the layout's
  constant; the untested sentence). ITM-157 (A) waits for ITM-162 (B): both change `dashboard-app.mjs`, the bar first. ITM-149
  (D) waits for ITM-148 (C) — both remove a mark from `tests/release-sprint-01-dashboard-app.test.mjs` — and for ITM-155 (C),
  which changes `spec-changes-view.mjs` first. ITM-150 (A) waits for ITM-149 (D) on the same release-test file. Inside a strand
  the order above resolves every shared file: `review-core.mjs` (152 → 148 → 155), `review-views.mjs` (151 → 149),
  `dashboard-app.mjs` (162 → 157 → 161 → 150), `settings-view.mjs` and `test_settings_page.py` (160 → 150),
  `dashboard-settings-last-test.test.mjs` (160 → 161), `tests/review-core.d/gates.test.mjs` (152 → 155).
- **Kinds.** ITM-158, ITM-159 and the four release-test items are refactoring jobs — CI green on every commit, no expected
  result changed (ITM-159's one changed expectation is the reading recorded at planning, as case 26 was in sprint 02); the
  rest are implementation jobs that begin with a failing test.

## Re-cut and decided at planning

Items are the Product Owner's (`docs/process.md`, *Boundary* names no item). Changed in the backlog:

| Item | Before | After |
|---|---|---|
| ITM-162 (new) | part of ITM-084 (the Progress view) and ITM-035 (`progress`): the chart in the model's measure, behind ITM-030 | the bar on the main page from the existing reads; the counting in the shell until `progress` exists, then switched (ITM-147's precedent with `parseDeclaration`) |
| ITM-084 | the whole of UC-035 | the same without the bar; links the bar to Progress and takes its counting over; depends on ITM-162 |
| ITM-035 | unchanged in scope | a note: the bar switches to `progress` when it exists |
| ITM-159 | both writers keep a proposal's trailing blank lines; depends on ITM-017 | **the Product Owner's reading:** the blank lines that end a proposal are the separator between sections, not the approved text — the content is written byte for byte, the section keeps its one separator; the other reading would put a second blank line between sections for a proposal ending in one, so that the SPEC's bytes and the current text shown beside the next proposal (`extractSection`) would differ while no word changed; the V1 case asserts the reading and loses its mark; no writer changes; no dependency on ITM-017; `akmaier` may overrule, as with S1 |
| ITM-156 | might add two lines to `spec-changes-view.mjs` | checked: the view shows a kind it does not know as the graph names it (`KIND[a.kind] ?? h(a.kind)`); MOD-traceability only, no shared file with ITM-155 or ITM-149 |
| ITM-160 | three files | `tests/dashboard-review-flows.test.mjs` added (the sentence grep, below); the remote session's line loses "on this page" too |
| ITM-161 | the reading open | the Scrum Master's reading adopted: the last use decides — a request that carried the token and was answered clears a kept refusal; the callers and asserting tests listed in the item |
| ITM-148, ITM-149, ITM-150, ITM-157, ITM-161 | no dependency inside this sprint | the waits above, as `depends_on` (the backlog's convention: the later of two items on one file depends on the earlier) |
| ITM-163 to ITM-166 (new) | — | the release tests per strand, with the practices of sprint 02's retrospective as criteria: run on a clean tree, no suite inside a test, fixtures and frozen copies only |
| ITM-023 | names `tests/test_destination_disclosure.py` | P6: that file is MOD-git-host's; the harness's `disclosure` is checked in `tests/job-harness.test.mjs` |

Not in the slice, and why: the chart over time, the gates, *Blocked* and *Who works on what* need the workflow (ITM-030, behind
ITM-028 and ITM-029) and the job records read by a view (ITM-085); the bar is what the reads of today give. The bar on every
route was weighed and set aside (*The bar's definition*).

**Changed outside the backlog, in the planning commit:** both suites were run on the planned tree as CI runs them. One case went
red — `tests/dashboard-backlog.test.mjs`, "Agent M's own sprint 02 …" (ITM-147's own test), which read the live `docs/backlog/`
and asserted sprint 02 as the sprint shown; this record makes sprint 02 the last closed sprint and sprint 03 the running one. The
third test to pin live sprint state (sprint 02's close broke two): its backlog input is frozen to
`tests/fixtures/sprint-02-running/docs/backlog/`, the copy the release tests of strand B already serve; no expectation changed
(34 requests cold, 3 warm, the same board). Recorded here so that the retrospective sees it; the Scrum Master's merge of `main`
into `sprint/03` carries it to the teams.

## Callers checked at planning (retrospective P7, and the sentence grep of the sprint 02 retrospective)

For every selected item that changes a function's signature, behaviour, place or a sentence a test asserts, the modules of
its callers and the asserting tests were listed from the code on `main` at `d2ed979` and compared with the item's modules and
files. Items filed on 2026-10-01 and 2026-10-02 carry a *Callers* section from their filing; it was re-read, not repeated.

| Item | What it changes | Callers and asserting tests found | Result |
|---|---|---|---|
| ITM-162 | the shell's `route` gains a call; `index.html` a slot; a new file imported by name | tests that assert a page load's requests over a product without a declaration — `load-per-view.test.mjs`, `review-page.test.mjs`, `dashboard-review-flows.test.mjs` — hold (empty slot, no request); no test loads the main page over a product with a declaration (`dashboard-backlog.test.mjs`, `release-sprint-02-b-dashboard-app.test.mjs`, `test_progress_derived.py` open `#backlog`); `dashboard-shell.test.mjs` requires `built.json` to name only table files — the bar's file is imported, not listed; `test_step_explanations.py` — a folded explanation | inside its module; written into the item |
| ITM-160 | the sentence "not tested on this page yet" | `settings-view.mjs` twice (the token lines, the remote session's line); asserted in `dashboard-settings-last-test.test.mjs` (8), `test_settings_page.py` (1), **`dashboard-review-flows.test.mjs` (1)** — all MOD-dashboard-app; no release test | **corrected:** the third file added |
| ITM-161 | when a kept refusal is cleared (`setTokenTest`, `setGitLabTokenTest`) | readers: `settings-view.mjs`, `setup-view.mjs`, `add-product-view.mjs` (hold); asserting: `dashboard-settings-last-test.test.mjs`, `dashboard-review-flows.test.mjs` ("UC-042 1b"), `test_settings_page.py` — expected to hold, listed in the item | inside its modules; the reading recorded |
| ITM-150 | the sentence "Then paste it under Settings → GitHub token → Change." goes | asserted nowhere in `tests/` (only quoted in a frozen item copy) | as filed |
| ITM-157 | `md` of the shell | `test_no_backend.py` scans this repository's Markdown and the page's origins, not `md`'s output (the item says so); every app-harness check renders this instance's files, which carry no foreign image | as filed; waits for ITM-162 on the shell |
| ITM-148 | `missingLayout` | as filed (three asserting test files listed); the fourth, `dashboard-review-flows.test.mjs`, is changed by ITM-160 first | **corrected:** waits for ITM-160 and ITM-152 |
| ITM-159 | one test's expectation | `tools/apply_approvals.py` and `review-core.mjs` unchanged; `test_apply_approvals.py` (the twin, F1–F3) unchanged | re-cut (above) |
| ITM-156 | `linkGraph`, `requirementImpact` gain an edge and a kind | `spec-changes-view.mjs` shows an unknown kind as named; `tests/test_impact_list.py`, `tests/test_coverage_report.py` are the item's | inside its module |
| ITM-023, ITM-037 | new files | no caller; the Python tests they name do not exist yet and are created (except `test_destination_disclosure.py`, P6 above) | — |
| ITM-151, ITM-152, ITM-155, ITM-149, ITM-158 | as filed on 2026-10-02 | their *Callers* sections re-read against `d2ed979`: unchanged | — |

Checks an item names but cannot build itself (P6): ITM-162 names `tests/test_progress_view.py` as ITM-035's; ITM-023
names `tests/test_destination_disclosure.py` as MOD-git-host's (corrected in the item). No other selected item names a check
outside its files.

## Branch and gates

- Sprint branch: `sprint/03`, from `main` at `d2ed979`. Each team branches from it, one item per branch
  (`team/ITM-<nnn>`), and merges back through a pull request with green CI on which the Definition of Done holds. The
  Scrum Master merges `main` into `sprint/03` after every backlog commit of the Product Owner — this planning's commit
  first (sprint 02 retrospective).
- **Until ITM-158 is merged, no red CI attempt is rerun** (the Product Owner's condition at the merge of sprint 02): a red
  run is read for the failing case; after ITM-158 the watcher's failure names it.
- **Gate *Development → Release testing*** — the merge of a team's pull request into `sprint/03`, decided by the
  Product Owner. Until gate records exist (ITM-031, ITM-037), each merge carries a comment naming the gate it
  decides and the decider by participant name, `po-fable` (sprint 01 retrospective, P8).
- **Gate *Release testing → Sprint review*** — decided by the Product Owner per strand, on the strand's
  release-test item merged green into `sprint/03`, written by `tester-opus` (`RELEASE TESTS ARE NOT WRITTEN BY
  THE IMPLEMENTER`). A red release test sends its item back to Development (the model's *back* transition): the
  test stays, marked as expected to fail with the item's identifier; the strand's developer takes the item up on
  a new branch, red first; the row is decided again when the mark is gone. As sprint 02 applied the rule: a mark goes
  back when its fix lies inside the item's text, modules and files and needs no person; a mark that names more than
  the item said, a reading the Product Owner settles otherwise, or a change only `akmaier` can make is an accepted
  limitation with an item of its own; a row whose remaining marks are all limitations is *passed*. The decisions are
  recorded in the table below, one row per strand, before the close; **the sprint is not closed until all four rows
  carry a decision** — the close by `scrum-master-session` starts only then.
- **Testers and developers:** suites are run on a clean tree, scratch scripts as `.txt` in the item's own scratch folder;
  no test runs a suite inside itself; no test reads the live backlog, sprint records or pull requests of this repository
  — frozen copies and fixtures only (sprint 02 retrospective).
- The sprint has no time box. It ends when every selected item is done — the release-test items included — or
  the Product Owner ends it. Its close — the review of the increment, the retrospective and the decision on every
  unfinished item — is assigned to `scrum-master-session` (`docs/process.md`, `sprint_close`; UC-041 1a); the merge
  of `sprint/03` into `main` is the Product Owner's decision after review and retrospective are recorded
  (`A GATE IS NOT DECIDED BY THE PARTICIPANT WHOSE WORK IT CHECKS`).

### Gate *Release testing → Sprint review* — decisions

Filled in by the Product Owner as each strand's release tests are merged. A row sent *back to Development* is decided
again, in a second line of the same row, when the marks it names are gone.

| Strand | Release-test item | Pull request | Green on `sprint/03` at | Decision | By, date |
|---|---|---|---|---|---|
| A | ITM-163 | | | | |
| B | ITM-164 | | | | |
| C | ITM-165 | | | | |
| D | ITM-166 | | | | |

## Not selected, and why

Ready on `main` at `d2ed979` but outside this goal, or not ready, left in the backlog for the next planning:

- **ITM-153, ITM-154** — each needs `akmaier` before it can start (`docs/process.md`, *Boundary*), as their filing says;
  they stand at positions 60 and 61, right behind the selection, and are selected as soon as the answer is in. What is
  asked, exactly — for the Scrum Master to put to `akmaier` at once:
  - **ITM-153:** does the interface line of `deriveStatus` in `docs/architecture/MOD-review-core.md` —
    `deriveStatus(path, currentBlob, records) -> "open" | "accepted" | "changed"` — gain a fourth value for a path that is
    none of the three reviewed kinds (a job, gate, approval or test result record), proposed `"record"`, accepted by an
    approval record of the changed module file under the account `akmaier`? If yes, under which name; if no, the engine
    keeps answering *open* and the views keep filtering (G1 stays an accepted limitation).
  - **ITM-154:** which way for the impact list of a changing SPEC entry — (a) an index derived in CI at every commit, one
    file (for example `docs/traceability/headers.json`: every test's `Guards:` line and every artifact's names, written by
    the CI entry from the readers the graph uses), read in one request and checked against the commit shown — is a
    CI-written derived file within `THE TRACEABILITY MATRIX IS DERIVED` ("never stored as a separately edited document")
    and ARC-006 (traceability computed from one pinned commit)?; or (b) a read added to MOD-git-host's interface that
    returns the header lines of the tree's files in fewer requests than one per blob — a change to an accepted module;
    or another way `akmaier` names.
- **ITM-138** — needs `akmaier` (the module files are changed and accepted under that account; UC-023). Its dependencies
  are all merged since sprint 02. What is asked: for each name ITM-138 lists — its sprint 01 list and the sprint 02
  additions under *From the sprint 02 review* —, does `akmaier` bring the module file up to date (the name added to
  `provides`, or to the importer's `uses`) and accept it, or should the importing code stop using the name? The item's
  step 1 — the measured list from the code — needs no person and runs first once the answer to the way is in.
- **ITM-137** — waits for ITM-068 (`findPeople`). **ITM-139, ITM-140** — need `akmaier` (ITM-139 MOD-artifacts' interface
  line; ITM-140 the five points ARC-020 and the SPEC leave open) and wait for ITM-138. **ITM-135** — waits for ITM-073.
- **ITM-035, ITM-084** — the chart over time and the gates need the workflow (ITM-030, behind ITM-028, ITM-029); the bar
  was cut from them. **ITM-085** — needs ITM-037 (this sprint), ITM-039 and ITM-055.
- **ITM-015, ITM-019 to ITM-022, ITM-024, ITM-026, ITM-028 to ITM-032, ITM-036, ITM-038 to ITM-040** (the proposal flow,
  the specification browser's data, the history, the run order, the audit view, the correction loop, the catalogue, the
  declaration and workflow, the gate and done checks, the run engine's next jobs and executor), **ITM-046 to ITM-048**,
  **ITM-052, ITM-054, ITM-055, ITM-059, ITM-063, ITM-064, ITM-066, ITM-068, ITM-073, ITM-076**: each opens a feature area
  of its own; selecting them would widen the increment beyond what one review can inspect, as sprint 02 decided.
- **ITM-100 and the bridge** — level 2; level 1 goes end to end first (`docs/backlog/order.md`).

### For `akmaier`, and only these

The three questions above (ITM-153, ITM-154, ITM-138). Nothing in this planning changes the SPEC, a use case or an
architecture file. Two readings of the Product Owner's that `akmaier` may overrule, as S1 in sprint 02: V1 (ITM-159 — the
blank lines that end a proposal are the separator, not the approved text) and `NO SERVER` for a product's images (ITM-157's
filing: should `akmaier` read the rule as not reaching them, the item is withdrawn, not widened).
