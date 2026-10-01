---
id: sprint-01
goal: The existing dashboard stands on the accepted architecture, and the kernel's artifact module is complete
start: 2026-10-01
end: 2026-10-01
selection:
  - ITM-001
  - ITM-002
  - ITM-003
  - ITM-004
  - ITM-005
  - ITM-006
  - ITM-007
  - ITM-124
  - ITM-008
  - ITM-123
  - ITM-009
  - ITM-010
  - ITM-011
  - ITM-012
  - ITM-013
closer: scrum-master-opus
branch: sprint/01
model: scrum-wip
planned_by: po-fable
---
# Sprint 01

**REGISTER**

The first sprint of Agent M under its declared process (`docs/process.md`, model `scrum-wip`): the Product
Owner's selection from the ordered backlog (`docs/backlog/order.md`), made at sprint planning on 2026-10-01
(UC-032 step 6). No state is kept here; whether an item is ready, in progress, blocked or done is derived from
the approval records, job records and pull requests (`PROGRESS AND JOB STATE ARE DERIVED, NOT STORED`).

## Goal

The existing dashboard stands on the accepted architecture, and the kernel's artifact module is complete:

- the code of `review-core.mjs` and `review-app.mjs` is split into the accepted modules — kernel, adapters and
  the dashboard shell with views loaded by name — with its behaviour unchanged, and every test names its
  module, what it guards and its level (ARC-003, ARC-020);
- on that structure, what the SPEC accepted on 2026-09-30 and 2026-10-01 is applied to the built dashboard: a
  used-up rate limit is named instead of blamed on the token, one token with *Pull requests* and *Workflows*,
  the pseudonymisation setting explained as rewriting without persons, and one write path that takes an
  authority;
- every flow the dashboard already carries out is characterised, and the flows it does not carry out are
  listed for the next refinement;
- MOD-artifacts reads and checks requirements, use cases, identifiers and headers, and group files, and runs
  every format check of one kind in one call — the base every derivation and job item builds on.

## Selection

In the order they are pulled: the top ready item of this list starts when fewer than four items are in
progress. Dependencies are given only where they lie inside this sprint; nothing selected waits for an item
outside it.

| # | Item | Title | Kind | Waits for (in this sprint) |
|---|---|---|---|---|
| 1 | ITM-001 | Split the adapters out of review-core.mjs — git host, browser store, tunnel commands | refactoring | — |
| 2 | ITM-002 | Split the kernel — artifacts, traceability and personal-data parts out of the approval engine | refactoring | ITM-001 |
| 3 | ITM-003 | The dashboard shell — texts and HTML out of the kernel, review-app.mjs becomes dashboard-app.mjs with view files loaded by name | refactoring | ITM-002 |
| 4 | ITM-004 | Every existing test names its module, what it guards and its level; the shared check file runs a folder | refactoring | ITM-003 |
| 5 | ITM-005 | A used-up rate limit is named, not blamed on the token | implementation | ITM-004 |
| 6 | ITM-006 | One GitHub token serves every feature — Pull requests and Workflows in the link, the guidance and the steps | implementation | ITM-005 |
| 7 | ITM-007 | The pseudonymisation setting is explained as rewriting without persons, not as stand-ins | implementation | ITM-006 |
| 8 | ITM-124 | The writes leave the kernel — the dashboard's five commits move into the dashboard, the product-settings line into the pseudonymiser | refactoring | ITM-007 |
| 9 | ITM-008 | One write path that takes an authority — click, CI secret or agent login | implementation | ITM-124 |
| 10 | ITM-123 | Characterise the use cases the dashboard already carries out — flow by flow, alternative flows included | refactoring | ITM-008 |
| 11 | ITM-009 | The requirement format and its checks — five fields, one statement, a named check, what it constrains, a registered source | implementation | ITM-004 |
| 12 | ITM-010 | Use cases checked in the dashboard's reader as in the Python twin — realised names, Mermaid, identifier kept | implementation | ITM-004 |
| 13 | ITM-011 | Identifiers, their stability, origin links, and the Module, Guards and Level lines of code and tests | implementation | ITM-004 |
| 14 | ITM-012 | Group files — parse, format, the hierarchy with every item once, moves | implementation | ITM-004 |
| 15 | ITM-013 | Every format check of one artifact kind in one call, as findings for the correction loop | implementation | ITM-009, ITM-010, ITM-011, ITM-012 |

