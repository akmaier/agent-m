---
id: ITM-860
title: A token stored on the add-product or setup page is used by the open page
level: unit
realises:
  - A CLEAR IS A REAL CLEAR
modules:
  - MOD-settings-pages
builds_on:
  - ITM-853
tests:
  - unit
origin:
  - ITM-853's pull request #815 (sprint team1/80), from developer-sonnet-a's finding 1
---
# ITM-860 A token stored on the add-product or setup page is used by the open page

**REGISTER**

## Outcome

ITM-853 reconnects the settings page's hosts after a token is saved on its line. The add-product page stores a token in
place (`src/settings-pages/products.mjs:236`, `:327`), and so does *Finish setting up* (`setup.mjs:101`). Neither
reconnects the open page's hosts afterwards. This lead was read from the code, not run.

At the start, a test stores a token on each page and lets the open page read without a reload. It shows whether the new
token is used. If it is not, the pages reach `reconnectHosts` through a hook of the Settings context, as `endpointsChanged`
does. The product host's own read is made observable in the test, which ITM-853 could not do.

## Acceptance

- After a token is stored on either page, the open page's next request carries it, and tests pin both.
- The first commit holds only the tests, and CI is red on it if the lead holds. No stub is committed.

**Narrowed at its gate (sprint team1/81, 2026-10-18, po-opus).** This item covers the add-product page. *Finish setting up*'s
token reaches the next page through MOD-site-frame's `instance.host`, so it is ITM-869.
