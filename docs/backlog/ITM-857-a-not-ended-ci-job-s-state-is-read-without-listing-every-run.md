---
id: ITM-857
title: A not-ended CI job's state is read without listing every run
level: unit
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
modules:
  - MOD-runtimes
  - MOD-main-page
builds_on:
  - ITM-847
tests:
  - unit
origin:
  - ITM-847's draft stop (sprint team1/79), from developer-sonnet-e's findings
---
# ITM-857 A not-ended CI job's state is read without listing every run

**REGISTER**

## Outcome

For each job taken by CI that has not ended, `liveState` (`src/runtimes/index.mjs:131`, `:149`) lists the whole workflow's
runs through `runOfAddress` (`src/runtimes/ci.mjs:283-286`, `host.listCiRuns`, `src/repository-hosts/github.mjs:451`). A re-read of the main page then costs one listing, of one or more pages, per such job. This lead is
from the code. At the start, it is counted with several not-ended CI jobs. Where one listing serves them all, they share
it.

## Acceptance

- The requests for N not-ended CI jobs do not grow with N beyond one listing, and a test counts it.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**Noted at ITM-847's gate (sprint team1/79, 2026-10-17, po-opus).** When the run listing meets a used-up limit,
MOD-main-page's `liveStatesOf` shows the job as not reachable. A used-up limit is named as such (`A USED-UP RATE LIMIT IS
NAMED`), not as an unreachable runtime. This item names it so, with a test.

**Stopped at its record's stop clause (sprint team1/83, 2026-10-18, po-opus): it waits for a draft of MOD-runtimes.**
- **Measured on the base:** 1, 3 and 6 not-ended CI jobs cost 1, 3 and 6 run listings.
- **Sharing one listing needs an interface no module states.**
  - MOD-runtimes' Data reads (MOD-runtimes.md:118-119): "It keeps, in memory, the jobs running in this tab, the result of
    each job of this tab that waits at a gate, and, where this browser cannot keep its identifier, this tab's own (below);
    nothing else".
  - A wrapper in MOD-main-page would call `MOD-repository-hosts.listCiRuns`, which its Uses do not name.
- **The draft for akmaier:** MOD-runtimes gives one call that reads the live states of many jobs with one listing per
  workflow, and names a used-up limit. That keeps reading a CI run in the module that owns it (`DEVELOP AGAINST
  INTERFACES`). The developer's draft patch is kept (`scratchpad/ITM-857-draft.patch`).
- **The tests, read again after the stop:**
  - TST-847010 (`tests/main-page-home.test.mjs:539-544`) expects one listing per job, so it changes.
  - `liveStatesOf` (`src/main-page/jobs.mjs:74-82`) still shows every failure of the listing as not reachable.
  - The case of a used-up limit belongs with the route `jobs` (`main-page-jobs.test.mjs`), where `live.reachable` is shown.
