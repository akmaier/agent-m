---
id: ITM-313
title: An EU legal text recognised by its address
level: module
realises:
  - UC-004
  - AN EU LEGAL TEXT IS FETCHED FROM THE OFFICIAL REPOSITORY
modules:
  - MOD-source-register
builds_on:
tests:
  - unit
origin:
  - UC-004 step 4
---
# ITM-313 An EU legal text recognised by its address

**REGISTER**

## Outcome

MOD-source-register's `recogniseLegalText(address)`, as its file states it: the CELEX number or the ELI that an EUR-Lex
or an ELI address names, or `null` for any other address. The library page fills in a legal text's identifier with it
(ITM-350). Fetching the text (`fetchLegalText`) and the instance's fetch workflow are not part of this item.

## Acceptance

- Unit tests that name MOD-source-register state, before the code exists: the AI Act's EUR-Lex and ELI addresses yield
  `32024R1689` and its ELI; an address of another site yields `null`. Nothing reaches the network.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/source-register/` and the tests that name MOD-source-register change.
