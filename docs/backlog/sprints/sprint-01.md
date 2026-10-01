---
id: sprint-01
goal: The existing dashboard stands on the accepted architecture, and the kernel's artifact module is complete
start: 2026-10-01
end: none
selection:
  - ITM-001
  - ITM-002
  - ITM-003
  - ITM-004
  - ITM-005
  - ITM-006
  - ITM-007
  - ITM-008
  - ITM-123
  - ITM-009
  - ITM-010
  - ITM-011
  - ITM-012
  - ITM-013
closer: po-fable
branch: sprint/01
model: scrum-wip
planned_by: po-fable
---
# Sprint 01

**REGISTER**

The first sprint of Agent M under its declared process (`docs/process.md`, model `scrum-wip`): the Product
Owner's selection from the ordered backlog (`docs/backlog/order.md`), made at sprint planning on 2026-10-01
(UC-032 step 6). No state is kept here; whether an item is ready, in progress, blocked or done is derived from
the approval records, job records and pull requests (`PROGRESS AND JOB STATE ARE DERIVED, NOT STORED`).

## Goal

The existing dashboard stands on the accepted architecture, and the kernel's artifact module is complete:

- the code of `review-core.mjs` and `review-app.mjs` is split into the accepted modules — kernel, adapters and
  the dashboard shell with views loaded by name — with its behaviour unchanged, and every test names its
  module, what it guards and its level (ARC-003, ARC-020);
- on that structure, what the SPEC accepted on 2026-09-30 and 2026-10-01 is applied to the built dashboard: a
  used-up rate limit is named instead of blamed on the token, one token with *Pull requests* and *Workflows*,
  the pseudonymisation setting explained as rewriting without persons, and one write path that takes an
  authority;
- every flow the dashboard already carries out is characterised, and the flows it does not carry out are
  listed for the next refinement;
- MOD-artifacts reads and checks requirements, use cases, identifiers and headers, and group files, and runs
  every format check of one kind in one call — the base every derivation and job item builds on.

## Selection

In the order they are pulled: the top ready item of this list starts when fewer than four items are in
progress. Dependencies are given only where they lie inside this sprint; nothing selected waits for an item
outside it.

| # | Item | Title | Kind | Waits for (in this sprint) |
|---|---|---|---|---|
| 1 | ITM-001 | Split the adapters out of review-core.mjs — git host, browser store, tunnel commands | refactoring | — |
| 2 | ITM-002 | Split the kernel — artifacts, traceability and personal-data parts out of the approval engine | refactoring | ITM-001 |
| 3 | ITM-003 | The dashboard shell — texts and HTML out of the kernel, review-app.mjs becomes dashboard-app.mjs with view files loaded by name | refactoring | ITM-002 |
| 4 | ITM-004 | Every existing test names its module, what it guards and its level; the shared check file runs a folder | refactoring | ITM-003 |
| 5 | ITM-005 | A used-up rate limit is named, not blamed on the token | implementation | ITM-004 |
| 6 | ITM-006 | One GitHub token serves every feature — Pull requests and Workflows in the link, the guidance and the steps | implementation | ITM-005 |
| 7 | ITM-007 | The pseudonymisation setting is explained as rewriting without persons, not as stand-ins | implementation | ITM-006 |
| 8 | ITM-008 | One write path that takes an authority — click, CI secret or agent login | implementation | ITM-007 |
| 9 | ITM-123 | Characterise the use cases the dashboard already carries out — flow by flow, alternative flows included | refactoring | ITM-008 |
| 10 | ITM-009 | The requirement format and its checks — five fields, one statement, a named check, what it constrains, a registered source | implementation | ITM-004 |
| 11 | ITM-010 | Use cases checked in the dashboard's reader as in the Python twin — realised names, Mermaid, identifier kept | implementation | ITM-004 |
| 12 | ITM-011 | Identifiers, their stability, origin links, and the Module, Guards and Level lines of code and tests | implementation | ITM-004 |
| 13 | ITM-012 | Group files — parse, format, the hierarchy with every item once, moves | implementation | ITM-004 |
| 14 | ITM-013 | Every format check of one artifact kind in one call, as findings for the correction loop | implementation | ITM-009, ITM-010, ITM-011, ITM-012 |

Every selected item realises only accepted requirements, use cases and modules (checked at planning against
`docs/approvals/`), needs no person, and is level 1. The selection is the head of the backlog order,
positions 1 to 14, without a gap.

## How the selection runs under the limit of four

- ITM-001 to ITM-004 follow one another: each moves code out of the files the one before it produced. Until
  ITM-004 is merged, one item is in progress and the limit is not reached.
- From ITM-004 on, two strands run side by side on disjoint files: the dashboard strand ITM-005 → ITM-006 →
  ITM-007 → ITM-008 → ITM-123 (MOD-git-host and the dashboard's views, one after the other) and the
  artifact strand ITM-009, ITM-010, ITM-011, ITM-012 (MOD-artifacts, one new file each, independent of each
  other), closed by ITM-013 once all four are merged. With the limit of four, the dashboard strand holds one
  slot and the artifact strand up to three; an item of the dashboard strand stands above the artifact items in
  this list, so it is pulled first whenever it is ready, because it is the longer chain.
- The refactorings and ITM-123 are refactoring jobs — CI green on every commit, no expected result changed
  —, the rest are implementation jobs that begin with a failing test. Both kinds of the Definition of Done
  (`docs/process.md`) are exercised in this sprint.

## Branch and close

- Sprint branch: `sprint/01`, from `main`. Each team branches from it, one item per branch, and merges back
  through a pull request with green CI on which the Definition of Done holds.
- Release tests of the selected items are written by `tester-opus`, never by the implementer, and run green
  on `sprint/01` before the review.
- The sprint has no time box. It ends when every selected item is done or the Product Owner ends it. Its
  close — the review of the increment, the retrospective and the decision on every unfinished item — is
  assigned to `po-fable` (UC-041); the merge of `sprint/01` into `main` is the Product Owner's decision after
  review and retrospective are recorded.

## Not selected, and why

Ready after ITM-004 but outside this goal, so left at the top of the backlog for the next planning: ITM-014,
ITM-016, ITM-027, ITM-033, ITM-037, ITM-046, ITM-047, ITM-048, ITM-050, ITM-052, ITM-059, ITM-064, ITM-066,
ITM-068, ITM-100. Each of these opens a feature area of its own (approval gates, the applier, process models,
work items, job records, the source register and resources, repository checks, the CI generator, model
endpoints, the mailbox, the jump host); selecting them here would widen the increment beyond what one review
can inspect.
