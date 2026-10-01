---
id: sprint-02
goal: Agent M watches itself — the backlog tab shows its own sprint live from the item files, the sprint file and the pull requests; the sprint 01 increment and every strand of this sprint are release-tested; and the dashboard's findings from the first review are closed
start: 2026-10-01
end:
selection:
  - ITM-141
  - ITM-125
  - ITM-126
  - ITM-027
  - ITM-127
  - ITM-131
  - ITM-129
  - ITM-033
  - ITM-128
  - ITM-132
  - ITM-130
  - ITM-034
  - ITM-146
  - ITM-050
  - ITM-133
  - ITM-147
  - ITM-014
  - ITM-136
  - ITM-018
  - ITM-016
  - ITM-134
  - ITM-143
  - ITM-144
  - ITM-142
  - ITM-145
closer: scrum-master-session
branch: sprint/02
model: scrum-wip
planned_by: po-fable
---
# Sprint 02

**REGISTER**

The second sprint of Agent M under its declared process (`docs/process.md`, model `scrum-wip`): the Product
Owner's selection from the ordered backlog (`docs/backlog/order.md`), made at sprint planning on 2026-10-01
(UC-032 step 6), on `main` at `37ed922` — sprint 01 merged (pull request #39, `385f5cf`) with one accepted
limitation, no release testing. No state is kept here; whether an item is ready, in progress, blocked or done is
derived from the approval records, job records and pull requests (`PROGRESS AND JOB STATE ARE DERIVED, NOT STORED`).

## Goal

Agent M watches itself — the backlog tab shows its own sprint live from the item files, the sprint file and the
pull requests; the sprint 01 increment and every strand of this sprint are release-tested; and the dashboard's
findings from the first review are closed:

- **The first slice of the process dashboard.** akmaier, 2026-10-01: "It would be cool to have an early prototype
  of the process / job dashboard; then one can watch how Agent M assembles itself." Cut as a thin vertical slice
  from the repository to one view, inside the accepted architecture: the model file parsed for its limit and
  measure (MOD-process-model, ITM-027); items and their order (MOD-work-items, ITM-033); the sprint file and the
  derived item states under the limit (ITM-034); the pull requests of a product read on both hosts (MOD-git-host,
  ITM-146); and the **Backlog** tab that shows the running sprint's board — *ready*, *in progress* with the open
  pull request, *done* with the merged one, *blocked* with its reason — and the backlog below it (ITM-147). The
  sprint it first shows is this one, on `sprint/02`, with the teams' pull requests. Nothing is stored, nothing
  written, and a load reads only what the board shows (`PROGRESS AND JOB STATE ARE DERIVED, NOT STORED`; the cached
  file texts of MOD-settings-store). The chart in the model's measure, the gates and the jobs follow (ITM-035,
  ITM-084, ITM-085): no job writes a record yet, so there is nothing a jobs view could show.
- **Release testing exists.** The sprint 01 increment is tested at level `release` by `tester-opus` from the use
  cases and the SPEC, on `main`; green, the limitation of the sprint 01 merge is lifted by a dated addendum in
  `sprint-01.md`, red, its findings become items (ITM-141). Every strand of this sprint ends with the release
  tests of its items (ITM-142 to ITM-145), so that the gate *Release testing → Sprint review* is decided for each
  strand before the close — the model's phase that sprint 01 skipped (`docs/process-models/scrum-wip.md`).
- **The checks the SPEC names for behaviour that exists are written.** The approval gates characterised with
  counter-proofs (ITM-014) and the applier moved into the engine beside the Python tool (ITM-016); the three
  repository checks of the hard product rules (ITM-050); the link graph of one commit with coverage gaps and
  impact lists (ITM-018); no test reads Agent M's own `SPEC.md` (ITM-128).
