# SPEC approvals — queue 2026-10-10 · several teams develop one product in parallel

**PO decision:** who exists, how a product is developed and who develops it are configured apart — the instance's one list
of participants `docs/participants.md`, the product's process declaration, which names no participant, and one file
`docs/teams/<team>.md` per team that only assigns the process's roles. In a model with sprints, any number of teams work
at once; each runs sprints of its own and plans them against what the other teams' sprints hold: of two items held by
sprints of different teams, neither changes a module that the other changes or uses.

**Size:** two entries. 01, §5 *Process models and practices*: the rule of `PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE`
says outright that there is one list, four new requirements stand at the section's end. 02, §13 *Process execution and
jobs*: the rules of `NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT`, `A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT`
and `A JOB GOES ONLY TO A HOLDER OF ITS ROLE` are read per team, four new requirements follow the second of them, and one
precedes `A GATE IS NOT DECIDED BY THE PARTICIPANT WHOSE WORK IT CHECKS`. Every other requirement of the two sections is
carried over byte for byte. Drafted with it: UC-048 *Set up a team* (new), and UC-002, UC-017, UC-024, UC-026, UC-032,
UC-033, UC-034, UC-035, UC-041, UC-042, UC-043 and UC-045 — among them, by the same decision, the backlog without a
stored order. Accept the queue first, then the use cases.

**Zieldatei aller Einträge:** `products/agent-m/SPEC.md`

| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |
|---|---|---|---|---|
| 01 | `SPEC.md` | ## 5. Process models and practices | — | — |
| 02 | `SPEC.md` | ## 13. Process execution and jobs | — | — |
