---
id: ITM-1049
title: Remove team frees a team whose sprints' items have reached the default branch
level: module
realises:
  - UC-048
  - A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH
modules:
  - MOD-implementation-pages
builds_on:
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-048-2, read against the accepted texts on main at 40e04d8d
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-1049 Remove team frees a team whose sprints' items have reached the default branch

**REGISTER**

## Outcome

UC-048.md:99-100: "While one of its sprints holds items (UC-032), the team cannot be removed, and Agent M names them;
otherwise Agent M removes its role assignment." MOD-implementation-pages.md:151-152: "a team is removed only while no
sprint of it holds an item (`heldItems`)". MOD-work-plans.md:151-153: an item's hold ends "when a merged pull request
naming it reaches the default branch".

`src/implementation-pages/roles.mjs:261` calls `heldItems` with the pull requests `"unknown"`, because
`listPullRequests` was not built when the route was (`roles.mjs:17-19`). It is built now
(`src/repository-hosts/index.mjs:347`) and named in the module's Uses (MOD-implementation-pages.md:23). So a team whose
items are all merged is refused today. *Remove team* reads the product's pull requests with `listPullRequests` and hands
them to `heldItems`. The refusal names the held items as now. The write of the removal is not changed here (NEW-048-3).

## Acceptance

- A team whose sprint selected an item whose pull request is merged into the default branch is removable; a team with an
  item whose pull request is open, or that has none, is refused and the item named. Tests state both, with a fixture host
  that serves the pull requests.
- Counter-proof: passing `"unknown"` again fails the first case.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/implementation-pages/` and the tests that name MOD-implementation-pages change.
