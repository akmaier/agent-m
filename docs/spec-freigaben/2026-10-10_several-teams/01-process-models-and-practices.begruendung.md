# 5. Process models and practices: the process names roles, a role assignment fills them

**The change.** `A ROLE NAMES HOW MANY FILL IT` follows `A PROCESS MODEL ORGANISES PEOPLE AND AGENTS`. The rule of
`PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE` says outright that `docs/participants.md` is the instance's one list of all
its participants; its name and its check file are kept, the check gains a case and counter-proofs. At the section's end:
the process declaration names the roles that participants fill, never a participant; a role assignment
`docs/role-assignments/<name>.md` fills them and does nothing else; a product has one role assignment, or, in a model that
works in sprints, one per team; a participant may serve several teams. The rest of the section is carried over byte for
byte.

**What the three models say.** Every model names roles, and none says who fills them: a role is "a defined responsibility
in the process, such as developer, reviewer, tester, product owner, or safety officer. One person may hold several roles in
a small project" (Vibe Coding, ch. 6, Geek Box *Artifacts, roles, and traceability*). The catalogue's Scrum has Product
Owner, Scrum Master and Developers (ch. 7, Table 7.3); its Kanban product owner, developer and reviewer; its V-model product
owner, developer, tester and reviewer. Only Scrum has teams — "the team (Scrum Master, Developers, Product Owner)" (ch. 7,
Figure 7.4) is one filling of Scrum's roles. Kanban is one flow under a work-in-progress limit, the V-model phases and
verification pairs along a plan; neither knows a team, and both are worked by a variable number of developers, testers and
reviewers (PO, 2026-10-10). Several Scrum teams are what the book calls agility at scale, "Scrum-on-Scrum structures"
(ch. 7, *Scaling Agility to Large Systems*).

**How many fill a role.** UC-002 lets the author assign "several to one role where the role allows it", but no requirement,
no field of the model schema and no architecture says whether a role allows it. `A ROLE NAMES HOW MANY FILL IT` makes the
model say it, so that a role assignment can give Kanban and the V-model as many developers, testers and reviewers as the
work needs, and Scrum one Product Owner per team.

**Three things, three places.** Who exists stands in the instance's one list (UC-017); how the product is developed in its
process declaration (UC-002); who fills which role in its role assignment (UC-048). Each file has one responsibility and
each thing stands in one place (ch. 12, *One Thing at a Time*; ch. 10, DRY). The role assignment is the same kind of file
in every model — the model only decides how many there may be —, so a product that changes its model keeps it (ch. 10,
least astonishment, open–closed). The process offers its roles and the role assignment fills them; neither knows the
inside of the other (ch. 10, develop against interfaces).

**Not changed, and why that is enough.** `THE PROCESS MODEL IS DECLARED PER PRODUCT` and `A PRODUCT DECLARES ITS DEFINITION
OF DONE` keep holding: there is one process declaration, so every team works under the same model and the same Definition
of Done. A participant's name needs no rule of its own: the one list holds each name once (MOD-participant-list: "unique in
the register"). Several teams are bound to a model that works in sprints, not to the practice of the scaling layers: the
catalogue names no machine-readable mark by which a practice could permit teams (`THE CATALOGUE IS DATA`).

**Why.** PO, 2026-10-10: a SCRUM team is implementing Agent M, but the SPEC and the use cases do not consider several teams
working on the code in parallel; "we have to be able to set up multiple teams". — "Participants have one file. Teams have
one file each. The process itself is not affected by who is doing it." — On a draft that gave every product teams: "This
is not true. It only applies to SCRUM." — "it names roles that are to be filled by participants. This is true for all
software processes." — "Kanban should have a variable number of testers, reviewers and developers. Same for v-model."
Team 2 was set up with a participant list and a process declaration of its own, `docs/participants_team2.md` and
`docs/process_team2.md`, under the rule's present wording; setting it up kept the name `scrum-master-session` and gave it
another agent (commits `4a246fa`, `60e71af`). PO: "We have to be clear in the spec."

**Impact list** (`git grep` at `main`): `PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE` stands in SPEC.md, ARC-046,
MOD-participant-list, ITM-216, ITM-230, UC-017, `src/participant-list/participants.schema.md`,
`tests/documents-findings.test.mjs`, `tests/participant-list-reader.test.mjs`, `tests/participant-list.test.mjs` and the
fixtures of sprint 02. The other five names are new. Once accepted: the model schema gains how many fill a role, and the
catalogue says it for each role of its models — Kanban gains testers; MOD-product-process reads the roles' holders from
the role assignments instead of the declaration's `## Roles`. In this instance, `docs/participants_team2.md` goes into
`docs/participants.md`, where `akmaier` stands once and the two agents now named `scrum-master-session` need a name each;
the role tables of `docs/process.md` and `docs/process_team2.md` become `docs/role-assignments/team1.md` and
`docs/role-assignments/team2.md`, and `docs/process_team2.md` goes.
