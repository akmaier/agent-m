---
id: ITM-509
title: The jobs list names the job of this tab's conversation
level: module
realises:
  - UC-049
  - UC-046
  - ONE DASHBOARD SHOWS EVERY JOB
modules:
  - MOD-main-page
builds_on:
  - ITM-500
  - ITM-504
  - ITM-506
tests:
  - unit
origin:
  - the architecture of the prompt bar, accepted by akmaier at 7e893c63 (110d2499)
  - MOD-main-page, Interfaces: view (`jobs`, strategies)
---
# ITM-509 The jobs list names the job of this tab's conversation

**REGISTER**

## Outcome

The route `jobs` lists the message of this tab's conversation that runs — `currentJob` — as this tab's, in the state
`running`; the main page's view hands the frame `sourceStrategies`, so that a conversation on it receives the book's
chapters of its page.

## Acceptance

- In a small DOM, a running message is listed as this tab's and gone once it ended; the view's strategies are
  `[sourceStrategies]`.