- **The findings of the sprint 01 review on the dashboard and the artifact kernel are closed.** ITM-125, ITM-126,
  ITM-127, ITM-129, ITM-130, ITM-131, ITM-132, ITM-133, ITM-134, ITM-136 — each a flow a use case names and the
  dashboard did not carry out, or a place where the code and the accepted architecture disagreed.

## Selection

In the order they are pulled: the top ready item of this list starts when fewer than four items are in
progress. Dependencies are given only where they lie inside this sprint; nothing selected waits for an item
outside it. *Strand* names the participant that holds the item's slot (below); within a strand the items run
one after the other in this order.

| # | Item | Title | Kind | Strand | Waits for (in this sprint) |
|---|---|---|---|---|---|
| 1 | ITM-141 | Release tests of the sprint 01 increment — written from the use cases and the SPEC, by the release tester, run on main | refactoring | T | — |
| 2 | ITM-125 | The export notice says what the GitHub token grants — pull requests included | implementation | D | — |
| 3 | ITM-126 | identifierKept returns a finding, not a sentence — the dashboard writes the sentence | implementation | A | — |
| 4 | ITM-027 | Process model definitions — read and validated before use | implementation | B | — |
| 5 | ITM-127 | A requirement's source named as it is written is no error — no SRC- identifier is required | implementation | C | — |
| 6 | ITM-131 | A refused save shows the newer version beside the edit | implementation | D | — |
| 7 | ITM-129 | A page load asks for no view or settings file that is not built yet — no 404 per planned view | implementation | A | — |
| 8 | ITM-033 | Backlog items, their order, and an item from an issue | implementation | B | — |
| 9 | ITM-128 | No test reads Agent M's own SPEC.md — the specRequirements check runs on its fixture | refactoring | C | — |
| 10 | ITM-132 | Add product — a repository that does not exist is named with GitHub's page for a new one, and Step A shows as done when the token already reaches the product | implementation | D | — |
| 11 | ITM-130 | The reads leave the kernel, and the shells read only through what the git host provides | refactoring | A | ITM-126, ITM-129 |
| 12 | ITM-034 | Sprints, item states, the work-in-progress limit and the sprint's selection | implementation | B | ITM-027, ITM-033 |
| 13 | ITM-146 | The pull requests of a product on both hosts — list and get, each token only to its own server | implementation | C | — |
| 14 | ITM-050 | Repository checks of the hard product rules — no server, Markdown artifacts, a self-sufficient product repository | implementation | D | — |
| 15 | ITM-133 | A write refused for missing write access offers the GitHub path as a link | implementation | A | ITM-130, ITM-131 |
| 16 | ITM-147 | The backlog and the running sprint, read — the first slice of the process dashboard, showing Agent M's own sprint live | implementation | B | ITM-027, ITM-033, ITM-034, ITM-146, ITM-129 |
| 17 | ITM-014 | Characterise the approval gates the code already keeps — the checks the SPEC names, with counter-proofs | refactoring | C | — |
| 18 | ITM-136 | A browser setting's line keeps its last test across reloads — works since a date, or refused at the last use | implementation | A | ITM-125, ITM-130, ITM-132, ITM-133 |
| 19 | ITM-018 | The link graph of one commit — coverage and module gaps, impact of a requirement change | implementation | D | ITM-133 |
| 20 | ITM-016 | applyApprovals in the approval engine — the same bytes as tools/apply_approvals.py | implementation | C | ITM-014 (both add tests of MOD-review-core; one at a time) |
| 21 | ITM-134 | A SPEC change entry that touches an existing requirement shows the artifacts that reference it before the reviewer decides | implementation | D | ITM-018 |
| 22 | ITM-143 | Release tests of sprint 02, strand B — the first slice of the process dashboard | refactoring | T | ITM-027, ITM-033, ITM-034, ITM-147 |
| 23 | ITM-144 | Release tests of sprint 02, strand C — the artifact kernel's checks, the pull-request reads and the approval engine | refactoring | T | ITM-127, ITM-128, ITM-146, ITM-014, ITM-016 |
| 24 | ITM-142 | Release tests of sprint 02, strand A — the dashboard's hub chain | refactoring | T | ITM-126, ITM-129, ITM-130, ITM-133, ITM-136 |
| 25 | ITM-145 | Release tests of sprint 02, strand D — the review findings, the repository checks and the link graph | refactoring | T | ITM-125, ITM-131, ITM-132, ITM-050, ITM-018, ITM-134 |

