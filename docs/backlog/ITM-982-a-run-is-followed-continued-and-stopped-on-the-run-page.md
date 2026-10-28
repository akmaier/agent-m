---
id: ITM-982
title: A run is followed, continued and stopped on the run page
level: module
realises:
  - UC-043
  - A RUN CONTINUES WITHOUT A CLICK BETWEEN ITS JOBS
  - A RUN HAS LIMITS FIXED AT ITS START
  - A CANCELLED JOB WRITES NOTHING MORE
modules:
  - MOD-implementation-pages
builds_on:
  - ITM-981
  - ITM-978
  - ITM-979
  - ITM-973
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-043-7, verified against the accepted texts on main at ee5d1364
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-982 A run is followed, continued and stopped on the run page

**REGISTER**

## Outcome

MOD-implementation-pages.md:195-198: "while the page is open, the run's next actions of this page's route started as the
records change; *Stop run*, which cancels every job of the run that has not ended, and then the run itself, through
`cancelJob`, which records each end; and *Continue* once the person has raised the limit that stopped it." UC-043 6b
(failed jobs listed first, with **Retry**), 6c and 6d (UC-043.md:145-152).

## Acceptance

- Unit tests that name MOD-implementation-pages, over a fake host:
  - with the page open, a changed record starts the next action of the tab's route and only that;
  - a held run names its limit; *Continue* with a raised limit calls `raiseLimits` and the run goes on;
  - *Stop run* cancels every job not ended, then the run, and starts nothing further;
  - at the end, failed jobs and what they blocked come first, each with *Retry*.
- Counter-proof: a *Stop run* that leaves a running job unended fails.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/implementation-pages/` and the tests that name MOD-implementation-pages change.
