---
id: ITM-974
title: Retry on a job's page, for a failed, cancelled or ended job
level: module
realises:
  - UC-036
  - ONE CLICK PER DECISION
  - THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
modules:
  - MOD-main-page
builds_on:
  - ITM-971
  - ITM-973
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-036-7, verified against the accepted texts on main at ee5d1364
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-974 Retry on a job's page, for a failed, cancelled or ended job

**REGISTER**

## Outcome

MOD-main-page.md:98-99: "*Retry* for a failed, cancelled or ended job, as a new job, with the same participant or another
holder of its role on a route offered for it". MOD-main-page.md:55: "Retrying a job that ran in a tab opens the view that
runs its kind, with the job's inputs." UC-036:105-107 (step 7), :139-140 (1c). The routes come from `routesFor`
(MOD-main-page.md:132); the retry from `retryJob` (ITM-973); a job whose task travelled with its hand-over offers the
prompt bar instead (`TaskNotInRecord`). The new job names the earlier one, and both stay in the list.

## Acceptance

- *Retry* is offered for failed, cancelled and ended-without-record jobs only; one confirmed click calls `retryJob` with
  the chosen holder and route; a tab job opens its kind's view with its inputs; `TaskNotInRecord` offers the prompt bar.
  Counter-proof: *Retry* on a running job fails.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/main-page/` and the tests that name MOD-main-page change.