Every selected item realises only accepted requirements, use cases and modules (checked at planning against
`docs/approvals/`), needs no person, and is level 1. The selection is the head of the backlog order,
positions 1 to 15, without a gap.

## Selection changed on 2026-10-01 — ITM-124 added before ITM-008

A new **Start sprint** decision of the Product Owner (UC-032 6a: an item added during a running sprint
enters the selection only by such a decision, and the sprint shows what it adds). Added: ITM-124, position 8,
between ITM-007 and ITM-008; nothing removed. Reason: the developer of ITM-008 found, before writing, that
the five functions that call the write path — `acceptItems`, `saveReviewedFile`, `addProduct`,
`savePseudonymisation`, `saveCollaborators` — still live in the kernel (`docs/assets/review-core.mjs`,
MOD-review-core), which imports the git host's write functions; ITM-008's modules are MOD-git-host and
MOD-dashboard-app only, so it could not change them (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).
Widening ITM-008 was rejected: moving the writes changes no expected result and is a refactoring job
(green on every commit), while the authority form changes behaviour and is an implementation job (red
first) — one pull request cannot satisfy both Definitions of Done, and the move is owed to the accepted
architecture (MOD-review-core: "it never writes itself"; ARC-003 decision 1) whether or not ITM-008
follows, so it belongs to this sprint's first goal. ITM-008's file list was corrected at the same time
(`spec-changes-view.mjs` and `setup-view.mjs` have no write call of their own; the click tests lie in
`tests/review-core.d/` since ITM-004). The team that started ITM-008 takes ITM-124 first, on a branch of
its own; the limit of four is untouched — the dashboard strand still holds one slot.

## How the selection runs under the limit of four

- ITM-001 to ITM-004 follow one another: each moves code out of the files the one before it produced. Until
  ITM-004 is merged, one item is in progress and the limit is not reached.
