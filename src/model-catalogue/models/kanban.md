---
name: kanban
kind: pulled
measure: items per state over time
---
# Kanban

**REGISTER**

Kanban of the book *Vibe Coding* as this instance's source register holds it (`SRC-vibe-coding`, version `2026-10-05`):
chapter 7, *Kanban as Flow-Oriented Synchronization*, and its Figures 7.2 and 7.3. The phases are the columns of the
board — Backlog, Doing, Review, Done —, and "work is selected, pulled into execution, checked before acceptance, and only
then considered finished". New work is pulled only while the work in progress is below the limit, and there are no
sprints. The board of Figure 7.2 holds three cards in progress — one in Doing, two in Review —: the limit is three. The
chapter names no role for a column: the roles are those of the Geek Box *Artifacts, roles, and traceability* of chapter 6
— product owner, developer and reviewer —, the product owner placing the work in the backlog and accepting it as done.

## Phases

| Name | Role | Produces |
|---|---|---|
| Backlog | Product owner | ITM |
| Doing | Developer | MOD, TST |
| Review | Reviewer | — |
| Done | Product owner | — |

## Transitions

| From | To | Kind |
|---|---|---|
| Backlog | Doing | sequence |
| Doing | Review | sequence |
| Review | Done | sequence |

## Verification pairs

| Phase | Checked by |
|---|---|
| Doing | Review |

## Gates

| Between | Artifacts | Condition | Decider |
|---|---|---|---|
| Review → Done | the item's MOD and TST | the review has checked the item: only then is it finished | Reviewer |

## Roles

| Name | Filled by | Capabilities |
|---|---|---|
| Product owner | either | read the repository, write to the repository |
| Developer | either | read the repository, write to the repository, run code and tests |
| Reviewer | either | read the repository |

## Flow control

| Kind | Value |
|---|---|
| WIP limit | 3 |
| Time box | — |
| Sprints | no |
