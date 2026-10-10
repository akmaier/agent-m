# 5. Process models and practices: any number of teams, and what a participant's name names

**The change.** `PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE` names the further lists `docs/participants_<name>.md`
beside `docs/participants.md`; its name and its check file are kept, the check gains a case and a counter-proof.
`A PARTICIPANT'S NAME NAMES ONE PERSON OR AGENT` follows it. Three new requirements at the section's end: in a model with sprints a product may be developed by any
number of teams, each assigning the roles of the product's model in a declaration of its own; a product whose
declaration names no team has one team; a participant may serve several teams. The rest of the section is carried
over byte for byte.

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
sprints because the coordination of entry 02 is that of sprints. A declaration of its own per team is the way of
working in use: Team 2 is declared in `docs/process_team2.md`, beside `docs/process.md`.

**Why the participants' two sentences.** They change nothing in how the instance works; they say what it does. The
SPEC named one list and did not say whether an instance may keep others; the register and MOD-participant-list say
"one row per participant" and "unique in the register", and did not say whether rows of one name in two lists are one
participant. Readers filled both gaps, and differently. Setting up Team 2 kept the name `scrum-master-session` and gave it
another agent: commit `4a246fa` ("replace Opus with Sol and Sonnet with Terra") renamed `po-opus` to `po-sol` and every
other Opus or Sonnet participant likewise, but changed only the model, processing place and route of
`scrum-master-session`; `60e71af` restored the Claude row in `docs/participants.md` and copied the Sol row into
`docs/participants_team2.md`. Drafting this queue, an agent read the one named list as the only one allowed, and the
two rows of `akmaier` as two participants. PO, 2026-10-10: "The rule is not violated in both teams akmaier is the same
entity." — "We have to be clear in the spec."

**Decisions of the PO, 2026-10-10:** any participant may serve several teams; "it can be more than two teams. I don't want
to introduce a restriction from what we are currently doing."

**Impact list** (`git grep` at `main`): `PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE` stands in SPEC.md, ARC-046,
MOD-participant-list, ITM-216, ITM-230, UC-017, `src/participant-list/participants.schema.md`,
`tests/documents-findings.test.mjs`, `tests/participant-list-reader.test.mjs`, `tests/participant-list.test.mjs` and the
fixtures of sprint 02. The other four names are new. Once accepted, the declarations name their teams, and one of the two
agents now named `scrum-master-session` gets a name of its own; `akmaier`, the same person in both lists, stays.
