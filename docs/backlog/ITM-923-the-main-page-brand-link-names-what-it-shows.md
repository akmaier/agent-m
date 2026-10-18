---
id: ITM-923
title: The main page's brand link names what it shows
level: module
realises:
  - THE SITE SERVES A SCREEN READER
modules:
  - MOD-main-page
builds_on:
  - ITM-905
tests:
  - unit
origin:
  - ITM-905's findings (sprint team1/89), `tests/site-accessibility.test.mjs`
---
# ITM-923 The main page's brand link names what it shows

**REGISTER**

## Outcome

ITM-905's check finds **label-content-name-mismatch** on the main page's brand link: its accessible name does not hold the
text it shows. It is drawn by `src/home/`, which MOD-main-page.md:66 names as taken over by this module's route `home`. So
the fix is made in the module's route, by the job that moves those files (`CODE OUTSIDE THE ARCHITECTURE IS MOVED INTO
IT`), or once the route is live.

## Acceptance

- The brand link's accessible name begins with the text it shows. The todo is removed, and the check passes, with a
  counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
