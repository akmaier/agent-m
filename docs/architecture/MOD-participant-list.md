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
provides:
  - Participant
  - Capability
  - Need
  - Eligibility
  - participantSchema
  - eligible
  - differs
---
# MOD-participant-list The participants of an instance and who may do a job

## Responsibility

It belongs to Participants and jobs (ARC-046). It defines the register of the people and agents who work on the
instance's products — the instance's `docs/participants.md` (`PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE`) — and
decides which of them may do a given job: the capabilities the job or role needs (`A ROLE NAMES THE CAPABILITIES IT
NEEDS`), the places its data may go (`RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS`, `THE PLACES A MAILBOX'S
MAIL MAY GO ARE CONFIGURED`), the context it must hold, and that a reviewer or checker is neither the drafter nor uses
the drafter's model (`NO REVIEWER IS THE DRAFTER`, `NO CHECKER IS THE REWRITER`). It runs unchanged in a browser and in
Node; it keeps no state and performs no input or output: the register's text is read by its callers through
MOD-documents with the schema this module gives.

## Parts

- `index.mjs` — the interface.
- `participants.schema.md` — the schema of the register, in the schema language of MOD-documents.
- `eligibility.mjs` — the rules of `eligible` and `differs`.

## Data

**The register `docs/participants.md`** of the instance repository: a title, a sentence on what the register is, and one
table with one row per participant. No key, token or password ever stands in it (`NO SECRET IN THE REPOSITORY`).

| Column | Type | Required | What it holds |
|---|---|---|---|
| Name | a name of lower-case letters, digits and hyphens, unique in the register | always | how roles, jobs and runs name the participant |
| Type | one of `person`, `model endpoint`, `CI agent`, `CLI agent`, `sandboxed agent` | always | `A PARTICIPANT HAS ONE OF FIVE TYPES` |
| Model | the identifier of the model it uses | for every type but `person`, which has `—` | `A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL` |
| Context | the number of tokens its model's context holds, or `—` | no | what a job is checked against before it is sent; without it, no job is sent to the participant |
| Price | `<input> / <output> <currency> per million tokens`, or `—` | no | how reported usage is priced; without it a cost is shown as usage, price unknown (`NO COST IS GUESSED`) |
| Capabilities | a comma-separated list from `draft text`, `read the repository`, `write to the repository`, `run code and tests`, `use tools`, `reach the web` | always | `A PARTICIPANT DECLARES ITS CAPABILITIES` |
| Processing place | where the data given to it is processed, in words, for example `this machine` or `NHR@FAU, Erlangen` | for every type but `person`, which has `—` | `A PARTICIPANT DECLARES WHERE IT PROCESSES DATA` |
| Route | how Agent M reaches it, by type: `account <server>/<account>` for a person; `endpoint <name>` for a model endpoint configured in a browser, or `bridge <bridge> server <name>` for a model server behind a Bridge; `ci hosted secret <NAME>` or `ci runner:<label> secret <NAME>` for a CI agent, naming the CI secret that holds its key; `bridge <bridge or remote session> agent <claude, codex or opencode>` for a CLI agent or a sandboxed agent | always | where a job for it is sent; the secret by name only |

The schema states which column is required for which type, so that MOD-documents rejects a CLI-agent row without a model
and accepts a person's row without one. An example row:

```markdown
| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |
|---|---|---|---|---|---|---|---|
| reviewer-b | CLI agent | example-model | 200000 | — | draft text, read the repository | this machine | bridge lab-pc agent claude |
```

## Interfaces

- `Participant` — `{ name: string, type: "person" | "model endpoint" | "CI agent" | "CLI agent" | "sandboxed agent",
  model: string | null, context: number | null, price: { input: number, output: number, currency: string } | null,
  capabilities: Capability[], place: string | null, route: string }`: one row of the register as MOD-documents reads it
  with this module's schema.
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
  it; this module offers no reader of its own.
- `eligible(participants: Participant[], need: Need) -> Eligibility` — which participants may do the job, and for each one
  left out every reason, in words a person can act on: a capability it lacks, named; a processing place a source or the
  mailbox does not allow, naming both; a context smaller than the size of the job, or none declared; that it is, or uses
  the model of, a participant it must differ from. It judges capabilities, places, context and difference only; a
  person holds roles and decides, but is no driver of a job, so a caller choosing who receives a job asks among the other
  four types. The caller must give the places of every restricted source whose content is part of the job; a source it
  leaves out is treated as allowing no place.
- `differs(a: Participant, b: Participant) -> boolean` — true when the two are different participants and name different
  models; false when either names no model. A reviewer must differ from the drafter, and each of three checkers from the
  rewriter and from each other.

## Files

It reads its own data file `participants.schema.md`. The register `docs/participants.md` of the instance is read and
written by its callers, through MOD-documents with `participantSchema`, and committed through Access.

## Uses

- `MOD-documents.loadSchema` — to load the register's schema from its data file.
- `MOD-documents.Schema` — the type `participantSchema` returns.
