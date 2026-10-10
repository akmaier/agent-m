---
model: scrum-wip
model_file: docs/process-models/scrum-wip.md
model_version: 36818d739a20b7bd0dbfec7f13a86f46ebd29e05
---

# How Agent M is developed

**REGISTER**

Agent M uses `scrum-wip`: Scrum with a work-in-progress limit of four items per team and no time box. The model defines the phases, transitions and gates. Each team fills its roles in `docs/role-assignments/<team>.md` from the instance's one participant list, `docs/participants.md`.

## Roles

- Product Owner
- Scrum Master
- Developers

## Practices

- none

## Branches

| Phase or time box | Branch |
|---|---|
| Sprint | `sprint/<team>/<nn>` |

## Definition of Done

The job rules hold for every pull request; no condition is added.

## Sprint close

The Scrum Master closes the sprint with its review, retrospective and decisions on unfinished items. The Product Owner decides the increment's merge into the default branch and must not have written the review or retrospective it checks. The Scrum Master carries out the merge on that recorded decision.
