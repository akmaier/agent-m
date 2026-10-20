---
id: ITM-864
title: A job's reachability and a step that is done have one meaning
level: module
realises:
  - THE BUILD IS SHOWN AS IT HAPPENS
  - UC-046
modules:
  - MOD-job-ledger
  - MOD-progress-measures
  - MOD-main-page
builds_on:
  - ITM-828
tests:
  - unit
origin:
  - ITM-828's draft stop (sprint team1/80), from developer-sonnet-e's draft
---
# ITM-864 A job's reachability and a step that is done have one meaning

**REGISTER**

## Outcome

ITM-828's draft could not mark a Bridge job whose runtime does not answer as not reachable on the live main page. The
meaning of a job's reachability is held in several places at once:
- **MOD-job-ledger's `listJobs`** sets `JobRow.source.reachable` from whether the record could be read
  (`src/job-ledger/index.mjs:421-430`). The module's own text says "the list shows the source as not reachable" when the
  runtime does not answer.
- **Three consumers** read `source.reachable` as "the record could be read" and read `live.reachable` beside it:
  `src/main-page/jobs.mjs:85`, `src/prompt-bar/follow.mjs:93`, and `liveStatesOf` at `jobs.mjs:68`.
- **MOD-progress-measures' `buildInProgress`** copies `source.reachable` (`stages.mjs:145`).
- **MOD-main-page's `home` and re-read** pass no Bridges to `productFacts` and replace `facts.jobs` with their own rows
  (`home.mjs:50`, `reread.mjs:42`). So a reachability set in `Facts` never reaches the page.

**The done row has two readings.**
- `THE BUILD IS SHOWN AS IT HAPPENS`'s Check reads: "once the job has ended, the step shows done".
- MOD-progress-measures' text and UC-046 step 4 read: an item moves on to *done* "when its pull request is merged".
- `buildInProgress` returns `job: string` for each row, so a done row cannot be carried at all.

These are one decision about a job's reachability and a step's state across MOD-job-ledger, MOD-progress-measures and
MOD-main-page, and the SPEC's Check and the module text disagree. So a draft for akmaier comes first. It covers the module
files and, for the done row, the SPEC sentence or its Check. This item then builds what is accepted, with ITM-828's draft
(`scratchpad/ITM-828-draft.patch`, TST-828001 to 004) as its start.

## Acceptance

- On the live main page, a job whose runtime does not answer is shown as not reachable (UC-046 4a), and a step that is done
  shows as the accepted text says, with tests.

**Read again (team 2's sprint 98, 2026-10-20, po-opus-b), after review by a2fd6f0bd4f5027fd.**
- **The reachability part is built.**
  - `listJobs` marks a read record whose runtime does not answer as not reachable (`src/job-ledger/index.mjs:432-433`,
    `b0929e22`), as MOD-job-ledger.md:176 says.
  - `home` and re-read derive the rows with the live states (`src/main-page/home.mjs:68-69`, `reread.mjs:44-46`).
- **The done step is the remaining gap.** The SPEC's counter-proof reads: "once the job has ended, the step shows done"
  (SPEC.md:928-929).
  - A step whose job ended as done, with its pull request open, gets `job: null` (`src/work-plans/states.mjs:181`). With
    no pull request it is `ready` (:184).
  - `buildInProgress` lists only `in progress` states with a job (`src/progress-measures/stages.mjs:143`), so the step
    vanishes.
- **There is no difference from UC-046.** A build row's state is its job's state (UC-046:63). "Moves on to done when its
  pull request is merged" (UC-046:64) is the item's own state.
- **The draft belongs in MOD-work-plans, not in MOD-progress-measures or MOD-main-page** (principle 2):
  - `ItemState.job` is the newest job whose record works on the item, also once that job has ended;
  - `itemStates` keeps that job while the pull request is open;
  - the draft decides whether a job ended as done with no pull request yet leaves the item `in progress` or `ready`.
- `buildInProgress` and the main page stay as they are.
- **It waits for ITM-1156**, team 1's sprint 98 item on MOD-work-plans.
