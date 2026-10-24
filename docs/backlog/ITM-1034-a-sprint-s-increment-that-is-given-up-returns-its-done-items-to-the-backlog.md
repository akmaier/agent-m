---
id: ITM-1034
title: A sprint's increment that is given up returns its done items to the backlog
level: module
realises:
  - UC-041
  - A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH
modules:
  - MOD-work-plans
  - MOD-implementation-pages
builds_on:
  - ITM-990
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-041-7, read against the accepted texts on main at 40e04d8d
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-1034 A sprint's increment that is given up returns its done items to the backlog

**REGISTER**

## Outcome

UC-041-close-a-sprint.md:148-149 (7b): "If the Product Owner gives the increment up, its done items go back to the backlog and
are no longer held."

## The accepted text

The draft for this item is accepted (`1c30ad0b` and the acceptances before it); quoted from `main` at 40e04d8d:

MOD-work-plans.md:233-237:

> - `giveUpIncrement(host: Host, sprint: string, reason: string, context: { head: string, trailers: string[] }) -> Promise<{
>   commit: string }>` — the Product Owner's *Give up increment* for a closed sprint whose branch was not merged: appends
>   `## Increment given up` with the date, the person and the reason, in one commit; the sprint then holds none of its items
>   (UC-041 7b). Errors: `NotFound { path }`, `NotClosed` for a sprint without `## Review`, `Merged` for a sprint whose
>   branch's pull request is merged, and the host's.

## An open reading

Since `4b8aea1c` every merged pull request naming an item makes it `done`, into any branch (MOD-work-plans, `ItemState`: "A
merged pull request decides first"; the backlog page filters no base, ITM-1197). An item merged into the branch of a sprint
whose increment is given up therefore stays `done`, and `startable` refuses a job on it ("a change to it is a new item").
UC-041 7b says its done items "go back to the backlog". This item builds only `heldItems`, as its Acceptance says. Which
state such an item has once it is back in the backlog no text states; that is a question to akmaier, since neither UC-041
nor MOD-work-plans can be read to give it.

## Acceptance

- Unit tests that name MOD-work-plans: after the increment is given up, `heldItems` holds none of the sprint's done items.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
