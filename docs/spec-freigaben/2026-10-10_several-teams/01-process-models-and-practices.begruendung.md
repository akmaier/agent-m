# 5. Process models and practices: teams, their lists and their declarations under one convention

**The change.** `PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE` lists the participants in one list
`docs/participants_<team>.md` per team, and each team assigns its roles from its own list; its name and its check file are
kept, the check gains a case and counter-proofs. `A PARTICIPANT'S NAME NAMES ONE PERSON OR AGENT` follows it. At the
section's end: a product is developed by one or more teams, each declared in `docs/process_<team>.md`; more than one
team only in a model with sprints; a participant may serve several teams. The rest of the section is carried over byte
for byte.

**Not changed, and why that is enough.** `THE PROCESS MODEL IS DECLARED PER PRODUCT` and `A PRODUCT DECLARES ITS
DEFINITION OF DONE` keep holding with several declarations: a product still declares exactly one model and one
Definition of Done, so every team's declaration names the same ones. The check of `A PRODUCT IS DEVELOPED BY TEAMS`
carries both counter-proofs. The backlog stays the product's one backlog (`THE BACKLOG LIVES IN THE PRODUCT REPOSITORY`).

**Why.** PO, 2026-10-10: a SCRUM team is implementing Agent M, but the SPEC and the use cases do not consider several teams
working on the code in parallel; "we have to be able to set up multiple teams". The book makes the shared artifacts the
synchronisation between parallel teams — "If several teams or several agents work in parallel, these artifacts prevent
duplicated work and conflicting assumptions" (Vibe Coding, ch. 7, Scrum artifacts) — and warns that scaling works "only
when additional coordination structure grows with the team" (ch. 7, Brooks's law). More than one team is bound to models
with sprints because the coordination of entry 02 is that of sprints.

One convention for every team: PO, 2026-10-10, on keeping `docs/participants.md` beside `docs/participants_team2.md`:
"Teams are part of the process. I don't like that one of the participants files peters out. They should all follow the
same convention." A team is part of a product's process, so its declaration stands in the product's repository; its
participants are configured in the instance, so its list stands there; the team's name joins the two —
`docs/participants_team2.md` and `docs/process_team2.md`, as Team 2 works now, and Team 1 alike.

What a name names: the SPEC named one list and did not say whether rows of one name in two lists are one participant;
the register and MOD-participant-list say "one row per participant" and "unique in the register". Readers filled the
gap differently. Setting up Team 2 kept the name `scrum-master-session` and gave it another agent: commit `4a246fa`
("replace Opus with Sol and Sonnet with Terra") renamed `po-opus` to `po-sol` and every other Opus or Sonnet participant
likewise, but changed only the model, processing place and route of `scrum-master-session`; `60e71af` restored the Claude
row in `docs/participants.md` and copied the Sol row into `docs/participants_team2.md`. Drafting this queue, an agent read
the one named list as the only one allowed, and the two rows of `akmaier` as two participants. PO, 2026-10-10: "The rule
is not violated in both teams akmaier is the same entity." — "We have to be clear in the spec."

**Decisions of the PO, 2026-10-10:** any participant may serve several teams; "it can be more than two teams. I don't want
to introduce a restriction from what we are currently doing."; one convention for the files of every team.

**Impact list** (`git grep` at `main`): `PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE` stands in SPEC.md, ARC-046,
MOD-participant-list, ITM-216, ITM-230, UC-017, `src/participant-list/participants.schema.md`,
`tests/documents-findings.test.mjs`, `tests/participant-list-reader.test.mjs`, `tests/participant-list.test.mjs` and the
fixtures of sprint 02. The other four names are new. The dashboard reads `docs/participants.md`
(`src/participant-list/participants.schema.md`) and `docs/process.md` (`src/product-process/declaration.schema.md`,
`src/home/progress.mjs`): once accepted, MOD-participant-list and MOD-product-process change, and `docs/participants.md`
and `docs/process.md` become `docs/participants_team1.md` and `docs/process_team1.md` together with the code that reads
them. One of the two agents now named `scrum-master-session` gets a name of its own; `akmaier`, the same person in both
lists, stays.
