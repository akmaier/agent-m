---
id: ITM-964
title: The route mail proposes issues through a participant at an allowed place, and rewrites report data checked by three others
level: module
realises:
  - UC-038
  - THE PLACES A MAILBOX'S MAIL MAY GO ARE CONFIGURED
  - A PLACE OUTSIDE THE EU IS NAMED AS NOT COMPLIANT
  - THE PAGE NAMES WHERE IT SENDS
  - REPORT DATA LEAVES THE MAILBOX ONLY REWRITTEN WITHOUT PERSONS
  - A REWRITTEN TEXT IS CHECKED BY THREE LLMS
  - A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE
  - PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF
modules:
  - MOD-maintenance-pages
builds_on:
  - ITM-963
  - ITM-954
tests:
  - unit
  - component
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-038-3, verified against the accepted texts on main at ee5d1364
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-964 The route mail proposes issues through a participant at an allowed place, and rewrites report data checked by three others

**REGISTER**

## Outcome

MOD-maintenance-pages.md:113-115 (blob `acdb0521`): "the participant for the proposals among those at places the mailbox
allows, a place outside the EU named as not compliant, and the three checkers; the run panel and *Propose*". The page runs
the kinds `propose-issues`, `rewrite-without-persons` (with `check-for-persons` × 3) through MOD-job-runner and
MOD-runtimes (MOD-maintenance-pages.md:172-174), choosing the checkers with `checkersFor` and the product's setting with
`pseudonymisationOf` (:161-162). UC-038 steps 4-6 (UC-038:91-114) and 4a, 4c, 5a, 5b, 6b, 6c (:155-177).

The kinds are built (`src/job-catalogue/kinds/propose-issues/`, `rewrite-without-persons/`, `check-for-persons/`), and so
are the reviewer loop (`src/job-runner/loop.mjs:120-164`), `checkersFor` (`src/personal-data/checkers.mjs:13`), the
recipe `report-data` and the check `people-search` (`src/personal-data/strategies.mjs:41`). `mail-batch` is ITM-954.

## Acceptance

- Unit and component tests that name MOD-maintenance-pages, with fixture participants and a fake mailbox:
  - only participants at an allowed place are offered; a place outside the EU is marked not compliant; the run panel names
    the participant's place, what it receives, and each checker's place and that it receives only the rewritten texts;
  - one *Propose* sends all listed mails in one job, and each proposal is shown beside its mail;
  - a proposal whose text names a person of the mail is marked;
  - an attachment reaches the participant only when ticked (5a); a proposal without a product asks the person (5b);
  - with three checkers, a checker's finding goes back and only the corrected rewrite is shown; with fewer than three, the
    missing ones are named and nothing is sent (6c);
  - with pseudonymisation off, the report data is shown unchanged with the notice above it (6b);
  - with no participant at an allowed place, nothing is sent and the mailbox's places are linked (4c);
  - a CLI agent receives the job through the Bridge it names (4a).
- Counter-proof: a page that offers a participant at a disallowed place fails.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/maintenance-pages/` and the tests that name MOD-maintenance-pages change.
