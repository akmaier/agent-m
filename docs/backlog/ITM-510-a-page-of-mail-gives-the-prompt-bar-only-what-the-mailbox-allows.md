---
id: ITM-510
title: A page of mail gives the prompt bar only what the mailbox allows
level: module
realises:
  - UC-049
  - UC-038
  - UC-039
  - THE PLACES A MAILBOX'S MAIL MAY GO ARE CONFIGURED
  - A PARTICIPANT THAT WRITES TO A REPOSITORY NEVER RECEIVES A MAIL
  - NO PERSONAL DATA FROM A MAIL ENTERS A REPOSITORY
  - MAIL STAYS IN THE MAILBOX
  - A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE
modules:
  - MOD-maintenance-pages
builds_on:
  - ITM-506
tests:
  - unit
origin:
  - the architecture of the prompt bar, accepted by akmaier at 7e893c63 (110d2499)
  - MOD-maintenance-pages, Interfaces: view (each route's subject)
---
# ITM-510 A page of mail gives the prompt bar only what the mailbox allows

**REGISTER**

## Outcome

Each route of mail gives the subject of the kind `converse`: the mail's text, sender and attachments only for a
participant whose place the mailbox allows and that does not write to the repository, its `MAIL-` identifier for any
other; `refuses` names `propose-edit` and `hand-over`; `withhold` names each of the mail's people found with `personHits`
and a passage of the mail. The issues' routes give the issue as the page.

## Acceptance

- For fixture participants of each kind, `paramsFor` gives the text or only the identifier as stated; `withhold`
  finds a planted name, address, phone number and account, and a counter-proof without one finds none.
