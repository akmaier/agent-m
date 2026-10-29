---
id: ITM-1190
title: The Jobs page holds what waits for a person; the main page links it
level: module
realises:
  - UC-036
  - UC-046
  - UC-047
modules:
  - MOD-main-page
builds_on:
tests:
  - unit
origin:
  - akmaier's request ("there should be an extra page for jobs"), accepted in MOD-main-page at blob 0ecb9fbf (f35b9903), UC-036 at c2557bc2, UC-046 at fcbc9d83 and UC-047 at 0362bc76 (9559c14f), 2026-10-22
---
# ITM-1190 The Jobs page holds what waits for a person; the main page links it

**REGISTER**

## Outcome

The accepted text, `docs/architecture/MOD-main-page.md`:
- **The route `home`** draws the cards and, below them, the link *Jobs* to the route `jobs`. It no longer lists what
  waits (`home.mjs`).
- **The route `jobs`** first lists what waits for a person across the instance, each item linked to the page where it is
  decided. That list is MOD-progress-measures' `waitingForAPerson`, from the instance's stored overview where there is
  one. Then comes every job (`waits.mjs`).
- UC-036 step 2 names what waits: open use cases, open SPEC changes, gates waiting for a decision, and failed jobs.

**Today** (`dcf0badd`, `fb1b7c69`): `home` draws what waits from the overview stored for the head, or, while that is not
stored, from the overview `latest.json` names (MOD-progress-measures' `latestOverview`), and derives it only where the
branch `overview-cache` holds neither (MOD-main-page, the route `home`). Moving the list to `jobs` keeps that reading.

**An open reading.** MOD-main-page's `jobs` names "the instance's own stored overview where there is one" and does not name
`latestOverview`. Whether `jobs` takes the overview stored last while the head's is not stored, as the card does, is read
at the start; where the text does not give it, the item stops for a draft to akmaier.

## Not ready: a draft for akmaier

MOD-main-page gives the route `jobs` "what waits for a person across the instance … (MOD-progress-measures'
`waitingForAPerson`, from the instance's own stored overview where there is one)" (MOD-main-page.md:130-131). UC-036
step 2 shows what waits "across the instance", and the instance holds its products. The texts do not settle three
things:
- how `jobs` reads what waits in each product: its stored overview, the one stored last, or its facts;
- whether `jobs` takes the overview stored last (`latestOverview`) while the head's is not stored yet, as a card of
  `home` does (MOD-main-page.md:119-121);
- what it reads where no overview is stored.

Reading "the instance's own stored overview" as every product's would add words the sentence does not hold (AGENTS.md
§6a.7). So a draft of MOD-main-page.md says how `jobs` reads what waits in the instance and in each product, as the cards
do. This item is built once the draft is accepted.

## Acceptance

- `home` draws the link *Jobs*, and no list of what waits.
- `jobs` draws what waits above the list of jobs, each item with its link. That holds with and without a stored
  overview.
- Counter-proof: a product with nothing waiting adds no entry.
- **Tests that pin what waits on the main page change,** and are named at the start (SPEC.md:1442-1445).
- No new kind of waiting thing and no new route beyond `jobs`.
- The first commit holds only the tests, and CI is red on it.
