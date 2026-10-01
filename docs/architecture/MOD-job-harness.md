---
id: MOD-job-harness
title: Job kinds as data, what a job may be given and where, and a drafting job's correction loop against whichever driver it is given
realises:
  - NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY
  - NO USE CASE IS LEFT OUT OF A PROMPT SILENTLY
  - THE PAGE STATES WHAT IT SENDS WHERE
  - RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS
  - A PARTICIPANT THAT WRITES TO A REPOSITORY NEVER RECEIVES A MAIL
  - A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT
  - A FINDING READS LIKE A COMPILER MESSAGE
  - AN ERROR MUST BE FIXED, A WARNING FIXED OR JUSTIFIED
  - WHAT A PERSON DECIDES IS NOT SENT BACK
  - THE CORRECTION LOOP HAS A FIXED LIMIT
  - THE ROUNDS ARE COUNTED AND SHOWN
  - UC-019
follows:
  - ARC-003
  - ARC-007
  - ARC-009
uses: []
provides:
  - loadDefinition
  - renderPrompt
  - validateOutput
  - contextFits
  - disclosure
  - mayReceive
  - runDraft
  - formatFinding
  - splitFindings
---
# MOD-job-harness Job kinds as data, and the correction loop

## Responsibility

Kernel. The single definition of every job kind (ARC-007): loading and validating the definitions in
`docs/assets/jobs/`, filling a prompt, checking an answer against its schema, refusing to send what does
not fit or may not go where the participant processes data, saying before *Run* what will be sent where,
and running a drafting job's correction loop. It knows no job kind by name and no kind of content: what
may go where is decided over labels that the modules owning the content supply (a source's permitted
places, a mailbox's allowed places, that a mail goes to no job that writes), and the checks of a loop are
functions the starting runtime hands in. The participant is reached through the driver it is given
(ARC-009); whether that is a browser call, a workflow or a CLI agent it never knows.

## Interfaces

- `loadDefinition(kind, read) -> definition` — `docs/assets/jobs/<kind>/job.json` and `prompt.md`, validated: role, capabilities, inputs, output JSON Schema, checks by name, round limit, result route; `read` is a port.
- `renderPrompt(definition, inputs) -> messages` — the template with its named placeholders filled; no other prompt text exists anywhere.
- `validateOutput(definition, answer) -> { value } | { findings }` — parses and checks an answer against the output schema; unreadable is an error finding, never an empty result.
- `contextFits(inputs, participant) -> { fits: true } | { fits: false, counts, limit }` — refuses before anything is sent when the inputs do not fit the participant's context, with how many there are and how much fits.
- `disclosure(definition, inputs, participant) -> { destination, place, items, counts, billing }` — what the run panel shows before *Run*: where, what exactly, how much, and whether the call is billed per use.
- `mayReceive(labels, place, { writes }) -> { ok: true } | { ok: false, refused: [{ label, reason }] }` — whether content carrying these labels may go to a participant processing data at `place`, and to a job that writes to a repository; each label names the places it allows and whether a writing job may have it, as its owner set it; an unknown place is refused.
- `runDraft({ definition, inputs, driver, limit, checks }) -> { draft, remaining, personFindings, rounds, cost }` — the loop of ARC-007 decision 7: sends, parses, runs `checks` (functions `(draft) -> Promise<[finding]>`, which may ask other participants), and sends back until no finding is to be sent back, the limit fixed before the first round is reached, or a round leaves the findings unchanged; every round with its findings is returned, and the cost only as the driver reported it.
- `formatFinding({ artifact, line, kind, what, rule, fix }) -> string` — `<artifact>:<line>: <error|warning>: <what> [<RULE>] — <fix>`, from the finding catalogue `docs/assets/jobs/findings.json`.
- `splitFindings(findings, justifications) -> { back, person, justified }` — errors and unjustified warnings go back; findings the SPEC leaves to a person (conflicts, renamed requirements) never do.

## Testing

Unit tests with a fixture driver that returns scripted answers — the check the SPEC names
(`tests/test_correction_loop.py`): an answer that first names an unknown requirement and then a corrected
one is asked once more; a participant that never fixes its error is asked exactly *limit* times; a
conflict finding appears in no message to it. The seams are the driver, the checks and `read`; no clock.
`mayReceive` is tested over a table of labels and places, with a counter-proof for each label. `disclosure` is
checked against the requests a fixture driver records: every destination the run contacts, and what it
sends there, was named before *Run* (`tests/test_destination_disclosure.py`). How well a
participant fits a task — the rounds it needs, how often it ends with findings left — depends on a model
and is measured as a rate per participant over a fixed set of cases (ARC-016, kind 4), reported, not
gated.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; revised on 2026-10-01 by Claude (claude-opus-5-5) against commit 2e6d8e4752b55b0707ec5e69c229914cb5d15fe8 — the mail's rewriting and checking kept inside the mail modules, at the PO's request; revised on 2026-10-01 by Claude (claude-opus-5-5) against commit d0e5631081876203e719a2508d673d904e7768db — the leaner architecture of the architecture review, as the PO approved it (UC-023): takes over MOD-job-definitions with one generic rule for where content may go, imports neither drivers nor derivation; revised on 2026-10-01 by Claude (claude-opus-5-5) against commit b09cb03fbe9a8f311d75626fb2629a48968bfade — each rule under one module (ARC-020 decision 5): `THE PAGE STATES WHAT IT SENDS WHERE` is checked here, no longer also under MOD-dashboard-app; open until accepted.*
