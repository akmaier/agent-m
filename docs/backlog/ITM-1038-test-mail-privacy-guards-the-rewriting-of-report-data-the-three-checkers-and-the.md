---
id: ITM-1038
title: test_mail_privacy guards the rewriting of report data, the three checkers and the mailbox's places
level: module
realises:
  - REPORT DATA LEAVES THE MAILBOX ONLY REWRITTEN WITHOUT PERSONS
  - A REWRITTEN TEXT IS CHECKED BY THREE LLMS
  - NO CHECKER IS THE REWRITER
  - A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE
  - PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF
  - THE PLACES A MAILBOX'S MAIL MAY GO ARE CONFIGURED
  - UC-038
modules:
  - MOD-personal-data
builds_on:
tests:
  - release
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-038-5, read against the accepted texts on main at 40e04d8d
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-1038 test_mail_privacy guards the rewriting of report data, the three checkers and the mailbox's places

**REGISTER**

## Outcome

SPEC.md names `tests/test_mail_privacy.py` as the check of these requirements (:2115-2116, :2136-2137, :2148-2151,
:2157-2159, :2164-2166, :2170-2171). The file does not exist. The code they guard is built: `personHits`
(`src/personal-data/people.mjs:67`), `checkersFor` (`checkers.mjs:13`), the recipe `report-data` with `PlaceNotAllowed`
and the check `people-search` (`strategies.mjs:13-41`), `pseudonymisationOf` (`index.mjs:41`). Its unit tests exist
(`tests/personal-data-*.test.mjs`); the release check the SPEC names does not.

## Acceptance

- `tests/test_mail_privacy.py` with its cases in `tests/test_mail_privacy.md`, each case as SPEC.md states its check:
  - an issue text with the sender's name or a signature name is refused and the hit named; without it, it passes;
  - a fixture log with a name, address, phone, IP and home-directory path, rewritten by a fixture participant, holds none
    of them; a rewrite that keeps one is refused;
  - three fixture checkers of which one reports a name: nothing written, the finding goes back; none reporting: written;
  - a checker set with the rewriter or its model is refused before anything is sent;
  - a product without the setting gets rewritten data, one that switched it off the original;
  - a mail is not given to a participant at an unlisted place, and is to one at a listed place.
- The rates the SPEC names are reported, not gated.
- Each test fails on a planted fault in `src/personal-data/`.
- Written by a participant that did not implement ITM-838 or ITM-839. Only tests that name MOD-personal-data change.
