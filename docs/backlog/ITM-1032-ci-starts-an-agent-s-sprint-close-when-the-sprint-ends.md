---
id: ITM-1032
title: CI starts an agent's sprint close when the sprint ends
level: module
realises:
  - UC-041
  - A SPRINT CLOSED BY AN AGENT STARTS BY ITSELF
  - CLOSING A SPRINT CAN BE ASSIGNED TO A PARTICIPANT
modules:
  - MOD-work-plans
  - MOD-workflow-entries
builds_on:
  - ITM-618
  - ITM-619
  - ITM-620
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-041-5, read against the accepted texts on main at 40e04d8d
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-1032 CI starts an agent's sprint close when the sprint ends

**REGISTER**

## Outcome

UC-041-close-a-sprint.md: a sprint whose close is assigned to an agent is closed by that agent when it ends (`A SPRINT
CLOSED BY AN AGENT STARTS BY ITSELF`). `onSchedule` is not built (`src/workflow-entries/product.mjs:3-4`: "onSchedule and
onTestsFinished are other items'").

## The accepted text

The draft for this item is accepted (`1c30ad0b` and the acceptances before it); quoted from `main` at 40e04d8d:

MOD-work-plans.md:185-189:

> - `sprintsToClose(sprints: Document[], states: ItemState[], today: string) -> Array<{ sprint: string, closer: string,
>   because: "time box ended" | "every selected item done" | "ended by the Product Owner" }>` — every sprint whose record
>   holds no `## Review` and that has ended: its `end` date is before or on `today`; or, without a time box, every item of
>   its selection is `done`, or its record holds `## Ended`; each with its `closer` (UC-041, an agent's close; `A SPRINT
>   CLOSED BY AN AGENT STARTS BY ITSELF`). It reads nothing.

MOD-workflow-entries.md:166-169:

> - `onSchedule(env: CiEnvironment) -> Promise<EntryStatus>` — on the product's schedule: the events in time. Each sprint
>   that MOD-work-plans' `sprintsToClose` names — its time box ended, or, without one, every selected item done or the
>   Product Owner's `## Ended` — whose closer is an agent gets its close, a job of kind `close-sprint`, queued for that
>   agent's route, unless a close of it is already queued or running (`A SPRINT CLOSED BY AN AGENT STARTS BY ITSELF`).

## Acceptance

- Unit tests that name MOD-workflow-entries: a sprint whose time box ended and whose `closer` is a CI agent gets one queued
  `close-sprint` job on that agent's route; a sprint closed already, or one closed by a person, gets none.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
