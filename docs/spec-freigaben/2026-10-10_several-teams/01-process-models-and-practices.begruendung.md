# 5. Process models and practices: participants, process and teams, each configured once

**The change.** The rule of `PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE` says outright that `docs/participants.md` is the
instance's one list of all its participants, and that every team assigns its roles from it; its name and its check file
are kept, the check gains a case and counter-proofs. At the section's end: a product is developed by one or more teams,
each in a file `docs/teams/<team>.md` that only assigns the roles of the product's process model; the process
declaration names no participant; more than one team only in a model with sprints; a participant may serve several
teams. The rest of the section is carried over byte for byte.

**Three things, three places.**

| What | Configured in | Decided in |
|---|---|---|
| who exists — people and agents | the instance: `docs/participants.md` | UC-017 |
| how the product is developed — model, practices, branches, Definition of Done | the product: its process declaration | UC-002 |
| who holds which role of that process | the product: `docs/teams/<team>.md`, one per team | UC-048 |

Each file has one responsibility, and each thing stands in one file (Vibe Coding, ch. 12, "One Thing at a Time"; ch. 10,
DRY). Adding a team adds a file and changes no other (ch. 10, open–closed). The process offers its roles, and a team only
fills them; neither knows the inside of the other (ch. 10, develop against interfaces).

**Not changed, and why that is enough.** `THE PROCESS MODEL IS DECLARED PER PRODUCT` and `A PRODUCT DECLARES ITS
DEFINITION OF DONE` keep holding: there is one process declaration, so every team works under the same model and the
same Definition of Done without a rule that keeps copies equal. A participant's name needs no rule of its own: the one
list holds each name once (MOD-participant-list: "unique in the register"). The backlog stays the product's one backlog
(`THE BACKLOG LIVES IN THE PRODUCT REPOSITORY`).

**Why.** PO, 2026-10-10: a SCRUM team is implementing Agent M, but the SPEC and the use cases do not consider several teams
working on the code in parallel; "we have to be able to set up multiple teams". The book makes the shared artifacts the
synchronisation between parallel teams — "If several teams or several agents work in parallel, these artifacts prevent
duplicated work and conflicting assumptions" (ch. 7, Scrum artifacts) — and warns that scaling works "only when additional
coordination structure grows with the team" (ch. 7, Brooks's law). More than one team is bound to models with sprints
because the coordination of entry 02 is that of sprints.

PO, 2026-10-10: "I think the root cause for the irritation is that participants and teams are configured in the same
file." — "Participants have one file. Teams have one file each. The process itself is not affected by who is doing it."
Team 2 was set up with a participant list and a process declaration of its own, `docs/participants_team2.md` and
`docs/process_team2.md`, under the rule's present wording. Readers then filled what that wording left open differently.
Setting up Team 2 kept the name `scrum-master-session` and gave it another agent: commit `4a246fa` ("replace Opus with Sol
and Sonnet with Terra") renamed `po-opus` to `po-sol` and every other Opus or Sonnet participant likewise, but changed only
the model, processing place and route of `scrum-master-session`; `60e71af` restored the Claude row in
`docs/participants.md` and copied the Sol row into `docs/participants_team2.md`. Drafting this queue, an agent read the one
named list as the only one allowed, and the two rows of `akmaier` as two participants. PO: "We have to be clear in the
spec."

**Decisions of the PO, 2026-10-10:** any participant may serve several teams; more than two teams; one list of
participants with the instance; one file per team with the product; a process that names no one.

**Impact list** (`git grep` at `main`): `PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE` stands in SPEC.md, ARC-046,
MOD-participant-list, ITM-216, ITM-230, UC-017, `src/participant-list/participants.schema.md`,
`tests/documents-findings.test.mjs`, `tests/participant-list-reader.test.mjs`, `tests/participant-list.test.mjs` and the
fixtures of sprint 02. The other four names are new. The roles' holders stand today in the process declaration
(`src/product-process/declaration.schema.md`, `## Roles`): once accepted, MOD-product-process reads them from the team
files. In this instance, `docs/participants_team2.md` then goes into `docs/participants.md`, where `akmaier` stands once
and the two agents now named `scrum-master-session` need a name each; the role tables of `docs/process.md` and
`docs/process_team2.md` become `docs/teams/team1.md` and `docs/teams/team2.md`, and `docs/process_team2.md` goes.
