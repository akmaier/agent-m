# 5. Process models and practices: one list of participants, one declaration per team

**The change.** The rule of `PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE` says outright that `docs/participants.md` is the
instance's one list of all its participants, and that every team assigns its roles from it; its name and its check file
are kept, the check gains a case and counter-proofs. At the section's end: a product is developed by one or more teams,
each declared in `docs/process_<team>.md`; more than one team only in a model with sprints; a participant may serve
several teams. The rest of the section is carried over byte for byte.

**Not changed, and why that is enough.** `THE PROCESS MODEL IS DECLARED PER PRODUCT` and `A PRODUCT DECLARES ITS
DEFINITION OF DONE` keep holding with several declarations: a product still declares exactly one model and one
Definition of Done, so every team's declaration names the same ones. The check of `A PRODUCT IS DEVELOPED BY TEAMS`
carries both counter-proofs. The backlog stays the product's one backlog (`THE BACKLOG LIVES IN THE PRODUCT REPOSITORY`).
A participant's name needs no rule of its own: the one list holds each name once (MOD-participant-list: "unique in the
register").

**Why.** PO, 2026-10-10: a SCRUM team is implementing Agent M, but the SPEC and the use cases do not consider several teams
working on the code in parallel; "we have to be able to set up multiple teams". The book makes the shared artifacts the
synchronisation between parallel teams — "If several teams or several agents work in parallel, these artifacts prevent
duplicated work and conflicting assumptions" (Vibe Coding, ch. 7, Scrum artifacts) — and warns that scaling works "only
when additional coordination structure grows with the team" (ch. 7, Brooks's law). More than one team is bound to models
with sprints because the coordination of entry 02 is that of sprints.

Participants and teams apart. PO, 2026-10-10: "I think the root cause for the irritation is that participants and teams are
configured in the same file. We have only one list of participants but multiple files for teams. This would make sense.
Participants with process/instance teams with products." The irritation: Team 2 was set up with a participant list of
its own, `docs/participants_team2.md`, beside `docs/participants.md`, under the rule's present wording. Readers then
filled what that wording left open differently. Setting up Team 2 kept the name `scrum-master-session` and gave it another
agent — commit `4a246fa` ("replace Opus with Sol and Sonnet with Terra") renamed `po-opus` to `po-sol` and every other
Opus or Sonnet participant likewise, but changed only the model, processing place and route of `scrum-master-session`, and
`60e71af` restored the Claude row in `docs/participants.md` and copied the Sol row into `docs/participants_team2.md`.
Drafting this queue, an agent read the one named list as the only one allowed, and the two rows of `akmaier` as two
participants. PO: "We have to be clear in the spec." With one list of all participants and a file per team, a
participant is configured once, and a team only names whom it assigns.

**Decisions of the PO, 2026-10-10:** any participant may serve several teams; more than two teams; one list of
participants with the instance, one file per team with the product; one convention for every team's file.

**Impact list** (`git grep` at `main`): `PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE` stands in SPEC.md, ARC-046,
MOD-participant-list, ITM-216, ITM-230, UC-017, `src/participant-list/participants.schema.md`,
`tests/documents-findings.test.mjs`, `tests/participant-list-reader.test.mjs`, `tests/participant-list.test.mjs` and the
fixtures of sprint 02. The other three names are new. Once accepted, `docs/participants_team2.md` goes into
`docs/participants.md`, where `akmaier` stands once and the two agents now named `scrum-master-session` need a name each;
and `docs/process.md` becomes `docs/process_team1.md` together with the code that reads it
(`src/product-process/declaration.schema.md`, `src/home/progress.mjs`).
