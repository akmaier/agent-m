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

**Decided at its stop (sprint team1/75, 2026-10-17, po-opus): the case at `:19` goes. Nothing is re-pointed.**
- It asserts that `settingsView.TOKEN_GUIDANCE` contains `api.github.com`. That is a text no live page draws, since
  `#settings` is MOD-settings-pages' route. The live pages say "GitHub's API" (`src/settings-pages/setup.mjs:133`,
  `src/site-frame/explanations.md:720`).
- The requirement it names, "THE PAGE STATES WHAT IT SENDS WHERE", is in no sentence of SPEC.md. `grep -c github.com
  SPEC.md` gives 2, and neither sentence names the token guidance. No use case quotes `api.github.com`.
  `THE PAGE NAMES WHERE IT SENDS` (SPEC.md:703) is about a run's destinations, and its Checks guard it.
- So this is a case of only the old view. It goes, and the pull request names that no requirement loses its test.
- The header's Guards line keeps only `A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT`, which the other half asserts
  (`TOKEN_DESTINATIONS`, `authHeaders`). That half stays as it is until ITM-689 moves the old host file.
- Before the change, developer-sonnet-c reads AGENTS.md and SPEC.md as files, chapters 9, 11, 12 and 13, and UC-002 and
  UC-042.
