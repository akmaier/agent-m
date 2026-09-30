---
id: MOD-job-definitions
title: Loads job definitions and assembles, discloses and checks what a job sends
realises:
  - ONE DEFINITION, THREE DRIVERS
  - DERIVATION SEES THE EXISTING REQUIREMENTS
  - NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY
  - A PROMPTED USE-CASE CHANGE SEES ITS NEIGHBOURS
  - NO USE CASE IS LEFT OUT OF A PROMPT SILENTLY
  - TEST GENERATION SEES THE EXISTING TESTS
  - THE PAGE STATES WHAT IT SENDS WHERE
  - RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS
  - A PARTICIPANT THAT WRITES TO A REPOSITORY NEVER RECEIVES A MAIL
  - A MAIL BECOMES AN ISSUE ONLY BY A PERSON'S CLICK
  - THE PLACES A MAILBOX'S MAIL MAY GO ARE CONFIGURED
  - REPORT DATA LEAVES THE MAILBOX ONLY REWRITTEN WITHOUT PERSONS
  - A REWRITTEN TEXT IS CHECKED BY THREE LLMS
  - UC-005
  - UC-007
  - UC-019
  - UC-022
  - UC-026
  - UC-038
follows:
  - ARC-003
  - ARC-007
uses:
  - MOD-source-library.contentPermitted
provides:
  - loadDefinition
  - assembleContext
  - contextFits
  - renderPrompt
  - validateOutput
  - disclosure
---
# MOD-job-definitions Loads job definitions and assembles, discloses and checks what a job sends

## Responsibility

The single definition of every job kind (ARC-007) and the rules for what a job may be given: the
complete context the SPEC requires, nothing a source forbids for the participant's processing place,
nothing of a mail for a job that writes to a repository. Pure core; the definitions are data in
`docs/assets/jobs/`.

Two of the kinds carry the privacy rules of ARC-014, as prompt and output schema like every other:

- `propose-issue-from-mail` — the participant chosen in UC-038 step 4 receives a mail, the products with
  their one-line descriptions, the titles and numbers of their open issues, and the report data the
  author ticked; it returns product, kind, a neutral title and text, possible duplicates, and each piece
  of report data rewritten without any person, keeping its technical content — error message, stack
  trace, versions, the steps — with a person or a path naming one replaced by a description ("the
  user's home folder"), never by a surrogate name (`REPORT DATA LEAVES THE MAILBOX ONLY REWRITTEN WITHOUT
  PERSONS`). Its prompt forbids names, addresses, phone numbers, accounts, signatures and greetings in
  every text it returns.
- `check-for-persons` — a checking participant receives one or more texts and returns, per text, every
  mention of a person it finds, with the line; an empty list for a text is its verdict that the text
  mentions no person (`A REWRITTEN TEXT IS CHECKED BY THREE LLMS`). Unreadable output is an error
  finding, never an empty list.

**Current state.** No code and no definition files exist.

## Interfaces

- `loadDefinition(kind, read) -> definition` — `docs/assets/jobs/<kind>/job.json` and `prompt.md`, validated: role, capabilities, inputs, output JSON Schema, checks by name, round limit, result route.
- `assembleContext(definition, snapshot, selection) -> { inputs, counts }` — every input the definition names, completely (all requirements with open queues, all use cases, all architecture, existing tests), content a source forbids for the participant's place left out and named, and for a job that writes to a repository only the neutral issue text and the report data as its issue holds it — rewritten without persons, or unchanged where the product switched the rewriting off — never a mail. A `check-for-persons` job receives only the texts it checks: never the mail, the mail's people, or anything else the rewriting participant was given.
- `contextFits(inputs, participant) -> { fits } | { fits: false, counts, limit }` — refuses before anything is sent when the inputs do not fit, with how many there are and how much fits.
- `renderPrompt(definition, inputs) -> messages` — the template with its named placeholders filled; no other prompt text exists anywhere.
- `validateOutput(definition, answer) -> { value } | { findings }` — parses and checks the answer against the output schema; unreadable is an error finding, never an empty result.
- `disclosure(definition, inputs, participant) -> { destination, place, items, counts, billing }` — what the run panel shows before *Run*: where, what exactly, how much, and whether the call is billed per use.

Uses, as declared above: `MOD-source-library.contentPermitted`.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; revised on 2026-10-01 by Claude (claude-opus-5-5) against commit 8b299337b2e61b80cb4a4415ff4e7c865d7a2dfe — SPEC queue 2026-09-30k as accepted: report data rewritten without persons and checked by three LLMs, surrogates withdrawn; open until accepted.*
