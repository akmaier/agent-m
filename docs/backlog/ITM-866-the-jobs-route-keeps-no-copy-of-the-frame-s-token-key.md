---
id: ITM-866
title: The jobs route keeps no copy of the frame's token key
level: unit
realises:
  - DEVELOP AGAINST INTERFACES
modules:
  - MOD-main-page
builds_on:
  - ITM-856
tests:
  - unit
origin:
  - ITM-856's pull request #821 (sprint team1/81), from developer-sonnet-e's point
---
# ITM-866 The jobs route keeps no copy of the frame's token key

**REGISTER**

## Outcome

After ITM-856, `home` takes `tokenStored` from MOD-site-frame's `chosenProduct`. MOD-main-page's route `jobs` still connects
each product with the token it finds through a private `tokenKeyOf` (`src/main-page/jobs.mjs:24`). That is a copy of the
frame's `tokenKeyOf` (`src/site-frame/routing.mjs:51`), against AGENTS.md §2, "Nothing twice". The route connects through
the host `chosenProduct` gives, as `home` does, and the copy goes.

## Acceptance

- `src/main-page/` holds no rule for a token's key, and the route `jobs` reads each product through the host the frame
  connected, with its tests unchanged in what they assert.
- It is declared as refactoring: CI is green on every commit.
