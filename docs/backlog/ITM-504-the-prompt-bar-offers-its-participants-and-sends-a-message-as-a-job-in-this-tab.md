---
id: ITM-504
title: The prompt bar offers its participants and sends a message as a job in this tab
level: module
realises:
  - UC-049
  - UC-019
  - THE PAGE NAMES WHERE IT SENDS
  - A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
  - A RECORDED CONVERSATION IS KEPT WHERE IT WAS HELD
  - A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
  - A PARTICIPANT DECLARES WHERE IT PROCESSES DATA
  - THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
  - ONE CLICK PER DECISION
  - EVERY STEP EXPLAINS ITSELF
  - NO SERVER
modules:
  - MOD-prompt-bar
builds_on:
  - ITM-482
  - ITM-483
  - ITM-484
  - ITM-485
  - ITM-493
  - ITM-503
tests:
  - unit
  - component
origin:
  - the architecture of the prompt bar, accepted by akmaier at 7e893c63 (110d2499)
  - MOD-prompt-bar, Parts: bar.mjs, offer.mjs, send.mjs; Interfaces: Subject, Message, ConversationDraft, startPromptBar, latestDraft, currentJob
---
# ITM-504 The prompt bar offers its participants and sends a message as a job in this tab

**REGISTER**

## Outcome

`startPromptBar` draws the bar: it offers the participants its module file names, each with its processing place —
none drawn without one (UC-049 1a), a subagent never offered (1b) —; holds the conversation in the tab; on *Send* asks the
subject for the kind and parameters, adds `instruction` and `conversation`, prepares the job with `prepareJob` in a
`tabContext`, sends nothing while it does not fit or a finding keeps it, names every destination before it sends, appends
to the conversation record first where recording is on, runs the job with `runOnTab` without a record, and shows the
answer — for a draft, *Review the draft*, which keeps the `ConversationDraft` and goes to the subject's draft route;
*Stop* aborts it. `latestDraft` and `currentJob` give the draft and the running message. A hand-over is ITM-505.

## Acceptance

- In a small DOM with fixture participants, store and host: the selector, *Send*, a refused send naming why, the
  destinations named, the answer shown, a draft kept and led to its route, *Stop*, and the record appended only with
  recording on.
- With recording off, no request writes anything; a counter-proof plants a write and the test sees it.
