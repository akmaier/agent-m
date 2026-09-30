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
  - UC-005
  - UC-007
  - UC-019
  - UC-022
  - UC-026
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

**Current state.** No code and no definition files exist.

## Interfaces

- `loadDefinition(kind, read) -> definition` — `docs/assets/jobs/<kind>/job.json` and `prompt.md`, validated: role, capabilities, inputs, output JSON Schema, checks by name, round limit, result route.
- `assembleContext(definition, snapshot, selection) -> { inputs, counts }` — every input the definition names, completely (all requirements with open queues, all use cases, all architecture, existing tests), content a source forbids for the participant's place left out and named, and for a job that writes to a repository only neutral issue text and pseudonymised report data.
- `contextFits(inputs, participant) -> { fits } | { fits: false, counts, limit }` — refuses before anything is sent when the inputs do not fit, with how many there are and how much fits.
- `renderPrompt(definition, inputs) -> messages` — the template with its named placeholders filled; no other prompt text exists anywhere.
- `validateOutput(definition, answer) -> { value } | { findings }` — parses and checks the answer against the output schema; unreadable is an error finding, never an empty result.
- `disclosure(definition, inputs, participant) -> { destination, place, items, counts, billing }` — what the run panel shows before *Run*: where, what exactly, how much, and whether the call is billed per use.

Uses, as declared above: `MOD-source-library.contentPermitted`.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; open until accepted.*
