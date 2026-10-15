---
id: ITM-507
title: The review pages show the conversation's draft
level: module
realises:
  - UC-019
  - UC-049
  - A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT
  - A SPEC EDIT IS SAVED AS A PROPOSAL
  - A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE
  - AN EDITED FILE KEEPS ITS IDENTIFIER
  - A CONFLICT IS DECIDED BY A PERSON
  - THE PERSON WHO PROMPTS IS A SOURCE
  - A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
modules:
  - MOD-review-pages
builds_on:
  - ITM-478
  - ITM-485
  - ITM-493
  - ITM-504
  - ITM-506
tests:
  - unit
  - component
origin:
  - the architecture of the prompt bar, accepted by akmaier at 7e893c63 (110d2499)
  - MOD-review-pages, Interfaces: view (routes `<k>/<id>`, edit routes, `draft`)
---
# ITM-507 The review pages show the conversation's draft

**REGISTER**

## Outcome

The route `draft` shows `latestDraft` for the subject the person came from against the current text — files in the
editor as their difference, a changed identifier restored first, requirements as `entrySections` composes them beside the
one each refers to, an undecided conflict kept out, an architecture file with its rounds, due diligence and impact list —
and *Save* and *Discard*, saving as UC-018 saves with provenance lines that name no message. The routes
`<k>/<id>/prompt`, `requirement/<name>/prompt` and `requirements/prompt` and *Change by prompt* are gone; each file's and
editor's route gives its subject, with the descriptor's change kind, the target and `draft` as its draft route, and for
requirements the person's own source.

## Acceptance

- In a small DOM with a fixture draft for each kind, the route shows and saves it as stated, refuses a save on a moved
  text keeping the edit, and drops it on *Discard*.
- No route or link named *Change by prompt* remains; each route's subject is as stated.
