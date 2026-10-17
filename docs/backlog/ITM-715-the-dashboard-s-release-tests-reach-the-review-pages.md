---
id: ITM-715
title: The dashboard's release tests reach the review pages
level: system
realises:
  - UC-006
  - UC-008
modules:
  - MOD-site-frame
  - MOD-trace-pages
builds_on:
tests:
  - release
origin:
  - ITM-680's draft stop (sprint team1/73), under sprint 68's agreement on release tests an item changes
---
# ITM-715 The dashboard's release tests reach the review pages

**REGISTER**

## Outcome

ITM-680 shows the review routes through MOD-review-pages. On its draft, five release files change result:

| Release file | Base (tests/pass/fail/todo) | Draft |
|---|---|---|
| `release-sprint-01-dashboard-app` | 36/34/0/2 | 36/16/18/2 |
| `release-sprint-02-a-dashboard-app` | 19/17/0/2 | 19/9/8/2 |
| `release-sprint-02-d-dashboard-app` | 8/8/0/0 | 8/0/8/0 |
| `release-sprint-04-trace-pages` | 5/5/0/0 | 5/0/5/0 |
| `release-sprint-15-spec-toggles` | 1/1/0/0 | 1/0/1/0 |

Each failing case is read against its use case.
- **A case that reaches the old page's markup** reaches the module's page instead, with the same expected result.
- **A case whose behaviour the draft lost** goes back to ITM-680 as a fault. Examples are an editor that no longer
  offers Save, the Mermaid handoff, and collapsed sections. Its test is not changed.

`release-sprint-02-d-dashboard-app` names `MOD-dashboard-app`, which has no module file, and MOD-site-frame's Parts take it
over. Its change lands on ITM-680's branch, ITM-680 being a job of MOD-site-frame, and its header names MOD-site-frame
(sprint 72's agreement).

It is written by a participant who builds none of ITM-680, and is merged into ITM-680's branch before ITM-680's gate.

## Acceptance

- Each of the five files passes whole on ITM-680's head, with every expected result kept. A changed expected value is
  named and stops the item.
- It lists, for each case, the markup it reached before and the markup it reaches now.
