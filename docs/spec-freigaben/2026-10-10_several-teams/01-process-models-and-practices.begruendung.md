# 5. Process models and practices: any number of teams, from participants in several lists

**The change.** `PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE` admits further lists `docs/participants_<name>.md` beside
`docs/participants.md`; its name and its check file are kept, the check gains a case and a counter-proof.
`A PARTICIPANT'S NAME NAMES ONE PARTICIPANT` follows it. At the section's end: in a model with sprints a product may
be developed by any number of teams, each assigning the roles of the product's model in a declaration of its own; a
product whose declaration names no team has one team; a participant may serve several teams.

**Not changed, and why that is enough.** `THE PROCESS MODEL IS DECLARED PER PRODUCT` and `A PRODUCT DECLARES ITS
DEFINITION OF DONE` keep holding with several declarations: a product still declares exactly one model and one
Definition of Done, so every team's declaration names the same ones. The check of `A PRODUCT MAY BE DEVELOPED BY SEVERAL
TEAMS` carries both counter-proofs. The backlog stays the product's one backlog (`THE BACKLOG LIVES IN THE PRODUCT
REPOSITORY`).

**Why.** PO, 2026-10-10: a SCRUM team is implementing Agent M, but the SPEC and the use cases do not consider several teams
working on the code in parallel; "we have to be able to set up multiple teams". The book makes the shared artifacts the
synchronisation between parallel teams — "If several teams or several agents work in parallel, these artifacts prevent
duplicated work and conflicting assumptions" (Vibe Coding, ch. 7, Scrum artifacts) — and warns that scaling works "only
when additional coordination structure grows with the team" (ch. 7, Brooks's law). Teams are bound to models with
sprints because the coordination of entry 02 is that of sprints.

The further participant lists keep the way of working in use: Team 2 is declared in `docs/process_team2.md` from
`docs/participants_team2.md`, beside `docs/process.md` and `docs/participants.md`. `A PARTICIPANT'S NAME NAMES ONE
PARTICIPANT` carries the uniqueness that MOD-participant-list already gives a name within its register across the
lists, while one participant may stand in several lists, as `akmaier` does:
roles, jobs and runs name a participant by its name (MOD-participant-list), and so does the independence of a gate's
decider (`A GATE IS NOT DECIDED BY THE PARTICIPANT WHOSE WORK IT CHECKS`).

**Decisions of the PO, 2026-10-10:** any participant may serve several teams; "it can be more than two teams. I don't want
to introduce a restriction from what we are currently doing."

**Impact list** (`git grep` at `main`): `PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE` stands in SPEC.md, ARC-046,
MOD-participant-list, ITM-216, ITM-230, UC-017, `src/participant-list/participants.schema.md`,
`tests/documents-findings.test.mjs`, `tests/participant-list-reader.test.mjs`, `tests/participant-list.test.mjs` and the
fixtures of sprint 02. The other four names are new. Once accepted, the declarations name their teams, and
`scrum-master-session`, which `docs/participants.md` and `docs/participants_team2.md` hold with different models, either
gets entries that agree or, where it is two participants, a name of its own each; `akmaier`, held by both with the same
entry, stays as it is.
