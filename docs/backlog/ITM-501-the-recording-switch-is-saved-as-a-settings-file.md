---
id: ITM-501
title: The recording switch is saved as a settings file
level: module
realises:
  - UC-042
  - SWITCHING CONVERSATION RECORDING ON STATES WHAT FOLLOWS
modules:
  - MOD-artifact-edits
builds_on:
tests:
  - unit
origin:
  - the architecture of the prompt bar, accepted by akmaier at 7e893c63 (110d2499)
  - MOD-artifact-edits, Interfaces: saveFile
---
# ITM-501 The recording switch is saved as a settings file

**REGISTER**

## Outcome

`saveFile` serves the instance's `docs/conversation-recording.md` as it serves the instance's other settings files.

## Acceptance

- The file is saved on the blob it was opened on and refused, keeping the edit, when it changed meanwhile.
