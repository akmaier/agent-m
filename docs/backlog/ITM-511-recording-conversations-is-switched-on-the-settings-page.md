---
id: ITM-511
title: Recording conversations is switched on the settings page
level: module
realises:
  - UC-042
  - UC-049
  - SWITCHING CONVERSATION RECORDING ON STATES WHAT FOLLOWS
  - A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
  - A STORED SECRET IS HIDDEN UNTIL SHOWN
modules:
  - MOD-settings-pages
builds_on:
  - ITM-503
  - ITM-506
tests:
  - unit
origin:
  - the architecture of the prompt bar, accepted by akmaier at 7e893c63 (110d2499)
  - MOD-settings-pages, Interfaces: view (`settings`, each route's subject)
---
# ITM-511 Recording conversations is switched on the settings page

**REGISTER**

## Outcome

The instance's section holds *Recording conversations*, *off* unless switched on: switching it on states first what
follows and names each repository its server reports as public, and saves `docs/conversation-recording.md` only after
*I have read this*; switching it off is saved without a notice and says that written records stay. Each route gives the
subject of the kind `converse`, naming each setting and its state and never a value.

## Acceptance

- In a small DOM with a fixture host, nothing is saved before the notice is acknowledged; the notice names a fixture
  public product and not a private one; no subject holds a stored value.
