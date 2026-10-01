# The Backlog tab — the red first commit, the requests a load costs, and the counter-proof of every new test

**MESSUNG** — 2026-10-01, branch `team/ITM-147` (from `sprint/02` at `4e20caa`), macOS, Node 25.9.0, Python 3.14.6.
ITM-147 (implementation job, developer-opus-b): the read-only tab **Backlog**, `docs/assets/dashboard/backlog-view.mjs`
(MOD-dashboard-app), registered by one line in `docs/assets/dashboard/built.json`; guarded by
`tests/dashboard-backlog.test.mjs` (11 tests, run in `tests/app-harness.mjs`) and `tests/test_progress_derived.py` (3 tests,
the check `PROGRESS AND JOB STATE ARE DERIVED, NOT STORED` names, for the item states). This file records the red first
commit, what a load of `#backlog` costs, and the counter-proof of every new test (SOFTWARE_MAINTENANCE §4.0a rule 5,
`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).

## 1. The first commit is red

`0e0fc97` holds only tests: the two new files and one changed expectation in `tests/dashboard-shell.test.mjs` (the tab bar
of today now includes *Backlog*, which this item's view adds). Locally: node, `tests/dashboard-backlog.test.mjs` and
`tests/dashboard-shell.test.mjs` — 18 tests, 6 pass, 12 fail (all 11 new tests and the tab bar); Python,
`test_progress_derived` — 3 tests, 3 failures. In CI, both runs of pull request #58 on that commit failed: run
36929745208 (push) and run 36929762191 (pull request) — `gh pr checks 58`, once, 240 s after the push.

## 2. What a load of `#backlog` costs

Counted by the harness's request recorder, every request of a page load (`tests/dashboard-backlog.test.mjs`, reported with
`t.diagnostic`):

| Product | Load | Requests | Which |
|---|---|---|---|
| fixture, 140 items, 25 selected | cold | 33 | commit, tree, 30 files (declaration, model, sprint record, order, SPEC, 25 selected items), 1 page of pull requests |
| fixture, 140 items, 25 selected | warm (texts kept by blob SHA) | 3 | commit, tree, 1 page of pull requests |
| fixture, unfolding the backlog | after the warm load | 116 | 115 item files, 1 page of pull requests (default branch) |
| Agent M's own files, sprint 02 | cold | 34 | commit, tree, 31 files (declaration, model, two sprint records, order, SPEC, 25 selected items), 1 page of pull requests |
| Agent M's own files, sprint 02 | warm | 3 | commit, tree, 1 page of pull requests |
| Agent M's own files, unfolding | after the warm load | 127 | 125 item files, 2 pages of pull requests (`sprint/01`, `main`) |

Unfolding reads each file once; afterwards it is kept by its blob SHA like every other file, and an unfold on a warm load
costs only the pull-request pages. Which use cases are accepted is read from the names of the approval records in the tree
— no record is read. No other tab reads anything for this one.

What the board shows for Agent M's own sprint 02 on the fixture (the repository's own files, a SPEC that names every
requirement the items realise, and a stub of the pull requests into `sprint/02` — #40 to #56 merged, #57 for ITM-136 and a
stub #58 for ITM-147 open): *in progress* ITM-147, ITM-136 — 2 of 4 slots taken; *done* ITM-141, ITM-125, ITM-126, ITM-027,
ITM-127, ITM-131, ITM-129, ITM-033, ITM-128, ITM-132, ITM-130, ITM-034, ITM-146, ITM-050, ITM-133, ITM-014, ITM-016; *ready*
ITM-018, ITM-134, ITM-143, ITM-144, ITM-142, ITM-145; *blocked* and *waiting for acceptance* none.

## 3. Counter-proofs

**Method.** A script (not committed; `scratchpad/itm147-developer-opus-b/mutations.txt`) planted one fault at a time — exact
strings replaced in one file, refused unless found — ran `node --test tests/dashboard-backlog.test.mjs` (and, for F4,
`python3 -m unittest test_progress_derived`), and restored the file. Before the series and after it: node 11 pass, 0 fail;
Python 3 tests, 0 failures.

| Fault | Red |
|---|---|
| F1 the pull requests are read without the sprint's base, and kept whatever their base | 5 of 11 — the board, the counter-proofs (ITM-005 done), the fold, the last sprint, the economy |
| F2 a pull request naming no item takes a slot | 3 of 11 — the board (3 of 2), the counter-proofs, below the limit |
| F3 every item is read on load — no fold | 6 of 11 — the fold, the economy, Agent M's sprint, the uncovered names, nothing written, the counter-proofs |
| F4 a state kept in local storage overrides the derived one | node 1 of 11 — derived, not stored; Python 1 of 3 — the planted state |
| F5 the state *blocked* has no explanation | 1 of 11 — every part explains itself |
| F6 a withdrawn requirement counts as accepted | 1 of 11 — the uncovered names |
| F7 the view writes: a POST to the pulls API on load | 2 of 11 — nothing written, the economy |
| F8 a merged pull request is shown without when | 1 of 11 — the board |
| F9 an open pull request is shown without who opened it | 2 of 11 — the board, Agent M's sprint |
| F10 the running sprint is the first record, ended or not | 7 of 11 |
| F11 no use case counts as accepted | 1 of 11 — below the limit (ITM-006, realising UC-002, becomes *waiting for acceptance*) |
| F12 the selected items are read past the texts kept by blob SHA | 1 of 11 — the economy (warm load) |
| F13 the view is not registered in `built.json` | 11 of 11 |

Every fault was caught. `tests/test_step_explanations.py` (not new) stays green: the view renders its four steps through
`stepHtml`.
