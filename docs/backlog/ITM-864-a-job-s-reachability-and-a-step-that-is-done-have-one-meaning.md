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
