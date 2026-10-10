# SPEC approvals — queue 2026-10-10 · several teams develop one product in parallel

**PO decision:** in a model with sprints, a product may be developed by any number of teams at once, each declared in a
declaration of its own, from participants that may stand in several lists of the instance and may serve several teams.
Each team runs sprints of its own and plans them against what the other teams' sprints hold: no item is held by two
sprints, and no sprint changes a module that another team's sprint changes or uses, or uses one that it changes. A team's
jobs go to its own role holders, and its gates are decided by them.

**Size:** two entries. 01, §5 *Process models and practices*: the rule of `PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE`
admits further lists, one requirement follows it, three new requirements stand at the section's end. 02, §13 *Process
execution and jobs*: the rules of `NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT`, `A TIME BOX WORKS ONLY ON WHAT WAS
SELECTED FOR IT` and `A JOB GOES ONLY TO A HOLDER OF ITS ROLE` are read per team, nine new requirements follow the second
of them, and one precedes `A GATE IS NOT DECIDED BY THE PARTICIPANT WHOSE WORK IT CHECKS`. Every other requirement of the
two sections is carried over byte for byte. Drafted with it: UC-002, UC-017, UC-024, UC-032, UC-033, UC-034, UC-035,
UC-041 and UC-043 — among them, by the same decision, the backlog without a stored order. Accept the queue first, then
the use cases.

**Zieldatei aller Einträge:** `products/agent-m/SPEC.md`

| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |
|---|---|---|---|---|
| 01 | `SPEC.md` | ## 5. Process models and practices | — | — |
| 02 | `SPEC.md` | ## 13. Process execution and jobs | — | — |
