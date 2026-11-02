---
id: ITM-1443
title: The Implementation page shows each team's running sprint
level: module
realises:
  - UC-035
  - PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE
modules:
  - MOD-implementation-pages
builds_on: []
tests:
  - unit
origin:
  - akmaier's report of the live site, 2026-11-02 — "Implementation also does not show a running sprint at present."
---
# ITM-1443 The Implementation page shows each team's running sprint

**REGISTER**

## Outcome

UC-035: "In a model with sprints, it shows what goes on now: each team's running sprint, its items and the jobs working on
them." Team 1's sprint 143 runs: its record `docs/backlog/sprints/team1/143.md` is on `main` with `end:` empty, and its
branch `sprint/team1/143` exists. The Implementation page shows no running sprint. MOD-implementation-pages' `progress.mjs`
draws "each team's running sprint".

The probe comes first. It gives the cause as a data-flow path, `file:line → function → value → where the sprint is lost`,
on this repository's own record. It confirms the modules: where the running sprint is derived outside
MOD-implementation-pages, the item names that module too, and the Product Owner checks it against the items in progress.

## Acceptance

- With a team's sprint record whose `end` is empty, the Implementation page shows that sprint as running, named by its
  team, with its items. Known positive: a record whose `end` is set is not shown as running.
- A fixture in the shape of `team1/143.md`, with its front matter as written, is shown as running.
- No other existing expected result changes, unless a probe names it and the accepted text allows it.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
