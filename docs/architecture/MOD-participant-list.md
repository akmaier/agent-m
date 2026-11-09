---
id: MOD-participant-list
title: The participants of an instance and who may do a job
folder: src/participant-list/
realises:
follows:
  - ARC-046
uses:
  - MOD-documents.loadSchema
  - MOD-documents.Schema
  - MOD-documents.Document
provides:
  - Participant
  - Connection
  - Capability
  - Need
  - Eligibility
  - participantSchema
  - participantsOf
  - eligible
  - differs
---
# MOD-participant-list The participants of an instance and who may do a job

## Responsibility

It belongs to Participants and jobs (ARC-046). It defines the register of the people and agents who work on the
instance's products — the instance's `docs/participants.md` (`PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE`): each a
name, a person or an agent, and an agent's model (`A PARTICIPANT IS A PERSON OR AN AGENT`, `A PARTICIPANT BASED ON A
LANGUAGE MODEL NAMES ITS MODEL`). It joins each agent with the connections that offer its model — the model endpoints and
the coding agents of Bridges that a browser's settings keep, each with its place, its capabilities and the context and
price of each model it offers (`A CONNECTION NAMES THE MODELS IT OFFERS`, `A CONNECTION DECLARES ITS CAPABILITIES`,
`A CONNECTION DECLARES WHERE IT PROCESSES DATA`) —, so that a job runs on a connection that offers its participant's
model (`A JOB RUNS ON A CONNECTION THAT OFFERS ITS PARTICIPANT'S MODEL`); and it decides which of them may do a given
job: the capabilities the job or role needs (`A ROLE NAMES THE CAPABILITIES IT NEEDS`), the places its data may go
(`RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS`, `THE PLACES A MAILBOX'S MAIL MAY GO ARE CONFIGURED`), the
context it must hold, and that a reviewer or checker is neither the drafter nor uses the drafter's model (`NO REVIEWER IS
THE DRAFTER`, `NO CHECKER IS THE REWRITER`). It runs unchanged in a browser and in Node; it keeps no state and performs
no input or output: the register's text is read by its callers through MOD-documents with the schema this module gives,
the connections are read by MOD-prompt-bar's `endpointsOffered` and `sessionsOffered` from the browser's settings, and
`participantsOf` joins what they read.

## Parts

- `index.mjs` — the interface.
- `participants.schema.md` — the schema of the register, in the schema language of MOD-documents.
- `eligibility.mjs` — the join of `participantsOf`, and the rules of `eligible` and `differs`.

## Data

**The register `docs/participants.md`** of the instance repository: a title, a sentence on what the register is, and one
table with one row per participant. No key, token or password ever stands in it (`NO SECRET IN THE REPOSITORY`), and
nothing of how an agent is reached: that is its connection's, kept in a browser (MOD-browser-store).

| Column | Type | Required | What it holds |
|---|---|---|---|
| Name | a name of lower-case letters, digits and hyphens, unique in the register; a person's is their account on the instance's server | always | how roles, jobs and runs name the participant |
| Type | `person` or `agent` | always | `A PARTICIPANT IS A PERSON OR AN AGENT` |
| Model | the identifier of the model it works with | for an agent; a person has `—` | `A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL`; the model its jobs run with |

The schema states that `Model` is required for an agent, so that MOD-documents rejects an agent's row without a model and
accepts a person's row without one. An example:

```markdown
| Name | Type | Model |
|---|---|---|
| akmaier | person | — |
| reviewer-b | agent | example-model |
```

## Interfaces

- `Connection` — `{ name: string, type: "model endpoint" | "CLI agent", model: string, context: number, price: { input:
  number, output: number, currency: string } | null, capabilities: Capability[], place: string, route: string }`: one
  model that one connection offers, as a browser's settings declare it — a model endpoint offers one, a coding agent of a
  Bridge one for each model it can run (MOD-browser-store, `endpoint:<name>` and `session:<bridge>:<agent>`). `name` is
  the connection's — `<endpoint>` or `<bridge>:<agent>` —; `route` how Agent M reaches it, `endpoint <name>`, with
  ` secret <NAME>` where its settings name the CI secret of its key, or `bridge <bridge> agent <agent>`. MOD-prompt-bar's
  `endpointsOffered` and `sessionsOffered` read them; a connection the prompt bar offers is handed to the job runner as
  it is, as a participant (`THE PROMPT BAR'S ENDPOINTS AND CLI SESSIONS ARE BOUND AS PARTICIPANTS ARE`).
