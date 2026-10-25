---
id: ITM-828
title: What waits and what is built name every row the old page showed
level: module
realises:
  - UC-046
modules:
  - MOD-progress-measures
builds_on:
  - ITM-685
tests:
  - unit
origin:
  - the count of the main page's requests before ITM-684 (sprint team1/76), by developer-sonnet-e
built_by:
  - b0929e22b42ebf8b4b9c311d787e29ab73574369
  - d5baa10321834225004fa831d85cc3a9b519bc12
---
# ITM-828 What waits and what is built name every row the old page showed

**REGISTER**

## Outcome

The old main page shows architecture files among *What waits for a person*, and *blocked* and *done* rows among what is
being built. `waitingForAPerson` omits the architecture files, and `buildInProgress` omits *blocked* and *done*.

At the start, each is read against MOD-progress-measures' text (`waitingForAPerson`, `buildInProgress`) and UC-046:
- where the text asks for the row, it is a fault, built here with a test;
- where no text asks for it, the row goes with the old page, and the item says so.

## Acceptance

- Both functions give what their text and UC-046 say, with tests, and the rows that go are named.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**Added at ITM-827's draft stop (sprint team1/78, 2026-10-17, po-opus).** `buildInProgress` takes `reachable` from
`row.source.reachable` (`src/progress-measures/stages.mjs:145`). `listJobs` sets that from whether the job's record could
be read (`src/job-ledger/index.mjs:421-430`), not from whether its runtime answers. UC-046 4a and the module's text say a
job whose runtime does not answer is listed as not reachable. That fault is this item's too, test first.

**Stopped at its draft (sprint team1/80, 2026-10-17, po-opus): it leaves the sprint.**
- **The rows.** Read against MOD-progress-measures' text and UC-046, none is missing. The architecture files, the blocked
  rows and the in-progress rows without a job go. TST-685011 and 685013 already pin that, so nothing is built for them.
- **The reachability fault** cannot reach the live page within this item's modules. It needs one meaning of a job's
  reachability across MOD-job-ledger, MOD-progress-measures and MOD-main-page.
- **The done row's SPEC Check and module text disagree.**
- Both are ITM-864, a draft for akmaier first. The draft is kept as a patch for it.

**Read again after ITM-864 (team 2's sprint 99, po-opus-b, on `sprint/team2/99`): met, with no code of its own, once #1251
reaches `main`.**

Each part of the Acceptance has its code and its test, and no part needs a draft.
- **The rows that go are named and pinned.** The old page's architecture files, blocked rows and in-progress rows without
  a job go. TST-685011 and TST-685013 (`tests/progress-measures-build-and-waits.test.mjs:68`, `:122`) pin that.
- **A job whose runtime does not answer is listed as not reachable** (UC-046 4a):
  - `listJobs` (`src/job-ledger/index.mjs:432-433`, `b0929e22`) and its test, `tests/job-ledger.test.mjs:558`;
  - the main page derives its rows with the live states (`src/main-page/home.mjs:68-69`);
  - `buildInProgress` copies `source.reachable`.
- **The done step** (SPEC.md:928-929): ITM-864 (#1243, merged into `sprint/team2/99` as `d5baa103`).
  - `itemStates` keeps an item in progress with its job once that job has ended as done.
  - `buildInProgress` lists it as `done` until its pull request is merged.
  - Its test: `tests/progress-measures-build-and-waits.test.mjs:99`.

So ITM-828 is recorded as done once #1251 is merged, and ITM-684's builds_on are then all done.

**Done (team 2's sprint 100's start, po-opus-b):** read on `main` at `064d185e`, where sprint 99 is merged (#1251). Each part
of the Acceptance named above has its code and its test there:
- the rows that go: TST-685011 and TST-685013;
- the job not reachable: `src/job-ledger/index.mjs:432-433`, `tests/job-ledger.test.mjs:558`;
- the done step: ITM-864, `tests/progress-measures-build-and-waits.test.mjs:99`.

No pull request names this item, and no code of its own changes.
