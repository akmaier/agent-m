# Release tests of sprint 02, strand B — results, counter-proofs, findings (ITM-143)

**MESSUNG** — 2026-10-01/02, branch `team/ITM-143` from `sprint/02` at `58b7fe4` (pull request #58, ITM-147, the strand's last item,
merged), the tests at commit `648eadd`; macOS, Node 25.9.0, Python 3.14.6. CI runs Node 22 (`.github/workflows/tests.yml`).

**Author.** `tester-opus` (claude-opus-5-5), the Release tester of `docs/process.md`, who implemented nothing of strand B — ITM-027,
ITM-033, ITM-034, ITM-147 were built by developer-opus-b (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`). Every expectation was
written from UC-031, UC-032, UC-033, UC-035 and the SPEC rules ITM-143 lists. The code was read only to learn how to drive it — the
functions each module exports and their arguments, the attributes the Backlog tab marks its parts, columns, cards and rows with,
the notation of a CI-check decider in a model file —; the implementers' tests and measurement records were not read before the
release tests were written. Their test names were read afterwards, for the overlaps below.

## Files and commands

| File | Module | Level | Cases |
|---|---|---|---|
| `tests/release-sprint-02-b-process-model.test.mjs` | MOD-process-model | release | 18 green |
| `tests/release-sprint-02-b-work-items.test.mjs` | MOD-work-items | release | 16 green |
| `tests/release-sprint-02-b-dashboard-app.test.mjs` | MOD-dashboard-app | release | 10 green |

Commands, at commit `648eadd`: `cd tests && python3 -m unittest` → `Ran 332 tests … OK (expected failures=5)`; `node --test
tests/*.test.mjs` → `tests 410, pass 405, fail 0, todo 5` (366 before this item). The five todo and the five expected failures are
the findings already recorded (R1–R3, G1/G2; F1–F3, V1); none is of this strand.

**What the tests run over.** This very repository, read with `fs` (there are more files than a command line holds):
`docs/process-models/scrum-wip.md`, `docs/process.md`, the 150 item files of `docs/backlog/`, `docs/backlog/order.md`, the sprint
files of sprint 01 and 02, `docs/use-cases/` and `docs/approvals/`. Agent M's own `SPEC.md` is read by no test: the page is served a
SPEC whose requirements are the 295 names the items realise, plus two names no item realises (`A RULE NO ITEM REALISES`, `ANOTHER
RULE NO ITEM REALISES`) and one withdrawn (`A WITHDRAWN RULE NO ITEM REALISES`). Which use cases are accepted is computed in the test
from the approval records' contents (`kind`, `file`, `blob`) against each use-case file's blob SHA: all 43 are. The pull requests
come from a fake of GitHub's *List pull requests* that replays every pull request into `sprint/02` as recorded once from GitHub
(`gh pr list --base sprint/02 --state all`, 2026-10-01 21:50 UTC): #40–#58 merged (19 items), #59 (ITM-018) open; no other base
has any. The page is the real `docs/assets/dashboard-app.mjs` in `tests/app-harness.mjs`; no request leaves the process. And fixtures
written from the use cases: one broken model definition per rule (Agent M's own model with one line changed), items that realise
nothing or name what the product lacks, an order naming an item twice, issues classified as bug or change, a Scrum product with
limit 2, a Kanban product.

**The board the page must show**, computed in the test from the rule (merged — done; open — in progress; otherwise ready, or
waiting for acceptance while a name the item realises is not accepted): done — ITM-014, ITM-016, ITM-027, ITM-033, ITM-034, ITM-050,
ITM-125 to ITM-133, ITM-136, ITM-141, ITM-146, ITM-147; in progress — ITM-018 (#59); ready — ITM-134, ITM-142, ITM-143, ITM-144,
ITM-145; blocked and waiting for acceptance — none. The limit: 1 of 4 slots taken, by ITM-018. The page shows exactly this.

## The tests, with what they test and their counter-proofs

A mutation replaced one piece of text in one code file (asserted to stand there exactly once); the three release files then ran
(`node --test --test-reporter=tap`), and the file was restored. All 44 cases were green before and after the series, and every case
was red under at least one mutation. The runner and its full log are scratch files (`scratchpad/itm143-tester-opus/mutate.txt`,
`mutate-final.log`), not committed.

| # | Case | Item | Flow or rule | Red under |
|---|---|---|---|---|
| | **MOD-process-model** | | | |
| 1 | Agent M's own model: pulled, *items per state over time*, WIP limit 4, no time box, sprints, five phases, three gates decided by the Product Owner; no error | ITM-027 | A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED; UC-031 postcondition | P1 |
| 2 | a transition naming a phase the model lacks — refused beside *Transitions*, on its line | ITM-027 | the SPEC's check of A MODEL DEFINITION IS VALIDATED …; UC-031 4 | P2 |
| 3 | a verification pair naming a phase the model lacks — beside *Verification pairs* | ITM-027 | same | P3 |
| 4 | a gate without artifacts — beside *Gates*, naming A GATE NAMES WHAT IT CHECKS | ITM-027 | A GATE NAMES WHAT IT CHECKS | P4 |
| 5 | a gate without a condition — the same | ITM-027 | A GATE NAMES WHAT IT CHECKS | P5 |
| 6 | a role without capabilities — beside *Roles*, naming A ROLE NAMES THE CAPABILITIES IT NEEDS | ITM-027 | the SPEC's check; A ROLE NAMES … | P6 |
| 7 | a phase without a role — beside *Phases* | ITM-027 | the SPEC's check; UC-031 4 | P7 |
| 8 | no declaration whether work is planned or pulled — beside *kind* | ITM-027 | the SPEC's check | P8 |
| 9 | a gate without a decider — naming A GATE NAMES WHO DECIDES IT | ITM-027 | A GATE NAMES WHO DECIDES IT | P9 |
| 10 | a gate decided by a role the model does not define — the same | ITM-027 | A GATE NAMES WHO DECIDES IT ("a role of the model") | P10 |
| 11 | a phase no transition reaches | ITM-027 | UC-031 4 | P11 |
| 12 | a gate checking an artifact kind (ARC) no phase up to it produces — naming A GATE NAMES WHAT IT CHECKS | ITM-027 | UC-031 4 | P12 |
| 13 | pulled work with neither a time box nor a WIP limit — beside *Flow control* | ITM-027 | UC-031 4 | P13 |
| 14 | pulled work with both | ITM-027 | UC-031 4 | P14 |
| 15 | a measure that does not fit the kind of work — naming PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE | ITM-027 | UC-031 4 | P15 |
| 16 | an unknown measure — the same | ITM-027 | PROGRESS IS SHOWN … ("A definition naming an unknown measure fails validation") | P16 |
| 17 | a gate decided by a role and one decided by a named CI check both pass | ITM-027 | A GATE NAMES WHO DECIDES IT, counter-proof | P17 |
| 18 | validation leaves the definition unchanged and names every error of a definition with two | ITM-027 | UC-031 4, 4a | P2, P6, P18 |
| | Every finding of 2–16 is held to the form of A FINDING READS LIKE A COMPILER MESSAGE: artifact, line, kind, a rule by name, what and the correction. | | | |
| | **MOD-work-items** | | | |
| 19 | this backlog: every item read with the identifier of its file name, a title, something it realises, an origin; no error; every use case it names exists | ITM-033 | THE BACKLOG LIVES IN THE PRODUCT REPOSITORY; A BACKLOG ITEM NAMES WHAT IT REALISES; EVERY ARTIFACT NAMES ITS ORIGIN | W1 |
| 20 | an item with `realises: []`, one without the field, and a draft realising nothing — an error naming A BACKLOG ITEM NAMES …; realising a known requirement or use case — none | ITM-033 | A BACKLOG ITEM NAMES WHAT IT REALISES; UC-032 3 | W1, W2 |
| 21 | an item naming a requirement or use case the product lacks — an error | ITM-033 | A BACKLOG ITEM NAMES WHAT IT REALISES | W3 |
| 22 | a draft restating an existing item — a warning naming it, no error | ITM-033 | UC-032 3 ("flags") | W4 |
| 23 | an item kept outside `docs/backlog/` or not named `ITM-<nnn>-<slug>.md` — an error naming THE BACKLOG LIVES …; under it, none | ITM-033 | THE BACKLOG LIVES IN THE PRODUCT REPOSITORY; UC-032 4 | W5 |
| 24 | this backlog's order: no problem, every item once, order.md's 150 lines in order, the unnamed appended (none today) | ITM-033 | UC-032 5; `order.md` | W19 |
| 25 | an order naming an unknown item and one twice — two problems on their lines; the unnamed appended; lines, not numbers, decide | ITM-033 | UC-032 5 | W6, W7, W19 |
| 26 | an item from an issue: title, outcome, the issue's address as origin and issue (GitHub and GitLab); a bug realises the violated requirement, a change its queue entries' names once; unclassified or neither — no item | ITM-033 | UC-033 2, 1a, postcondition | W8, W9 |
| 27 | a bug item is ready; a change item waits for acceptance, and is ready once its requirement is accepted | ITM-033, ITM-034 | UC-033 5, postcondition; NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED | W9, W15 |
| 28 | an item file naming two issues is read with both | ITM-033 | UC-033 4a | W10 |
| 29 | this sprint's record: id, start, end as written, branch, closer, the selection in the file's order; no state field; sprint 01's record without a problem | ITM-034 | UC-032 6, postcondition; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED | W11 |
| 30 | limit 2, two items in progress (open pull requests, waiting for review): the third start refused, naming the rule, the limit 2 and the two items; one of them merged — it starts | ITM-034 | NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT (its check, word for word); UC-032 7 | W12, W17 |
| 31 | an item outside the running sprint's selection refused with A TIME BOX …; a selected one starts; no sprint running, or one ended — refused | ITM-034 | A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT; UC-032 6a, 6b | W13 |
| 32 | a job without an item refused with AGILE IMPLEMENTATION STARTS FROM THE BACKLOG, in a Scrum and a Kanban fixture; in Kanban a backlog item starts, one outside the backlog does not | ITM-034 | AGILE IMPLEMENTATION STARTS FROM THE BACKLOG (its check) | W14, W18 |
| 33 | an item naming a requirement and a use case not accepted waits for acceptance, naming both; accepted, it starts | ITM-034 | NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED (its check); UC-032 1 | W15 |
| 34 | an item's state follows its pull requests — ready, in progress, done — not a `state:` written into its file; a pull request for ITM-0140 is not one for ITM-014 | ITM-034 | PROGRESS AND JOB STATE ARE DERIVED, NOT STORED | W16, W17 |
| | **MOD-dashboard-app — the Backlog tab** | | | |
| 35 | sprint 02's own board: sprint-02 on `sprint/02`; the 19 merged items *done*, ITM-018 *in progress*, the five not started *ready*; every selected item once; the in-progress card links #59, a done card #58 and says merged; the limit named — *1 of 4*, by ITM-018 | ITM-147 | UC-032 1 and the board of 7; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT | P1, W17, D1 |
| 36 | the model's limit set to 1: *1 of 1*, by ITM-018; every ready card says it cannot start, naming the limit 1 and ITM-018; the states unchanged | ITM-147 | NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT; UC-032 7a | P1, W12, W17, D1, D9 |
| 37 | UC-033 changed after its acceptance: ITM-143, the ready item that realises it, *waiting for acceptance*, naming UC-033; the rest unchanged | ITM-147 | NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED; UC-032 1; STATUS IS DERIVED FROM THE RECORDS | W15, W17, D1, D11 |
| 38 | the uncovered names above the board, the backlog below it | ITM-147 | UC-032 1 | D2 |
| 39 | the first load reads the item files of the selected items and of no other, and only the pull requests into `sprint/02`; unfolding reads the others | ITM-147 | ITM-143 *Outcome*; the sprint file's goal ("a load reads only what the board shows") | D1, D3 |
| 40 | unfolded: one row per item in the order of order.md; ITM-143's row with its title, what it realises, its origin and its state; the selected items with the board's states; every unselected ready item *not selected for sprint sprint-02*; the uncovered names exactly the two planted requirements — not the withdrawn one — and no use case | ITM-147 | UC-032 1; A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT | W1, W13, W17, W19, D3, D4, D10 |
| 41 | after clearing every browser store — no localStorage, so no token, and an empty Cache Storage — and reloading: the same board, limit and backlog states | ITM-147 | PROGRESS AND JOB STATE ARE DERIVED, NOT STORED (its check) | D3, D5, D6 |
| 42 | nothing written: only GET requests, no commit, localStorage unchanged (the token only), the Cache Storage holds only texts of repository files | ITM-147 | PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; UC-035 postcondition | D3, D6 |
| 43 | every part — uncovered, sprint, limit, backlog — and every column carries a folded *What is this?* | ITM-147 | EVERY STEP EXPLAINS ITSELF; UC-032 | D7 |
| 44 | a declared model that plans its work: the tab says there is no backlog and links Progress | ITM-147 | UC-032 1b | D8 |

The mutations:

| Id | File | Planted fault |
|---|---|---|
| P1 | `process-model.mjs` | the WIP limit is read one too high |
| P2 | `process-model.mjs` | a transition's phases are not checked |
| P3 | `process-model.mjs` | a verification pair's phases are not checked |
| P4 | `process-model.mjs` | a gate without artifacts passes |
| P5 | `process-model.mjs` | a gate without a condition passes |
| P6 | `process-model.mjs` | a role without capabilities passes |
| P7 | `process-model.mjs` | a phase without a role passes (the check of its role skipped as well) |
| P8 | `process-model.mjs` | a missing kind of work passes |
| P9 | `process-model.mjs` | a gate without a decider passes |
| P10 | `process-model.mjs` | a gate decided by an unknown role passes |
| P11 | `process-model.mjs` | a phase no transition reaches passes |
| P12 | `process-model.mjs` | a gate's artifact kinds are not checked against the phases before it |
| P13 | `process-model.mjs` | pulled work without flow control passes |
| P14 | `process-model.mjs` | pulled work with both a time box and a limit passes |
| P15 | `process-model.mjs` | a measure that does not fit the kind passes |
| P16 | `process-model.mjs` | an unknown measure passes (and is not checked for fit either) |
| P17 | `process-model.mjs` | a named CI check is not read as a decider |
| P18 | `process-model.mjs` | validation names only the first error |
| W1 | `work-items.mjs` | an origin of one line is not read |
| W2 | `work-items.mjs` | an item that realises nothing passes |
| W3 | `work-items.mjs` | an unknown requirement name passes |
| W4 | `work-items.mjs` | a restating item is rejected, not flagged |
| W5 | `work-items.mjs` | an item outside `docs/backlog/` passes |
| W6 | `work-items.mjs` | the unnamed items are put at the top |
| W7 | `work-items.mjs` | an item named twice in the order passes |
| W8 | `work-items.mjs` | an item from an issue names no origin |
| W9 | `work-items.mjs` | a change item realises nothing of its queue |
| W10 | `work-items.mjs` | an item file is read with its first issue only |
| W19 | `work-items.mjs` | a numbered line of the order is not read |
| W11 | `work-items/flow.mjs` | the selection is read in reverse |
| W12 | `work-items/flow.mjs` | the limit refuses only above it, not at it |
| W13 | `work-items/flow.mjs` | an unselected item is not refused |
| W14 | `work-items/flow.mjs` | a job without an item is not refused |
| W15 | `work-items/flow.mjs` | a name not accepted does not hold the item back |
| W16 | `work-items/flow.mjs` | a pull request for ITM-0140 counts for ITM-014 |
| W17 | `work-items/flow.mjs` | an open pull request does not make its item in progress |
| W18 | `work-items/flow.mjs` | an item outside the backlog is not refused |
| D1 | `dashboard/backlog-view.mjs` | the board reads the pull requests into the default branch, not the sprint's |
| D2 | `dashboard/backlog-view.mjs` | the uncovered names are put below the backlog |
| D3 | `dashboard/backlog-view.mjs` | the whole backlog is read on load |
| D4 | `dashboard/backlog-view.mjs` | every accepted use case is listed as uncovered |
| D5 | `dashboard/backlog-view.mjs` | without what the browser stores (the token), no pull request is read |
| D6 | `dashboard/backlog-view.mjs` | the view stores a state of its own in localStorage |
| D7 | `dashboard/backlog-view.mjs` | the board's columns lose their explanation |
| D8 | `dashboard/backlog-view.mjs` | a planned model is shown a backlog |
| D9 | `dashboard/backlog-view.mjs` | a refused card does not name the limit |
| D10 | `dashboard/backlog-view.mjs` | a withdrawn requirement counts as accepted |
| D11 | `dashboard/backlog-view.mjs` | a use case changed since its acceptance counts as accepted |

P7, P8 and P16 skip the whole check, not only its first condition: read from the code before the series, with the first condition
alone switched off the next branch of the same check still refuses the definition beside the same field (a phase naming the empty
role, a kind that is neither planned nor pulled, a measure that does not fit), and the case would rightly stay green. In the first
run of the series case 24 was red under no mutation — W6 puts the unnamed items first, and this backlog's order names every item,
so nothing is appended —; W19 was added for it, and the series was run again in full on the final test files.

## Findings

None. Every case is green on `sprint/02` at `58b7fe4` plus the test files; no case carries a mark, so nothing goes back to
Development and the gate *Release testing → Sprint review* of strand B can be decided on this run.

## Readings where the documents were open

- **No test reads Agent M's own SPEC.md**, but the Backlog tab takes the accepted requirements from `SPEC.md`. The page is served a
  generated SPEC instead (above); which requirement names count as accepted on the board is therefore the fixture's, not the real
  SPEC's. The sprint file says every selected item realises only live requirements, so the board on the real SPEC should be the
  same; that is not checked here.
- **"a pull-request fake that replays the pull requests of sprint 02 as the harness's recorder saw them"**: `tests/app-harness.mjs`
  has no recorder of pull requests. Read as: recorded once from GitHub (one `gh pr list` call) and replayed by a handler in the test
  file, the recording kept inline with its date. Pull requests opened after it — the release-test items' own, ITM-018's merge —
  are not in it; the board is that of 2026-10-01 21:50 UTC.
- **Which sprint files are served**: sprint 01 and 02 only. A later sprint's file would be the running sprint without a recorded
  pull request; leaving it out keeps the tests about sprint 02 when sprint 03 is planned.
- **"after clearing every browser store"**: read as an empty localStorage — the token included, the repository being public — and
  an empty Cache Storage. Clearing the caches only, with the token kept, is implied by it and not run separately.
- **"a third start is refused"**: no function that starts a job exists yet (ITM-038). Read through `itemState`'s interface in
  MOD-work-items: a start is allowed exactly when the state is *ready* and no reason stands.
- **The uncovered names "above"** (UC-032 1: "The top of the page shows …") against **"no request for an unselected item before the
  backlog is unfolded"** (ITM-143): both hold only if the uncovered names, which need every item, are listed once the backlog is
  unfolded. Tested that way; the part stands above the board from the first load and says what unfolding shows. Not taken as a
  finding — ITM-143 names both, and the sprint file's goal keeps the load to what the board shows.
- **The rule a validation error names**: the SPEC fixes it for the gate rules, the role's capabilities and the measure; for a
  transition, a pair, a phase's role, the kind and the flow control it is held only to be one of the model's rules of §5 and §13.
- **Not tested, because not built**: the shipped catalogue of the book's models ("each book model in the shipped catalogue must
  pass" — ITM-028); declaring a model for a product (ITM-030); jobs and their states — *blocked* — on the board (ITM-085: no job
  writes a record); the chart in the model's measure (ITM-035).
- **All 43 use cases are accepted** on `sprint/02`, so the real board has no item waiting for acceptance; case 37 makes one wait by
  changing UC-033 after its acceptance.

## Overlaps with the implementers' tests

Read after the release tests were written, by test name: `tests/test_model_validation.py` and `tests/test_gate_definition.py`
(ITM-027 — the same broken-definition rules, on their own fixture models; the release tests break Agent M's own model instead),
`tests/test_backlog_layout.py`, `tests/test_backlog_item_fields.py` (ITM-033 — both also read this repository's items and order),
`tests/test_wip_limit.py`, `tests/test_time_box_selection.py`, `tests/test_job_from_backlog.py` (ITM-034 — the SPEC's checks word for
word, as here), `tests/test_progress_derived.py` and `tests/dashboard-backlog.test.mjs` (ITM-147 — the board, the fold, nothing
written, the explanations, the cleared stores, on fixture pull requests). New here: the board over the recorded pull requests of
sprint 02, the limit reached and an item waiting for acceptance at the page, the exact uncovered names with a withdrawn one among
the candidates, the planned model's tab, and a check of what the Cache Storage holds.

## Addendum 2026-10-02 — the backlog frozen as it was while sprint 02 ran

**MESSUNG** — 2026-10-02, branch `team/frozen-sprint-input-143` from `sprint/02` at `87b3268`, by `tester-opus`
(claude-opus-5-5); macOS, Node 25.9.0, Python 3.14.6. The entries above stand as they were measured.

**What broke.** The close of sprint 02 by `scrum-master-session` (local commit `3e91a80`) sets `end: 2026-10-02` in
`docs/backlog/sprints/sprint-02.md`, rewrites `order.md`, changes ITM-138 and files ITM-159 to ITM-161. Case 40 then failed:
`ITM-001: not selected` — expected `/not selected for sprint sprint-02/`, the page said `… ready sprint sprint-02 has ended
(2026-10-02)`. The page was right: it was served the live backlog, in which sprint 02 had ended. The defect was in the test's
input — a release test of the running sprint's board read a backlog that changes at every close — not in its expectation.

**The change.** `docs/backlog/` as it stood on `sprint/02` at `87b3268` (`end:` empty in `sprint-02.md`) is copied byte for
byte to `tests/fixtures/sprint-02-running/docs/backlog/` (`git archive 87b3268 docs/backlog`; 161 files: 158 items,
`order.md`, `sprint-01.md`, `sprint-02.md`). Both files that read the backlog take every `docs/backlog/` path from that copy
and serve it at the same path, as the pull requests of sprint 02 were already replayed from a recording:

| File | Cases whose input is now the frozen backlog |
|---|---|
| `tests/release-sprint-02-b-dashboard-app.test.mjs` | all ten (35–44): the page is served the frozen items, order and sprint files |
| `tests/release-sprint-02-b-work-items.test.mjs` | 19 (this backlog parses), 24 (this backlog's order), 29 (this sprint's record, sprint 01's too) |

No expectation changed. Not frozen, because they are no sprint or backlog state: `docs/process.md`,
`docs/process-models/scrum-wip.md` (read by `release-sprint-02-b-process-model.test.mjs` and the page), `docs/use-cases/`
and `docs/approvals/`. Every expectation over them is computed in the test from their current texts. The other cases of
the work-items and process-model files read fixtures written in the test.

**Counter-proof**, with the close's changes to `docs/backlog/` applied to the live tree (`git diff 87b3268 3e91a80 --
docs/backlog | git apply`, not committed): before the change, the three files ran `tests 44, pass 43, fail 1` (case 40, as
above); after it, `tests 44, pass 44, fail 0`. And that the copy is what is read: with `end: 2026-10-02` written into the
copy's `sprint-02.md` instead, case 40 is red again (`pass 43, fail 1`); the copy restored, it equals `87b3268`'s
`docs/backlog/` (`git diff --no-index`, no difference).

Commands on the live tree restored: `cd tests && python3 -m unittest` → `Ran 366 tests … OK (expected failures=5)`;
`node --test tests/*.test.mjs` → `tests 502, pass 493, fail 0, todo 9` (the recorded findings).