- `Participant` — `{ name: string, type: "person" | "agent" | "model endpoint" | "CLI agent", model: string | null, context: number
  | null, price: { input: number, output: number, currency: string } | null, capabilities: Capability[], place: string |
  null, route: string | null }`: who does a job and where it runs — a person of the register; an agent of the register on
  one connection that offers its model, with the agent's `name` and `model` and the connection's `type`, `context`,
  `price`, `capabilities`, `place` and `route`; or a connection the prompt bar offers, which has this shape already. A
  person has no model, no context, no capabilities, no place and no route; an agent that no connection given offers its
  model keeps the type `agent`, with no context, no capabilities, no place and no route.
- `Capability` — `"draft text" | "read the repository" | "write to the repository" | "run code and tests" | "use tools" |
  "reach the web"`.
- `Need` — `{ capabilities: Capability[], size?: number, places?: { from: string, allowed: string[] }[], notLike?:
  Participant[] }`: what a job or a role demands of whoever does it — the capabilities; the size of what would be sent, in
  tokens; for each restricted source or mailbox whose content is part of the job, the places it allows (`from` names the
  source or mailbox); and the participants it must differ from.
- `Eligibility` — `{ eligible: Participant[], leftOut: { participant: Participant, reasons: string[] }[] }`: every
  participant considered appears in exactly one of the two lists.
- `participantSchema() -> Schema` — the schema of `docs/participants.md`, read from this module's data file with
  MOD-documents' `loadSchema`. Callers read and write the register through MOD-documents with it, and build forms from
  it.
- `participantsOf(register: Document, connections: Connection[]) -> Participant[]` — the participants of a register read
  with `participantSchema`, in its order: a person once; an agent once for each connection among `connections` whose
  `model` is the agent's, in their order, and once without a route where none is. Pure. It judges no row: a row's errors
  are those `documentFindings` names with `participantSchema`. A caller in Node that has no browser's settings — a job in
  CI, on a Bridge — passes the connection its job names (MOD-runtimes, MOD-workflow-entries).
- `eligible(participants: Participant[], need: Need) -> Eligibility` — which participants may do the job, and for each one
  left out every reason, in words a person can act on: that no connection offers its model, naming the model; a
  capability its connection lacks, named; a processing place of its connection that a source or the mailbox does not
  allow, naming both; a context of its model on its connection smaller than the size of the job; that it is, or uses the
  model of, a participant it must differ from. It judges connections, capabilities, places, context and difference only;
  a person holds roles and decides, but is no driver of a job, so a caller choosing who receives a job asks among the
  others. The caller must give the places of every restricted source whose content is part of the job; a source it
  leaves out is treated as allowing no place.
- `differs(a: Participant, b: Participant) -> boolean` — true when the two are different participants and name different
  models; false when either names no model. A reviewer must differ from the drafter, and each of three checkers from the
  rewriter and from each other. Of one agent on two connections, neither differs from the other.

## Files

It reads its own data file `participants.schema.md`. The register `docs/participants.md` of the instance is read and
written by its callers, through MOD-documents with `participantSchema`, and committed through Access.

## Uses

- `MOD-documents.loadSchema` — to load the register's schema from its data file.
- `MOD-documents.Schema` — the type `participantSchema` returns.
- `MOD-documents.Document` — the register `participantsOf` turns into participants.
