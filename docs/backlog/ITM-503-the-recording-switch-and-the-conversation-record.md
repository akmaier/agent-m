---
id: ITM-503
title: The recording switch and the conversation record
level: module
realises:
  - UC-049
  - UC-042
  - A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
  - A RECORDED CONVERSATION IS KEPT WHERE IT WAS HELD
  - A RECORD IS EVIDENCE, NOT A PROPOSAL
  - NO SECRET IN THE REPOSITORY
  - NO PERSONAL DATA FROM A MAIL ENTERS A REPOSITORY
modules:
  - MOD-prompt-bar
builds_on:
tests:
  - unit
origin:
  - the architecture of the prompt bar, accepted by akmaier at 7e893c63 (110d2499)
  - MOD-prompt-bar, Parts: record.mjs, conversation.schema.md, recording.schema.md; Data; Interfaces: recordingSchema, recordingOf
---
# ITM-503 The recording switch and the conversation record

**REGISTER**

## Outcome

The first part of the new module MOD-prompt-bar: the recording switch `docs/conversation-recording.md`, read with
`recording.schema.md` — `recordingOf` `false` for a missing file or key, `recordingSchema` for the settings page's form —;
and the conversation record `docs/conversations/<yyyymmdd>-<hhmm>-<4 hex>.md`, read and written with
`conversation.schema.md`, started by the first message and then only appended to, one section per message, a withheld
message naming why and nothing of its text, and a section for a job handed over — each append a commit on the head that
was read, and again on a moved head, as the module file's Data and `startPromptBar` state. The bar itself is
ITM-504.

## Acceptance

- `recordingOf` reads `on`, `off`, a missing key and a missing file; `recordingSchema` gives the schema.
- Over a fixture host, appending three messages — one withheld — writes one record, each append its own commit, nothing
  earlier changed; a moved head is read again; a refusal for a stored secret appends the message as withheld.
