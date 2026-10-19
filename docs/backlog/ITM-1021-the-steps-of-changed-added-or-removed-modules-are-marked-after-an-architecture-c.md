---
id: ITM-1021
title: The steps of changed, added or removed modules are marked after an architecture change
level: module
realises:
  - UC-045
modules:
  - MOD-work-plans
  - MOD-implementation-pages
builds_on:
  - ITM-613
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-045-4, read against the accepted texts on main at 40e04d8d
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-1021 The steps of changed, added or removed modules are marked after an architecture change

**REGISTER**

## Outcome

UC-045-plan-the-implementation.md:108-109 (1c): "The steps of changed, added or removed modules and subsystems are
marked; the planner drafts the plan again or edits it."

## The accepted text

The draft for this item is accepted (`1c30ad0b` and the acceptances before it); quoted from `main` at 40e04d8d:

MOD-work-plans.md:167-171:

> - `planFindings(plan: Document, steps: Document[], architecture: Document[], workflow: Workflow, source: TextSource,
>   history?: { host: Host }) -> Promise<Finding[]>` — a module, a subsystem or the system without a step; with `history`, a
>   step whose module or subsystem file was removed, and a step whose module or subsystem file was changed by a commit later
>   than the step's own last commit (`readHistory` of both files, `changes: false`), each naming the file and the step, so
>   that the plan page marks them after an architecture change (UC-045); a module ordered before one whose interface …

## Acceptance

- Unit tests: after a module file changes, the step that implements it is marked; a removed module's step is marked; an added
  module is named as without a step. Nothing is written until the planner saves.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
