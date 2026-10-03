# The progress bar on the main page — the red first commit, what a load costs, what it shows, and the counter-proof of every new test

**MESSUNG** — 2026-10-03, branch `team/ITM-162` (from `sprint/03` at `fc61996`), macOS, Node 25.9.0, Python 3.14.6.
ITM-162 (implementation job, developer-opus-b, claude-opus-5-5): the bar of the product's completion on the main page,
`docs/assets/dashboard/progress-bar.mjs` (MOD-dashboard-app), imported by the shell by name and filled into the slot
`#progress-bar` of `docs/index.html` after the view; guarded by `tests/dashboard-progress-bar.test.mjs` (13 tests, run in
`tests/app-harness.mjs`) and `tests/test_progress_derived.py` (3 new tests beside the board's 3, the check `PROGRESS AND JOB
STATE ARE DERIVED, NOT STORED` names). This file records the red first commit, what a load costs, what the bar shows, and the
counter-proof of every new test (SOFTWARE_MAINTENANCE §4.0a rule 5, `A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).

## 1. The first commit is red

`3c43402` holds only tests: the new file and the bar's class in `tests/test_progress_derived.py`. Locally, on that commit and
a clean tree: node, the whole suite (`node --test tests/*.test.mjs`) — 515 tests, 493 pass, **13 fail** (all 13 new), 9 todo;
Python (`cd tests && python3 -m unittest`) — 369 tests, **5 failures** (the 3 new tests of the bar, and the 2 cases of
`test_release_sprint_02_c.NoTestOpensAgentMsOwnSpec` that run the node and Python suites inside themselves and fail because the
suites do), 5 expected failures. In CI, both runs of pull request #77 on that commit failed: run 37116085932 (push) and run
37116093931 (pull request) — `gh pr checks 77`, once, 240 s after the push.

## 2. What a load costs

Counted by the harness's request recorder (`tests/dashboard-progress-bar.test.mjs`, reported with `t.diagnostic`). "The
bar's" are the requests a load of the main page makes beyond those of the same product without `docs/process.md`, whose slot
is empty and which makes none for it.

| Product | Load | The bar's requests |
|---|---|---|
| fixture, 140 items, two sprint records | cold | 5 files (declaration, model, order, 2 sprint records), 1 page of pull requests — no item file, no use case, no record |
| fixture, 140 items | warm (texts kept by blob SHA) | 0 files, 1 page of pull requests |
| Agent M's backlog while sprint 02 ran (frozen copy `tests/fixtures/sprint-02-running/`, two sprint records) | cold | 5 files, 1 page of pull requests |
| the same | warm | 0 files, 1 page of pull requests |
| Agent M's own repository on this branch (`docs/backlog/` with sprint 03's record; the pulls API's answer recorded with `gh api`, 2026-10-03: 77 pull requests, 56 opened since 2026-10-01) | cold | **6 files** (declaration, model, order, **3** sprint records), 1 page of pull requests |
| the same | warm | 0 files, 1 page of pull requests |

The page of pull requests is one list without a base (`pullRequests().list({ since })`, since the earliest sprint's start), one
request per hundred pull requests opened since then; those into a sprint record's branch or into the default branch count. On
Agent M's own repository the sprint records are read by the item's definition — "the order and the sprint records" — and there
are three of them since sprint 03 was planned: the item's "five file reads cold" was counted on `main` at `d2ed979`, with two;
each further sprint adds one file read cold and none warm. Measured with `scratchpad/itm162-developer-opus-b/measure.txt` (not
committed): the main page of this repository's files reads 44 files cold without the bar (the use cases) and 50 with it.

**The Backlog tab is unchanged**: the bar's slot is emptied on every route but the main page, and no route but the main page
calls the bar. `tests/dashboard-backlog.test.mjs` (34 requests cold and 3 warm for Agent M's sprint 02, 33 and 3 for the 140-item
fixture) and the release tests of sprint 02 strand B pass unchanged; the new test asserts once more that a cold `#backlog` load
asks for the pull requests into the sprint's branch only.

## 3. What the bar shows

| Product | Measure | The bar |
|---|---|---|
| the behaviour fixture: 10 items (8 in the order, 2 unplaced), sprint-06 on `sprint/06`, sprint-07 on `sprint/07` | items per state over time | 3 done, 2 in progress, 0 blocked, 5 not started — 30 % done |
| Agent M while sprint 02 ran (frozen; the recorded pull requests: #24–#38 merged into `sprint/01`, #40–#56 merged into `sprint/02`, #57 and #58 open, #39 `sprint/01` into `main` naming no item) | items per state over time | of 158 items: 32 done, 2 in progress, 0 blocked, 124 not started — 20 % done |
| Agent M's own repository on this branch, with the pull requests of 2026-10-03 | items per state over time | of 166 items: 40 done, 3 in progress, 0 blocked, 123 not started — 24 % done |
| the fixture under a model with a time box (`remaining items per time box`), sprint-07 running | remaining items per time box | 5 of 6 selected items remain |
| the fixture under a planned model (`plan entries per phase`) | plan entries per phase | no bar: the sentence that the plan is shown on Progress once it exists |

## 4. Counter-proofs

**Method.** `scratchpad/itm162-developer-opus-b/mutations.txt` (not committed) planted one fault at a time — an exact string
replaced in one file, refused unless found —, ran `node --test tests/dashboard-progress-bar.test.mjs` (and, for F6,
`python3 -m unittest test_progress_derived`), and restored the file. Before the series and after it: node 13 pass, 0 fail;
Python OK.

| Fault | Red |
|---|---|
| F1 the pull requests count whatever their base | 4 of 13 — the bar, the counter-proofs (merged into "elsewhere"), the time box, derived not stored |
| F2 the unplaced items are left out of the denominator | 3 of 13 — the bar, the states, the counter-proofs |
| F3 the bar stands on every route | 2 of 13 — where it stands, the request economy (the Backlog tab's load) |
| F4 every item file is read for the bar | 2 of 13 — the request economy, Agent M's backlog |
| F5 the pull requests are read into the running sprint's branch only | 6 of 13 |
| F6 counts kept in local storage override the derived ones | node 1 of 13 — derived, not stored; Python 1 of 6 — the counts planted |
| F7 the bar writes: a POST to the pulls API | 2 of 13 — nothing written, the request economy |
| F8 the bar has no explanation | 1 of 13 — the folded What is this? |
| F9 the measure is not followed: always items per state | 1 of 13 — the time box |
| F10 without a declaration the pull requests are read anyway | 1 of 13 — no declaration, no request |
| F11 the slot is not in `docs/index.html` | 1 of 13 — the slot |
| F12 the order is read past the texts kept by blob SHA | 2 of 13 — the request economy, Agent M's backlog (warm) |
| F13 the slot is not emptied away from the main page | 1 of 13 — where it stands |
| F14 a time box is ignored: a sprint with an end is never running | 1 of 13 — the time box |
| F15 the shell does not call the bar after the view | 12 of 13 |
| F16 a planned model is not told apart: its slot stays empty | 2 of 13 — the planned model, the folded What is this? |

Every fault was caught. `tests/test_step_explanations.py` (not new) stays green: the bar is no step — it asks nothing of the
person — and its explanation is a folded `details`, as the Backlog tab's states are; it writes no `class="step"` by hand.