Every selected item realises only accepted requirements, use cases and modules (checked at planning against
`SPEC.md` and `docs/approvals/`: every name in every item's `realises` is a live requirement of the SPEC or a use
case whose approval record names its current blob), needs no person, and is level 1. The selection is the head
of the level-1 backlog order, positions 16 to 40, without a gap; ITM-141 stands first, as the merge decision of
sprint 01 requires.

## Strands and slots

Four developers and one release tester (`docs/process.md`, *Roles*; `docs/participants.md`) and a limit of four
items in progress (`docs/process-models/scrum-wip.md`, *Flow control*). An item counts from the moment its team
starts it until its pull request is merged into `sprint/02`; a release-test item counts like any other. Each
strand changes files no other strand changes, so its items need no wait outside the ones named above.

| Strand | Participant | Items, in order | What it is |
|---|---|---|---|
| T | tester-opus | ITM-141; then ITM-143, ITM-144, ITM-142, ITM-145 as each strand's last item is merged | release testing — the sprint 01 increment first, then each strand of this sprint |
| A | developer-opus-a | ITM-126 → ITM-129 → ITM-130 → ITM-133 → ITM-136 | the dashboard's hub chain: `artifacts.mjs` and `dashboard/writes.mjs`, `dashboard-app.mjs`, the reads out of `review-core.mjs` and `git-host.mjs`, `review-views.mjs`, `settings-view.mjs` — the files most items of the review touch, one after the other |
| B | developer-opus-b | ITM-027 → ITM-033 → ITM-034 → ITM-147 | the first slice of the process dashboard: three new kernel files, then the **Backlog** tab that shows this sprint |
| C | developer-opus-c | ITM-127 → ITM-128 → ITM-146 → ITM-014 → ITM-016 | the artifact kernel's checks, the one adapter read the slice needs (a new file beside `git-host.mjs`), tests of MOD-review-core, the applier beside `review-core.mjs` |
| D | developer-opus-d | ITM-125 → ITM-131 → ITM-132 → ITM-050 → ITM-018 → ITM-134 | the small review findings that strand A waits for (`settings-store.mjs`, `review-views.mjs` once, `add-product-view.mjs`), the repository checks, then the link graph and the one view that shows it (`spec-changes-view.mjs`) |

- **Slots.** ITM-141 is pulled first and holds one slot; strands D, A and B start at once, and strand C starts
  when the first of the four is merged — D's first items are tiny and are what A's chain waits for (ITM-131 for
  ITM-133, ITM-125 and ITM-132 for ITM-136), so D stands above A and A above B in the pull order; C's ITM-146 is
  third in its strand and is ready long before B's ITM-147 needs it. From then on each strand keeps its slot; a
  release-test item takes the slot its strand frees. When two items are ready at once, the pull order above
  decides.
- **Which developer.** developer-opus-a split the adapters, moved the writes and built the authority form
  (ITM-001, ITM-004, ITM-124, ITM-008) and knows the kernel's seams — strand A; developer-opus-b split the
  kernel (ITM-002) — strand B, the new kernel modules and the view on them; developer-opus-c built the shell, the
  use-case checks and the format checks (ITM-003, ITM-010, ITM-013) — strand C, the artifact kernel's checks;
  developer-opus-d closed sprint 01 as scrum-master-opus and has read every pull request of it — strand D, the
  review's findings.
