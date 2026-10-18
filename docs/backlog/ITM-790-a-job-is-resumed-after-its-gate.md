---
id: ITM-790
title: A job waiting at a gate is resumed on the tab's or a Bridge's route
level: module
realises:
  - UC-034
  - A JOB STOPS AT EVERY GATE
modules:
  - MOD-runtimes
builds_on:
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-790 A job waiting at a gate is resumed on the tab's or a Bridge's route

**REGISTER**

## Outcome

UC-034 step 7, "the job continues". A job stops at a gate on the tab's route (`src/runtimes/tab.mjs:116`), and
MOD-runtimes states `resumeJob` and does not build it (`src/runtimes/index.mjs:7`). This item builds it as the module's
file states it: the resumption appended to the record, naming the gate record, on the head read; the job handed back —
on in the tab; on a Bridge handed over again when `bridge` is given, else taken up when the Bridge next reads the
repository; on CI the push itself goes on.

**Note.** No module file names `resumeJob` among its Uses, so no caller is stated for the tab's and a Bridge's routes
(MOD-main-page: "the job's route resumes or ends the job when it notices the record"). This item builds the function its
module provides; who calls it is a gap of the architecture, named in the report.

## Acceptance

- A job waiting at a gate goes on only after `resumeJob` names a gate record; its record shows the resumption.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

## Settled at sprint team2/89's start, 2026-10-18 (po-opus-b): (b), a module text change only

The question sprint 86 left for akmaier (`docs/backlog/sprints/team2/86.md:90-95`): does a tab's job resume by being
prepared again, or does `resumeJob` receive what the tab holds? Every kind with gate points declares `before-merge`
(`src/job-catalogue/kinds/*/kind.md`), where the writer has run already (MOD-job-runner.md:291-292), so preparing again
would redo the work. What is left after the gate is the job's end, with its usage and cost: the tab appends it only when
the job did not stop at a gate (`src/runtimes/tab.mjs:131`). MOD-runtimes keeps "in memory, the jobs running in this tab;
nothing else" (MOD-runtimes.md:97), and a job waiting at a gate is not running (MOD-job-ledger.md:156).

**The draft**, committed as `c2f0a91e`: MOD-runtimes keeps in memory "the jobs running in this tab, and the result of each job
of this tab that waits at a gate"; `resumeJob` in the tab "goes on from the result this module kept for it, its end
appended as a job of the tab ends". The Bridge's route needs nothing new (`handOver` takes the record). Principles: *one
responsibility* — the route that ran the job holds it to its end; *nothing twice* — no second copy on the page; no new
parameter.

The item builds on the acceptance of that draft. Its Note stands: no module names `resumeJob` among its Uses yet. While
team 1's sprint 87 runs, MOD-runtimes uses MOD-trace-graph (ITM-735) and is used by MOD-review-pages, so it is held.