- From ITM-004 on, two strands run side by side on disjoint files: the dashboard strand ITM-005 → ITM-006 →
  ITM-007 → ITM-124 → ITM-008 → ITM-123 (MOD-git-host and the dashboard's views, one after the other) and the
  artifact strand ITM-009, ITM-010, ITM-011, ITM-012 (MOD-artifacts, one new file each, independent of each
  other), closed by ITM-013 once all four are merged. With the limit of four, the dashboard strand holds one
  slot and the artifact strand up to three; an item of the dashboard strand stands above the artifact items in
  this list, so it is pulled first whenever it is ready, because it is the longer chain.
- The refactorings, ITM-124 and ITM-123 are refactoring jobs — CI green on every commit, no expected result changed
  —, the rest are implementation jobs that begin with a failing test. Both kinds of the Definition of Done
  (`docs/process.md`) are exercised in this sprint.

## Branch and close

- Sprint branch: `sprint/01`, from `main`. Each team branches from it, one item per branch, and merges back
  through a pull request with green CI on which the Definition of Done holds.
- Release tests of the selected items are written by `tester-opus`, never by the implementer, and run green
  on `sprint/01` before the review.
- The sprint has no time box. It ends when every selected item is done or the Product Owner ends it. Its
  close — the review of the increment, the retrospective and the decision on every unfinished item — is
  assigned to `scrum-master-opus` (UC-041); the merge of `sprint/01` into `main` is the Product Owner's decision
  after review and retrospective are recorded. *Corrected at the close, 2026-10-01:* this line and the front
  matter first named `po-fable` as closer. `docs/process.md` assigns the close to `scrum-master-opus`
  (`sprint_close: scrum-master-opus`), because the merge of `sprint/01` into `main` checks the review and the
  retrospective, and the Product Owner who decides that merge must not have written them (`A GATE IS NOT DECIDED
  BY THE PARTICIPANT WHOSE WORK IT CHECKS`). The front matter's `closer` follows `docs/process.md`; `end` records
  the day the last selected item was merged (pull request #38, 18:15 UTC).

## Not selected, and why

Ready after ITM-004 but outside this goal, so left at the top of the backlog for the next planning: ITM-014,
ITM-016, ITM-027, ITM-033, ITM-037, ITM-046, ITM-047, ITM-048, ITM-050, ITM-052, ITM-059, ITM-064, ITM-066,
ITM-068, ITM-100. Each of these opens a feature area of its own (approval gates, the applier, process models,
work items, job records, the source register and resources, repository checks, the CI generator, model
endpoints, the mailbox, the jump host); selecting them here would widen the increment beyond what one review
can inspect.

## Review of the increment

Recorded on 2026-10-01 by `scrum-master-opus`, the closer `docs/process.md` names (UC-041, alternative flow 1a), on
the branch `sm/close-sprint-01` from `main` at `1ce7724`. UC-041 step 6 and MOD-work-items `sprintClose` ask for the
review and the retrospective as one record under `docs/backlog/sprints/`, but leave open whether it is the sprint's own
file; they are written here, as two sections of the sprint file, so that the sprint and its close are one record.

**No stakeholder took part** (`AN AGENT'S REVIEW NAMES WHERE ITS FEEDBACK CAME FROM`). Every point of feedback below is
an agent's finding — the teams' and this closer's —, or a decision of `akmaier` relayed during the close; none is a
user's or stakeholder's voice.

### What was done

Every selected item is merged into `sprint/01`; the increment is all fifteen. *Participant* is what the pull request
names; seven pull requests name no participant, only the model.

| # | Item | Kind | Pull request · merged (UTC) | Participant | Realises | Evidence beyond CI |
|---|---|---|---|---|---|---|
| 1 | ITM-001 | refactoring | #24 · 14:29 | developer-opus-a | `EVERY ARTIFACT NAMES ITS ORIGIN`; UC-024 | moved-not-rewritten comparison in the PR |
| 2 | ITM-002 | refactoring | #25 · 14:42 | developer-opus-b | `EVERY ARTIFACT NAMES ITS ORIGIN`; UC-024 | in the PR |
| 3 | ITM-003 | refactoring | #26 · 15:21 | developer-opus-c | `EVERY ARTIFACT NAMES ITS ORIGIN`; `EVERY STEP EXPLAINS ITSELF`; `CONFIGURATION LIVES IN THE BROWSER`; UC-024 | `docs/measurements/2026-10-01_dashboard-shell.md` |
| 4 | ITM-004 | refactoring | #27 · 15:48 | developer-opus-a | `EVERY ARTIFACT NAMES ITS ORIGIN`; `EVERY TEST HAS ONE LEVEL` | in the PR |
| 5 | ITM-005 | implementation | #29 · 16:05 | not named | `A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN`; `AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED` | in the PR |
| 6 | ITM-006 | implementation | #31 · 16:19 | not named | `ONE GITHUB TOKEN SERVES EVERY FEATURE`; `THE TOKEN LINK IS PREFILLED`; `THE REPOSITORY CHOICE IS SPELLED OUT`; `A TOKEN IS SCOPED TO WHAT IT WRITES`; UC-014 | in the PR |
| 7 | ITM-007 | implementation | #34 · 16:33 | not named | `PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF`; `REPORT DATA LEAVES THE MAILBOX ONLY REWRITTEN WITHOUT PERSONS`; `SWITCHING PSEUDONYMISATION OFF STATES WHAT FOLLOWS`; UC-042 | in the PR; its two checks in `tests/test_mail_privacy.py` were not built (feedback 11) |
| 8 | ITM-124 | refactoring | #36 · 17:06 | developer-opus-a | `EVERY ARTIFACT NAMES ITS ORIGIN`; UC-024 | `docs/measurements/2026-10-01_writes-leave-the-kernel.md` |
| 9 | ITM-008 | implementation | #37 · 17:28 | developer-opus-a | `THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK`; `A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET`; `A LOCAL AGENT USES THE PERSON'S OWN LOGIN`; `A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE` | `docs/measurements/2026-10-01_one-write-path-with-an-authority.md`; its checks in `tests/test_runtime_levels.py` and `tests/test_bridge_agents.py` were not built (feedback 10) |
| 10 | ITM-123 | refactoring | #38 · 18:15 | not named | UC-001; UC-006; UC-008; UC-014; UC-042 | `docs/measurements/2026-10-01_built-flows-characterised.md` |
| 11 | ITM-009 | implementation | #28 · 16:07 | not named | `A REQUIREMENT HAS FIVE FIELDS`; `ONE STATEMENT PER REQUIREMENT`; `A REQUIREMENT NAMES ITS CHECK`; `A REQUIREMENT HAS A REGISTERED SOURCE`; `A RESOURCE'S TERMS ENTER AS A SOURCE` (its sixth name, per PR #28, not built) | `docs/measurements/2026-10-01_requirement-checks-mutations.md` |
| 12 | ITM-010 | implementation | #30 · 16:11 | developer-opus-c | `A USE CASE REALISES NAMED REQUIREMENTS`; `A USE CASE HAS ACTOR, PRECONDITION, FLOW AND POSTCONDITION`; `DIAGRAMS ARE MERMAID IN MARKDOWN`; `ONE USE CASE, ONE FILE`; `AN EDITED FILE KEEPS ITS IDENTIFIER` | `docs/measurements/2026-10-01_use-case-checks.md` |
| 13 | ITM-011 | implementation | #32 · 16:30 | not named | `EVERY ARTIFACT HAS AN IDENTIFIER`; `THE NAME IS THE ID AND IT SURVIVES`; `EVERY ARTIFACT NAMES ITS ORIGIN`; `EVERY TEST HAS ONE LEVEL` | `docs/measurements/2026-10-01_identity-checks-mutations.md` |
| 14 | ITM-012 | implementation | #33 · 16:37 | not named | `ARTIFACTS ARE ARRANGED IN NESTED GROUPS`; `A GROUP CARRIES NO IDENTIFIER`; `A GROUP HOLDS ONE KIND OF ARTIFACT`; `AN ITEM HAS ONE PLACE IN ITS HIERARCHY`; `EVERY HIERARCHY IS KEPT IN A GROUP FILE OF ITS OWN`; `REGROUPING LEAVES THE GROUPED FILE UNCHANGED`; `AN UNGROUPED ITEM IS SHOWN AT THE TOP LEVEL` | `docs/measurements/2026-10-01_group-files.md` |
| 15 | ITM-013 | implementation | #35 · 17:07 | developer-opus-c | UC-007; UC-019; UC-022 | `docs/measurements/2026-10-01_format-checks.md` |

**Not done:** none. Every selected item is merged; no item goes back to the backlog or into the next sprint.

**Release testing was not carried out.** The model places *Release testing* between *Development* and *Sprint
review*, with a gate the Product Owner decides ("written by a participant other than the implementer of the behaviour
they test, green on the sprint branch", `docs/process-models/scrum-wip.md`), and this file says "Release tests of the
selected items are written by `tester-opus` … and run green on `sprint/01` before the review". On `sprint/01` at
`cc86c1f` no test declares the level `release` (the test files declare `unit` and `component`, one `system`), and no
pull request or commit names `tester-opus`. The gate *Release testing → Sprint review* has no recorded decision. This
review is written without it; whether release testing is done before the merge into `main`, or the merge is decided
with this gap named, is the Product Owner's decision.

### Who took part

- `po-fable` (Product Owner) — planned the sprint and changed its selection once (ITM-124 before ITM-008, *Selection
  changed on 2026-10-01* above).
- `developer-opus-a` — ITM-001, ITM-004, ITM-124, ITM-008; `developer-opus-b` — ITM-002; `developer-opus-c` — ITM-003,
  ITM-010, ITM-013. ITM-005, ITM-006, ITM-007, ITM-009, ITM-011, ITM-012 and ITM-123 were implemented by one of the three
  developers, but their pull requests do not say which.
- `tester-opus` (Release tester) — did not take part.
- `scrum-master-opus` — this close.
- `akmaier` — the one person: every commit and every merge of the sprint is under this account; during the sprint
  `akmaier` approved the first `gh pr merge` in the harness, accepted UC-002, UC-031, UC-032, UC-041, ARC-006, ARC-019 and
  six module files on `main`, and decided feedback 7, 8 and 9 during this close.
- The session's coordinating agent — started the teams and collected their reports into the feedback list below.
  `docs/participants.md` does not name it, so which participant it acted as is not recorded.
- **Stakeholders: none.**

### Where the feedback came from

- The fifteen pull requests #24–#38 into `sprint/01`, each read once (`gh pr view`).
- The measurement records the teams wrote on `sprint/01`: `docs/measurements/2026-10-01_dashboard-shell.md`,
  `…_requirement-checks-mutations.md`, `…_use-case-checks.md`, `…_identity-checks-mutations.md`, `…_group-files.md`,
  `…_format-checks.md`, `…_writes-leave-the-kernel.md`, `…_one-write-path-with-an-authority.md`,
  `…_built-flows-characterised.md`.
- The list of 22 findings the coordinating agent collected from the teams' reports during the sprint (agents' findings;
  numbered below as given), and the decisions of `akmaier` of 2026-10-01 on findings 7, 8 and 9, relayed during the close.
- The CI runs of `sprint/01` (`tests`, green on `cc86c1f`, run 36905524737) and this closer's own runs of both suites.
- The issue tracker of `akmaier/agent-m` holds no issue; no mailbox is connected to Agent M. Neither gave feedback.
- No job records and no test result records exist yet (ITM-037, ITM-056); the sprint's numbers below are read from the
  pull requests.

### Feedback and where it went

Each point is a new backlog item, a change to an existing item, or noted (UC-041 step 3). New items are appended at the
end of the level-1 part of `docs/backlog/order.md` (after ITM-116, before ITM-099); the Product Owner reorders.

| # | Finding (short) | Where it went |
|---|---|---|
| 1 | every planned view not built costs a `404` per page load | **ITM-129** |
| 2 | ITM-003 said the renewal texts move to the dashboard; MOD-git-host's `tokenRefusal` returns `text` | *noted* — the accepted MOD-git-host interface names `text`, and ARC-003 decision 5 ("data, not text, below the shells") binds kernel and features, not the git host, an adapter; ITM-003's sentence went beyond the architecture. Moving the texts would be a change of MOD-git-host for `akmaier` (UC-023), not a defect |
| 3 | module files lag the code (`provides`, `uses`, signatures) | **ITM-138** (needs `akmaier` to change and accept the module files) |
| 4 | ITM-011's six open points of ARC-020; `formatChecks("test")` reports 72 errors here | **ITM-139** (point 6, per-case `Guards:`) · **ITM-140** (points 1–5 — needs `akmaier`'s decision) |
| 5 | `tests/architecture-format.test.mjs` reads Agent M's own `SPEC.md` | **ITM-128** |
| 6 | `identifierKept` returns a sentence where MOD-artifacts declares `null \| finding` | **ITM-126** |
| 7, 8 | — | no backlog item and no note (`akmaier`, 2026-10-01) |
| 9 | requirement sources read as `SRC-` identifiers | **ITM-127** — `akmaier`, 2026-10-01: a source is named as it is written and needs no `SRC-` identifier |
| 10 | ITM-008 named checks that need ITM-061 and ITM-101 | *change to existing items* — ITM-061, ITM-101 (*From the sprint 01 review*) |
| 11 | ITM-007 named `tests/test_mail_privacy.py` checks of the write gate | *change to an existing item* — ITM-068 (*From the sprint 01 review*) |
| 12 | `A REFUSED SAVE KEEPS THE EDIT` — the newer version is not shown beside the edit | **ITM-131** |
| 13 | flows ITM-123 found not carried out | already covered: UC-014 steps 1–5 by ITM-073, UC-042 step 3 by ITM-098, UC-042 2a by ITM-107, UC-042 2b by ITM-067. New: UC-001 2a and 3a **ITM-132**; UC-008 4a **ITM-133**; UC-006 3b **ITM-134**; UC-014 step 3 offered later and 4a **ITM-135**; UC-042 step 1 **ITM-136**; UC-042 5a **ITM-137** |
| 14 | the export notice's GitHub grant lacks pull requests | **ITM-125** |
| 15 | dashboard files import `fetchText`; the kernel still reads through the git host | **ITM-130** |
| 16–22 | process findings | the retrospective below; 20 also as a change to ITM-062 (*From the sprint 01 review*) |

### The state of the increment

| | `main` at `1ce7724` | `sprint/01` at `cc86c1f` | `sprint/01` merged with `main` (not committed) |
|---|---|---|---|
| `cd tests && python3 -m unittest` | 93 tests, OK | 172 tests, OK | 172 tests, OK |
| `node --test tests/*.test.mjs` | 129 tests, 129 pass | 244 tests, 244 pass | 244 tests, 244 pass |

Run by this closer on 2026-10-01 (macOS, Node 25.9, Python 3) in a git checkout; `tests/test_products_folder.py`
needs one — run on an exported tree without git, it reports 5 failures that are not the product's. CI on `sprint/01`
is green on `cc86c1f`. `main` has six commits that `sprint/01` lacks (the acceptances and queue of 2026-10-01 and the
ITM-124 backlog entry); `git merge-tree` finds no conflict, and both suites are green on the merged tree, as the table
shows.

## Retrospective

Recorded on 2026-10-01 by `scrum-master-opus`. The findings are recorded at once; every change to `docs/process.md`,
`docs/process-models/scrum-wip.md`, the Definition of Done or a participant's instructions is a **proposal for
`akmaier`** and is not applied (`AN AGENT'S RETROSPECTIVE CHANGES NO PROCESS BY ITSELF`). No process file is changed by
this close.

### The sprint's numbers

- Fifteen items, fifteen pull requests, 41 commits; the first pull request opened 14:05 UTC, the last merged 18:15 UTC.
- A pull request waited 5 to 24 minutes from opening to merge, 11 at the median.
- One job stopped and was restarted: ITM-008 stopped before writing, because its item could not be done inside its
  modules; ITM-124 was added before it.
- Correction rounds: none — there is no correction loop yet. Flaky tests: none seen in the CI runs read; with no
  result records (ITM-056), a flip on the same commit could not be seen. Cost: unknown — no runtime reported one
  (`NO COST IS GUESSED`).
- Tests: Python 93 → 172, node 129 → 244; nine measurement records with a counter-proof for every new test.

### What went well

- Every item reached the sprint branch through a pull request with green CI, refactorings green on every commit and
  implementations red first; every new test is recorded red on a planted fault.
- When ITM-008 could not be done inside its modules, the developer stopped instead of widening the item, and the
  scope change went through the backlog (UC-032 6a) — a new item, a recorded reason, the limit untouched.
- Teams raised change requests where the item, SPEC or architecture left a choice (PRs #28, #31, #32, #34, #37) instead
  of deciding it in code; the measurement records name what their suites do not see.
- The dashboard strand and the artifact strand ran side by side on disjoint files, as planned.

### What did not go well

- Release testing did not happen (see the review): no release test, no `tester-opus`, no recorded gate before the review.
- Seven of fifteen pull requests do not name the participant that implemented them, although UC-024's postcondition asks
  "the pull request records who implemented it, with which model and Agent M version, and when".
- Every commit and merge is under the account `akmaier`; no record names the Product Owner as the decider of the
  *Development → Release testing* gates it passed by merging (gate and job records are not built: ITM-031, ITM-037).
- The coordinating agent that ran the teams is not a participant of `docs/participants.md`.
- 16: one team's script in the shared session scratchpad was overwritten by another's.
- 17, 10, 11: items named checks that only a later item can build (ITM-001–ITM-004 named `test_origin_links.py`,
  `test_test_levels.py` of ITM-011; ITM-008 and ITM-007 named checks of ITM-061, ITM-101, ITM-068).
- 18: ITM-008's item could not be done inside its modules — found by the developer, not at planning.
- 19: with three developers and a limit of four, at most three items were in development; the fourth slot held an item
  waiting for the Product Owner's merge.
- 20: when CI stops at the Python step, a red first commit never shows the node result.
- 21: the harness's auto-mode check blocked the first `gh pr merge`; the person approved it.
- 22: one report said "no change request" while it had resolved an ambiguity by a reading of its own.

### Proposals for `akmaier` — none applied

| # | Proposal | Where it would go |
|---|---|---|
| P1 | Release testing runs per item as soon as it is merged into the sprint branch — `tester-opus` writes the item's release tests, and the Product Owner records the gate *Release testing → Sprint review* —, and the close starts only after that gate, not when the last item is merged | `docs/process.md` (*Sprint*), `docs/process-models/scrum-wip.md` (when the close starts) |
| P2 | The work-in-progress limit matches the developers: either a limit of 3 with three developers, or a fourth developer row with the limit of 4; and an item waiting for the Product Owner's merge is named as such on the board | `docs/process-models/scrum-wip.md` (*Flow control*), `docs/participants.md` |
| P3 | The first line of every pull request body names the participant, the model, the Agent M commit it started from and the date (UC-024 postcondition) | developers' instructions |
| P4 | Every report lists each reading taken where the item, the SPEC or the architecture left a choice — each marked as a change request or as within the item; "no change request" only when no reading was taken | developers' instructions |
| P5 | Each team keeps its scratch files in a folder named after its item inside the session scratchpad | developers' instructions |
| P6 | At refinement, an item's *Tests the SPEC names* lists only checks it can build inside its modules and files; a check that needs a later item is named with that item (*checked by ITM-…*) | the Product Owner's instructions; the conventions of `docs/backlog/order.md` |
| P7 | At planning, for an item that changes a function's signature or behaviour, the Product Owner lists the modules of its callers and checks them against the item's modules before selecting it | the Product Owner's instructions |
| P8 | Until gate and job records exist (ITM-031, ITM-037), the Product Owner's merge of a team's pull request carries a comment naming the gate it decides and the decider by participant name | the Product Owner's instructions |
| P9 | The coordinating agent of a sprint session is a row of `docs/participants.md`, or the session is run by a participant that is one (`po-fable` or `scrum-master-opus`), so that every action of the sprint is attributable | `docs/participants.md`, `docs/process.md` |
| P10 | Whether `gh pr merge` of a team's pull request into the sprint branch is allowed without a prompt in the agent harness is decided once by `akmaier` | the harness's permission settings of `akmaier` (not an Agent M file) |
| P11 | Until Agent M's CI runs every suite after a failing one (ITM-062, *From the sprint 01 review*), a developer records both suites' local results for the red first commit, as ITM-008's developer did | developers' instructions |
