---
id: ITM-1057
title: The plan page shows the architecture beside the plan's steps and their states
level: module
realises:
  - UC-045
  - PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
  - DIAGRAMS ARE MERMAID IN MARKDOWN
modules:
  - MOD-implementation-pages
builds_on:
  - ITM-1060
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-045-1, read against the accepted texts on main at 40e04d8d
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-1057 The plan page shows the architecture beside the plan's steps and their states

**REGISTER**

## Outcome

MOD-implementation-pages.md:156-157: "`plan` — the architecture's subsystems and modules beside the plan's steps with their
derived states and what each waits for". UC-045 step 1 (UC-045.md:63-66), 1a and 1b (UC-045.md:105-107). The route is not
built (`src/implementation-pages/index.mjs:3`). `itemStates` already orders the steps by `docs/plan/order.md` and gives a
step that waits for a gate as `waiting` (`src/work-plans/states.mjs:27-62`, `:166`).

## Acceptance

- Unit tests that name MOD-implementation-pages, over a fake host with a fixture V-model product:
  - the system, its subsystems and their modules are shown beside the steps in their order, each with its state and what it
    waits for, and a Mermaid diagram of the steps;
  - a product whose model works from a backlog links to the backlog and shows no plan;
  - with an open architecture file, the page names it and offers nothing to plan.
- Counter-proof: steps shown in file order instead of `order.md`'s fail.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/implementation-pages/` and the tests that name MOD-implementation-pages change.
