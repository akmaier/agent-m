---
id: ITM-659
title: The key a product's token is kept under is written once
level: module
realises:
  - A GITHUB PRODUCT USES A TOKEN OF ITS OWN
modules:
  - MOD-site-frame
  - MOD-review-pages
  - MOD-settings-pages
  - MOD-browser-store
builds_on:
tests:
  - unit
origin:
  - ITM-601's stop before its tests-only commit (sprint team1/67), from developer-sonnet-d's finding
---
# ITM-659 The key a product's token is kept under is written once

**REGISTER**

## Outcome

The key a product's own token is kept under ("MOD-browser-store, Data") is written four times:
- MOD-site-frame's `tokenKeyOf` (`src/site-frame/routing.mjs:51`);
- MOD-review-pages' `storedToken` (`src/review-pages/common.mjs:94-100`);
- MOD-settings-pages' `tokenSettingKey` (`src/settings-pages/products.mjs:116-120`);
- MOD-browser-store's `tokenKey`, for keys it converts (`src/browser-store/legacy-keys.mjs:59-63`).

Found at ITM-601's stop. Which module gives it once is read at the start against MOD-browser-store's file:
- MOD-browser-store, whose Data defines the key;
- or the frame, through `ProductContext.tokenStored` and the token's name, if the draft committed with ITM-658's cut is
  accepted.

## Acceptance

- The key is computed in one place, and every module above uses that place.
- No expected result of a test changes.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
