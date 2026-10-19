---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - ba92e377db1fd9e8665c455655e636063d12fd07
  - https://github.com/akmaier/agent-m/pull/1015
date: 2026-10-19 10:38 UTC
---
# Development → Release testing: ITM-1037, rejected — no red on CI, the reading not done, and host calls the module does not use

**REGISTER**

## Reason

ITM-1037 (MOD-prompt-bar), pull request #1015 into `sprint/team1/93`, is rejected on `ba92e377`.

**What holds.**
- Two commits, one parent each, with the trailer `developer-sonnet-d`.
- `73427dd2` holds only tests, and `ba92e377` holds the code, whose CI run 39238534191 is green.
- The refusal for a missing job workflow links the route `settings` through `go` (MOD-prompt-bar.md:206-208).

**What fails.**
- **No red on CI.** SPEC.md:1426-1427 AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST asks that "the product's CI run on that
  commit is red". `73427dd2` has no CI run. A local red is not that run.
- **The reading was not done.** AGENTS.md §1 has a developer read `SPEC.md` and, for code, chapters 9, 11, 12 and 13 in full
  before the work. The developer says it did not.
- **Host calls the module does not use.** To learn that a run ended `not run`, `src/prompt-bar/follow.mjs:73-75` calls the
  host's `listCiRuns` and `ciRunLog`. MOD-prompt-bar names neither among its uses (MOD-prompt-bar.md:13-18). It does name
  MOD-runtimes' `liveState` and `jobLog` (:59-60), which are a job's state and log.

**What passes on the next head.**
- The reading is done first.
- `73427dd2` alone gets its CI run through a draft pull request used only for CI, as #996 did for ITM-1030, and that run is
  red.
- The ended run is learned through the interfaces the module uses, `liveState` and `jobLog`. If they cannot give it, the
  item stops and says why.
