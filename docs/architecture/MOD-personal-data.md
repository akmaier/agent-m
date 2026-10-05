---
id: MOD-personal-data
title: Keeping a mail's people out of everything Agent M writes
folder: src/personal-data/
realises:
follows:
  - ARC-044
uses:
  - MOD-documents.loadSchema
  - MOD-documents.Schema
  - MOD-documents.Document
  - MOD-text-tools.finding
  - MOD-text-tools.Finding
  - MOD-participant-list.eligible
  - MOD-participant-list.differs
  - MOD-job-runner.Strategies
provides:
  - peopleIn
  - personHits
  - checkersFor
  - settingsSchemas
  - pseudonymisationOf
  - namedPersonFindings
  - privacyStrategies
  - MailText
  - People
  - Hit
---
# MOD-personal-data Keeping a mail's people out of everything Agent M writes

## Responsibility

It belongs to Issues and mail (ARC-044). It knows who the people of a mail are and finds them in any text drawn from
that mail, so that nothing Agent M writes carries them (`NO PERSONAL DATA FROM A MAIL ENTERS A REPOSITORY`, `A TEXT FROM
A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE`). It chooses the three participants that check a rewritten text, defines the
product's settings and collaborators files, and checks that a generated artifact names a person only by account or with
consent. Its functions are pure; it runs in the browser and in Node.

## Parts

- `index.mjs` — the interface.
- `people.mjs` — the people of a mail, and the search of a text for them.
- `checkers.mjs` — the choice of the three checking participants.
- `consent.mjs` — names in generated artifacts against accounts and consenting collaborators.
- `strategies.mjs` — the recipe `report-data` and the check `people-search`.
- `settings.schema.md`, `collaborators.schema.md` — the schemas of the product's two files.

## Data

It keeps nothing beyond a call: the people of a mail exist only in memory while a mail is handled, and are never written.

**The settings file** `docs/settings.md` of a product, a document of the common shape (MOD-documents reads it by
`settings.schema.md`): front matter with the key `pseudonymisation`, whose value is `on` or `off`; no required section.
A missing file, or a missing key, means `on` (`PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF`).

```markdown
---
pseudonymisation: off
---
# Settings of this product
```

**The collaborators file** `docs/collaborators.md` of a product, a register read by `collaborators.schema.md`: one row
per person who agreed to be named in the repository, with the columns *Name* (as the person wishes to be named),
*Account* (their account on the product's server) and *Agreed* (`yes`). Who added a row, and when, is the commit's.

```markdown
| Name | Account | Agreed |
|---|---|---|
| Ada Example | ada-example | yes |
```

## Interfaces

- `MailText` — `{ addresses: { name: string | null, address: string }[], text: string }`: what this module reads of a
  mail — the addresses and display names of all its address headers, and its text with its signature. The caller builds
  it from the mail it holds.
- `People` — `{ names: string[], addresses: string[], phones: string[], accounts: string[] }`.
- `peopleIn(mail: MailText) -> People` — every address and display name of the mail's headers, and every name, address,
  phone number and account handle found in its text and its signature. Deterministic; a person found twice is listed
  once.
- `Hit` — `{ kind: "name" | "address" | "phone" | "account", value: string, line: number, column: number }`.
- `personHits(text: string, people: People) -> Hit[]` — every place in `text` where one of `people` appears: names also by
  their parts, addresses also by their local part, phone numbers by their digits whatever the separators, regardless of
  case. An empty result means the text names none of them; it says nothing about people the mail does not name.
- `checkersFor(participants: Participant[], rewriter: Participant, places: string[]) -> { checkers: Participant[] } | {
  missing: string }` — three participants that work with a language model, each at one of the processing places the
  mailbox allows, with three different models, none of them the rewriter and none using the rewriter's model (`A
  REWRITTEN TEXT IS CHECKED BY THREE LLMS`, `NO CHECKER IS THE REWRITER`); or, when there are not three, what is missing,
  in a sentence the page shows. `Participant` is MOD-participant-list's.
- `settingsSchemas() -> Promise<{ settings: Schema, collaborators: Schema }>` — the schemas of the two files, for
  MOD-documents and for the forms of the settings page.
- `pseudonymisationOf(settings: Document | null) -> "on" | "off"` — whether report data from mails is rewritten without
  persons for this product; `null` — no settings file — is `on`.
- `namedPersonFindings(text: string, artifact: string, known: People, collaborators: Document | null, accounts: string[])
  -> Finding[]` — one error for every name of a known person — from a mail, or any other person the caller knows of —
  that occurs in a generated artifact and is neither an account on the server nor a collaborator who agreed (`A PERSON IS
  NAMED BY ACCOUNT OR WITH CONSENT`); the finding names the artifact and line. A collaborator's name passes.
- `privacyStrategies` — the strategies this module offers the job runner, of MOD-job-runner's type `Strategies`:
  - recipe `report-data` — the parts a rewriting participant receives: the report data the person picked from one mail —
    the text of its attachments, logs, error messages, a screenshot's text, data files —, each a part of its own. The
    mail's people go into the job's context for the check, never into a part. Errors: `PlaceNotAllowed` when the
    participant's processing place is not among the places the mailbox allows (`THE PLACES A MAILBOX'S MAIL MAY GO ARE
    CONFIGURED`); nothing is then sent.
  - check `people-search` — an error finding for every hit of the context's people in a draft (`personHits`), naming
    the line, under the rule `A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE`. Every text drawn from a mail passes
    it before it is written anywhere.

## Files

It reads the schemas in its folder. `docs/settings.md` and `docs/collaborators.md` of a product are read and written by
the caller through MOD-documents and Access with these schemas; this module writes no file.

## Uses

- `MOD-documents.loadSchema` — reading its two schemas.
- `MOD-documents.Schema`, `MOD-documents.Document` — the types of a schema and of a document read by it.
- `MOD-text-tools.finding`, `MOD-text-tools.Finding` — the findings of `namedPersonFindings` and of the check
  `people-search`, in the one compiler form.
- `MOD-participant-list.eligible` — participants at an allowed place that can draft text, for `checkersFor`.
- `MOD-participant-list.differs` — that a checker differs from the rewriter, and the checkers from each other, in
  participant and model.
- `MOD-job-runner.Strategies` — the type of `privacyStrategies`.
