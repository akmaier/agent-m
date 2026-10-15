---
id: ITM-508
title: The specification browser gives the prompt bar its subject
level: module
realises:
  - UC-020
  - UC-019
  - UC-049
  - THE PERSON WHO PROMPTS IS A SOURCE
modules:
  - MOD-trace-pages
builds_on:
  - ITM-506
  - ITM-507
tests:
  - unit
origin:
  - the architecture of the prompt bar, accepted by akmaier at 7e893c63 (110d2499)
  - MOD-trace-pages, the specification view; Interfaces: view
---
# ITM-508 The specification browser gives the prompt bar its subject

**REGISTER**

## Outcome

The specification view gives, on the default branch, the open requirement or the group with the names it holds, the
kind `change-requirements`, the person's own source and the draft route `draft`; at a released version, the requirement
as it read there with the kind `converse`; every other trace view the frame's default with the version shown. The buttons
*Change by prompt* are gone.

## Acceptance

- In a small DOM, each view's subject is as stated on the default branch and at a tag.
