---
id: ITM-839
title: The recipe report-data and the check people-search
level: module
realises:
  - UC-038
  - A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE
  - THE PLACES A MAILBOX'S MAIL MAY GO ARE CONFIGURED
modules:
  - MOD-personal-data
builds_on:
  - ITM-550
tests:
  - unit
origin:
  - MOD-personal-data, Interfaces privacyStrategies; no code gives it
---
# ITM-839 The recipe report-data and the check people-search

**REGISTER**

## Outcome

MOD-personal-data's `privacyStrategies`, of MOD-job-runner's type `Strategies`, is added as the module file states it
(`strategies.mjs`):
- the recipe `report-data` gives each piece of report data the person picked from one mail as a part of its own; the
  mail's people go into the job's context, never into a part. A participant whose processing place the mailbox does not
  allow gets `PlaceNotAllowed`, and nothing is sent;
- the check `people-search` gives an error finding, naming the line, for every hit of the context's people in a draft,
  through `personHits`, under the rule `A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE`.

## Acceptance

- New unit tests naming MOD-personal-data. Each states its input, precondition and expected result before it runs:
  - `report-data` gives one part per picked piece, and no part holds a name or address of the mail's people;
  - a participant at a place not allowed gets `PlaceNotAllowed`;
  - `people-search` finds a planted address and a planted name, each with its line, and finds nothing in a clean draft.
- Where the module file leaves a value open, the pull request names it and the test asserts no invented value.
- The existing tests naming MOD-personal-data stay green with no expected result changed.
- The first commit holds only tests, and CI is red on it; each new test's counter-proof is recorded in the pull request.
- Only `src/personal-data/` and tests naming MOD-personal-data change; no dependency changes.
