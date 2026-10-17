---
id: ITM-811
title: The destination-disclosure test reads no old settings text
level: unit
realises:
  - CODE OUTSIDE THE ARCHITECTURE IS MOVED INTO IT
modules:
  - MOD-repository-hosts
builds_on:
tests:
  - unit
origin:
  - ITM-683's draft stop (sprint team1/74), finding 2
---
# ITM-811 The destination-disclosure test reads no old settings text

**REGISTER**

## Outcome

`tests/test_destination_disclosure.py` reads `TOKEN_GUIDANCE` from `docs/assets/dashboard/settings-view.mjs`. Its header
names `MOD-git-host`, which has no module file. MOD-repository-hosts' Parts take it over (`MOD-repository-hosts.md:78`),
so only MOD-repository-hosts' job may change it, by moving it into the module (sprint 72's agreement). ITM-689 is that
job, and it builds on ITM-683.

So, as ITM-807 did for the git-host test, this part goes first:
- the header names MOD-repository-hosts, without item history;
- the case reads the guidance the live page shows, MOD-settings-pages' text, in place of `settings-view.mjs`;
- each assertion is kept. If the live text does not say what the case asserts, the item stops.

It changes no code of MOD-repository-hosts.

## Acceptance

- The test imports nothing from `settings-view.mjs`, its header names MOD-repository-hosts, and its expected results stay.
- It is declared as refactoring: CI is green on every commit.
