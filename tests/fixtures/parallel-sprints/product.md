# The fixture product of the parallel sprints

The data of tests/test_parallel_sprints.py, tests/test_time_box_selection.py and tests/test_wip_limit.py: a product whose
model works in sprints, with a work-in-progress limit of 2, and two teams, team1 and team2. Its sprint records stand under
`docs/backlog/sprints/<team>/`, its role assignments under `docs/role-assignments/`. Now team1 runs its sprint 01, which
holds ITM-001, ITM-003 and ITM-005; team2 closed its sprint 01 — ITM-002 merged into the default branch with the sprint's
branch, ITM-006 sent back to the backlog — and runs its sprint 02, which holds ITM-007 and ITM-008.

## Modules

| Module | Uses |
|---|---|
| MOD-store | — |
| MOD-pages | MOD-store.read |
| MOD-mail | — |
| MOD-feed | MOD-mail.fetch |
| MOD-auth | — |
| MOD-admin | MOD-auth.check |

## Items

| Item | Modules |
|---|---|
| ITM-001 | MOD-store |
| ITM-002 | MOD-pages |
| ITM-003 | MOD-mail |
| ITM-004 | MOD-feed |
| ITM-005 | MOD-store, MOD-mail |
| ITM-006 | MOD-pages |
| ITM-007 | MOD-auth |
| ITM-008 | MOD-admin |

## Pull requests

| Number | Branch | Base | State | Merged |
|---|---|---|---|---|
| 1 | work/ITM-002 | sprint/team2/01 | merged | 2026-10-05T10:00:00Z |
| 2 | sprint/team2/01 | main | merged | 2026-10-06T10:00:00Z |
| 3 | work/ITM-001 | sprint/team1/01 | merged | 2026-10-08T10:00:00Z |
| 4 | work/ITM-003 | sprint/team1/01 | open | — |
| 5 | work/ITM-007 | sprint/team2/02 | open | — |

## Process

| Phase | Roles | Produces |
|---|---|---|
| Sprint Planning | Product Owner | ITM |
| Development | Developers | MOD, TST |

## Roles

| Role | Capabilities |
|---|---|
| Product Owner | read the repository |
| Developers | read the repository, write to the repository, run code and tests |

## Participants

| Name | Capabilities |
|---|---|
| alice | read the repository, write to the repository |
| dev-a | read the repository, write to the repository, run code and tests |
| dev-b | read the repository, write to the repository, run code and tests |
