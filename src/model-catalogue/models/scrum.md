---
name: scrum
kind: pulled
measure: remaining items per time box
---
# Scrum

**REGISTER**

Scrum of the book *Vibe Coding* as this instance's source register holds it (`SRC-vibe-coding`, version `2026-10-05`):
chapter 7, *Scrum as Structured Flexibility*, its Figure 7.4 and its Table 7.3. Work runs in time boxes called sprints:
"Sprint planning then selects a subset of that work for the current sprint. Inside the sprint, the team works from the
sprint backlog, synchronizes through daily Scrum meetings, and produces an increment. At the end of the sprint, the review
checks what was actually achieved, and the retrospective reflects on how the team itself should improve before the next
cycle begins." The retrospective feeds its improvements back for the next sprint. The roles are those of Table 7.3: the
Product Owner, the Development Team — here its Developers, as Figure 7.4 names them — and the Scrum Master; the
stakeholders, who provide domain expectations and feedback, hold no role of the model. The gates follow the chapter: "acceptance criteria determine whether
the generated result should be accepted", and the retrospective comes "before the next cycle begins". A sprint has a fixed
duration, "often one week in small examples and at most one month in the standard guidance": the time box is one week.

## Phases

| Name | Role | Produces |
|---|---|---|
| Sprint Planning | Product Owner | ITM |
| Development | Developers | MOD, TST |
| Sprint Review | Product Owner | sprint record |
| Sprint Retrospective | Scrum Master | sprint record |

## Transitions

| From | To | Kind |
|---|---|---|
| Sprint Planning | Development | sequence |
| Development | Sprint Review | sequence |
| Sprint Review | Sprint Retrospective | sequence |
| Sprint Retrospective | Sprint Planning | back |

## Verification pairs

| Phase | Checked by |
|---|---|
| Development | Sprint Review |

## Gates

| Between | Artifacts | Condition | Decider |
|---|---|---|---|
| Development → Sprint Review | the increment: the MOD and TST of the selected ITM | every selected item meets its acceptance criteria | Product Owner |
| Sprint Retrospective → Sprint Planning | the sprint record of the review and the retrospective | the retrospective names how the team will improve | Product Owner |

## Roles

| Name | Filled by | Capabilities |
|---|---|---|
| Product Owner | either | read the repository, write to the repository |
| Scrum Master | either | read the repository |
| Developers | either | read the repository, write to the repository, run code and tests |

## Flow control

| Kind | Value |
|---|---|
| WIP limit | — |
| Time box | 1 week |
| Sprints | yes |