- **Cross-strand waits.** ITM-133 (A) waits for ITM-131 (D), because both change `dashboard/review-views.mjs`.
  ITM-136 (A) waits for ITM-125 (D, `settings-store.mjs`) and ITM-132 (D, `add-product-view.mjs`). ITM-018 (D)
  waits for ITM-133 (A), the last change to `review-views.mjs` before its own. ITM-147 (B) waits for ITM-146 (C)
  and for ITM-129 (A): ITM-129 decides how the shell knows which view files are built, and ITM-147 adds its view
  where ITM-129 leaves the list — a data file beside the views, never `dashboard-app.mjs`, which strand A changes
  four times (ITM-129, *From the sprint 02 planning*). Strand B otherwise waits for nothing; strand C for nothing.
- **Kinds.** ITM-128, ITM-130, ITM-014 and the five release-test items are refactoring jobs — CI green on every
  commit, no expected result changed; the rest are implementation jobs that begin with a failing test. Both kinds
  of the Definition of Done (`docs/process.md`) are exercised again.

## The slice, and what was re-cut for it

akmaier's wish arrived during planning; the Product Owner weighed it and made it the lead of the goal. The cut
stays inside the accepted architecture — every function the slice calls is in its module's `provides`, every view
in the `DASHBOARD` table of the shell — and inside the GitHub API economy the dashboard has: a load reads the
sprint file, the order, the selected items and one or two pages of pull requests, through the cached file texts.
Re-cut in the backlog (items are the Product Owner's, `docs/process.md`, *Boundary* names no item):

| Item | Before | After |
|---|---|---|
| ITM-146 (new) | part of ITM-055: `git-host/pull-requests.mjs` among issues, workflows and repository information | `pullRequests().list` and `get` on both hosts, read only |
| ITM-055 | issues, pull requests, workflows, repository information | the same without the reads of pull requests; keeps `merge`; depends on ITM-146 |
| ITM-147 (new) | part of ITM-083: the whole of UC-032 in one item | the read part: the running sprint's board under the limit, the backlog in order with derived states, the uncovered names; nothing written |
| ITM-083 | the whole of UC-032 | the writes — *Propose items*, *+ Item*, *Save order*, *Plan sprint*, *Pull*, *End sprint* —, added to ITM-147's view; depends on ITM-147 |
| ITM-034 | depended on ITM-030 (the declaration and the workflow, behind ITM-028 and ITM-029) | depends on ITM-027: `itemState` takes the limit as `wip`, which `parseModel` reads from the model file |
| ITM-129 | the implementer chooses between a list beside the views and asking on first use | the same choice, bounded: a list, if kept, is a data file beside the views, not a line of `dashboard-app.mjs` |

Not in the slice, and why: ITM-035 and ITM-084 (the chart in the model's measure and the gates need the workflow of
ITM-030, three items deeper); ITM-085 (a jobs view would show nothing — no job writes a record before the run engine
runs one; ITM-037, the record format, was in the first draft of this plan and left the sprint with ITM-023 to make
room for the slice without widening it).

## Callers checked at planning (retrospective P7)

For every selected item that changes a function's signature, behaviour or place, the modules of its callers were
listed from the code on `main` at `37ed922` and compared with the item's modules, so that no item is stuck the
way ITM-008 was (sprint 01, *Selection changed*). Three items needed a correction, written into the item file
under *From the sprint 02 planning*:

| Item | What it changes | Callers found | Result |
|---|---|---|---|
| ITM-018 | `impactList` → `architectureImpact` over the graph | `dashboard/review-views.mjs` (MOD-dashboard-app, two calls); `tests/architecture-impact.test.mjs`, `tests/architecture-view.test.mjs` | **corrected:** MOD-dashboard-app added for that one file; waits for ITM-133 |
| ITM-136 | `tokenState` in memory → the kept state | `dashboard-app.mjs`, `dashboard/settings-view.mjs`, **`dashboard/setup-view.mjs`, `dashboard/add-product-view.mjs`**, `tests/test_settings_page.py` — all MOD-dashboard-app | **corrected:** the two files added; waits for ITM-132 and ITM-133 |
| ITM-137 | calls `findPeople` of MOD-pseudonymiser | **no file under `docs/assets/` exports it** — ITM-068 builds it | **corrected and not selected:** depends on ITM-068 |
| ITM-126 | `identifierKept` returns a finding | `artifacts/checks.mjs`, `dashboard/writes.mjs`, `tests/review-core.d/artifacts.test.mjs` | inside its modules, as listed |
| ITM-127 | `requirementProblems` and its fixture | `artifacts/checks.mjs`; five test files of MOD-artifacts read the fixture | inside its module; the four other readers added to its list |
| ITM-129 | the view table of `dashboard-app.mjs` | the shell's own loader; `tests/dashboard-shell.test.mjs`, `tests/load-per-view.test.mjs` (MOD-dashboard-app) | inside its module; bounded for ITM-147 (above) |
| ITM-130 | `readBlob`, `recordCommittedAt`, `lastAccepted`, `deriveTarget` take ports or move; no shell imports `fetchText` | `dashboard-app.mjs`, `dashboard/writes.mjs`, `dashboard/settings-view.mjs`, `dashboard/review-views.mjs` (`lastAccepted`, already with ports); `tests/test_instance_target.py`, `tests/status-by-names.test.mjs`, `tests/review-core.test.mjs`, `tests/review-core.d/dashboard-app.test.mjs` (MOD-review-core, MOD-dashboard-app); `tests/test_no_credential_in_url.py` (MOD-git-host, keeps `fetchText`); `tests/test_pages_layout.py` (no module, scans origins only) | inside its three modules |
| ITM-133 | `writeRefusalText` and what it shows | `dashboard/review-views.mjs`; `tests/review-core.d/dashboard-app.test.mjs` | inside its module |
| ITM-016 | adds `applyApprovals` beside `review-core.mjs` | none; `tests/test_apply_approvals.py` exists (MOD-review-core) and gains the twin comparison | inside its module |
| ITM-147 | a new view, `dashboard/backlog-view.mjs`, and one line in ITM-129's list | the shell loads it by name from the existing `DASHBOARD` row; no other caller | inside its module |
| ITM-125 | the GitHub token's grant sentence in `settingKeys` | `tests/dashboard-review-flows.test.mjs` asserts the sentence word for word; `tests/test_settings_disclosure.py`, which the item names, carries MOD-dashboard-app — both MOD-dashboard-app | **corrected at the sprint 02 review:** MOD-dashboard-app added for those two test files; no code file of it changes |
| ITM-027, ITM-033, ITM-034, ITM-146, ITM-014, ITM-050, ITM-128, ITM-131, ITM-132, ITM-134 | new files, or a text, or tests only | no caller outside the item's modules | — |

Checks an item names but cannot build itself (P6): ITM-134 names `tests/test_impact_list.py` as created by ITM-018,
which is in this sprint before it; ITM-147 names `tests/test_progress_derived.py` for the item states and leaves the
job states to ITM-085. ITM-023, read for the first draft, named `tests/test_correction_loop.py`, which ITM-024
builds — corrected in the item file although it is not selected. No other selected item names a check outside its
files.

## Branch and gates

- Sprint branch: `sprint/02`, from `main` at `37ed922`. Each team branches from it, one item per branch
  (`team/ITM-<nnn>`), and merges back through a pull request with green CI on which the Definition of Done holds.
- **Gate *Development → Release testing*** — the merge of a team's pull request into `sprint/02`, decided by the
  Product Owner. Until gate records exist (ITM-031, ITM-037), each merge carries a comment naming the gate it
  decides and the decider by participant name, `po-fable` (sprint 01 retrospective, P8 — a practice of the
  Product Owner's own, no process change).
- **Gate *Release testing → Sprint review*** — decided by the Product Owner per strand, on the strand's
  release-test item merged green into `sprint/02`, written by `tester-opus` (`RELEASE TESTS ARE NOT WRITTEN BY
  THE IMPLEMENTER`). A red release test sends its item back to Development (the model's *back* transition): the
  test stays, marked as expected to fail with the item's identifier; the strand's developer takes the item up on
  a new branch, red first; the gate is decided only when no release test of the strand carries a mark. The
  decisions are recorded in the table below, one row per strand, before the close; **the sprint is not closed
  until all four rows carry a decision** — the close by `scrum-master-session` starts only then.
- **ITM-141** closes sprint 01's limitation, not a gate of this sprint: when it is merged, the Product Owner
  writes the dated addendum to `sprint-01.md` — green, the limitation is lifted; red, the findings and their items
  are named there.
- The sprint has no time box. It ends when every selected item is done — the release-test items included — or
  the Product Owner ends it. Its close — the review of the increment, the retrospective and the decision on every
  unfinished item — is assigned to `scrum-master-session` (`docs/process.md`, `sprint_close`; UC-041 1a); the merge
  of `sprint/02` into `main` is the Product Owner's decision after review and retrospective are recorded
  (`A GATE IS NOT DECIDED BY THE PARTICIPANT WHOSE WORK IT CHECKS`).

### Gate *Release testing → Sprint review* — decisions

Filled in by the Product Owner as each strand's release tests are merged; empty until then.

| Strand | Release-test item | Pull request | Green on `sprint/02` at | Decision | By, date |
|---|---|---|---|---|---|
| A | ITM-142 | | | | |
| B | ITM-143 | | | | |
| C | ITM-144 | | | | |
| D | ITM-145 | | | | |

## Not selected, and why

Ready on `main` at `37ed922` but outside this goal, left in the backlog for the next planning:

- **ITM-023, ITM-037** — the job harness and the job records: in the first draft of this plan, taken out to make
  room for the slice; no job runs yet that would load a definition or write a record. They stand at the head of
  the order after the selection.
- **ITM-137** — waits for ITM-068: `findPeople` is in MOD-pseudonymiser's module file, not in the code (P7 above).
- **ITM-138, ITM-139, ITM-140** — each needs `akmaier` before it can start (`docs/process.md`, *Boundary*): ITM-138
  the module files brought up to date with the code and accepted; ITM-139 MOD-artifacts' interface line for
  `headerTags` changed to read per-case `Guards:` lines; ITM-140 the five points ARC-020 and the SPEC leave open.
  ITM-138 also waits for ITM-018 and the review items of this sprint, and ITM-140 for ITM-138 and ITM-139. What
  is asked of `akmaier` stands in each item under *Needs a person*; nothing of it is decided here.
- **ITM-135** — waits for ITM-073, not selected.
- **ITM-046, ITM-047, ITM-048** (the source register and resources), **ITM-054, ITM-055** (the git host's results
  branch, tags, issues, the merge of pull requests and workflows), **ITM-059** (the CI generator — its generated
  configuration cannot run before ITM-060), **ITM-063** (Playwright end-to-end tests — a new CI dependency and a
  change to `.github/workflows/tests.yml`), **ITM-064** (model endpoints), **ITM-066** (the mailbox), **ITM-068**
  (the write gate's people search), **ITM-073** (the guided fork), **ITM-076** (the arrange view), **ITM-052** (a
  released runtime's measurement file — there is no release yet, ITM-058): each opens a feature area of its own;
  selecting them would widen the increment beyond what one review can inspect, as in sprint 01.
- **ITM-100** — level 2; level 1 goes end to end first (`docs/backlog/order.md`).

## Review of the increment

*Recorded at the close by `scrum-master-session`.*

## Retrospective

*Recorded at the close by `scrum-master-session`.*
