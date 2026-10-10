# 5. Process models and practices: any number of teams

**The change.** Three new requirements at the section's end: in a model with sprints a product may be developed by any
number of teams, each assigning the roles of the product's model in a declaration of its own; a product whose
declaration names no team has one team; a participant may serve several teams. No existing requirement of the section
changes.

**Not changed, and why that is enough.** `THE PROCESS MODEL IS DECLARED PER PRODUCT` and `A PRODUCT DECLARES ITS
DEFINITION OF DONE` keep holding with several declarations: a product still declares exactly one model and one
Definition of Done, so every team's declaration names the same ones. The check of `A PRODUCT MAY BE DEVELOPED BY SEVERAL
TEAMS` carries both counter-proofs. The backlog stays the product's one backlog (`THE BACKLOG LIVES IN THE PRODUCT
REPOSITORY`), and the teams assign their roles from the instance's participants (`PARTICIPANTS ARE CONFIGURED ONCE PER
INSTANCE`).

**Why.** PO, 2026-10-10: a SCRUM team is implementing Agent M, but the SPEC and the use cases do not consider several teams
working on the code in parallel; "we have to be able to set up multiple teams". The book makes the shared artifacts the
synchronisation between parallel teams — "If several teams or several agents work in parallel, these artifacts prevent
duplicated work and conflicting assumptions" (Vibe Coding, ch. 7, Scrum artifacts) — and warns that scaling works "only
when additional coordination structure grows with the team" (ch. 7, Brooks's law). Teams are bound to models with
sprints because the coordination of entry 02 is that of sprints. A declaration of its own per team is the way of
working in use: Team 2 is declared in `docs/process_team2.md`, beside `docs/process.md`.

**Decisions of the PO, 2026-10-10:** any participant may serve several teams; "it can be more than two teams. I don't want
to introduce a restriction from what we are currently doing."

**Impact list:** the three names are new and stand nowhere yet. Once accepted, the declarations name their teams.
