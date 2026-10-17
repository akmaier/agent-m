---
id: ITM-725
title: The explanations of arranging and of implementing
level: module
realises:
  - UC-021
  - UC-024
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-site-frame
builds_on:
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-725 The explanations of arranging and of implementing

**REGISTER**

## Outcome

The topics of MOD-site-frame's `explanations.md` that UC-021 and UC-024 name and that the file does not hold yet,
written for someone new to them:
- arranging (UC-021): a group is only a heading — it has no identifier, nothing realises or tests it, and moving an
  item never changes the item;
- the route a process model prescribes for implementing (UC-024 step 1): the table of UC-024, with a pointer to book
  ch. 6 and 7;
- the three kinds of coding participant (UC-024 step 5): a CLI agent through the local bridge, a sandboxed agent
  through a tunnel, a CI agent on a self-hosted runner, and what each costs in setup, speed and isolation.

The arrangement page (ITM-726) and the implementation page (ITM-732, ITM-733) show them folded.

## Acceptance

- `explain` gives each new topic, folded, with its text; no existing topic changes.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
